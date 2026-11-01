import { describe, expect, it } from 'vitest'
import { clientErrorFrame, clientErrorFile } from './clientError.ts'

describe('bounded client error locations', () => {
  it('extracts the throw frame instead of the React component stack', () => {
    const error = new Error('Cannot read properties of null')
    error.stack = `TypeError: Cannot read properties of null\n    at mount (${window.location.origin}/assets/catalog-hash.js:2:100072)\n    at component (${window.location.origin}/assets/react-hash.js:1:42)`
    expect(clientErrorFrame(error)).toBe('/assets/catalog-hash.js:2:100072')
  })

  it('handles Safari frames without including URL parameters', () => {
    const error = new Error('failure')
    error.stack = `mount@${window.location.origin}/assets/catalog.js?token=secret#fragment:2:42`
    expect(clientErrorFrame(error)).toBe('/assets/catalog.js:2:42')
  })

  it('does not report external URLs, private paths, or opaque values', () => {
    expect(clientErrorFile('https://external.example/script.js?secret=value')).toBe('')
    expect(clientErrorFile(`${window.location.origin}/private/person.js`)).toBe('')
    expect(clientErrorFrame(null)).toBe('')
    const error = new Error('failure')
    error.stack = 'TypeError: failure\n    at https://external.example/script.js:1:2'
    expect(clientErrorFrame(error)).toBe('')
  })
})
