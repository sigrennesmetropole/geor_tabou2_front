import React, { useState, useEffect } from 'react';
import { Combobox } from 'react-widgets';

function Tabou2Combo({
    style = {},
    placeholder = '',
    load = () => { },
    valueField,
    textField,
    firstItem,
    onLoad = () => { },
    ...props
}) {

    // set default state according to param type
    const [busy, setBusy] = useState(false); // boolean
    const [data, setData] = useState([]); // array

    useEffect(() => {
        setBusy(true);
        load().then(result => {
            if (onLoad) {
                result = onLoad(result);
            }
            if(firstItem) result.unshift(firstItem);
            setData(result);
            setBusy(false);
        })
    }, []); // pass array to stop inifity loop

    return (
        <Combobox
            busy={busy}
            style={style}
            valueField={valueField}
            textField={textField}
            data={data}
            defaultValue={props.defaultValue}
            placeholder={placeholder}
            {...props} />
    )
}

export default Tabou2Combo;