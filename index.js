
import {somep, whilep, map, fst, repeat, iteratep, tee, reducep} from "./utils";


export function str(str) {
    return (input, start) => {
        return new Promise((resolve, reject) => {
            if (str === input.substr(start, str.length))
                resolve([str, str.length + start]);
            else
                reject(`<str ${str}> failed at ${start}`);
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
                reject(`<re ${pattern.source}> failed at ${start}`);
        });
    };
}

export function or(...parsers) {
    return (input, start) => {
        return somep(map(x=> x(input, start), parsers));
    };
}

export function seq(...parsers) {
    return (input, start) => {
        let wrap = parser => ([results, pos]) =>
                parser(input, pos).then(([result, pos, skiped]) => {
                    if (!skiped) results.push(result);
                    return [results, pos];
                });
        return reducep(map(wrap, parsers), [[], start]);
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

export function maybe(parser) {
    return (input, pos)=> parser(input, pos).catch(x => [null, pos]);
}

export function done(input, start) {
    return new Promise((resolve, reject)=> {
        input.length === start ? resolve([null, 0]) : reject(`EOF expected at ${start}`);
    });
}

export function run(parser, input) {
    return parser(input, 0).then(fst);
}
