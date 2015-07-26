
import {somep, whilep, fst, iteratep, tee, reducep, map as _map, repeat as _repeat, i2a, take} from "./utils";


export function char(c) {
    return (input, start) => {
        return new Promise((resolve, reject) => {
            if (input.charAt(start) === c) {
                resolve([c, start + 1]); }
            else
                reject(Error(`<char "${c}"> failed at ${start}`));
        });
    };
}

export const str = (str) => map(seq(...str.split('').map(char)), chars => chars.join(''));

export function re(pattern) {
    pattern = new RegExp("^" + pattern.source);
    return (input, start) => {
        return new Promise((resolve, reject)=> {
            let result = pattern.exec(input.substr(start));
            if (result)
                resolve([result[0], result[0].length + start]);
            else
                reject(Error(`<re "${pattern.source}"> failed at ${start}`));
        });
    };
}

export function or(...parsers) {
    return (input, start) => {
        return somep(_map(x=> x(input, start), parsers));
    };
}

export function seq(...parsers) {
    return (input, start) => {
        let wrap = parser => ([results, pos]) => {
                if ("function" !== typeof parser) throw Error(`invalid parser at ${pos}`);
                return parser(input, pos).then(([result, pos, skiped]) => {
                    if (!skiped) results.push(result);
                    return [results, pos];
                });
        };
        return reducep(_map(wrap, "function" === typeof parsers[0] ? parsers : parsers[0]), [[], start]);
    };
}

export function skip(parser) {
    return (input, start)=> {
        return parser(input, start).then(([_, pos])=> [null, pos, true]);
    };
}

export function many(parser) {
    return (input, start)=> {
        return iteratep(([results,pos]) => {
            return parser(input, pos).then(([result, pos]) => {
                results.push(result);
                return [results, pos];
            });
        }, [[], start]);
    };
}

export const oneplus = (parser)=> seq(parser, many(parser));

export const repeat = (n, parser)=> seq(...take(n, _repeat(parser)));

export function sep(sepParser, parser) {
    return map(seq(many(seq(parser, sepParser)), parser), ([items, last])=> [].concat.apply([], items.concat([last])));
}

export function maybe(parser) {
    return (input, pos)=> parser(input, pos).catch(x => [null, pos]);
}

export function decl() {
    let parser;
    return (input, start=null)=> {
        if (start === null) {
            // define
            return parser = input;
        } else {
            if (parser)
                return parser(input, start);
            else
                throw Error("parser not defined yet");
        }
    };
}

export const map = (parser, f) => (...args) => parser(...args).then(([r,p,s])=> [f(r),p,s]);

export function done(input, start) {
    return new Promise((resolve, reject)=> {
        input.length === start ? resolve([null, 0]) : reject(Error(`EOF expected at ${start}`));
    });
}

export function run(parser, input) {
    return parser(input, 0).then(fst);
}


export const lower = or(..."abcdefghijklmnopqrstuvwxyz".split("").map(char));
export const upper = or(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char));
export const digit = or(..."0123456789".split("").map(char));
export const letter = or(lower, upper);
export const alphaNum = or(lower, upper, digit);
