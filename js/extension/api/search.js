import axios from '@mapstore/libs/ajax';
import { API_BASE_URL } from '../constants';

/**
 * API - get commune values
 */
export function getCommunes(params) {
    params = params || {};
    return axios.get(`${API_BASE_URL}/communes`, { params: params }).then(({ data }) => data);
}

/**
 * API - get quartiers values
 */
export function getQuartiers(params) {
    params = params || {};
    return axios.get(`${API_BASE_URL}/quartiers`, { params: params }).then(({ data }) => data);
}

/**
 * API - get quartiers values
 */
export function getIris(params) {
    params = params || {};
    return axios.get(`${API_BASE_URL}/iris`, { params: params }).then(({ data }) => data);
}


/**
 * API - get quartiers values
 */
export function getPAFromCQL() {
    let CQL = [
        `INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:commune_emprise', 'the_geom','("code_insee" = 35238)')))`,
        `INTERSECTS(the_geom,collectGeometries(queryCollection('tabou2:commune_emprise', 'the_geom','("code_insee" = 35076)')))`    
    ];
    let URL = 'https://georchestra.example.org/geoserver/wfs';
    let params = {
        CQL_FILTER: CQL.join(' OR '),
        service:'WFS',
        request:'GetFeatures',
        typeName: 'tabou2:v_oa_programme',
        outputFormat:'application/json',
        srsname:'EPSG:3857'
    };
    console.log(params);
    return axios.post(URL, params, null).then(({ data }) => {console.log(data); return data});
}