
module.exports =

    str: (str) ->
        parse: (input, start) ->
            if str is input.substr start, str.length
                [str, str.length]
        toString: -> str

    re: (pattern) ->
        pattern = new RegExp("^" + pattern.source)
        parse: (input, start) ->
            if result = pattern.exec input.substr start
                [result[0], result[0].length]
        toString: pattern.source

    or: (parsers...)->
        parse: (input, start) ->
            for parser in parsers
                if result = parser.parse input, start
                    return result
        toString: -> "or(#{parsers.join(" | ")})"

    maybe: (parser)->
        parse: (input, start)->
            if result = parser.parse input, start
                result
            else
                [null, 0]
        toString: -> "maybe(#{parser})"

    seq: (parsers...)->
        parse: (input, start)->
            pos = start
            results = []
            for parser in parsers
                if result = parser.parse input, pos
                    [consumed, length, skiped] = result
                    results.push consumed unless skiped
                    pos += length
                else
                    throw Error "#{parser} at #{pos}"
                    return no
            [results, pos - start]

    many: (parser)->
        parse: (input, start)->
            pos = start
            results = []
            while result = (try parser.parse input, pos)
                [consumed, length, skiped] = result
                results.push consumed unless skiped
                pos += length
            return [results, pos - start]

    skip: (parser)->
        parse: (input, start)->
            if result = parser.parse input, start
                [_, len] = result
                [null, len, yes]
        toString: -> "skip(#{parser})"

    done:
        parse: (input, start)->
            if input.length is start
                [null, 0]

    run: (parser, input) ->
        if result = parser.parse input, 0
            result[0]
        else
            throw Error "failed"
