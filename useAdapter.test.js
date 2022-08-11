import React, { useId, useState } from 'react'
import useAdapter from './useAdapter.js'
import {render, fireEvent, waitFor, screen, act} from '@testing-library/react'
import '@testing-library/jest-dom'

function Number({ value, onChange, label }) {
    const id = useId()
    const [getStr, setStr] = useAdapter(number => number.toString(), string => parseInt(string))

    return <div>
        <label htmlFor={id}>{label || 'Input'}</label>
        <input type="text" id={id} value={getStr(value)} onChange={ev => onChange(setStr(ev.target.value))} />
    </div>
}

test('displays value', () => {
    render(<Number value={5} />)

    expect(screen.getByLabelText('Input').value).toBe('5')
})

test('fires onChange event', () => {
    const handleChange = jest.fn()
    render(<Number value={5} onChange={handleChange} />)

    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '10' } })

    expect(handleChange.mock.calls.length).toBe(1)
    expect(handleChange.mock.calls[0][0]).toBe(10)
})

function NumberContainer() {
    const [number, setNumber] = useState(5)

    return (
        <Number value={number} onChange={setNumber} />
    )
}

test('expect abstracted data to be retained', () => {
    render(<NumberContainer />)

    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '10.' } })

    expect(screen.getByLabelText('Input').value).toBe('10.')
})

function NumberConverter() {
    const [number, setNumber] = useState(5)
    const [getDoubled, setDoubled] = useAdapter(number => number*2, doubled => Math.floor(doubled/2))

    return (
        <div>
            <Number label="Double" value={getDoubled(number)} onChange={number => setNumber(setDoubled(number))} />
            <Number value={number} onChange={setNumber} />
        </div>
    )
}

test('changes input value even if upper-level value is unchanged', () => {
    render(<NumberConverter />)

    fireEvent.change(screen.getByLabelText('Double'), { target: { value: '11' } })
    expect(screen.getByLabelText('Input').value).toBe('5')
    expect(screen.getByLabelText('Double').value).toBe('11')
})

test('reverts to input value on upper-value reversal', () => {
    render(<NumberConverter />)

    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '2' } })
    expect(screen.getByLabelText('Input').value).toBe('2')
    expect(screen.getByLabelText('Double').value).toBe('4')

    fireEvent.change(screen.getByLabelText('Double'), { target: { value: '5' } })
    expect(screen.getByLabelText('Input').value).toBe('2')
    expect(screen.getByLabelText('Double').value).toBe('5')

    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '3' } })
    expect(screen.getByLabelText('Input').value).toBe('3')
    expect(screen.getByLabelText('Double').value).toBe('6')

    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '2' } })
    expect(screen.getByLabelText('Input').value).toBe('2')
    expect(screen.getByLabelText('Double').value).toBe('5')
})

function NumberPlaceholder() {
    const [nullable, setNullable] = useState(undefined)
    const [getFiveOnNull, setFiveOnNull] = useAdapter(nullable => nullable == null ? 5 : nullable, number => number)

    return (
        <div>
            <Number value={getFiveOnNull(nullable)} onChange={number => setNullable(setFiveOnNull(number))} />
        </div>
    )
}

test('runs display on first render even when upper-level value is undefined', () => {
    render(<NumberPlaceholder />)

    expect(screen.getByLabelText('Input').value).toBe('5')
})

function NumberPlaceholderObj() {
    const [object, setObject] = useState({})
    const [getFiveOnObj, setFiveOnObj] = useAdapter(obj => typeof obj === 'object' ? 5 : 0, number => number)

    return (
        <div>
            <Number value={getFiveOnObj(object)} onChange={number => setObject(setFiveOnObj(number))} />
        </div>
    )
}

test('runs display on first render even when upper-level value is an object', () => {
    render(<NumberPlaceholderObj />)

    expect(screen.getByLabelText('Input').value).toBe('5')
})

function NumberPlaceholderNaN() {
    const [nan, setNan] = useState(Number.NaN)
    const [getFiveOnNan, setFiveOnNan] = useAdapter(nan => isNaN(nan) ? 5 : 0, number => number)

    return (
        <div>
            <Number value={getFiveOnNan(nan)} onChange={number => setNan(setFiveOnNan(number))} />
        </div>
    )
}

test('runs display on first render even when upper-level value is NaN', () => {
    render(<NumberPlaceholderNaN />)

    expect(screen.getByLabelText('Input').value).toBe('5')
})
