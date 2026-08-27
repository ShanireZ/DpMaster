import * as React from 'react'

const holder = { React }
Reflect.set(holder.React, 'useEffect', (callback) => callback())

export const unused = true
