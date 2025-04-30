import axios from "@mapstore/libs/ajax";
import { API_BASE_URL } from "../constants";
import { keys } from "lodash";
const baseURL = "/tabou2";

/**
 * Create geoserver request to get featrures IDs
 * @param {*} params - request params
 * @param {*} geoserverURL - Geoserver URL or path
 * @returns - geoserver response
 */
export function getIdsFromSearch(params, geoserverURL) {
    let paramsToStr = keys(params).map(k => `${k}=${params[k]}`);
    return axios.post(`${geoserverURL}/ows`, paramsToStr.join('&'), {
        timeout: 60000,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(({ data }) => data);
}

/**
 * Create GET request - specific method to use header authent
 * @param {string} name - service name
 * @param {object} apiCfg - config
 * @param {object} params - object
 * @returns {object} - API response
 */
export function getRequestApi(name, apiCfg, params) {
    let url = apiCfg?.apiURL || baseURL;
    let requestParams = {
        params: params || {}
    };
    // always order by asc
    requestParams.params.asc = true;
    if (apiCfg?.authent) {
        requestParams.headers = {
            Authorization: `Basic ${btoa(apiCfg.authent)}`
        };
    }
    return axios.get(`${url}/${name}`, requestParams).then(({ data }) => data);
}

/**
 * Create PUT request - specific method to use header authent
 * @param {string} name - service name
 * @param {object} apiCfg - config
 * @param {object} body - POST body
 * @returns {object} - API response
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
 * Create POST request - specific method to use header authent
 * @param {string} name - service name
 * @param {object} apiCfg - config
 * @param {object} body - POST body
 * @returns {object} - API response
 */
export function postRequestApi(name, apiCfg, body) {
    let url = apiCfg?.apiURL || API_BASE_URL;
    let headers = {};
    if (apiCfg?.authent) {
        headers.Authorization = `Basic ${btoa(apiCfg.authent)}`;
    }
    return axios.post(`${url}/${name}`, body, {headers: headers}).then(({ data }) => data);
}
/**
 * Get events by tabou feature
 * @param {string} type - service type name
 * @param {integer} id - id tabou
 * @return {object} - API response
 */
export function getFeatureEvents(type, id) {
    return axios.get(`${baseURL}/${type}/${id}/evenements`, null, {});
}
/**
 * Add event to tabou feature
 * @param {string} type - service type name
 * @param {integer} id - id tabou
 * @param {object} event - event infos
 * @returns
 */
export function addFeatureEvent(type, id, event) {
    return axios.post(`${baseURL}/${type}/${id}/evenements`, event);
}
/**
 * Change event for a given tabou feature
 * @param {string} type - service type name
 * @param {integer} id - id tabou
 * @param {object} event - event infos
 * @returns {any} - API response
 */
export function changeFeatureEvent(type, id, event) {
    return axios.put(`${baseURL}/${type}/${id}/evenements`, event);
}
/**
 *
 * @param {string} type - service type name
 * @param {integer} id - id tabou
 * @param {integer} eventId - event id
 * @returns {object} - API response
 */
export function deleteFeatureEvent(type, id, eventId) {
    return axios.delete(`${baseURL}/${type}/${id}/evenements/${eventId}`);
}
/**
 * Get events types
 * @returns {object} - API response
 */
export function getTypesEvents() {
    return getRequestApi(`types-evenements?asc=true`);
}
/**
 * Get all tiers
 * @param {object} params - to insert GET params
 * @returns {object} - API response
 */
export function getTiers(params = {}) {
    return axios.get(`${baseURL}/tiers`, {params: params}, {});
}
/**
 * Get all tiers for a given tabou feature
 * @param {string} type - service type name
 * @param {integer} id - id tabou
 * @returns {object} - API response
 */
export function getFeatureTiers(type, id) {
    return axios.get(`${baseURL}/${type}/${id}/tiers?asc=true`, null, {});
}
/**
 * Get all teirs types from API
 * @returns {object} - all tiers type
 */
export function getTypesTiers() {
    return getRequestApi(`/types-tiers?asc=true`).then(({ data }) => data);
}
/**
 * Create association between tiers and feature
 * @param {string} type - service type name
 * @param {integer} id - feature's id tabou
 * @param {integer} idTier - targeted tiers id to change
 * @param {string} idType - id's tiers type
 * @returns {object} - axios response
 */
export function associateFeatureTier(type, id, idTier, idType) {
    return axios.post(`${baseURL}/${type}/${id}/tiers?tiersId=${idTier}&typeTiersId=${idType}`, {
        tiersId: idTier,
        typeTiersId: idType
    });
}
/**
 * Modify tiers association info
 * @param {string} type - service type name
 * @param {integer} id - feature's id tabou
 * @param {integer} idTier - targeted tiers id to change
 * @param {integer} idType - id's tiers type
 * @param {integer} associationId - association id
 * @returns {object} - axios response
 */
export function changeFeatureTierAssociation(type, id, idTier, idType, associationId) {
    return axios.put(`${baseURL}/${type}/${id}/tiers/${associationId}`, {
        tiersId: idTier,
        typeTiersId: idType
    });
}
/**
 * Create new tiers
 * @param {Object} tiers to create
 * @returns {object} - axios response
 */
export function createTier(tiers) {
    return axios.post(`${baseURL}/tiers`, tiers.tiers);
}
/**
 * Change tiers attribute
 * @param {Object} tiers to change
 * @returns {object} - axios response
 */
export function changeFeatureTier(tiers) {
    return axios.put(`${baseURL}/tiers`, tiers);
}
/**
 * Dissociate tiers from tabou feature
 * @param {string} type - service type name
 * @param {integer} id - id tabou
 * @param {*} associationId - association id
 * @returns {object} - axios response
 */
export function dissociateFeatureTier(type, id, associationId) {
    return axios.delete(`${baseURL}/${type}/${id}/tiers/${associationId}`);
}
/**
 * Inactive tiers
 * @param {integer} tiersId - tiers id
 * @returns {object} - axios response
 */
export function inactivateTier(tiersId) {
    return axios.put(`${baseURL}/tiers/${tiersId}/inactivate`, {});
}
/**
 * Call PDF document
 * @param {integer} id - tabou feature id
 * @returns {object} - contain pdf document as buffer
 */
export function getPDFProgramme(id) {
    return axios.get(`${baseURL}/programmes/${id}/fiche-suivi`, {responseType: 'arraybuffer'});
}
/**
 * Get programme by id tabou
 * @param {integer} id - id tabou
 * @returns {object} - axios response
 */
export function getProgramme(id) {
    return axios.get(`${baseURL}/programmes/${id}`);
}
/**
 * Get AGAPEO data for a given programme id
 * @param {integer} id - id tabou
 * @returns {object} - axios response
 */
export function getProgrammeAgapeo(id) {
    return axios.get(`${baseURL}/programmes/${id}/agapeo`);
}
/**
 * Get permis data for a given programme id
 * @param {integer} id - id tabou
 * @returns {object} - axios response
 */
export function getProgrammePermis(id) {
    return axios.get(`${baseURL}/programmes/${id}/permis`);
}
/**
 * Get every operations for a given programme id
 * @param {integer} id - id tabou
 * @returns {object} - axios response
 */
export function getOperationProgrammes(id) {
    return axios.get(`${baseURL}/operations/${id}/programmes`);
}
/**
 * Get operation by id tabou
 * @param {integer} id  - id tabou
 * @returns {object} - axios response
 */
export function getOperation(id) {
    return axios.get(`${baseURL}/operations/${id}`);
}
/**
 * Get secteur by id tabou. Secteur is an operation with a specific status.
 * @param {integer} id - id tabou
 * @returns {object} - axios response
 */
export function getSecteur(id) {
    // secteur is an operation with attribute secteur = true
    return getOperation(id);
}
/**
 * Create new tabou feature from unknown selected map feature
 * @param {string} layer - service type name
 * @param {object} params - tabou feature infos
 * @returns {object} - axios response
 */
export function createNewTabouFeature(layer, params) {
    return axios.post(`${baseURL}/${layer}`, params);
}
/**
 * Autocomplete PLUI text with API
 * @param {string} text - string to search
 * @returns {object} - autocompletion result
 */
export function searchPlui(text) {
    return axios.get(`${baseURL}/plui`, { params: {libelle: `${text}*`, asc: true}}).then(({ data }) => data);
}
