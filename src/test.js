
import chai from 'chai';
import promised from "chai-as-promised";
import {char, str, re, skip, finished, many, seq, maybe, run, or, done, decl, sep, map, alphaNum, lower, repeat, oneplus, letter} from ".";
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
            [..._map(x => x, "str")].should.deep.equal(["s", "t", "r"]);
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
                char('}')), '{a}').should.eventually.deep.equal(["{", "a", "}"]));
        it("generator", () =>
            run(seq((function*() {
                yield char('{');
                yield char("a");
                yield char('}');
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
                skip(char('{')),
                char("a"),
                skip(char('}'))), '{a}').should.eventually.deep.equal("a"));
    });

    describe("regexp", _ => {
        let num = re(/\d+/);
        it("regexp", () =>
           run(seq(num, char("."), num), "22.3").should.eventually.deep.equal(["22", ".", "3"]));
        it("regexp", () =>
           run(num, "22.3").should.eventually.equal("22"));
    });

    describe("many", _ => {
        it("should match zero times", () =>
           run(many(letter), "123").should.eventually.deep.equal([]));
        it("should match many times", () =>
           run(many(letter), "abc").should.eventually.deep.equal(["a", "b", "c"]));
    });

    describe("maybe", _ => {
        let num = seq(maybe(char("-")), re(/\d+/));
        it("should null", () =>
           run(num, "-2").should.eventually.deep.equal(["-", "2"]));
        it("should null", () =>
           run(num, "2").should.eventually.deep.equal([null, "2"]));
    });

    describe("map", _ => {
        it("should", () => {
            let num = map(seq(maybe(char("-")), re(/\d+/)), ([s, n])=> s? -parseInt(n): parseInt(n));
            let ws = maybe(many(char(" ")));
            let comma = skip(seq(ws, char(","), ws));
            return run(seq(num, many(seq(comma, num))), "1 ,-1, 0").should.eventually.deep.equal([1, [-1, 0]]);
        });
        let incr = (amount)=> (x)=> x + amount;
        let num = map(re(/\d+/), parseInt, incr(2), incr(1));
        it("should map mutiple times", () =>
           run(num, "2").should.eventually.equal(5));
        it("should map mutiple times", () =>
           run(num, "0").should.eventually.equal(3));
    });

    describe("done", _ => {
        it("should done", () =>
           run(seq(str("ab"), done), "ab").should.eventually.deep.equal(["ab", null]));
    });

    describe("decl", _ => {

        let braces = decl();
        braces.define(seq(char("{"), maybe(braces), char("}")));

        it("should decl", () =>
           run(braces, "{}").should.eventually.deep.equal(["{", null, "}"]));
        it("should decl", () =>
           run(braces, "{{}}").should.eventually.deep.equal(["{", ["{", null, "}"], "}"]));
    });

    describe("sep", _ => {
        let ws = skip(maybe(many(char(" "))));
        let comma = skip(char(","));
        let num = map(re(/\d+/), parseInt);
        it("should sep", () =>
           run(seq(
               skip(char("[")),
               sep(comma, seq(ws, num, ws)),
               skip(char("]"))), "[ 1, 2 ,3,4]")
           .should.eventually.deep.equal([1, 2, 3, 4]));
        it("should handle multiple items", () =>
           run(sep(comma, seq(num,ws,num)), "1 2")
           .should.eventually.deep.equal([[1, 2]]));
        it("should handle single item", () =>
           run(sep(comma, num), "1").should.eventually.deep.equal([1]));
    });

    describe("alphaNumeric", _ => {
        it("should parse lower", () =>
            run(lower, "abc").should.eventually.equal('a'));
        it("should parse letter", () =>
            run(alphaNum, "abc ").should.eventually.equal('a'));
        it("should parse number", () =>
            run(alphaNum, "1").should.eventually.equal('1'));
    });

    describe("repeat", _ => {
        it("should repeat", () =>
            run(map(repeat(3, lower),
                    xs => xs.join(''))
                ,"abcd").should.eventually.equal('abc'));
    });

    describe("oneplus", _ => {
        it("should match at least once", () =>
           run(oneplus(lower), "abc").should.eventually.deep.equal(['a', 'b', 'c']));
    });
});
