@preprocessor typescript

expression -> item ([\s] "and"i [\s] item):? {% (match) => {
    return match[1] ? [match[0], match[1][3]] : [match[0]];
} %}
item -> cost ([\s] frequency):? ([\s] deductible):? {% (match) => {
    const frequency = match[1] ? match[1][1][0].toLowerCase() : "once";
    const deductible = match[2] ? match[2][1][0].toLowerCase() : "non";
    const value = typeof match[0] === "string" ? {
        value: 0,
        isPercent: false,
    } : match[0];

    if (typeof match[0] === "string" && match[0].toLowerCase() === "unknown") {
        return { isKnown: false }
    } else if (typeof match[0] === "string" && match[0].toLowerCase() === "included in medical") {
        return { isKnown: true, includedWithMedical: true };
    } else {
        return {
            isKnown: true,
            includedWithMedical: false,
            ...value,
            deductible,
            per: frequency,
        };
    }
}%}

cost -> "no charge"i
    |   "included in medical"i
    |   "see plan brochure"i {% (match) => "unknown" %}
    |   "not applicable"i {% (match) => "unknown" %}
    |   "$" [\d] [\d,.]:* ([\s] "copay"i):? {% (match) => {
            return {
                value: require('numeral')(match[0] + match[1] + (match[2]?.join('')?.replace(',', '') ?? "")).value(),
                isPercent: false,
            };
        } %} # Integer dollar value
    |   [\d.]:+ "%" ([\s] "coinsurance"i):? {% (match) => {
            return {
                value: require('numeral')(match[0].join("") + match[1]).value(),
                isPercent: true,
            };
        } %} # Percentage value

frequency -> "per"i [\s] ("stay"i | "day"i) {% (match) => match[2] %}

deductible -> ("with"i | "after"i) [\s] "deductible"i {% (match) => match[0] %}