import React, {useEffect, useState} from "react";
import {FormControl} from "react-bootstrap";

const expandExponential = (value) => {
    const match = value.match(/^(-?)(\d+)(?:\.(\d*))?e([+-]?\d+)$/i);
    if (!match) return value;

    const [, sign, integer, fraction = "", exponentValue] = match;
    const digits = integer + fraction;
    const decimalPosition = integer.length + Number(exponentValue);
    if (decimalPosition <= 0) return `${sign}0.${"0".repeat(-decimalPosition)}${digits}`;
    if (decimalPosition >= digits.length) return `${sign}${digits}${"0".repeat(decimalPosition - digits.length)}`;
    return `${sign}${digits.slice(0, decimalPosition)}.${digits.slice(decimalPosition)}`;
};

export const formatSurfaceValue = (value) => {
    if (value === null || value === undefined || value === "") return "";

    const normalized = expandExponential(String(value).replace(/,/g, "."));
    if (normalized === ".") return "";
    if (/^\.\d+$/.test(normalized)) return formatSurfaceValue(`0${normalized}`);
    const match = normalized.match(/^(-?)(\d+)(?:\.(\d*))?$/);
    if (!match) return normalized;

    const [, sign, integer, fraction] = match;
    if (!fraction) return `${sign}${integer}.00`;
    if (fraction.length === 0) return `${sign}${integer}.00`;
    if (fraction.length === 1) return `${sign}${integer}.${fraction}0`;
    return `${sign}${integer}.${fraction}`;
};

const SurfaceInput = ({value, onChange, readOnly, className, placeholder}) => {
    const [focused, setFocused] = useState(false);
    const [draft, setDraft] = useState(() => formatSurfaceValue(value));

    useEffect(() => {
        if (!focused) setDraft(formatSurfaceValue(value));
    }, [focused, value]);

    return (
        <FormControl
            type="text"
            inputMode="decimal"
            value={focused ? draft : formatSurfaceValue(value)}
            readOnly={readOnly}
            className={className}
            placeholder={placeholder}
            onFocus={() => {
                setFocused(true);
                setDraft(formatSurfaceValue(value));
            }}
            onChange={(event) => {
                const nextValue = event.target.value.replace(/,/g, ".");
                if (!/^\d*(?:\.\d*)?$/.test(nextValue)) return;
                setDraft(nextValue);
                onChange(nextValue);
            }}
            onBlur={() => {
                if (!readOnly) {
                    const normalizedDraft = draft.startsWith(".") ? `0${draft}` : draft;
                    const finalValue = /^\d+(?:\.\d+)?$/.test(normalizedDraft) ? normalizedDraft : "";
                    onChange(finalValue);
                    setDraft(formatSurfaceValue(finalValue));
                }
                setFocused(false);
            }}
        />
    );
};

export default SurfaceInput;
