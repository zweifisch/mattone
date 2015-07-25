
import {somep, whilep, fst, repeat, iteratep, tee, reducep, map as _map} from "./utils";


export function str(str) {
    return (input, start) => {
        return new Promise((resolve, reject) => {
            if (str === input.substr(start, str.length))
                resolve([str, str.length + start]);
            else
                reject(Error(`<str "${str}"> failed at ${start}`));
        });
    };
}

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
        let wrap = parser => ([results, pos]) =>
                parser(input, pos).then(([result, pos, skiped]) => {
                    if (!skiped) results.push(result);
                    return [results, pos];
                });
        return reducep(_map(wrap, parsers), [[], start]);
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
