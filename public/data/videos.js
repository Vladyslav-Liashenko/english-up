// Короткі відео BBC Learning English для кінця уроку: по 10 на рівень (урок n -> відео n).
// [YouTube ID, назва]. Відтворюються всередині застосунку (youtube-nocookie embed).
window.VIDEOS = {
  A1: [
    ['I_tRSrPru94', 'How to introduce yourself'],
    ['bq6GBbh3uhU', 'How to talk about your daily routine'],
    ['aiUGN3TDvw4', 'How to talk about activities'],
    ['sMg4vj6ugSs', 'Describing the weather'],
    ['wUF33157hYI', 'Likes and dislikes'],
    ['kTf0V4HyFtM', 'What you did last weekend'],
    ['hK8KwiGOWb4', 'How to say hello like a British speaker'],
    ['81MmK177K_c', 'Talking about the time'],
    ['v9EU41cuhHY', 'How to describe your family'],
    ['wkmKA2zGn6k', 'Prepositions of place: in, at, on']
  ],
  A2: [
    ['T-L0BBB2icQ', 'Will vs be going to'],
    ['yyClpj_GJDc', 'How to talk about your feelings'],
    ['on_1sS6Ii8M', 'How to talk about your home town'],
    ['ceOhxZjDt-g', 'How to describe things'],
    ['N9B59PHIFbA', 'Make and do'],
    ['4kOBvS-asdE', 'Been vs gone'],
    ['VY5nh_-1phQ', "I've done or I did?"],
    ['o-GWYDA4IQY', "Present perfect with 'ever' and 'never'"],
    ['2mnL9jPVzsk', 'Talking about clothes shopping'],
    ['uLoZ0OfxXfc', "5 uses of 'get'"]
  ],
  B1: [
    ['pvoqkQHb3lo', 'Present perfect simple or continuous?'],
    ['sSZcAh42qtI', "Present perfect with 'for' and 'since'"],
    ['60RsFyoaOxg', 'The past perfect tense in a minute'],
    ['vyvGJrB7WNM', 'The past perfect tense'],
    ['8_nhtAwI0dA', "Just, already and yet"],
    ['FGQPFqqduec', 'Take a tenses tour'],
    ['X6LuWwb9whM', 'How to use present tenses'],
    ['B-zN3MbwFTg', 'Journey and trip'],
    ['TL61VKkme14', 'Talking about meetings'],
    ['qUri6Agl-rg', '4 verbs for cooking']
  ],
  B2: [
    ['8c20lS2t8f0', 'Past simple and past perfect'],
    ['nI5zaB6QL-o', 'Present and past passives'],
    ['XRZMlJRqhvw', 'A walk in the park'],
    ['BiaUB9bz8jc', 'Have a go'],
    ['SuV-uETO1hc', 'Up your game'],
    ['4sFv_azG1og', 'A bright spark'],
    ['ty33i4waFqE', 'Whizz-kid'],
    ['7G09ElS_2-A', "That'll teach you!"],
    ['4SWSI5tJTUE', 'So done with'],
    ['KZL4iPBSfEw', 'Oomph']
  ],
  C1: [
    ['KA0FWnFw4Hk', 'Catch-22'],
    ['xZS_164E7ak', 'Workation'],
    ['C4TDI8z3Ej8', 'Smombie'],
    ['KB-Uai40fJ8', 'Awesomesauce'],
    ['FZQge9dZ1HQ', 'Lolz'],
    ['YAsDeXcYyTg', 'Scared to speak English?'],
    ['wkjSBC-_bDA', 'How do you learn to speak a language?'],
    ['-XcALxwXJVY', 'Can apps teach you a language?'],
    ['LDkvRFCm8No', 'How can I speak English more fluently?'],
    ['lOKD08QAhyc', 'How can I stop translating?']
  ],
  C2: [
    ['_5siHrpPnmw', 'The health benefits of apples'],
    ['Y681hXWwhQY', 'The benefits of doing nothing'],
    ['h-NZcQF7jgI', 'Learning from different generations'],
    ['YjwHsdFZPxE', 'The future of food'],
    ['0XccoTXPu_c', 'What if athletes were allowed to take drugs?'],
    ['_zmMl7T8164', 'Can AI solve crime?'],
    ['DJSvLo9dA9U', 'Did a civilisation exist before humans?'],
    ['XgLdOI6UsJY', 'Present perfect and past simple: the grammar gameshow'],
    ['PgsG98vByiw', 'The past simple tense'],
    ['t25LxJkZ1Ng', 'Morning routine: phrasal verbs']
  ]
};
window.lessonVideo = function (level, n) {
  var list = window.VIDEOS[level] || [];
  return list.length ? list[(n - 1) % list.length] : null;
};
