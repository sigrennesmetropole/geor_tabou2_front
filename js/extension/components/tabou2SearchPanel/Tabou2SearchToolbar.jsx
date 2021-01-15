import React from 'react';
import { connect } from 'react-redux';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { applySearchQuery, resetSearchFilters } from '../../actions/tabou2';

const filtersBylayer = [
    {
        url: 'https://public.sig.rennesmetropole.fr/geoserver/wfs',
        featureTypeName: 'espub_mob: gev_jeu',
        groupFields: [{
            id: 1,
            logic: 'OR',
            index: 0
        }],
        filterFields: [{ // this will change layers property by these props directly
            attribute: 'nom',
            operator: '=',
            value: 'PLACE SIMONE'
        }],
        spatialeField: {
            method: null,
            operation: 'INTERSECTS',
            geometry: null,
            attribute: 'shape'
        },
        crossLayerFilter: null,
        filterType: "OGC",
        ogcVersion: "1.1.0"
    }
];

function Tabou2SearchToolbar({ applyFilters = () => { }, resetFilters = () => { } }) {

    const search = () => {
        filtersBylayer.forEach((el, i) => {
            applyFilters(el.url, filtersBylayer[i], el.featureTypeName)
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
                    glyph: 'floppy-disk',
                    tooltip: 'Sauvegarder',
                    onClick: () => { console.log('save'); }
                },
                {
                    glyph: 'clear-filter',
                    tooltip: 'Supprimer les filtrer',
                    onClick: resetFilters
                }
            ]}
        />
    )
}

export default connect((state) => ({
    // selectors
}), { //actions
    applyFilters: applySearchQuery,
    resetFilters: resetSearchFilters
})(Tabou2SearchToolbar);