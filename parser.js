/**
 * Scrub PHP syntax during dev preview
 * If there's default data, they should be loaded in template before calling parser and should define a `defaultData` object.
 */

const getTagStructure = (openTag, closeTag, text) => {
  const openRegexp = new RegExp(`${openTag}\\((.*)\\)`, 'g');
  const closeRegexp = new RegExp(closeTag, 'g');
  const tags = [...text.matchAll(openRegexp)];
  const endTags = [...text.matchAll(closeRegexp)];

  if (tags.length !== endTags.length) {
    throw new Error(`Each \`${openTag}\` should be closed by \`${closeTag}\`.`);
  }

  const tagStructures = [];
  const indexes = [...tags.keys()];
  for (let i = 0; i < endTags.length; i++) {
    const endIndex = endTags[i].index;
    const minIndex = indexes.length ? Math.min(...indexes) : 0;
    const firstTagIndex = tags[minIndex].index;
    if (i + 1 === endTags.length) {
      tagStructures.push({
        begin: firstTagIndex,
        end: endIndex,
        matchString: tags[minIndex][0],
        matchContent: tags[minIndex][1],
      });
    }
    for (let j = 0; j < indexes.length; j++) {
      const currentIndex = tags[indexes[j]].index;
      if (currentIndex > endIndex) {
        const previousIndex = j - 1 >= 0 ? indexes[j - 1] : indexes[0];
        const previousTag = tags[previousIndex];
        tagStructures.push({
          begin: previousTag.index,
          end: endIndex,
          matchString: previousTag[0],
          matchContent: previousTag[1],
        });
        indexes.splice(j - 1, 1);
        break;
      }
    }
  }

  return tagStructures;
}

/**
 * Parse for loops in given text. Parse only simple for loop format.
 * @param {string} text 
 * @returns Text with for loops applied
 */
const parseForLoops = (text) => {
  const loopStructures = getTagStructure('@for', '@endfor', text);

  if (!loopStructures.length) {
    return text;
  }

  const firstForLoop = loopStructures[0];
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
  const issetStructures = getTagStructure('@isset', '@endisset', text);

  if (!issetStructures.length) {
    return text;
  }

  const firstIsset = issetStructures[0];
  const attribute = firstIsset.matchContent.replace('$', '');

  let content = text.slice(firstIsset.begin, firstIsset.end);
  content = content.replace(/@isset\(.*\)/g, '');

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
  const ifStructures = getTagStructure('@if', '@endif', text);

  if (!ifStructures.length) {
    return text;
  }

  const firstIf = ifStructures[0];
  const condition = firstIf.matchContent;
  const conditionIsEqual = condition.includes('==');
  const conditionIsStrictEqual = condition.includes('===');
  const conditionIsGreater = condition.includes('>');
  const conditionIsGreaterOrEqual = condition.includes('>=');
  const conditionIsLower = condition.includes('<');
  const conditionIsLowerOrEqual = condition.includes('<=');

  let content = text.slice(firstIf.begin, firstIf.end);
  content = content.replace(/@if\(.*\)/g, '');

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