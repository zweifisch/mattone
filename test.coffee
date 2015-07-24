chai = require 'chai'
chai.should()
expect = chai.expect

parser = require "./"
{str, re, skip, finished, many, seq, maybe, run} = parser
_or = parser.or

describe "parser", ->

    describe "str", ->

        it "str", ->

            run(str("abc"), ("abc")).should.equal "abc"

    describe "or", ->

        it "str", ->
            run(_or(str('ab'), str('cd')), "cd").should.equal "cd"

    describe "seq", ->
        it "seq", ->
            run(seq(
                str('{'),
                str("a"),
                str('}')), '{a}').should.deep.equal ["{", "a", "}"]

    describe "skip", ->
        it "skip", ->
            run(seq(
                skip(str('{')),
                str("a"),
                skip(str('}'))), '{a}').should.deep.equal ["a"]

    describe "regexp", ->
        it "regexp", ->
            num = re /\d+/
            run(num, "22.3").should.equal "22"
            run(seq(num, str("."), num), "22.3").should.deep.equal ["22", ".", "3"]

    describe "many", ->
        it "many", ->
            run(many(str("ab")), "ababab").should.deep.equal ["ab", "ab", "ab"]
            num = re /\d+/
            array = seq skip(str("[")), many(seq num, skip(str(","))), num, skip(str("]"))
            run(array, "[1,2,3]").should.deep.equal [[["1"], ["2"]], "3"]
