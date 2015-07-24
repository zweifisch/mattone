"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

exports.map = map;
exports.filter = filter;
exports.repeat = repeat;
exports.somep = somep;
exports.whilep = whilep;
exports.reducep = reducep;
exports.iteratep = iteratep;
exports.tee = tee;
var marked0$0 = [map, filter, repeat].map(regeneratorRuntime.mark);

function map(f, xs) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, x;

    return regeneratorRuntime.wrap(function map$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                context$1$0.prev = 3;
                _iterator = xs[Symbol.iterator]();

            case 5:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                    context$1$0.next = 12;
                    break;
                }

                x = _step.value;
                context$1$0.next = 9;
                return f(x);

            case 9:
                _iteratorNormalCompletion = true;
                context$1$0.next = 5;
                break;

            case 12:
                context$1$0.next = 18;
                break;

            case 14:
                context$1$0.prev = 14;
                context$1$0.t0 = context$1$0["catch"](3);
                _didIteratorError = true;
                _iteratorError = context$1$0.t0;

            case 18:
                context$1$0.prev = 18;
                context$1$0.prev = 19;

                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }

            case 21:
                context$1$0.prev = 21;

                if (!_didIteratorError) {
                    context$1$0.next = 24;
                    break;
                }

                throw _iteratorError;

            case 24:
                return context$1$0.finish(21);

            case 25:
                return context$1$0.finish(18);

            case 26:
            case "end":
                return context$1$0.stop();
        }
    }, marked0$0[0], this, [[3, 14, 18, 26], [19,, 21, 25]]);
}

function filter(f, xs) {
    var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, x;

    return regeneratorRuntime.wrap(function filter$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                context$1$0.prev = 3;
                _iterator2 = xs[Symbol.iterator]();

            case 5:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                    context$1$0.next = 13;
                    break;
                }

                x = _step2.value;

                if (!f(x)) {
                    context$1$0.next = 10;
                    break;
                }

                context$1$0.next = 10;
                return x;

            case 10:
                _iteratorNormalCompletion2 = true;
                context$1$0.next = 5;
                break;

            case 13:
                context$1$0.next = 19;
                break;

            case 15:
                context$1$0.prev = 15;
                context$1$0.t0 = context$1$0["catch"](3);
                _didIteratorError2 = true;
                _iteratorError2 = context$1$0.t0;

            case 19:
                context$1$0.prev = 19;
                context$1$0.prev = 20;

                if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                    _iterator2["return"]();
                }

            case 22:
                context$1$0.prev = 22;

                if (!_didIteratorError2) {
                    context$1$0.next = 25;
                    break;
                }

                throw _iteratorError2;

            case 25:
                return context$1$0.finish(22);

            case 26:
                return context$1$0.finish(19);

            case 27:
            case "end":
                return context$1$0.stop();
        }
    }, marked0$0[1], this, [[3, 15, 19, 27], [20,, 22, 26]]);
}

function repeat(x) {
    return regeneratorRuntime.wrap(function repeat$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (!true) {
                    context$1$0.next = 5;
                    break;
                }

                context$1$0.next = 3;
                return x;

            case 3:
                context$1$0.next = 0;
                break;

            case 5:
            case "end":
                return context$1$0.stop();
        }
    }, marked0$0[2], this);
}

var next = function next(xs) {
    return xs.next().value;
};

exports.next = next;

function somep(ps) {
    return new Promise(function (resolve, reject) {
        var nextP = function nextP(_) {
            var p = next(ps);
            if (p) p.then(resolve, nextP);else reject();
        };
        nextP();
    });
}

function whilep(ps) {
    return new Promise(function (resolve, reject) {
        var results = [];
        var nextP = function nextP(_) {
            var p = next(ps);
            if (p) p.then(function (x) {
                results.push(x);
                nextP();
            })["catch"](reject);else resolve(results);
        };
        nextP();
    });
}

function reducep(fs, initial) {
    return new Promise(function (resolve, reject) {
        var n = function n(x) {
            var f = next(fs);
            f ? f(x).then(n)["catch"](reject) : resolve(x);
        };
        n(initial);
    });
}

function iteratep(f, arg) {
    return new Promise(function (resolve, reject) {
        var iter = function iter(x) {
            return f(x).then(iter)["catch"](function (_) {
                return resolve(x);
            });
        };
        iter(arg);
    });
}

function tee(f) {
    return function (x) {
        f(x);
        return x;
    };
}

var fst = function fst(_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var x = _ref2[0];
    var _ = _ref2[1];
    return x;
};
exports.fst = fst;