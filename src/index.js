
import {somep, whilep, fst, iteratep, tee, reducep, map as _map, repeat as _repeat, i2a, take} from "./utils";
import {ParserError} from "./error";


export function char(c) {
    return {
        parse (input, start) {
            return new Promise((resolve, reject) => {
                if (input.charAt(start) === c) {
                    resolve([c, start + 1]); }
                else
                    reject(new ParserError(`<char "${c}"> failed at ${start}`));
            });
        },
        toString: () => `<char '${c}'>`
    };
}

export const str = (str) => {
    let parser = map(seq(...str.split('').map(char)), chars => chars.join(''));
    return  {
        parse: parser.parse,
        toString: () => `<str "${str}">`
    };
};

export function re(pattern) {
    pattern = new RegExp("^" + pattern.source);
    return {
        parse (input, start) {
            return new Promise((resolve, reject)=> {
                let result = pattern.exec(input.substr(start));
                if (result)
                    resolve([result[0], result[0].length + start]);
                else
                    reject(new ParserError(`<re "${pattern.source}"> failed at ${start}`));
            });
        },
        toString: () => `<re ${pattern.source}>`
    };
}

export function or(...parsers) {
    return {
        parse: (input, start) => somep(_map(x=> x.parse(input, start), parsers)).catch(err => {
            if (err instanceof ParserError)
                throw new ParserError(`${err.message} in #<or>`);
            else
                throw err;
        }),
        toString: () => `#<or>`
    };
}

export function seq(...parsers) {
    return {
        parse (input, start) {
            let wrap = parser => ([results, pos]) => {
                if ('function' != typeof parser.parse) {
                    throw new ParserError(`${parser} is not a parser at ${pos}`);
                }
                return parser.parse(input, pos).then(([result, pos, skiped]) => {
                    if (!skiped) results.push(result);
                    return [results, pos];
                }).catch(err => {
                    if (err instanceof ParserError)
                        throw new ParserError(`${err.message} in #<seq>`);
                    else
                        throw err;
                });
            };
            if (!parsers[0])
                throw new ParserError(`need at leaset one parser`);
            let _parsers = 'function' === typeof parsers[0][Symbol.iterator] ? parsers[0] : parsers;
            return reducep(_map(wrap, _parsers), [[], start])
                .then(([results, pos])=> [results.length === 1 ? results[0]: results, pos]);
        },
        toString: () => `#<seq>`
    };
}

export function skip(parser) {
    return {
        parse: (input, start)=> parser.parse(input, start).then(([_, pos])=> [null, pos, true]),
        toString: () => `#<skip ${parser}>`
    };
}

export function many(parser) {
    return {
        parse (input, start) {
            return iteratep(([results,pos]) => {
                return parser.parse(input, pos).then(([result, pos]) => {
                    results.push(result);
                    return [results, pos];
                });
            }, [[], start]);
        },
        toString: () => `#<many ${parser}>`
    };
}

export const oneplus = (parser)=> map(seq(parser, many(parser)),
                                      ([x, xs])=> [x].concat(xs));

export function repeat(n, parser) {
    return {
        parse: seq(...take(n, _repeat(parser))).parse,
        toString: () => `#<repeat ${n} ${parser}>`
    };
};

export function sep(sepParser, parser) {
    return {
        parse: map(seq(many(seq(parser, sepParser)), parser),
                   ([items, last])=> items.concat([last])).parse,
        toString: () => `<sep ${sepParser} ${parser}>`
    };
}

export function maybe(parser) {
    return {
        parse: (input, pos)=> parser.parse(input, pos).catch(err => {
            if (err instanceof ParserError)
                return [null, pos];
            else
                throw err;
        }),
        toString: () => `<maybe ${parser}>`
    };
}

export function some(predict) {
    return {
        parse (input, pos) {
            return new Promise((resolve, reject)=>{
                if (pos >= input.length)
                    reject(new ParserError(`EOF`));
                else if (predict(input[pos]))
                    resolve([input[pos], 1 + pos]);
                else
                    reject(new ParserError(`failed at ${pos}`));
            });
        },
        toString () {
            return `<some>`;
        }
    };
}

export function decl() {
    let parser;
    return {
        parse (input, start) {
            if (parser)
                return parser.parse(input, start);
            else
                throw new ParserError("parser not defined yet");
        },
        define: (_parser)=> parser = _parser,
        toString: () => `<decl ${parser}>`
    };
}

export function map(parser, f, ...fns) {
    return {
        parse: (...args) => parser.parse(...args).then(([r,p,s])=> {
            let result = f(r);
            for (let f of fns)
                result = f(result);
            return [result, p, s];
        }),
        toString: () => `<map ${parser}>`
    };
}

export const done = {
    parse (input, start) {
        return new Promise((resolve, reject)=> {
            input.length === start ? resolve([null, 0]) : reject(new ParserError(`EOF expected at ${start}`));
        });
    }
};

export function run(parser, input) {
    return parser.parse(input, 0).then(fst);
}


export const lower = {
    parse: or(..."abcdefghijklmnopqrstuvwxyz".split("").map(char)).parse,
    toString: () => "lower"
};
export const upper = {
    parse: or(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char)).parse,
    toString: () => "upper"
};
export const digit = {
    parse: or(..."0123456789".split("").map(char)).parse,
    toString: () => "digit"
};
export const letter = {
    parse: or(lower, upper).parse,
    toString: () => "letter"
};
export const alphaNum = {
    parse: or(lower, upper, digit).parse,
    toString: () => "alphaNum"
};

export function anno (annotation, parser) {
    return {
        parse (...args) {
            return parser.parse(...args)
                .then(([result, pos, skiped])=> [[annotation, result], pos, skiped])
                .catch(err=> {
                    let msg = `${err.message} in\n${parser}(${annotation})`;
                    if (err instanceof ParserError)
                        throw new ParserError(msg);
                    throw new Error(msg);
                });
        },
        toString: () => `${parser}(${annotation})`
    };
}
