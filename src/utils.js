
import {ParserError} from "./error";

export function* map(f, xs) {
    if (!xs[Symbol.iterator])
        throw new Error(`${xs} not iterable`);
    for (let x of xs) {
        yield f(x);
    }
}

export function* filter(f, xs) {
    for (let x of xs) {
        if (f(x)) yield x;
    }
}

export function* repeat(x) {
    while (true) yield x;
}

export var next = (xs)=> xs.next().value;

export function somep(ps) {
    return new Promise((resolve, reject)=> {
        let nextP = () => {
            let p = next(ps);
            if (p)
                p.then(resolve).catch(err => {
                    if (err instanceof ParserError)
                        nextP();
                    else
                        reject(err);
                });
            else
                reject(new ParserError("all promise failed"));
        };
        nextP();
    });
}

export function whilep(ps) {
    return new Promise((resolve, reject)=> {
        let results = [];
        let nextP = _ => {
            let p = next(ps);
            if (p)
                p.then(x=> {
                    results.push(x);
                    nextP();
                }).catch(reject);
            else
                resolve(results);
        };
        nextP();
    });
}

export function reducep(fs, initial) {
    return new Promise((resolve, reject)=> {
        let n = x => {
            let f = next(fs);
            f ? f(x).then(n).catch(reject) : resolve(x);
        };
        n(initial);
    });
}

export function iteratep(f, arg) {
    return new Promise((resolve, reject)=> {
        let iter = x => f(x).then(iter).catch(err => {
            if (err instanceof ParserError)
                resolve(x);
            else
                reject(err);
        });
        iter(arg);
    });
}

export function tee(f) {
    return x => {
        f(x);
        return x;
    };
}

export const fst = ([x, _]) => x;

export function* take(n, iterable) {
    if (!iterable[Symbol.iterator])
        throw new Error(`${iterable} not iterable`);
    for (let i of iterable) {
        if (n-- > 0)
            yield i;
        else
            return;
    }
}
