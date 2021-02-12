import React from 'react';
import { connect } from 'react-redux';
import { keys } from 'lodash';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { applyFilterObj, resetSearchFilters, resetCqlFilters } from '../../actions/tabou2';
import { getLayerFilterObj } from '../../selectors/tabou2';

function Tabou2SearchToolbar({ apply, getFiltersObj, ...props }) {

    const search = () => {
        keys(getFiltersObj).forEach(k => {
            apply(k);
        })
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
                    onClick: search
                },
                {
                    glyph: 'clear-filter',
                    tooltip: 'Supprimer les filtrer',
                    onClick: props.reset
                }
            ]}
        />
    )
}

export default connect((state) => ({
    // selectors
    getFiltersObj: getLayerFilterObj(state),
}), { //actions
    apply: applyFilterObj,
    resetFiltersObj: resetSearchFilters,
    resetFiltersCql:resetCqlFilters
})(Tabou2SearchToolbar);