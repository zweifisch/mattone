"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require("chai-as-promised");

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _2 = require(".");

var _utils = require("./utils");

_chai2["default"].use(_chaiAsPromised2["default"]);
_chai2["default"].should();

describe("utils", function (_) {
    describe("repeat", function (_) {
        it("repeat", function (done) {
            var yes = (0, _utils.repeat)(true);
            (0, _utils.next)(yes).should.equal(true);
            (0, _utils.next)(yes).should.equal(true);
            done();
        });
    });
});

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

    describe("map", function (_) {
        it("should", function (done) {
            var num = (0, _2.map)((0, _2.seq)((0, _2.maybe)((0, _2.str)("-")), (0, _2.re)(/\d+/)), function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2);

                var s = _ref2[0];
                var n = _ref2[1];
                return s ? -parseInt(n) : parseInt(n);
            });
            var ws = (0, _2.maybe)((0, _2.many)((0, _2.str)(" ")));
            var comma = (0, _2.skip)((0, _2.seq)(ws, (0, _2.str)(","), ws));
            (0, _2.run)((0, _2.seq)(num, (0, _2.many)((0, _2.seq)(comma, num))), "1 ,-1, 0").should.eventually.deep.equal([1, [[-1], [0]]]).notify(done);
        });
    });

    describe("done", function (_) {
        it("should done", function (_done) {
            (0, _2.run)((0, _2.seq)((0, _2.str)("ab"), _2.done), "ab").should.eventually.deep.equal(["ab", null]).notify(_done);
        });
    });

    describe("decl", function (_) {
        it("should decl", function (done) {
            var braces = (0, _2.decl)();
            braces((0, _2.seq)((0, _2.str)("{"), (0, _2.maybe)(braces), (0, _2.str)("}")));
            (0, _2.run)(braces, "{}").should.eventually.deep.equal(["{", null, "}"]);
            (0, _2.run)(braces, "{{}}").should.eventually.deep.equal(["{", ["{", null, "}"], "}"]).notify(done);
        });
    });

    describe("sep", function (_) {
        it("should sep", function (done) {
            var ws = (0, _2.skip)((0, _2.maybe)((0, _2.many)((0, _2.str)(" "))));
            var comma = (0, _2.skip)((0, _2.str)(","));
            var num = (0, _2.map)((0, _2.re)(/\d+/), parseInt);
            var fst = function fst(_ref3) {
                var _ref32 = _slicedToArray(_ref3, 1);

                var x = _ref32[0];
                return x;
            };
            (0, _2.run)((0, _2.map)((0, _2.seq)((0, _2.skip)((0, _2.str)("[")), (0, _2.sep)(comma, (0, _2.map)((0, _2.seq)(ws, num, ws), fst)), (0, _2.skip)((0, _2.str)("]"))), fst), "[ 1, 2 ,3,4]").should.eventually.deep.equal([1, 2, 3, 4]).notify(done);
        });
    });
});