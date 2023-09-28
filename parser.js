/**
 * Scrub PHP syntax during dev preview
 * If there's default data, they should be loaded in template before calling parser and should define a `defaultData` object.
 */

const getFirstLoopStructure = (tags, endTags) => {
  if (!tags.length) {
    return undefined;
  }

  const endIndex = endTags[0].index;
  if (tags.length === 1) {
    return {
      begin: tags[0].index,
      end: endIndex,
      matchString: tags[0][0],
      matchContent: tags[0][1],
    };
  }

  for (let i = 1; i < tags.length; i++) {
    const currentIndex = tags[i].index;
    if (currentIndex > endIndex) {
      const previousIndex = i - 1;
      const previousTag = tags[previousIndex];
      return {
        begin: previousTag.index,
        end: endIndex,
        matchString: previousTag[0],
        matchContent: previousTag[1],
      };
    }
  }

  const lastTag = tags[tags.length - 1];
  return {
    begin: lastTag.index,
    end: endIndex,
    matchString: lastTag[0],
    matchContent: lastTag[1],
  };
}

const getFirstConditionalStructure = (tags, endTags) => {
  if (!tags.length) {
    return undefined;
  }

  const beginIndex = tags[0].index;
  if (tags.length === 1) {
    return {
      begin: beginIndex,
      end: endTags[0].index,
      matchString: tags[0][0],
      matchContent: tags[0][1],
    };
  }

  let currentEndIndex = 0;
  let currentEndTag = endTags[0];
  for (let i = 1; i < tags.length; i++) {
    const nextTagIndex = tags[i].index;
    if (nextTagIndex > currentEndTag.index) {
      const deep = i - 1;
      currentEndIndex = deep;
      currentEndTag = endTags[currentEndIndex];
      if (deep === 0 || nextTagIndex > currentEndTag.index) {
        return {
          begin: beginIndex,
          end: currentEndTag.index,
          matchString: tags[0][0],
          matchContent: tags[0][1],
        };
      }
    }
  }

  const lastEndTag = endTags[endTags.length - 1];
  return {
    begin: beginIndex,
    end: lastEndTag.index,
    matchString: tags[0][0],
    matchContent: tags[0][1],
  };
}

const getFirstTagStructure = (openTag, closeTag, text, imbricatedFirst = true) => {
  const openRegexp = new RegExp(`${openTag}\\((.*)\\)`, 'g');
  const closeRegexp = new RegExp(closeTag, 'g');
  const tags = [...text.matchAll(openRegexp)];
  const endTags = [...text.matchAll(closeRegexp)];

  if (tags.length !== endTags.length) {
    throw new Error(`Each \`${openTag}\` should be closed by \`${closeTag}\`.`);
  }

  return imbricatedFirst ? getFirstLoopStructure(tags, endTags) : getFirstConditionalStructure(tags, endTags);
}

/**
 * Parse for loops in given text. Parse only simple for loop format.
 * @param {string} text 
 * @returns Text with for loops applied
 */
const parseForLoops = (text) => {
  const firstForLoop = getFirstTagStructure('@for', '@endfor', text);

  if (!firstForLoop) {
    return text;
  }

  const firstForString = firstForLoop.matchString;
  const betterForString = firstForString.replace(/\s|@for|\(|\)/g, '');
  const splittedString = betterForString.split(';');
  const variableName = splittedString[0].split('=')[0];
  const iteratorStart = splittedString[0].split('=')[1];
  const conditionIsLower = splittedString[1].includes('<');
  const conditionIsLowerOrEqual = splittedString[1].includes('<=');
  let content = text.slice(firstForLoop.begin, firstForLoop.end);
  content = content.replace(/@for\(.*\)/g, '');

  let result = text;

  const beginString = result.slice(0, firstForLoop.begin);
  const endString = result.slice(firstForLoop.end + 7);
  let conditionValue;
  if (conditionIsLowerOrEqual) {
    conditionValue = splittedString[1].split('<=')[1];
    result = beginString;
    for (let index = iteratorStart; index <= conditionValue; index++) {
      const regexp = new RegExp(`\\${variableName}`, 'g');
      const currentContent = content.replace(regexp, index.toString());
      result += currentContent;
    }
    result += endString;
  } else if (conditionIsLower) {
    conditionValue = splittedString[1].split('<')[1];
    result = beginString;
    for (let index = iteratorStart; index < conditionValue; index++) {
      const regexp = new RegExp(variableName, 'g');
      const currentContent = content.replace(regexp, index);
      result += currentContent;
    }
    result += endString;
  }

  const forLoops = [...text.matchAll(/@for\(.*\)/g)];
  if (forLoops.length > 1) {
    result = parseForLoops(result);
  }

  return result;
};

const parseIssets = (text) => {
  const firstIsset = getFirstTagStructure('@isset', '@endisset', text, false);

  if (!firstIsset) {
    return text;
  }

  const attribute = firstIsset.matchContent.replace('$', '');

  let content = text.slice(firstIsset.begin + firstIsset.matchString.length, firstIsset.end);

  let result = text;

  const beginString = result.slice(0, firstIsset.begin);
  const endString = result.slice(firstIsset.end + 9);

  result = beginString;
  if (defaultData[attribute]) {
    result += content;
  }
  result += endString;

  const issets = [...text.matchAll(/@isset\((.*)\)/g)];
  if (issets.length > 1) {
    result = parseIssets(result);
  }

  return result;
}

const parseIfs = (text) => {
  const firstIf = getFirstTagStructure('@if', '@endif', text, false);

  if (!firstIf) {
    return text;
  }

  const condition = firstIf.matchContent;
  const conditionIsEqual = condition.includes('==');
  const conditionIsStrictEqual = condition.includes('===');
  const conditionIsGreater = condition.includes('>');
  const conditionIsGreaterOrEqual = condition.includes('>=');
  const conditionIsLower = condition.includes('<');
  const conditionIsLowerOrEqual = condition.includes('<=');

  let content = text.slice(firstIf.begin + firstIf.matchString.length, firstIf.end);

  let result = text;

  const beginString = result.slice(0, firstIf.begin);
  const endString = result.slice(firstIf.end + 6);

  result = beginString;
  if (conditionIsStrictEqual) {
    const splitString = condition.split('===');
    const variable = splitString[0].replace(/\$|\s/g, '');
    const value = splitString[1].replace(/\s/g, '');
    if (defaultData[variable] && defaultData[variable] === value) {
      result += content;
    }
  } else if (conditionIsEqual) {
    const splitString = condition.split('==');
    const variable = splitString[0].replace(/\$|\s/g, '');
    const value = splitString[1].replace(/\s/g, '');
    if (defaultData[variable] && defaultData[variable] == value) {
      result += content;
    }
  } else if (conditionIsGreaterOrEqual) {
    const splitString = condition.split('>=');
    const variable = splitString[0].replace(/\$|\s/g, '');
    const value = splitString[1].replace(/\s/g, '');
    if (defaultData[variable] && defaultData[variable] >= value) {
      result += content;
    }
  } else if (conditionIsGreater) {
    const splitString = condition.split('>');
    const variable = splitString[0].replace(/\$|\s/g, '');
    const value = splitString[1].replace(/\s/g, '');
    if (defaultData[variable] && defaultData[variable] > value) {
      result += content;
    }
  } else if (conditionIsLowerOrEqual) {
    const splitString = condition.split('<=');
    const variable = splitString[0].replace(/\$|\s/g, '');
    const value = splitString[1].replace(/\s/g, '');
    if (defaultData[variable] && defaultData[variable] <= value) {
      result += content;
    }
  } else if (conditionIsLower) {
    const splitString = condition.split('<');
    const variable = splitString[0].replace(/\$|\s/g, '');
    const value = splitString[1].replace(/\s/g, '');
    if (defaultData[variable] && defaultData[variable] < value) {
      result += content;
    }
  }
  result += endString;

  const ifs = [...text.matchAll(/@if\((.*)\)/g)];
  if (ifs.length > 1) {
    result = parseIfs(result);
  }

  return result;
}

const replaceAttribute = (correspondance, p1) => {
  if (!p1) {
    return '';
  }
  // Remove useless blank spaces at start or end and useless `$` before attribute name
  let attribute = p1.trim().replace(/\$/g, '');
  if (!attribute) {
    return '';
  }
  if (!defaultData[attribute]) {
    return '';
  }
  return defaultData[attribute];
}

const replaceConcatenateAttribute = (correspondance, p1) => {
  if (!p1) {
    return '';
  }
  let attribute = p1.trim().replace(/\$/g, '');
  // Concatenate attribute name if needed
  const cleanString = attribute.replace(/\s|\"|\{|\}/g, '');
  const splittedAttribute = cleanString.split('.');
  attribute = '$';
  for (const splitString of splittedAttribute) {
    attribute += splitString.trim();
  }
  return attribute;
}

const body = document.body;
let parsedBody = body.innerHTML;
parsedBody = parsedBody.replace(/&amp;/g, '&');
parsedBody = parsedBody.replace(/&lt;/g, '<');
parsedBody = parsedBody.replace(/&gt;/g, '>');

// Replace for loops with incremented elements
parsedBody = parseForLoops(parsedBody);
// Concatenate attribute
parsedBody = parsedBody.replace(/\$\{([^\}]*)\}/g, replaceConcatenateAttribute);
// Replace attribute values
parsedBody = parsedBody.replace(/(?:\{\{|\{!!)+(.*)(?:\}\}|(?:!!)\})+/g, replaceAttribute);
// Replace live attribute values
parsedBody = parsedBody.replace(/@liveAttribute\('(.*)'\)/g, replaceAttribute);
// Replace i18n values
parsedBody = parsedBody.replace(/@i18n\('(.*)'\)/g, '$1');
// Replace @issets with content if attribute exist, else delete content
parsedBody = parseIssets(parsedBody);
// Replace @ifs with content if condition is respected, else delete content
parsedBody = parseIfs(parsedBody);
// Replace other php syntax
parsedBody = parsedBody.replace(/@+.*/g,'');
body.innerHTML = parsedBody;