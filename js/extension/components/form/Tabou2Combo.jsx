import React, { useState, useEffect } from 'react';
import { Combobox } from 'react-widgets';
import { uniqBy, get, has } from 'lodash';

/**
 * Extend combobox to create async combo connected to API service.
 * State is managed according to input or default value.
 * @param {any} param
 * @returns component
 */
function Tabou2Combo({
    style = {},
    placeholder = '',
    load = () => { },
    valueField,
    textField,
    value,
    firstItem,
    disabled,
    parentValue = '',
    onLoad = () => { },
    ...props
}) {

    // set default state according to param type
    const [data, setData] = useState([]); // array
    const [text, setText] = useState("");

    // execute given request and load data returns into nativ combobox component
    const loadData = () => {
        load().then(result => {
            let response;
            if (onLoad) {
                response = onLoad(result);
            }
            if (firstItem) response.unshift(firstItem);
            if (props?.distinct) {
                response = uniqBy(response, textField);
            }
            setData(response);
        });
    };

    // hooks
    useEffect(() => {
        setText("");
        if (!disabled) {
            loadData();
        }
    }, [parentValue, disabled]); // pass array to stop inifity loop

    useEffect(() => {
        if (text !== value) {
            setText(value);
        }
    }, [value]); // pass array to stop inifity loop

    // manage change value
    const changeText = (v, fn) => {
        if (textField) {
            setText(get(v, textField));
        }
        if (fn) {
            fn(v);
        }
    };

    return (<Combobox
        value={text}
        textField={textField}
        valueField={valueField}
        style={style}
        data={data}
        defaultValue={props.defaultValue}
        filter={has(props, "filter") ? props.filter : "contains"}
        placeholder={placeholder}
        disabled={disabled}
        onSelect={v => changeText(v, props.onSelect)}
        onChange={v => changeText(v, props.onChange)}
        messages={props.messages}
        className={props.className}
        dropUp={props.dropUp}
    />);
}

export default Tabou2Combo;
