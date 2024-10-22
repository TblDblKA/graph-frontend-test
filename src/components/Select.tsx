import React from 'react'

interface Props {
    data: number[]
    value: string | undefined
    handleSelect: (newVal: string) => void
}

export const Select = ({ data, value, handleSelect } : Props) => {
    return (
        <select
            className="select"
            defaultValue={undefined}
            onChange={(event) => handleSelect(event.currentTarget.value)}
            value={value}
        >
            <option
                value={undefined}
                style={{display: 'none'}}
            />
            {data?.length > 0 && data.map(el =>
                <option
                    key={el}
                    value={el}
                >{el}</option>
            )}
        </select>
    )
}