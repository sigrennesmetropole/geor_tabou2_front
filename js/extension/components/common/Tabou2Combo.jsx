import React, { useState, useEffect } from 'react';
import { Combobox } from 'react-widgets';
import { find, isObject } from 'lodash';

function Tabou2Combo({
    style = {},
    value = {},
    placeholder = '',
    load = () => { },
    onSelect = () => { },
    valueField = '',
    textField = '',
    onLoad = () => { }
}) {

    // set default state according to param type
    const [busy, setBusy] = useState(false); // boolean
    const [data, setData] = useState([]); // array

    useEffect(() => {
        setBusy(true);
        load().then(result => {
            if (onLoad) {
                //result = result[searchField];
                result = onLoad(result);
            }
            console.log(result);
            setData(result);
            setBusy(false);
        })
    }, []); // pass array to stop inifity loop

    return (
        <Combobox
            busy={busy}
            style={style}
            textField={textField}
            valueField={valueField}
            data={data}
            onSelect={onSelect}
            placeholder={placeholder} />
    )
}

export default Tabou2Combo;