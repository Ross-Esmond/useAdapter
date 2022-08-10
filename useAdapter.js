import { useState } from 'react'
import equal from 'fast-deep-equal/es6'

export default function useAdapter(display, parse) {
    const [low, setLow] = useState()
    const [parsed, setParsed] = useState({})

    return [
        high => equal(high, parsed) ? low : display(high),
        low => {
            setLow(low)
            let parsed = parse(low)
            setParsed(parsed)
            return parsed
        }
    ]
}

