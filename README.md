# tap-render

[![build status][1]][2]

[![browser support][3]][4]

A readable stream of TAP output

## Example

```js
var Render = require("tap-render")

var r = Render()

r.begin()
// TAP version 13

r.push({
    name: "first test"
})
// # first test

r.push(null, {
    ok: true
})
// ok 1

r.push(null, {
    ok: true
    , name: "this test passes"
})
// ok 2 this test passes

r.push(null, {
    ok: false
    , name: "this test fails"
    , operator: "equal"
    , expected: "one"
    , actual: "two"
})
/*
not ok 2 this test fails
  ---
    operator: equal
    expected: "one"
    actual:   "two"
  ...
*/

r.close()
/*

1..3
# tests 3
# pass  2
# fail  1
*/

r.pipe(process.stdout)
```

## Installation

`npm install tap-render`

## Contributors

 - Raynos

## MIT Licenced


  [1]: https://secure.travis-ci.org/Raynos/tap-render.png
  [2]: http://travis-ci.org/Raynos/tap-render
  [3]: http://ci.testling.com/Raynos/tap-render.png
  [4]: http://ci.testling.com/Raynos/tap-render
