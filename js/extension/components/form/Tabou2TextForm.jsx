import React, {useState, useEffect} from 'react';
import { FormControl } from 'react-bootstrap';

export default function Tabou2TextForm({
    ...props
}) {
    const [text, setText] = useState("");

    // hooks
    useEffect(() => {
        if (text !== props.value) {
            setText(props.value);
        }
    }, [props.value]);

    // action on blur
    const triggerBlur = (event) => {
        if (event.target.value !== text && props.onBlur) {
            props.onBlur(event);
        }
    };

    // action on change
    const triggerChange = (event) => {
        if (event.target.value !== text && props.onChange) {
            props.onChange(event);
        }
    };

    return (<FormControl
        type={props.type}
        readOnly={props.readOnly}
        style={props.style}
        required={props.required}
        value={text || ''}
        onBlur={(evt) => {
            triggerBlur(evt);
        }}
        onChange= {(evt) => {
            triggerChange(evt);
        }}
        placeholder={props.placeholder}
    />);
}
