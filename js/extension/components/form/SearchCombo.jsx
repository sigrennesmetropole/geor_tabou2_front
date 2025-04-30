import React, {useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { find, isObject, isEmpty } from 'lodash';
import { Combobox as CB } from 'react-widgets';
import { Glyphicon } from "react-bootstrap";
import localizedProps from '@mapstore/components/misc/enhancers/localizedProps';
import { getMessageById } from '@mapstore/utils/LocaleUtils';
import {compose, getContext, mapProps} from 'recompose';


const localizeMessages = compose(
    getContext({
        messages: PropTypes.object
    }),
    mapProps(({messages, ...props}) => ({
        ...props,
        messages: {
            emptyList: getMessageById(messages, 'tabou2.emptyList'),
            emptyFilter: getMessageById(messages, 'tabou2.nodata')
        }
    })
    )
);
const Combobox = localizedProps('placeholder')(localizeMessages(CB));

/**
 * A utility combo for search.
 * @params search
 */
export default ({
    value = {},
    valueField,
    minLength,
    forceSelection = false,
    onChange = () => {},
    search = () => {},
    onSelect = () => {},
    disabled = false,
    hideRemove = false,
    additionalStyle = {},
    placeholder = "",
    dropUp = false,
    ...props
}) => {
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState([]);
    useEffect( () => {
        if (text.length >= minLength) {
            setBusy(true);
            search(text).then(results => {
                setData(results);
                setBusy(false);
            });
        }
    }, [text]);

    const clearData = () => {
        onSelect(undefined);
        setText("");
        onChange("");
    };

    return (<div style={{position: "relative", ...additionalStyle}}>
        <Combobox
            dropUp={dropUp}
            busy={busy}
            disabled={disabled}
            placeholder={placeholder}
            valueField={valueField}
            value={isObject(value) ? value[valueField] : value}
            onSelect={(v) => {
                onSelect(find(data, {[valueField]: v}) ?? v);
            }}
            onBlur={
                () => {
                    if (!forceSelection) return;
                    if (!data.length || isEmpty(find(data, text))) {
                        clearData();
                    }
                }
            }
            onChange={
                t => {
                    onChange(t);
                    setText(t);
                }
            }
            data={data}
            minLength={minLength}
            {...props}
        />
        {!hideRemove && (text || value) ? <Glyphicon glyph="remove"
            bsSize="xsmall"
            style={{
                position: 'absolute',
                top: 9,
                opacity: 0.4,
                right: 35,
                zIndex: 2,
                cursor: "pointer"

            }}
            onClick={clearData}/> : null}
    </div>);
};
