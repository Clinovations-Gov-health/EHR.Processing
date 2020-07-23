// Generated automatically by nearley, version 2.19.5
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }

interface NearleyToken {  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: NearleyToken) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {"name": "expression$subexpression$1", "symbols": [/[nN]/, /[oO]/, /[tT]/, {"literal":" "}, /[aA]/, /[pP]/, /[pP]/, /[lL]/, /[iI]/, /[cC]/, /[aA]/, /[bB]/, /[lL]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "expression", "symbols": ["expression$subexpression$1"], "postprocess": match => undefined},
    {"name": "expression$ebnf$1$subexpression$1$subexpression$1", "symbols": [{"literal":" "}, /[cC]/, /[oO]/, /[pP]/, /[aA]/, /[yY]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "expression$ebnf$1$subexpression$1", "symbols": ["expression$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "expression$ebnf$1", "symbols": ["expression$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "expression$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "expression$ebnf$2$subexpression$1", "symbols": [{"literal":" "}, "frequency"]},
    {"name": "expression$ebnf$2", "symbols": ["expression$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "expression$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "expression$ebnf$3$subexpression$1", "symbols": [{"literal":" "}, "deductibles"]},
    {"name": "expression$ebnf$3", "symbols": ["expression$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "expression$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "expression", "symbols": ["dollar", "expression$ebnf$1", "expression$ebnf$2", "expression$ebnf$3"], "postprocess":  match => {
            return {
                amount: match[0],
                isPercent: false,
                deductibleStatus: match[3] ? match[3][1] : "unknown",
                frequency: match[2] ? match[2][1] : "once",
            };
        } },
    {"name": "expression$ebnf$4$subexpression$1$subexpression$1", "symbols": [{"literal":" "}, /[cC]/, /[oO]/, /[iI]/, /[nN]/, /[sS]/, /[uU]/, /[rR]/, /[aA]/, /[nN]/, /[cC]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "expression$ebnf$4$subexpression$1", "symbols": ["expression$ebnf$4$subexpression$1$subexpression$1"]},
    {"name": "expression$ebnf$4", "symbols": ["expression$ebnf$4$subexpression$1"], "postprocess": id},
    {"name": "expression$ebnf$4", "symbols": [], "postprocess": () => null},
    {"name": "expression$ebnf$5$subexpression$1", "symbols": [{"literal":" "}, "deductibles"]},
    {"name": "expression$ebnf$5", "symbols": ["expression$ebnf$5$subexpression$1"], "postprocess": id},
    {"name": "expression$ebnf$5", "symbols": [], "postprocess": () => null},
    {"name": "expression", "symbols": ["percentage", "expression$ebnf$4", "expression$ebnf$5"], "postprocess":  match => {
            return {
                amount: match[0],
                isPercent: true,
                deductibleStatus: match[2] ? match[2][1] : "unknown",
            };
        } },
    {"name": "dollar$subexpression$1", "symbols": [{"literal":"$"}], "postprocess": function(d) {return d.join(""); }},
    {"name": "dollar$ebnf$1$subexpression$1", "symbols": [/[\d\,\.]/]},
    {"name": "dollar$ebnf$1", "symbols": ["dollar$ebnf$1$subexpression$1"]},
    {"name": "dollar$ebnf$1$subexpression$2", "symbols": [/[\d\,\.]/]},
    {"name": "dollar$ebnf$1", "symbols": ["dollar$ebnf$1", "dollar$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "dollar", "symbols": ["dollar$subexpression$1", "dollar$ebnf$1"], "postprocess": match => parseFloat(match[1].join(""))},
    {"name": "dollar$subexpression$2", "symbols": [/[nN]/, /[oO]/, {"literal":" "}, /[cC]/, /[hH]/, /[aA]/, /[rR]/, /[gG]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "dollar", "symbols": ["dollar$subexpression$2"], "postprocess": match => 0},
    {"name": "percentage$ebnf$1$subexpression$1", "symbols": [/[\d\,\.]/]},
    {"name": "percentage$ebnf$1", "symbols": ["percentage$ebnf$1$subexpression$1"]},
    {"name": "percentage$ebnf$1$subexpression$2", "symbols": [/[\d\,\.]/]},
    {"name": "percentage$ebnf$1", "symbols": ["percentage$ebnf$1", "percentage$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "percentage$subexpression$1", "symbols": [{"literal":"%"}], "postprocess": function(d) {return d.join(""); }},
    {"name": "percentage", "symbols": ["percentage$ebnf$1", "percentage$subexpression$1"], "postprocess": match => parseFloat(match[0].join(""))},
    {"name": "percentage$subexpression$2", "symbols": [/[nN]/, /[oO]/, {"literal":" "}, /[cC]/, /[hH]/, /[aA]/, /[rR]/, /[gG]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "percentage", "symbols": ["percentage$subexpression$2"], "postprocess": match => 0},
    {"name": "frequency$string$1", "symbols": [{"literal":"p"}, {"literal":"e"}, {"literal":"r"}, {"literal":" "}], "postprocess": (d) => d.join('')},
    {"name": "frequency$subexpression$1$subexpression$1", "symbols": [/[dD]/, /[aA]/, /[yY]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frequency$subexpression$1", "symbols": ["frequency$subexpression$1$subexpression$1"]},
    {"name": "frequency$subexpression$1$subexpression$2", "symbols": [/[sS]/, /[tT]/, /[aA]/, /[yY]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frequency$subexpression$1", "symbols": ["frequency$subexpression$1$subexpression$2"]},
    {"name": "frequency", "symbols": ["frequency$string$1", "frequency$subexpression$1"], "postprocess": match => match[1][0].toLowerCase()},
    {"name": "deductibles$subexpression$1$subexpression$1", "symbols": [/[aA]/, /[fF]/, /[tT]/, /[eE]/, /[rR]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "deductibles$subexpression$1", "symbols": ["deductibles$subexpression$1$subexpression$1"]},
    {"name": "deductibles$subexpression$1$subexpression$2", "symbols": [/[wW]/, /[iI]/, /[tT]/, /[hH]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "deductibles$subexpression$1", "symbols": ["deductibles$subexpression$1$subexpression$2"]},
    {"name": "deductibles$subexpression$2", "symbols": [{"literal":" "}, /[dD]/, /[eE]/, /[dD]/, /[uU]/, /[cC]/, /[tT]/, /[iI]/, /[bB]/, /[lL]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "deductibles", "symbols": ["deductibles$subexpression$1", "deductibles$subexpression$2"], "postprocess": (match) => match[0] === "after" ? "after" : "before"}
  ],
  ParserStart: "expression",
};

export default grammar;
