"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
;
;
;
;
const grammar = {
    Lexer: undefined,
    ParserRules: [
        { "name": "expression$ebnf$1$subexpression$1$subexpression$1", "symbols": [/[aA]/, /[nN]/, /[dD]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "expression$ebnf$1$subexpression$1", "symbols": [/[\s]/, "expression$ebnf$1$subexpression$1$subexpression$1", /[\s]/, "item"] },
        { "name": "expression$ebnf$1", "symbols": ["expression$ebnf$1$subexpression$1"], "postprocess": id },
        { "name": "expression$ebnf$1", "symbols": [], "postprocess": () => null },
        { "name": "expression", "symbols": ["item", "expression$ebnf$1"], "postprocess": (match) => {
                return match[1] ? [match[0], match[1][3]] : [match[0]];
            } },
        { "name": "item$ebnf$1$subexpression$1", "symbols": [/[\s]/, "frequency"] },
        { "name": "item$ebnf$1", "symbols": ["item$ebnf$1$subexpression$1"], "postprocess": id },
        { "name": "item$ebnf$1", "symbols": [], "postprocess": () => null },
        { "name": "item$ebnf$2$subexpression$1", "symbols": [/[\s]/, "deductible"] },
        { "name": "item$ebnf$2", "symbols": ["item$ebnf$2$subexpression$1"], "postprocess": id },
        { "name": "item$ebnf$2", "symbols": [], "postprocess": () => null },
        { "name": "item", "symbols": ["cost", "item$ebnf$1", "item$ebnf$2"], "postprocess": (match) => {
                const frequency = match[1] ? match[1][1] : "once";
                const deductible = match[2] ? match[2][1] : "non";
                const value = typeof match[0] === "string" ? {
                    value: 0,
                    isPercent: false,
                } : match[0];
                if (typeof match[0] === "string" && match[0].toLowerCase() === "unknown") {
                    return { isKnown: false };
                }
                else if (typeof match[0] === "string" && match[0].toLowerCase() === "included in medical") {
                    return { isKnown: true, includedWithMedical: true };
                }
                else {
                    return {
                        isKnown: true,
                        includedWithMedical: false,
                        ...value,
                        deductible,
                        per: frequency,
                    };
                }
            } },
        { "name": "cost$subexpression$1", "symbols": [/[nN]/, /[oO]/, { "literal": " " }, /[cC]/, /[hH]/, /[aA]/, /[rR]/, /[gG]/, /[eE]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "cost", "symbols": ["cost$subexpression$1"] },
        { "name": "cost$subexpression$2", "symbols": [/[iI]/, /[nN]/, /[cC]/, /[lL]/, /[uU]/, /[dD]/, /[eE]/, /[dD]/, { "literal": " " }, /[iI]/, /[nN]/, { "literal": " " }, /[mM]/, /[eE]/, /[dD]/, /[iI]/, /[cC]/, /[aA]/, /[lL]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "cost", "symbols": ["cost$subexpression$2"] },
        { "name": "cost$subexpression$3", "symbols": [/[sS]/, /[eE]/, /[eE]/, { "literal": " " }, /[pP]/, /[lL]/, /[aA]/, /[nN]/, { "literal": " " }, /[bB]/, /[rR]/, /[oO]/, /[cC]/, /[hH]/, /[uU]/, /[rR]/, /[eE]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "cost", "symbols": ["cost$subexpression$3"], "postprocess": (match) => "unknown" },
        { "name": "cost$subexpression$4", "symbols": [/[nN]/, /[oO]/, /[tT]/, { "literal": " " }, /[aA]/, /[pP]/, /[pP]/, /[lL]/, /[iI]/, /[cC]/, /[aA]/, /[bB]/, /[lL]/, /[eE]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "cost", "symbols": ["cost$subexpression$4"], "postprocess": (match) => "unknown" },
        { "name": "cost$ebnf$1", "symbols": [] },
        { "name": "cost$ebnf$1", "symbols": ["cost$ebnf$1", /[\d,.]/], "postprocess": (d) => d[0].concat([d[1]]) },
        { "name": "cost$ebnf$2$subexpression$1$subexpression$1", "symbols": [/[cC]/, /[oO]/, /[pP]/, /[aA]/, /[yY]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "cost$ebnf$2$subexpression$1", "symbols": [/[\s]/, "cost$ebnf$2$subexpression$1$subexpression$1"] },
        { "name": "cost$ebnf$2", "symbols": ["cost$ebnf$2$subexpression$1"], "postprocess": id },
        { "name": "cost$ebnf$2", "symbols": [], "postprocess": () => null },
        { "name": "cost", "symbols": [{ "literal": "$" }, /[\d]/, "cost$ebnf$1", "cost$ebnf$2"], "postprocess": (match) => {
                return {
                    value: require('numeral')(match[0] + match[1] + (match[2]?.join('')?.replace(',', '') ?? "")).value(),
                    isPercent: false,
                };
            } },
        { "name": "cost$ebnf$3", "symbols": [/[\d.]/] },
        { "name": "cost$ebnf$3", "symbols": ["cost$ebnf$3", /[\d.]/], "postprocess": (d) => d[0].concat([d[1]]) },
        { "name": "cost$ebnf$4$subexpression$1$subexpression$1", "symbols": [/[cC]/, /[oO]/, /[iI]/, /[nN]/, /[sS]/, /[uU]/, /[rR]/, /[aA]/, /[nN]/, /[cC]/, /[eE]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "cost$ebnf$4$subexpression$1", "symbols": [/[\s]/, "cost$ebnf$4$subexpression$1$subexpression$1"] },
        { "name": "cost$ebnf$4", "symbols": ["cost$ebnf$4$subexpression$1"], "postprocess": id },
        { "name": "cost$ebnf$4", "symbols": [], "postprocess": () => null },
        { "name": "cost", "symbols": ["cost$ebnf$3", { "literal": "%" }, "cost$ebnf$4"], "postprocess": (match) => {
                return {
                    value: require('numeral')(match[0].join("") + match[1]).value(),
                    isPercent: true,
                };
            } },
        { "name": "frequency$subexpression$1", "symbols": [/[pP]/, /[eE]/, /[rR]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "frequency$subexpression$2$subexpression$1", "symbols": [/[sS]/, /[tT]/, /[aA]/, /[yY]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "frequency$subexpression$2", "symbols": ["frequency$subexpression$2$subexpression$1"] },
        { "name": "frequency$subexpression$2$subexpression$2", "symbols": [/[dD]/, /[aA]/, /[yY]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "frequency$subexpression$2", "symbols": ["frequency$subexpression$2$subexpression$2"] },
        { "name": "frequency", "symbols": ["frequency$subexpression$1", /[\s]/, "frequency$subexpression$2"], "postprocess": (match) => match[2] },
        { "name": "deductible$subexpression$1$subexpression$1", "symbols": [/[wW]/, /[iI]/, /[tT]/, /[hH]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "deductible$subexpression$1", "symbols": ["deductible$subexpression$1$subexpression$1"] },
        { "name": "deductible$subexpression$1$subexpression$2", "symbols": [/[aA]/, /[fF]/, /[tT]/, /[eE]/, /[rR]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "deductible$subexpression$1", "symbols": ["deductible$subexpression$1$subexpression$2"] },
        { "name": "deductible$subexpression$2", "symbols": [/[dD]/, /[eE]/, /[dD]/, /[uU]/, /[cC]/, /[tT]/, /[iI]/, /[bB]/, /[lL]/, /[eE]/], "postprocess": function (d) { return d.join(""); } },
        { "name": "deductible", "symbols": ["deductible$subexpression$1", /[\s]/, "deductible$subexpression$2"], "postprocess": (match) => match[0] }
    ],
    ParserStart: "expression",
};
exports.default = grammar;
//# sourceMappingURL=grammar.js.map