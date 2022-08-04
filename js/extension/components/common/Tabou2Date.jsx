import React, { memo } from "react";
import { DateTimePicker } from "react-widgets";
import { isEqual } from "lodash";

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);

/**
 * This component is usefull to avoid a DateTimePicker refresh when user input a value manually (when parent re render child)
 * @param {any} props as react props
 * @returns DateTimePicker instance
 */
const Tabou2Date = ({
    ...props
}) => {
    return (
        <DateTimePicker {...props} />
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
    return oldProps.refresh && oldProps.refreshValue ? oldProps.refresh(oldProps.refreshValue, nextProps.refreshValue) : isEqual(oldProps.value, nextProps.value);
});
