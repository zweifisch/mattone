
import chai from 'chai';
import promised from "chai-as-promised";
import {char, str, re, skip, finished, many, seq, maybe, run, or, done, decl, sep, map, alphaNum, lower, repeat} from ".";
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

    describe("char", _ => {
        it("char", () =>
           run(char("a"), "a").should.eventually.equal("a"));
    });

    describe("seq", _ => {
        it("seq", () =>
            run(seq(
                char('{'),
                char("a"),
                str('}')), '{a}').should.eventually.deep.equal(["{", "a", "}"]));
        it("generator", () =>
            run(seq((function*() {
                yield str('{');
                yield str("a");
                yield str('}');
            })()) , '{a}').should.eventually.deep.equal(["{", "a", "}"]));
    });

    describe("str", _ => {
        it("str", () =>
           run(str("abc"), "abc").should.eventually.equal("abc"));
    });

    describe("or", _ => {
        it("or", () =>
           run(or(char('a'), char('b')), "ba").should.eventually.equal("b"));
    });

    describe("skip", _ => {
        it("skip", () =>
            run(seq(
                skip(str('{')),
                str("a"),
                skip(str('}'))), '{a}').should.eventually.deep.equal(["a"]));
    });

    describe("regexp", _ => {
        it("regexp", () => {
            let num = re(/\d+/);
            run(num, "22.3").should.eventually.equal("22");
            run(seq(num, str("."), num), "22.3").should.eventually.deep.equal(["22", ".", "3"]);
        });
    });

    describe("many", _ => {
        it("many", () =>
           run(many(str("ab")), "ababab").should.eventually.deep.equal(["ab", "ab", "ab"]));
        it("many", () => {
            let num = re(/\d+/);
            let array = seq(skip(str("[")),
                        many(seq(num, skip(str(",")))),
                        num,
                        skip(str("]")));
            run(array, "[1,2,3]").should.eventually.deep.equal([[["1"], ["2"]], "3"]);
        });
    });

    describe("maybe", _ => {
        let num = seq(maybe(str("-")), re(/\d+/));
        it("should null", () =>
           run(num, "-2").should.eventually.deep.equal(["-", "2"]));
        it("should null", () =>
           run(num, "2").should.eventually.deep.equal([null, "2"]));
    });

    describe("map", _ => {
        it("should", () => {
            let num = map(seq(maybe(str("-")), re(/\d+/)), ([s, n])=> s? -parseInt(n): parseInt(n));
            let ws = maybe(many(str(" ")));
            let comma = skip(seq(ws, str(","), ws));
            run(seq(num, many(seq(comma, num))), "1 ,-1, 0").should.eventually.deep.equal([1, [[-1], [0]]]);
        });
    });

    describe("done", _ => {
        it("should done", () =>
           run(seq(str("ab"), done), "ab").should.eventually.deep.equal(["ab", null]));
    });

    describe("decl", _ => {

        let braces = decl();
        braces.define(seq(str("{"), maybe(braces), str("}")));

        it("should decl", () =>
           run(braces, "{}").should.eventually.deep.equal(["{", null, "}"]));
        it("should decl", () =>
           run(braces, "{{}}").should.eventually.deep.equal(["{", ["{", null, "}"], "}"]));
    });

    describe("sep", _ => {
        it("should sep", () => {
            let ws = skip(maybe(many(str(" "))));
            let comma = skip(str(","));
            let num = map(re(/\d+/), parseInt);
            let fst = ([x])=> x;
            run(map(seq(
                skip(str("[")),
                sep(comma, map(seq(ws, num, ws), fst)), 
                skip(str("]"))), fst), "[ 1, 2 ,3,4]")
                .should.eventually.deep.equal([1, 2, 3, 4]);
        });
        it("should sep", () => {
            let comma = skip(str(","));
            let num = map(re(/\d+/), parseInt);
            run(sep(comma, num), "1")
                .should.eventually.deep.equal([1, 2, 3, 4]);
        });
    });

    describe("alphaNumeric", _ => {
        it("should", () =>
            run(lower, "abc").should.eventually.equal('a'));
        it("should", () =>
            run(alphaNum, "abc ").should.eventually.equal('a'));
    });

    describe("repeat", _ => {
        it("should", () =>
            run(map(repeat(3, lower),
                    xs => xs.join(''))
                ,"abcd").should.eventually.equal('abc'));
    });
});
