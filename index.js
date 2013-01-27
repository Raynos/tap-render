var Stream = require("stream")
var json = typeof JSON === "object" ? JSON : require("jsonify")

// Keep a counter of all running Render's and a list of their
// results
var running = 0
var results = []

module.exports = Render

function Render() {
    var stream = new Stream()
    stream.readable = true
    stream.count = 0
    stream.fail = 0
    stream.pass = 0
    var began = false

    stream.pipe = pipe
    stream.begin = begin
    stream.push = push
    stream.close = close

    return stream

    function pipe() {
        stream.piped = true
        return Stream.prototype.pipe.apply(this, arguments)
    }

    function begin() {
        var first = running === 0
        running++

        began = true

        if (first) {
            stream.emit("data", "TAP version 13\n")
        }
    }

    function push(t, result) {
        if (t && t.name) {
            stream.emit("data", "# " + t.name + "\n")
        }

        if (result) {
            handleResult(result)
        }

        if (t && t.on) {
            t.on("result", handleResult)
        }
    }

    function close() {
        results.push({
            count: stream.count
            , pass: stream.pass
            , fail: stream.fail
        })

        if (began) {
            running--
        }

        if (running === 0) {
            handleEnd(stream)
        }

        stream.emit("end")
    }

    function handleResult(result) {
        if (typeof result === "string") {
            stream.emit("data", "# " + result + "\n")
            return
        }

        stream.count++
        stream.emit("data", encodeResult(result, stream.count))

        if (result.ok) {
            stream.pass++
        } else {
            stream.fail++
        }
    }
}

function handleEnd(stream) {
    var count = 0
    var pass = 0
    var fail = 0

    for (var i = 0; i < results.length; i++) {
        var result = results[i]
        count += result.count
        pass += result.pass
        fail += result.fail
    }

    results = []

    stream.emit("data", "\n1.." + count + "\n")
    stream.emit("data", "# tests " + count + "\n")
    stream.emit("data", "# pass  " + pass + "\n")
    if (fail > 0) {
        stream.emit("data", "# fail  " + fail + "\n")
    } else {
        stream.emit("data", "\n# ok\n")
    }
}

function encodeResult(result, count) {
    var output = ""
    output += (result.ok ? "ok " : "not ok ") + count
    output += result.name ? " " +
        result.name.replace(/\s+/g, " ") : ""

    if (result.skip) {
        output += " # SKIP"
    } else if (result.todo) {
        output += " # TODO"
    }

    output += "\n"

    if (!result.ok) {
        output += encodeError(result)
    }

    return output
}

function encodeError(result) {
    var output = ""
    var outer = "  "
    var inner = outer + "  "
    output += outer + "---\n"
    output += inner + "operator: " + result.operator + "\n"

    var expected = json.stringify(result.expected, null, "  ") || ""
    var actual = json.stringify(result.actual, null, "  ") || ""

    if (Math.max(expected.length, actual.length) > 65) {
        expected = expected.replace(/\n/g, "\n" + inner + "  ")
        actual = actual.replace(/\n/g, "\n" + inner + "  ")

        output += inner + "expected:\n" + inner + "  " + expected + "\n"
        output += inner + "actual:\n" + inner + "  " + actual + "\n"
    } else {
        output += inner + "expected: " + expected + "\n"
        output += inner + "actual:   " + actual + "\n"
    }

    if (result.at) {
        output += inner + "at: " + result.at + "\n"
    }

    if (result.operator === "error" && result.actual &&
        result.actual.stack
    ) {
        var lines = String(result.actual.stack).split("\n")
        output += inner + "stack:\n"
        output += inner + "  " + lines[0] + "\n"
        for (var i = 1; i < lines.length; i++) {
            output += inner + lines[i] + "\n"
        }
    }

    output += outer + "...\n"

    return output
}
