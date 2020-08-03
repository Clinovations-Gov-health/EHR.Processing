@preprocessor typescript

expression -> 
     "Not Applicable"i                      {% match => undefined %}
    | dollar (" copay"i):? (" " frequency):? (" " deductibles):?  {% match => {
        return {
            amount: match[0],
            isPercent: false,
            deductibleStatus: match[3] ? match[3][1] : "unknown",
            frequency: match[2] ? match[2][1] : "once",
        };
    } %}
    | percentage (" coinsurance"i):? (" " deductibles):? {% match => {
        return {
            amount: match[0],
            isPercent: true,
            deductibleStatus: match[2] ? match[2][1] : "unknown",
        };
    } %}

dollar -> 
     "$"i ([\d\,\.]):+                      {% match => parseFloat(match[1].join("")) %}
    | "No Charge"i                          {% match => 0 %}

percentage ->
     ([\d\,\.]):+ "%"i                      {% match => parseFloat(match[0].join("")) %}
     | "No Charge"i                         {% match => 0 %}

frequency -> "per " ("day"i | "stay"i)      {% match => match[1][0].toLowerCase() %}

deductibles -> ("after"i | "with"i) " deductible"i {% (match) => match[0] === "after" ? "after" : "before" %}