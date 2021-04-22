import axios from '@mapstore/libs/ajax';
import { API_BASE_URL } from '../constants';

let baseURL = "/tabou2";

/**
 * API - create GET request
 */
export function getRequestApi(name, apiCfg, params) {
    let url = apiCfg?.apiURL || baseURL;
    let requestParams = {
        params: params || {}
    };
    if (apiCfg?.authent) {
        requestParams.headers = {
            Authorization: `Basic ${btoa(apiCfg.authent)}`
        };
    }
    return axios.get(`${url}/${name}`, requestParams).then(({ data }) => data);
}

/**
 * API - create PUT request
 */
export function putRequestApi(name, apiCfg, body) {
    let url = apiCfg?.apiURL || API_BASE_URL;
    let headers = {};
    if (apiCfg?.authent) {
        headers.Authorization = `Basic ${btoa(apiCfg.authent)}`;
    }
    return axios.put(`${url}/${name}`, body, {headers: headers}).then(({ data }) => data);
}

/**
 * API - create POST request
 */
export function postRequestApi(name, apiCfg, body) {
    let url = apiCfg?.apiURL || API_BASE_URL;
    let headers = {};
    if (apiCfg?.authent) {
        headers.Authorization = `Basic ${btoa(apiCfg.authent)}`;
    }
    return axios.post(`${url}/${name}`, body, {headers: headers}).then(({ data }) => data);
}


export function getFeatureEvents(type, id) {
    //return getRequestApi(`${type}/${id}/evenements`).then(({ data }) => data);
    return axios.get(`${baseURL}/${type}/${id}/evenements`, null, {})
}

export function addFeatureEvent(type, id, event) {
    return axios.post(`${baseURL}/${type}/${id}/evenements`, event);
}

export function changeFeatureEvent(type, id, event) {
    return axios.post(`${baseURL}/${type}/${id}/evenements`, event);
}

export function deleteFeatureEvent(type, id, eventId) {
    return axios.delete(`${baseURL}/${type}/${id}/evenements/${eventId}`);
}








export function getTypesEvents() {
    return getRequestApi(`types-evenements?asc=true`);
}

export function getFeatureTiers(type, id) {
    return getRequestApi(`${type}/${id}/tiers?asc=true`).then(({ data }) => data);
}

export function getTiers() {
    return getRequestApi(`tiers?asc=true`).then(({ data }) => data);
}

export function getTypesTiers() {
    return getRequestApi(`/types-tiers?asc=true`).then(({ data }) => data);
}