import {keys, get} from 'lodash';

/**
 * Utils to format string
 * @param {string} type
 * @param {string} value
 * @returns string expected by CQL Url format
 */
const fixStringCql = (type, value) => {
    let cqlVal = value;
    if (type === 'string' && value) {
        cqlVal = `'${value.replace(/'/g, "''")}'`;
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
 * @param {object} crossLayerFilter
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
 * Describe a cross layer filter: features of a layer intersecting features of another layer.
 * The filter is not serialized to CQL here because it can not always be sent as is to GeoServer:
 * the operations layer is reachable only through the API proxy, which refuses `queryCollection`.
 * See resolveCondition in epics/search.js.
 * @param {string} type - date or empty or string
 * @param {string} geomA - geom field to filtered
 * @param {string} layer - typeName of the layer used as filter
 * @param {string} geomB - geom field name from use as filter
 * @param {string} field - optionnal - Limit layer use as filter by cql expression.
 * @param {string} value - optionnal. Value for previous field param.
 * @param {boolean} onlyTabou - optionnal - filter only tabou layer.
 * @param {string} condition - pass a condition directly
 * @returns {object|null} {geomA, layer, geomB, cql} where cql is the plain condition applied on `layer`
 */
export function getSpatialFilter({type, geomA, layer, geomB, field, value, onlyTabou, condition}) {
    const onlyTabouCql = onlyTabou ? "id_tabou IS NOT NULL AND " : "";
    let cql;
    if (condition) {
        cql = `(${onlyTabouCql}${condition})`;
    } else if (type === "date" && (value.start || value.end)) {
        // allow to input only one date filter
        let vals = [
            value.start ? `"${field}" >='${value.start}'` : "",
            value.end ? `"${field}" <= '${value.end}'` : ""
        ].filter(m => m);
        cql = `(${onlyTabouCql}${vals.join(" AND ")})`;
    } else if (type === "date") {
        return null;
    } else if (!field && value) {
        cql = 'INCLUDE';
    } else {
        cql = `(${onlyTabouCql}"${field}" = ${fixStringCql(type, value)})`;
    }
    return {geomA, layer, geomB, cql};
}

/**
 * Serialize a cross layer filter to the native GeoServer CQL syntax (collectGeometries / queryCollection).
 * Only usable on layers directly reachable on GeoServer, never on the operations layer.
 * @param {object} spatialFilter - see getSpatialFilter
 * @returns {string} CQL expression
 */
export function spatialFilterToCql({geomA, layer, geomB, cql}) {
    // the inner CQL is a string literal of queryCollection: quotes must be doubled
    return `(INTERSECTS(${geomA},collectGeometries(queryCollection('${layer}', '${geomB}','${cql.replace(/'/g, "''")}'))))`;
}

const ringToWkt = (ring) => `(${ring.map(([x, y]) => `${x} ${y}`).join(", ")})`;
const polygonToWkt = (rings) => `(${rings.map(ringToWkt).join(", ")})`;

/**
 * Convert a GeoJSON geometry to WKT. Only polygons are supported.
 * @param {object} geometry - GeoJSON geometry
 * @returns {string|null} WKT, or null for an unsupported geometry
 */
export function geometryToWkt(geometry) {
    if (geometry?.type === "Polygon") {
        return `POLYGON${polygonToWkt(geometry.coordinates)}`;
    }
    if (geometry?.type === "MultiPolygon") {
        return `MULTIPOLYGON(${geometry.coordinates.map(polygonToWkt).join(", ")})`;
    }
    return null;
}

/**
 * Create a CQL expression selecting features intersecting literal geometries.
 * One clause by feature to avoid building an invalid collection from overlapping geometries.
 * @param {string} geomA - geom field of the filtered layer
 * @param {Array} features - GeoJSON features
 * @returns {string} CQL expression, EXCLUDE if there is no usable geometry
 */
export function geometriesToCql(geomA, features) {
    const clauses = (features || [])
        .map(feature => geometryToWkt(feature?.geometry))
        .filter(wkt => wkt)
        .map(wkt => `INTERSECTS(${geomA}, ${wkt})`);
    return clauses.length ? `(${clauses.join(" OR ")})` : "EXCLUDE";
}

/**
 * Get the plugin configuration (layersCfg) of a layer from its typeName.
 * @param {object} pluginCfg
 * @param {string} typeName - layer typeName
 * @returns {object|undefined} layer configuration
 */
export function getLayerCfg(pluginCfg, typeName) {
    return Object.values(pluginCfg?.layersCfg || {}).find(layerCfg => layerCfg?.nom === typeName);
}

/**
 * Get the OGC service URL to use for a layer: the `url` of its layersCfg entry if there is one (a layer behind
 * the API proxy, like the operations layer), the GeoServer URL otherwise.
 * @param {object} pluginCfg
 * @param {string} typeName - layer typeName
 * @returns {string} OGC service URL
 */
export function getOGCUrl(pluginCfg, typeName) {
    return getLayerCfg(pluginCfg, typeName)?.url || `${pluginCfg?.geoserverURL}/ows`;
}

/**
 * Control that a cross layer filter must be resolved by the client instead of by GeoServer:
 * a layer with its own url (behind the API proxy) is on one side of the filter, and the proxy refuses `queryCollection`.
 * @param {object} spatialFilter - see getSpatialFilter
 * @param {string} targetLayer - typeName of the filtered layer
 * @param {object} pluginCfg
 * @returns {boolean}
 */
export function involvesLayer(spatialFilter, targetLayer, pluginCfg) {
    return !!(getLayerCfg(pluginCfg, spatialFilter.layer)?.url || getLayerCfg(pluginCfg, targetLayer)?.url);
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
 * @param {object} crossLayer - optionnal - filter by cross layer
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
    if (crossLayer) {
        newFilter.crossLayerFilter.collectGeometries.queryCollection.filterFields = filterFields;
    } else {
        newFilter.filterFields = filterFields;
        newFilter.cql = cql || valuesToCql;
    }
    // prepare filter: "tocFilter" holds the MapStore layer filter object.
    // It must be a distinct object (not a self-reference to newFilter), otherwise the
    // structure is circular and breaks JSON.stringify when MapStore serializes the
    // layer state once the filter is applied.
    return {
        ...newFilter,
        layerToFilter: layer,
        tocFilter: {...newFilter}
    };
}

/**
 * Create params object expected by Ajax POST request
 * @param {String} cql - expression
 * @param {String} layer - name from geoserver typeName
 * @param {object} extraParams - optionnal - other WFS params
 * @returns object
 */
export function createWfsPostRequest(cql, layer, extraParams = {}) {
    return {
        CQL_FILTER: cql,
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        TYPENAME: layer, // tabou2:iris
        OUTPUTFORMAT: 'application/json',
        VERSION: '1.0.0',
        ...extraParams
    };
}
