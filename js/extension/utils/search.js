import { keys, get } from 'lodash';

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

export function getCQL (type, geomA, layer, geomB, field, value) {
    if(type === 'string') {
        value = `''${value}''`;
    }
    return `(INTERSECTS(${geomA},collectGeometries(queryCollection('${layer}', '${geomB}','${field} = ${value}'))))`;
}

export function getTabouLayersInfos(config) {
    if(!config) return;
    let infos = {};
    let layers = keys(config);
    if(!layers.length) return infos;
    layers.forEach(lyr => {
        return infos[get(config, `${lyr}.nom`)] = {
            id: get(config, `${lyr}.idField`),
            type: get(config, `${lyr}.idType`),
            geom: get(config, `${lyr}.geomField`)
        }
    });
    return infos;
}

export function getGeoServerUrl(props) {
    return props?.pluginCfg?.geoserverURL || `https://${window.location.hostname}/geoserver`;
}