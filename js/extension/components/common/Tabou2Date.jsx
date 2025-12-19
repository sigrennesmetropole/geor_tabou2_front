import React, {memo} from "react";
import {DateTimePicker} from "react-widgets";
import {isEqual} from "lodash";

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

momentLocalizer(moment);

/**
 * This component is usefull to avoid a DateTimePicker refresh when user input a value manually (when parent re render child)
 * @param {object} props - react props
 * @param {boolean} props.readOnly - indicates if the date field is readonly
 * @param {object} props.style - custom style object to apply to the DateTimePicker
 * @returns DateTimePicker instance
 */
const Tabou2Date = ({
    readOnly,
    style,
    ...props
}) => {
    // Ajouter un style grisé pour les champs en readonly
    const dateStyle = readOnly ? {
        ...style,
        backgroundColor: '#e9ecef',
        cursor: 'not-allowed',
        opacity: 1
    } : style;

    return (
        <DateTimePicker
            {...props}
            readOnly={readOnly}
            style={dateStyle}
        />
    );
};
/**
 * Use props.refresh function and props.refreshValue to custom rerender.
 * By default, rerender target component date value.
 */
export default memo(Tabou2Date, (oldProps, nextProps) => {
    // false to re render
    // true to avoid rerender
    // ==> Allow to use custom props function to compare old and next props
    return oldProps.refresh?.(oldProps.refreshValue, nextProps.refreshValue) ?? isEqual(oldProps.value, nextProps.value);
});
