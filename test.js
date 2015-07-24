
import chai from 'chai';
import promised from "chai-as-promised";
import {str, re, skip, finished, many, seq, maybe, run, or, done} from ".";
import {repeat, next} from "./utils";

chai.use(promised);
chai.should();

// describe("utils", _ => {
//     describe("repeat", _ => {
//         it("repeat", _ => {
//             let yes = repeat(true);
//             next(yes).should.equal(true);
//             next(yes).should.equal(true);
//         });
//     });
// });

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

    describe("done", _ => {
        it("should done", _done => {
            run(seq(str("ab"), done), "ab").should.eventually.deep.equal(["ab", null]).notify(_done);
        });
    });
});
