"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require("chai-as-promised");

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _2 = require(".");

var _utils = require("./utils");

_chai2["default"].use(_chaiAsPromised2["default"]);
_chai2["default"].should();

// describe("utils", _ => {
//     describe("repeat", _ => {
//         it("repeat", _ => {
//             let yes = repeat(true);
//             next(yes).should.equal(true);
//             next(yes).should.equal(true);
//         });
//     });
// });

describe("parser", function (_) {

    describe("str", function (_) {
        it("str", function (done) {
            (0, _2.run)((0, _2.str)("abc"), "abc").should.eventually.equal("abc").notify(done);
        });
    });

    describe("or", function (_) {
        it("or", function (done) {
            (0, _2.run)((0, _2.or)((0, _2.str)('ab'), (0, _2.str)('cd')), "cd").should.eventually.equal("cd").notify(done);
        });
    });

    describe("seq", function (_) {
        it("seq", function (done) {
            (0, _2.run)((0, _2.seq)((0, _2.str)('{'), (0, _2.str)("a"), (0, _2.str)('}')), '{a}').should.eventually.deep.equal(["{", "a", "}"]).notify(done);
        });
    });

    describe("skip", function (_) {
        it("skip", function (done) {
            (0, _2.run)((0, _2.seq)((0, _2.skip)((0, _2.str)('{')), (0, _2.str)("a"), (0, _2.skip)((0, _2.str)('}'))), '{a}').should.eventually.deep.equal(["a"]).notify(done);
        });
    });

    describe("regexp", function (_) {
        it("regexp", function (done) {
            var num = (0, _2.re)(/\d+/);
            (0, _2.run)(num, "22.3").should.eventually.equal("22");
            (0, _2.run)((0, _2.seq)(num, (0, _2.str)("."), num), "22.3").should.eventually.deep.equal(["22", ".", "3"]).notify(done);
        });
    });

    describe("many", function (_) {
        it("many", function (done) {
            (0, _2.run)((0, _2.many)((0, _2.str)("ab")), "ababab").should.eventually.deep.equal(["ab", "ab", "ab"]).notify(done);
        });
        it("many", function (done) {
            var num = (0, _2.re)(/\d+/);
            var array = (0, _2.seq)((0, _2.skip)((0, _2.str)("[")), (0, _2.many)((0, _2.seq)(num, (0, _2.skip)((0, _2.str)(",")))), num, (0, _2.skip)((0, _2.str)("]")));
            (0, _2.run)(array, "[1,2,3]").should.eventually.deep.equal([[["1"], ["2"]], "3"]).notify(done);
        });
    });

    describe("maybe", function (_) {
        it("should null", function (done) {
            var num = (0, _2.seq)((0, _2.maybe)((0, _2.str)("-")), (0, _2.re)(/\d+/));
            (0, _2.run)(num, "-2").should.eventually.deep.equal(["-", "2"]);
            (0, _2.run)(num, "2").should.eventually.deep.equal([null, "2"]).notify(done);
        });
    });

    describe("done", function (_) {
        it("should done", function (_done) {
            (0, _2.run)((0, _2.seq)((0, _2.str)("ab"), _2.done), "ab").should.eventually.deep.equal(["ab", null]).notify(_done);
        });
    });
});