"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

exports.str = str;
exports.re = re;
exports.or = or;
exports.seq = seq;
exports.skip = skip;
exports.many = many;
exports.sep = sep;
exports.maybe = maybe;
exports.decl = decl;
exports.done = done;
exports.run = run;

var _utils = require("./utils");

function str(str) {
    return function (input, start) {
        return new Promise(function (resolve, reject) {
            if (str === input.substr(start, str.length)) resolve([str, str.length + start]);else reject(Error("<str \"" + str + "\"> failed at " + start));
        });
    };
}

function re(pattern) {
    pattern = new RegExp("^" + pattern.source);
    return function (input, start) {
        return new Promise(function (resolve, reject) {
            var result = pattern.exec(input.substr(start));
            if (result) resolve([result[0], result[0].length + start]);else reject(Error("<re \"" + pattern.source + "\"> failed at " + start));
        });
    };
}

function or() {
    for (var _len = arguments.length, parsers = Array(_len), _key = 0; _key < _len; _key++) {
        parsers[_key] = arguments[_key];
    }

    return function (input, start) {
        return (0, _utils.somep)((0, _utils.map)(function (x) {
            return x(input, start);
        }, parsers));
    };
}

function seq() {
    for (var _len2 = arguments.length, parsers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        parsers[_key2] = arguments[_key2];
    }

    return function (input, start) {
        var wrap = function wrap(parser) {
            return function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2);

                var results = _ref2[0];
                var pos = _ref2[1];
                return parser(input, pos).then(function (_ref3) {
                    var _ref32 = _slicedToArray(_ref3, 3);

                    var result = _ref32[0];
                    var pos = _ref32[1];
                    var skiped = _ref32[2];

                    if (!skiped) results.push(result);
                    return [results, pos];
                });
            };
        };
        return (0, _utils.reducep)((0, _utils.map)(wrap, parsers), [[], start]);
    };
}

function skip(parser) {
    return function (input, start) {
        return parser(input, start).then(function (_ref4) {
            var _ref42 = _slicedToArray(_ref4, 2);

            var _ = _ref42[0];
            var pos = _ref42[1];
            return [null, pos, true];
        });
    };
}

function many(parser) {
    return function (input, start) {
        return (0, _utils.iteratep)(function (_ref5) {
            var _ref52 = _slicedToArray(_ref5, 2);

            var results = _ref52[0];
            var pos = _ref52[1];

            return parser(input, pos).then(function (_ref6) {
                var _ref62 = _slicedToArray(_ref6, 2);

                var result = _ref62[0];
                var pos = _ref62[1];

                results.push(result);
                return [results, pos];
            });
        }, [[], start]);
    };
}

function sep(sepParser, parser) {
    return map(seq(many(seq(parser, sepParser)), parser), function (_ref7) {
        var _ref72 = _slicedToArray(_ref7, 2);

        var items = _ref72[0];
        var last = _ref72[1];
        return [].concat.apply([], items.concat([last]));
    });
}

function maybe(parser) {
    return function (input, pos) {
        return parser(input, pos)["catch"](function (x) {
            return [null, pos];
        });
    };
}

function decl() {
    var parser = undefined;
    return function (input) {
        var start = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        if (start === null) {
            // define
            return parser = input;
        } else {
            if (parser) return parser(input, start);else throw Error("parser not defined yet");
        }
    };
}

var map = function map(parser, f) {
    return function () {
        return parser.apply(undefined, arguments).then(function (_ref8) {
            var _ref82 = _slicedToArray(_ref8, 3);

            var r = _ref82[0];
            var p = _ref82[1];
            var s = _ref82[2];
            return [f(r), p, s];
        });
    };
};

exports.map = map;

function done(input, start) {
    return new Promise(function (resolve, reject) {
        input.length === start ? resolve([null, 0]) : reject(Error("EOF expected at " + start));
    });
}

function run(parser, input) {
    return parser(input, 0).then(_utils.fst);
}