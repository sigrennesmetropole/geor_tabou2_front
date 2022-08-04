import { reproject } from '@mapstore/utils/CoordinatesUtils';
import GeoJSON from 'ol/format/GeoJSON';
import Polygon from 'ol/geom/Polygon';

export const featuresToJSON = (features) => {
    let writer = new GeoJSON();
    return writer.writeFeatures(features);
};

/**
* Generate a simple point geometry using position data
 * @param {object} point/position data from the map
 * @return {{coordinates: [number, string], projection: string, type: string}|*} geometry of type Point
 */
const getGeometry = (point, from, to) => {
    const geometry = point?.geometricFilter?.value?.geometry;
    if (geometry) {
        return geometry;
    }
    let lng = point.lng || point.latlng.lng;
    let lngCorrected = lng - 360 * Math.floor(lng / 360 + 0.5);
    let lonLat = [lngCorrected, point.lat || point.latlng.lat];
    if (from && to) {
        lonLat = reproject(lonLat, from, to);
    }
    return {
        coordinates: lonLat,
        projection: to || "EPSG:4326",
        type: "Point"
    };
};

// TODO : set geom field from config
export const createParams = (point, layer) => {
    const geometry = getGeometry(point, "EPSG:4326", "EPSG:3948");
    return {
        CQL_FILTER: `INTERSECTS(the_geom,POINT(${geometry.coordinates[0] || geometry.coordinates.x} ${geometry.coordinates[1] || geometry.coordinates.y}))`,
        OUTPUTFORMAT: "application/json",
        REQUEST: "GetFeature",
        SERVICE: "WFS",
        TYPENAME: layer, // "tabou:tabou_v_oa_operation",
        VERSION: "1.0.0",
        SRSNAME: "EPSG:4326"
    };
};

export const createCqlPoint = (point) => {
    const geometry = getGeometry(point, "EPSG:4326", "EPSG:3948");
    return `INTERSECTS(the_geom,POINT(${geometry.coordinates[0] || geometry.coordinates.x} ${geometry.coordinates[1] || geometry.coordinates.y}))`;
};


export const readFeatures = (data, from, to) => {
    let reader = new GeoJSON({
        defaultDataProjection: from
    });
    let features = reader.readFeatures(data, from && to ? { dataProjection: from, featureProjection: to } : {});
    features.forEach(f => f.setProperties({ area: f.getGeometry().getArea() }));
    return features;
};

export const getAreaFeature = (featureJson, from, to) => {
    return readFeatures(featureJson, from, to)[0].getGeometry().getArea();
};

export const getJsonFeatures = (data, from, to) => {
    let features = readFeatures(data, from, to);
    return JSON.parse(featuresToJSON(features));
}
