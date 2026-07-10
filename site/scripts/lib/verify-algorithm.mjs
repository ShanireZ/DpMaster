import assert from 'node:assert/strict'

export function verifyCases({ name, cases, solve, oracle, equivalent, invariants = [] }) {
  let checked = 0
  for (const input of cases) {
    const actual = solve(input)
    const expected = oracle(input)
    const message = `${name} failed for ${JSON.stringify(input)}`
    if (equivalent) assert.equal(equivalent(actual, expected), true, message)
    else assert.deepEqual(actual, expected, message)
    for (const invariant of invariants) invariant(actual, input, expected)
    checked++
  }
  assert.ok(checked > 0, `${name} must execute at least one case`)
  return checked
}

export function* vectors(alphabet, maxLength, includeEmpty = true) {
  if (includeEmpty) yield []
  for (let length = 1; length <= maxLength; length++) {
    const current = Array(length)
    function* fill(index) {
      if (index === length) {
        yield current.slice()
        return
      }
      for (const value of alphabet) {
        current[index] = value
        yield* fill(index + 1)
      }
    }
    yield* fill(0)
  }
}

