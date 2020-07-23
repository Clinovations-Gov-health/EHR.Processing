@preprocessor typescript

expression -> text " per "i (frequencyNum " "i):? text {% (match) => ({
    unit: match[0],
    frequencyNum: match[2] ? match[2][0] : 1,
    frequencyUnit: match[3]
}) %}

text -> [^\d(s]:+ ("s"i | "(s)"i):? {% (match) => match[0].join('').toLowerCase() %}

frequencyNum -> [\d] {% (match) => parseInt(match[0]) %}