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
export function getNewFilter(layerTypeName = '', spatialFilter = {}, textFilters = [], crossLayer = null) {
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
    };
}

/**
 * Return simple CQL Cross layer filter from complexe CQL expression.
 * * This structure is expected by MapStore2 TOC filter plugin to work together.
 * @param {object} props
 * @returns {object} as CQL filter's crossLayer param object.
 */
export function getNewCrossLayerFilter(props) {
    if (containEmpty(props)) return null;
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
    };
}

/**
 * Return simple CQL Cross layer filter from simple CQL expression.
 * This structure is expected by MapStore2 TOC filter plugin to work together.
 * @param {object} props
 * @returns {object} as CQL filter's crossLayer param object.
 */
export function getNewCqlFilter(props) {
    if (containEmpty(props)) return null;
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
    };
}

export function getIdsToCql(ids, field) {
    return ids.map(id => {
        return {
            attribute: field,
            groupId: 1,
            operator: "=",
            rowId: new Date().getTime(),
            type: "number",
            value: id
        };
    });
}
/**
 * Create a simple CQL syntax without spatial query
 * @param {string} type layer expected from config as layerOA, layerPA, layer SA values
 * @param {any} field to filter
 * @param {*} value to apply
 * @returns
 */
 export function getCQL(type, field, value) {
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
 * @param {string} type
 * @param {string} geomA
 * @param {string} layer
 * @param {string} geomB
 * @param {string} field
 * @param {any} value
 * @returns {string} as CQL expression value
 */
export function getSpatialCQL(type, geomA, layer, geomB, field, value, onlyTabou) {
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
