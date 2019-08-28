# @munter/tap-render



A readable stream of TAP output

Refactored out of [substack/tape][https://github.com/substack/tape/blob/35ba8a36f023361089d1d09c122a8288cb061ede/lib/render.js] by [Raynos](https://github.com/Raynos)

Forked from [Raynos/tap-render](https://github.com/Raynos/tap-render) by [Munter](https://github.com/Munter)

`tap-render` only emits the start and end of a valid TAP output
  once even if there are multiple Render's. This is to allow
  you to use multiple TAP outputting test frameworks in one
  process.

If you want an individual `Render` to output the correct TAP
  header and footer on it's own pass the force option

`var r = Render({ force: true })`

## Example

```js
var Render = require("tap-render")

var r = Render()

r.pipe(process.stdout)

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
```

## Installation

`npm install tap-render`

## Contributors

 - Raynos
 - Munter

## MIT Licenced
