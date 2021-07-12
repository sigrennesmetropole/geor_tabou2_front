import React from 'react';
import { keys } from 'lodash';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

/**
 * Search panel toolbar
 * @param {any} param
 * @returns component
 */
export default function Tabou2SearchToolbar({ ...props }) {

    // trigger search method
    const search = () => {
        keys(props.filters).forEach(k => {
            props.apply(k);
        });
    };
    return (
        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md',
                bsStyle: 'primary'
            }}
            btnGroupProps={{
                style: {
                    margin: 10
                }
            }}
            buttons={[
                {
                    glyph: 'ok',
                    tooltip: 'Appliquer',
                    loading: props.searchLoading,
                    disabled: props.searchLoading || props.getTabouErrors.filter,
                    onClick: search
                },
                {
                    glyph: 'clear-filter',
                    disabled: props.searchLoading,
                    tooltip: 'Supprimer les filtrer',
                    onClick: props.reset
                }
            ]}
        />
    );
}
