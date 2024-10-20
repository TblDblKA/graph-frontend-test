export default function Select({ data, value, handleSelect }) {
    return (
        <select
            defaultValue={undefined}
            onChange={handleSelect}
            value={value}
        >
            <option
                value={undefined}
                style={{display: 'none'}}
            />
            {data?.length && data.map(el =>
                <option
                    key={el}
                    value={el}
                >{el}</option>
            )}
        </select>
    )
}