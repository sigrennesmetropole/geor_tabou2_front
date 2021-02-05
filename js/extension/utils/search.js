import {keys } from 'lodash';

import { currentTabouFilters } from '../selectors/tabou2';

export function containEmpty(obj) {
    return keys(obj).filter(key => !obj[key]).length > 0;
}

export function getNewFilter (layerTypeName = '', spatialFilter = {}, textFilters = [], crossLayer = null) {
    return {
        featureTypeName: layerTypeName || '',
        groupFields: [{
            id: 1,
            logic: "OR",
            index: 0
        }],
        filterFields: textFilters || [],
        spatialField: spatialFilter || {},
        pagination: null,
        filterType: "OGC",
        ogcVersion: "1.1.0",
        sortOptions: null,
        crossLayerFilter: crossLayer || null,
        hits: false
    }
};

export function getNewCrossLayerFilter (props) {
    if(containEmpty(props)) return;
    return {
        operation: "INTERSECTS",
        attribute: props.mapLayerGeom,
        collectGeometries: {
            queryCollection: {
                cqlFilter: props.cqlFilter,
                filterFields: [{
                    attribute: props.attribute,
                    exception: null,
                    fieldOptions: {
                        currentPage: 1,
                        valuesCount: 0
                    },
                    groupId: 1,
                    operator: props.operator,
                    rowId: new Date().getTime(),
                    type: props.type,
                    value: props.value
                }],
                geometryName: props.crossGeom,
                typeName: props.crossName
            }
        }
    }
}

export function getNewCqlFilter (props) {
    if(containEmpty(props)) return;
    return {
        operation: "INTERSECTS",
        attribute: props.mapLayerGeom,
        collectGeometries: {
            queryCollection: {
                cqlFilter: props.cqlFilter,
                geometryName: props.crossGeom,
                typeName: props.crossName
            }
        }
    }
}

export function getEtapeOA (oa, val) {
    if(!oa) { // for PA, SA layers
        return `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:oa_secteur', 'the_geom','("code_etape" = ${val})'))))`
    } // for OA
    return `("code_etape" = ${val})`;
}

export function getEtapePA (pa, val) {
    if(!pa) { // for PA, SA layers
        return `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:pa_secteur', 'the_geom','("code_etape" = ${val})'))))`;
    } // for OA
    return `("code_etape" = ${val})`;
}

export function getCqlExpression (val, layer) {
    const exp = {
        commune_emprise: `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:commune_emprise', 'the_geom','("code_insee" = ${val})'))))`,
        quartier: `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:quartier', 'the_geom','("nuquart" = ${val})'))))`,
        iris: `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:iris', 'the_geom','("code_iris" = ${val})'))))`,
        etapeOA: getEtapeOA(layer, val),
        etapePA: getEtapePA(layer, val),
        secteur_sam: `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:v_chargedoperation_secteur', 'the_geom','("nom_secteu" = ${val})'))))`,
        secteur_speu: `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:v_referent_urbaniste_secteur', 'the_geom','("nom_secteu" = ${val})'))))`,
        secteur_sds: `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:v_instructeur_secteur', 'the_geom','("nom_secteu" = ${val})'))))`,
        ref_foncier: `(INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:v_negociateurfoncier_secteur', 'the_geom','("nom" = ${val})'))))`
    }
    return exp[layer];
}