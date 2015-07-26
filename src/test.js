
import chai from 'chai';
import promised from "chai-as-promised";
import {str, re, skip, finished, many, seq, maybe, run, or, done, decl, sep, map, alphaNum, lower, repeat} from ".";
import {repeat as _repeat, next, map as _map} from "./utils";

chai.use(promised);
chai.should();

describe("utils", _ => {
    describe("repeat", _ => {
        it("repeat", () => {
            let yes = _repeat(true);
            next(yes).should.equal(true);
            next(yes).should.equal(true);
        });
    });

    describe("map", _ => {
        it("string", () => {
            let collected = [];
            for (let c of _map(x => x, "str")) {
                collected.push(c);
            }
            collected.should.deep.equal(["s", "t", "r"]);
        });
    });
});

describe("parser", _ => {

    describe("str", _ => {
        it("str", done => {
            run(str("abc"), "abc").should.eventually.equal("abc").notify(done);
        });
    });

    describe("or", _ => {
        it("or", done => {
            run(or(str('ab'), str('cd')), "cd").should.eventually.equal("cd").notify(done);
        });
    });

    describe("seq", _ => {
        it("seq", done => {
            run(seq(
                str('{'),
                str("a"),
                str('}')), '{a}').should.eventually.deep.equal(["{", "a", "}"]).notify(done);
        });
        it("generator", done => {
            run(seq((function*() {
                yield str('{');
                yield str("a");
                yield str('}');
            })()) , '{a}').should.eventually.deep.equal(["{", "a", "}"]).notify(done);
        });
    });

    describe("skip", _ => {
        it("skip", done => {
            run(seq(
                skip(str('{')),
                str("a"),
                skip(str('}'))), '{a}').should.eventually.deep.equal(["a"]).notify(done);
        });
    });

    describe("regexp", _ => {
        it("regexp", done => {
            let num = re(/\d+/);
            run(num, "22.3").should.eventually.equal("22");
            run(seq(num, str("."), num), "22.3").should.eventually.deep.equal(["22", ".", "3"]).notify(done);
        });
    });

    describe("many", _ => {
        it("many", done => {
            run(many(str("ab")), "ababab").should.eventually.deep.equal(["ab", "ab", "ab"]).notify(done);
        });
        it("many", done => {
            let num = re(/\d+/);
            let array = seq(skip(str("[")),
                        many(seq(num, skip(str(",")))),
                        num,
                        skip(str("]")));
            run(array, "[1,2,3]").should.eventually.deep.equal([[["1"], ["2"]], "3"]).notify(done);
        });
    });

    describe("maybe", _ => {
        it("should null", done => {
            let num = seq(maybe(str("-")), re(/\d+/));
            run(num, "-2").should.eventually.deep.equal(["-", "2"]);
            run(num, "2").should.eventually.deep.equal([null, "2"]).notify(done);
        });
    });

    describe("map", _ => {
        it("should", done => {
            let num = map(seq(maybe(str("-")), re(/\d+/)), ([s, n])=> s? -parseInt(n): parseInt(n));
            let ws = maybe(many(str(" ")));
            let comma = skip(seq(ws, str(","), ws));
            run(seq(num, many(seq(comma, num))), "1 ,-1, 0").should.eventually.deep.equal([1, [[-1], [0]]]).notify(done);
        });
    });

    describe("done", _ => {
        it("should done", _done => {
            run(seq(str("ab"), done), "ab").should.eventually.deep.equal(["ab", null]).notify(_done);
        });
    });

    describe("decl", _ => {
        it("should decl", done => {
            let braces = decl();
            braces(seq(str("{"), maybe(braces), str("}")));
            run(braces, "{}").should.eventually.deep.equal(["{", null, "}"]);
            run(braces, "{{}}").should.eventually.deep.equal(["{", ["{", null, "}"], "}"]).notify(done);
        });
    });

    describe("sep", _ => {
        it("should sep", done => {
            let ws = skip(maybe(many(str(" "))));
            let comma = skip(str(","));
            let num = map(re(/\d+/), parseInt);
            let fst = ([x])=> x;
            run(map(seq(
                skip(str("[")),
                sep(comma, map(seq(ws, num, ws), fst)), 
                skip(str("]"))), fst), "[ 1, 2 ,3,4]")
                .should.eventually.deep.equal([1, 2, 3, 4]).notify(done);
        });
    });

    describe("alphaNumeric", _ => {
        it("should", done => {
            run(lower, "abc").should.eventually.equal('a');
            run(alphaNum, "abc ").should.eventually.equal('a').notify(done);
        });
    });

    describe("repeat", _ => {
        it("should", done => {
            run(map(repeat(3, lower), "abcd"),
                xs => xs.join('')).should.eventually.equal('abc').notify(done);
        });
    });
});
