var Stream = require("stream")

module.exports = toArray

function toArray(callback) {
    var stream = new Stream()
    stream.writable = true
    var list = stream.list = []
    var remainder = ""

    stream.write = write
    stream.end = end

    if (callback) {
        stream.on("finish", callback)
    }

    return stream

    function write(chunk) {
        remainder += chunk
        var lines = remainder.split("\n")
        for (var i = 0; i < lines.length - 1; i++) {
            list.push(lines[i])
        }

        remainder = lines[i]
    }

    function end(chunk) {
        if (chunk) {
            write(chunk)
        }

        if (remainder) {
            list.push(remainder)
        }

        stream.emit("finish", list)
    }
}
