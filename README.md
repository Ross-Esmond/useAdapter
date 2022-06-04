# useAdapter

A React hook to help abstract user input.

[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FRoss-Esmond%2FuseAdapter%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/Ross-Esmond/useAdapter/main)

## Install
With npm.
```bash
npm install useAdapter
```
With yarn.
```bash
yarn add useAdapter
```

### Usage
```JSX
import useAdapter from 'useAdapter'
function PhoneNumberField({ value, onChange }) {
    const [getInput, setInput] = useAdapter(
        // display, turn 8175553356 into 817-555-3356
        digits => {
            if (digits?.length !== 10) return ''
            return `${digits.substr(0,3)}-${digits.substr(3, 3)}-${digits.substr(6, 4)}`
        },
        // parser, turn any formatted phone number like 817-555-3356 into 8175553356
        input => {
            const digits = input.match(/\d+/g).join('')
            if (digits.length !== 10) return null
            return digits
        }
    )

    return (
        <input type="tel"
            // getInput runs the argument through the display function above
            value={getInput(value)}
            // setInput runs the argument through the parser function above
            onChange={e => onChange(setInput(e.target.value))}
        />
    )
}
```
The `setInput` function does three things. First, it stores `e.target.value` in
React state. Next, it runs `e.target.value` through your custom parser function
and stores the result in React state. And finally, it returns the result of the
parse so that you may pass it directly to a callback or a conventional
`setState`.

On the first render, `getInput` will simply run `value` through your custom
display function and return the result. On subsequent renders, however,
`getInput` will check if `value` is equal to the result of parsing the current
input. If the value is equal to parsing the input (which was stored by
`setInput`), `getInput` will simply return the stored input. Equality is checked
by the `fast-deep-equal` npm package, such that objects and arrays with
equivilant structures and equal values are considered equal.

This system allows `PhoneNumberField` to abstract the input value for any
higher-level component without disallowing the user from typing a phone number
in whatever format they see fit. Normally, if a parent component only stores the
digits of a phone number, the user would be incapable of typing formatting
characters like `-` or spaces, as React idioms dictate that the state be passed
as the current input value,
```JSX
    <input type="tel" value={number} onChange={ev => setNumber(ev.target.value)} />
```
Conversely, `useAdapter` allows developers to parse values before hoisting them
into React state while still retaining the users precise input as they type.

Of course, you could skip passing the value back to the input, but then your
React app would not be able to programmatically update the phone number if
necessary, as with a reset button.
```JSX
<button onClick={() => onChange(previousNumber)}>Reset</button>
```
In the case of a reset, `getInput` would detect that the `value` has changed,
which would trigger the use of the display function to generate the new input
value.

