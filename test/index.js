/*global console*/
var test = require("tape")
var EventEmitter = require("events").EventEmitter

var toArray = require("./lib/toArray")
var Render = require("../index")

var TAP_HEADER = "TAP version 13"
var STANDARD_OUTPUT =  [
    TAP_HEADER
    , "# one"
    , "ok 1"
    , ""
    , "1..1"
    , "# tests 1"
    , "# pass  1"
    , ""
    , "# ok"
]

test("render is a stream", function (assert) {
    var s = Render()

    assert.ok(s.pipe)
    assert.ok(s.begin)
    assert.ok(s.push)
    assert.ok(s.close)

    s.close()

    assert.end()
})

test("render outputs TAP", function (assert) {
    var r = Render()

    r.pipe(toArray(function (list) {
        assert.deepEqual(list, STANDARD_OUTPUT)
        assert.end()
    }))

    r.begin()
    r.push({
        name: "one"
    }, {
        ok: true
    })
    r.close()
})

test("render outputs TAP from multiple r's", function (assert) {
    var r1 = Render()
    var r2 = Render()
    var finished = false

    r1.pipe(toArray(function (list) {
        finished = true

        assert.deepEqual(list, [
            TAP_HEADER
            , "# one"
            , "ok 1"
        ])
    }))

    r2.pipe(toArray(function (list) {
        assert.equal(finished, true)

        assert.deepEqual(list, [
            "# two"
            , "ok 1"
            , ""
            , "1..2"
            , "# tests 2"
            , "# pass  2"
            , ""
            , "# ok"
        ])

        assert.end()
    }))

    r1.begin()
    r2.begin()

    r1.push({
        name: "one"
    }, {
        ok: true
    })
    r2.push({
        name: "two"
    }, {
        ok: true
    })

    r1.close()
    r2.close()
})

test("render outputs TAP with t.on('result')", function (assert) {
    var r = Render()

    r.pipe(toArray(function (list) {
        assert.deepEqual(list, STANDARD_OUTPUT)
        assert.end()
    }))

    r.begin()

    var test = new EventEmitter()
    test.name = "one"

    r.push(test)

    test.emit("result", { ok: true })

    r.close()
})

test("handle failures", function (assert) {
    var r = Render()

    r.pipe(toArray(function (list) {
        assert.deepEqual(list, [
            TAP_HEADER
            , "# zero"
            , "ok 1"
            , "# one"
            , "not ok 2"
            , "  ---"
            , "    operator: equal"
            , "    expected: \"one\""
            , "    actual:   \"two\""
            , "    at: foobar"
            , "  ..."
            , ""
            , "1..2"
            , "# tests 2"
            , "# pass  1"
            , "# fail  1"
        ])
        assert.end()
    }))

    r.begin()

    r.push({
        name: "zero"
    }, { ok : true })

    r.push({
        name: "one"
    }, {
        ok: false
        , operator: "equal"
        , expected: "one"
        , actual: "two"
        , at: "foobar"
    })

    r.close()
})

test("handle errors", function (assert) {
    var r = Render()

    r.pipe(toArray(function (list) {
        assert.deepEqual(list, [
            TAP_HEADER
            , "# one"
            , "not ok 1"
            , "  ---"
            , "    operator: error"
            , "    expected:"
            , "      "
            , "    actual:"
            , "      {"
            , "        \"message\": \"foo\","
            , "        \"stack\": \"some stack trace\\nsome more lines\\n more lines\""
            , "      }"
            , "    stack:"
            , "      some stack trace"
            , "    some more lines"
            , "     more lines"
            , "  ..."
            , ""
            , "1..1"
            , "# tests 1"
            , "# pass  0"
            , "# fail  1"
        ])

        assert.end()
    }))

    r.begin()

    r.push({
        name: "one"
    }, {
        ok: false
        , operator: "error"
        , actual: {
            message: "foo"
            , stack: "some stack trace\nsome more lines\n more lines"
        }
    })

    r.close()
})
