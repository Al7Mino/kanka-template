const defaultData = {
  job: 'Bounty hunter',
  height: '175',
  weight: '70',
  catchphrase: 'Life has no price, death does',
  movement: 'Normal',
  ptForce: 2,
  ptDarkForce: 1,
  ptCharacter: 5,
  money: 2000,
  experience: 100,
  notes: 'Nothing particular',
  dex_value: '4D',
  dex_skill_1: 'Archaic weapon',
  dex_skill_1_value: '',
  dex_skill_2: 'Blaster',
  dex_skill_2_value: '6D',
  dex_skill_3_sub: 'Spé: blaster pistol',
  dex_skill_3_value: '7D',
  dex_skill_4: 'Blaster artillery',
  dex_skill_4_value: '',
  dex_skill_5: 'Bowcaster',
  dex_skill_5_value: '',
  dex_skill_6: 'Brawling parry',
  dex_skill_6_value: '',
  dex_skill_7: 'Dodge',
  dex_skill_7_value: '6D',
  dex_skill_8: 'Grenade',
  dex_skill_8_value: '5D',
  dex_skill_9: 'Lightsaber',
  dex_skill_9_value: '',
  dex_skill_10: 'Melee combat',
  dex_skill_10_value: '',
  dex_skill_11_sub: 'Spé: vibroblades',
  dex_skill_11_value: '6D',
  dex_skill_12: 'Melee Parry',
  dex_skill_12_value: '',
  dex_skill_13: 'Missile weapons',
  dex_skill_13_value: '',
  dex_skill_14: 'Pick pocket',
  dex_skill_14_value: '',
  dex_skill_15: 'Running',
  dex_skill_15_value: '',
  dex_skill_16: 'Thrown weapons',
  dex_skill_16_value: '',
  mec_value: '3D',
  mec_skill_1: 'Astrogation',
  mec_skill_1_value: '5D',
  mec_skill_2: 'Beast riding',
  mec_skill_2_value: '',
  mec_skill_3: 'Communications',
  mec_skill_3_value: '',
  mec_skill_4: 'Sensors',
  mec_skill_4_value: '',
  mec_skill_5: 'Space transports',
  mec_skill_5_value: '',
  mec_skill_6_sub: 'Spé: YT-1300 transport',
  mec_skill_6_value: '',
  mec_skill_7: 'Starfighter piloting',
  mec_skill_7_value: '4D',
  mec_skill_8: 'Starship gunnery',
  mec_skill_8_value: '',
  mec_skill_9: 'Starship shields',
  mec_skill_9_value: '',
  mec_skill_10: 'Swoop operation',
  mec_skill_10_value: '',
  mec_skill_11: 'Walker operation',
  mec_skill_11_value: '',
  mec_skill_12: 'Jetpack operation',
  mec_skill_12_value: '',
  mec_skill_13: '',
  mec_skill_13_value: '',
  mec_skill_14: '',
  mec_skill_14_value: '',
  tech_value: '2D',
  tech_skill_1: 'Armor repair',
  tech_skill_1_value: '',
  tech_skill_2: 'Blaster repair',
  tech_skill_2_value: '',
  tech_skill_3: 'Computer programming/repair',
  tech_skill_3_value: '',
  tech_skill_4: 'Demolitions',
  tech_skill_4_value: '',
  tech_skill_5: 'Droid programming',
  tech_skill_5_value: '',
  tech_skill_6: 'Droid repair',
  tech_skill_6_value: '',
  tech_skill_7: 'First aid',
  tech_skill_7_value: '',
  tech_skill_8: 'Ground vehicle repair',
  tech_skill_8_value: '',
  tech_skill_9: '(A) Medicine',
  tech_skill_9_value: '',
  tech_skill_10: 'Security',
  tech_skill_10_value: '',
  tech_skill_11: 'Space transports repair',
  tech_skill_11_value: '',
  tech_skill_12: 'Starfighter repair',
  tech_skill_12_value: '',
  tech_skill_13: 'Starship weapon repair',
  tech_skill_13_value: '',
  tech_skill_14: 'Walker repair',
  tech_skill_14_value: '',
  tech_skill_15: '',
  tech_skill_15_value: '',
  tech_skill_16: '',
  tech_skill_16_value: '',
  tech_skill_17: '',
  tech_skill_17_value: '',
  tech_skill_18: '',
  tech_skill_18_value: '',
  tech_skill_19: '',
  tech_skill_19_value: '',
  knw_value: '2D',
  knw_skill_1: 'Alien species',
  knw_skill_1_value: '',
  knw_skill_2: 'Bureaucracy',
  knw_skill_2_value: '',
  knw_skill_3: 'Business',
  knw_skill_3_value: '',
  knw_skill_4: 'Cultures',
  knw_skill_4_value: '',
  knw_skill_5: 'Intimidation',
  knw_skill_5_value: '5D',
  knw_skill_6: 'Languages',
  knw_skill_6_value: '',
  knw_skill_7: 'Law enforcement',
  knw_skill_7_value: '',
  knw_skill_8: 'Planetary systems',
  knw_skill_8_value: '',
  knw_skill_9: 'Scholar',
  knw_skill_9_value: '',
  knw_skill_10: 'Streetwise',
  knw_skill_10_value: '5D',
  knw_skill_11: 'Survival',
  knw_skill_11_value: '',
  knw_skill_12: 'Tactics',
  knw_skill_12_value: '',
  knw_skill_13: 'Willpower',
  knw_skill_13_value: '',
  per_value: '3D',
  per_skill_1: 'Bargain',
  per_skill_1_value: '',
  per_skill_2: 'Command',
  per_skill_2_value: '',
  per_skill_3: 'Con',
  per_skill_3_value: '',
  per_skill_4: 'Gambling',
  per_skill_4_value: '',
  per_skill_5: 'Hide',
  per_skill_5_value: '',
  per_skill_6: 'Investigation',
  per_skill_6_value: '4D',
  per_skill_7: 'Persuasion',
  per_skill_7_value: '',
  per_skill_8: 'Search',
  per_skill_8_value: '',
  per_skill_9: 'Sneak',
  per_skill_9_value: '5D',
  vig_value: '4D',
  vig_skill_1: 'Brawling',
  vig_skill_1_value: '',
  vig_skill_2: 'Climbing/Jumping',
  vig_skill_2_value: '',
  vig_skill_3: 'Lifting',
  vig_skill_3_value: '',
  vig_skill_4: 'Stamina',
  vig_skill_4_value: '',
  vig_skill_5: 'Swimming',
  vig_skill_5_value: '',
  vig_skill_6: '',
  vig_skill_6_value: '',
};