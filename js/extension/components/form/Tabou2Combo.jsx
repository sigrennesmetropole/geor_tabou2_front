import React, { useState, useEffect } from 'react';
import { Combobox } from 'react-widgets';
import { uniqBy } from 'lodash';

function Tabou2Combo({
    style = {},
    placeholder = '',
    load = () => { },
    valueField = null,
    textField,
    firstItem,
    disabled,
    reloadValue = '',
    onLoad = () => { },
    onSelect = () => { },
    ...props
}) {

    // set default state according to param type
    const [busy, setBusy] = useState(false); // boolean
    const [data, setData] = useState([]); // array

    const loadData = (r) => {
        setBusy(!r ? false : true);
        load().then(result => {
            let response;
            if (onLoad) {
                response = onLoad(result);
            }
            if (firstItem) response.unshift(firstItem);
            response = uniqBy(response, textField);
            setData(response);
            setBusy(false);
        });
        // trigger select without value to clean filters if parent cbox value is empty
        if (!r) {
            onSelect('');
        }
    };

    useEffect(() => {
        if (!disabled) {
            loadData(reloadValue);
        }
    }, [reloadValue, disabled]); // pass array to stop inifity loop

    return (<Combobox
        busy={busy}
        style={style}
        valueField={valueField}
        textField={textField}
        data={data}
        defaultValue={props.defaultValue}
        suggest
        placeholder={placeholder}
        disabled={disabled}
        onSelect={onSelect}
        {...props} />);
}

export default Tabou2Combo;
