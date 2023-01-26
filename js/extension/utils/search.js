import { keys, get } from 'lodash';

/**
 * Utils to format string
 * @param {string} type
 * @param {string} value
 * @returns string expected by CQL Url format
 */
const fixStringCql = (type, value) => {
    let cqlVal = value;
    if (type === 'string' && value) {
        cqlVal = `''${value.replace(/'/g, "''''")}''`;
    }
    return cqlVal;
};


/**
 * Control if an object have null attribute value.
 *
 * @param {object} obj
 * @returns {Boolean} - True if object have empty or null or value equal to 0.
 */
export function containEmpty(obj) {
    return keys(obj).filter(key => !obj[key]).length > 0;
}

/**
 * Create layerFilter params expected by MapStore to attach a filter to a layer as param.
 * This structure is expected by TOC filters plugin to work correctly.
 * @param {string} layerTypeName
 * @param {object} spatialFilter
 * @param {object} textFilters
 * @param {object} crossLayer
 * @returns {object}
 */
export function getNewFilter(layerTypeName = '', spatialFilter = {}, textFilters = [], crossLayerFilter = null) {
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
        crossLayerFilter: crossLayerFilter || null,
        hits: false
    };
}

/**
 * Create spatial filter to apply to TOC layer
 * @param {*} operation - operation to realize between geoms
 * @param {String} geom - geom field
 * @param {String} cqlFilter - cql expression
 * @param {Array} filterFields - list of filter fields object
 * @param {String} crossGeom - geom field name of layer use to filter
 * @param {String} crossName - typeName of layer use to filter
 * @returns cross layer filter object
 */
export function getNewCrossLayerFilter(operation, geom, cqlFilter, filterFields, crossGeom, crossName) {
    let crossFilter =  {
        operation: operation || "INTERSECTS",
        attribute: geom,
        collectGeometries: {
            queryCollection: {
                filterFields: filterFields,
                geometryName: crossGeom,
                typeName: crossName,
                groupFields: [{
                    id: 1,
                    logic: "OR",
                    index: 0
                }]
            }
        }
    };
    if (cqlFilter) crossFilter.collectGeometries.queryCollection.cqlFilter = cqlFilter;
    return crossFilter;
}

export function getFilterField(field, values, valueType, operator, groupId) {
    return values.map(value => ({
        attribute: field,
        groupId: groupId || 1,
        operator: operator || "=",
        rowId: new Date().getTime(),
        type: valueType || "number",
        value: value
    }));
}
/**
 * Create a simple CQL syntax without spatial query
 * @param {string} type layer expected from config as layerOA, layerPA, layer SA values
 * @param {any} field to filter
 * @param {*} value to apply
 * @param {string} condition - pass a condition directly
 * @returns
 */
export function getCQL(type, field, value, condition) {
    if (condition) {
        return condition;
    }
    if (type === "date" && (value.start || value.end)) {
        let vals = [
            value.start ? `"${field}" >='${value.start}'` : "",
            value.end ? `"${field}" <= '${value.end}'` : ""
        ].filter(m => m);
        return `${vals.join(" AND ")}`;
    } else if (type === "date") {
        return "";
    }
    return `${field}='${value}'`;
}


/**
 * Create standard CQL Cross Layer filter expression
 * @param {string} type - date or empty or string
 * @param {string} geomA - geom field to filtered
 * @param {string} layer - TOC id to filtered
 * @param {string} geomB - geom field name from use as filter
 * @param {string} field - optionnal - Limit layer use as filter by cql expression.
 * @param {string} value - optionnal. Value for previous field param.
 * @param {string} condition - pass a condition directly
 * @returns {string} CQL expression
 */
export function getSpatialCQL(type, geomA, layer, geomB, field, value, onlyTabou, condition) {
    if (condition) {
        return `(INTERSECTS(${geomA},collectGeometries(queryCollection('${layer}', '${geomB}','(${onlyTabou ? "id_tabou IS NOT NULL AND " : ""}${condition})'))))`;
    }
    if (type === "date" && (value.start || value.end)) {
        // allow to input only one date filter
        let vals = [
            // spcific for query filter ->  use ("field" >= ''string'') and not ("field" >= 'string')
            value.start ? `"${field}" >=''${value.start}''` : "",
            value.end ? `"${field}" <= ''${value.end}''` : ""
        ].filter(m => m);
        let cql = `${vals.join(" AND ")}`;
        return `(INTERSECTS(${geomA},collectGeometries(queryCollection('${layer}', '${geomB}','(${onlyTabou ? "id_tabou IS NOT NULL AND " : ""}${cql})'))))`;
    } else if (type === "date") {
        return "";
    } else if (!field && value) {
        return `(INTERSECTS(${geomA},collectGeometries(queryCollection('${layer}', '${geomB}','INCLUDE'))))`;
    }
    return `(INTERSECTS(${geomA},collectGeometries(queryCollection('${layer}', '${geomB}','(${onlyTabou ? "id_tabou IS NOT NULL AND " : ""}"${field}" = ${fixStringCql(type, value)})'))))`;
}

/**
 * Create an config object from pluginCfg to easily work with OA, SA, PA layers params
 * @param {object} config
 * @returns {object} infos
 */
export function getTabouLayersInfos(config) {
    if (!config) return null;
    let infos = {};
    let layers = keys(config);
    if (!layers.length) return infos;
    layers.forEach(lyr => {
        infos[get(config, `${lyr}.nom`)] = {
            id: get(config, `${lyr}.idField`),
            type: get(config, `${lyr}.idType`),
            geom: get(config, `${lyr}.geomField`)
        };
    });
    return infos;
}

/**
 * Get Geoserver URL from pluginCfg or from browser hostname if not set
 * @param {object} props
 * @returns {string} geoserver URL
 */
export function getGeoServerUrl(props) {
    return props?.pluginCfg?.geoserverURL || `https://${window.location.hostname}/geoserver`;
}

/**
 * Create layer filter from list values
 * @param {String} layer - layer typeName
 * @param {Array} values - list of values to filter
 * @param {String} field - field name to filterFields
 * @param {String} cql - optional cql expression like list
 * @returns filter object to apply as MapStore TOC filter
 */
export function newfilterLayerByList(layer, values, field, cql, crossLayer) {
    let newFilter = getNewFilter(layer, null, [], crossLayer);
    let valuesToCql = values.map(id => `${field} = ${id}`).join(' OR ');
    let filterFields = values.map((id, idx) => ({
        "rowId": new Date().getTime() + idx,
        "groupId": 1,
        "attribute": field,
        "operator": "=",
        "value": id,
        "type": "number",
        "fieldOptions": {
            "valuesCount": 0,
            "currentPage": 1
        },
        "exception": null
    }));
    // prepare filter
    let finalFilter = {
        layerToFilter: layer,
        tocFilter: null
    };
    if (crossLayer) {
        newFilter.crossLayerFilter.collectGeometries.queryCollection.filterFields = filterFields;
    } else {
        newFilter.filterFields = filterFields;
        newFilter.cql = cql || valuesToCql;
    }
    newFilter.tocFilter = newFilter;
    return {...finalFilter, ...newFilter};
}

/**
 * Create params object expected by Ajax POST request
 * @param {String} cql - expression
 * @param {String} layer - name from geoserver typeName
 * @returns object
 */
export function createWfsPostRequest(cql, layer) {
    return {
        CQL_FILTER: cql,
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        TYPENAME: layer, // tabou2:iris
        OUTPUTFORMAT: 'application/json',
        VERSION: '1.0.0'
    };
}