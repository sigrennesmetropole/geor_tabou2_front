import axios from "@mapstore/libs/ajax";
import { API_BASE_URL } from "@ext/constants";
import { keys, find } from "lodash";

let baseURL = "/tabou2";

/** SEARCH - get ids from cross layer filter */
export function getIdsFromSearch(params, geoserverURL) {
    let paramsToStr = keys(params).map(k => `${k}=${params[k]}`);
    return axios.post(`${geoserverURL}/ows`, paramsToStr.join('&'), {
        timeout: 60000,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(({ data }) => data);
}

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


/**
 * EVENTS
 */
export function getFeatureEvents(type, id) {
    return axios.get(`${baseURL}/${type}/${id}/evenements`, null, {});
}

export function addFeatureEvent(type, id, event) {
    return axios.post(`${baseURL}/${type}/${id}/evenements`, event);
}

export function changeFeatureEvent(type, id, event) {
    return axios.post(`${baseURL}/${type}/${id}/evenements`, event);
}

export function deleteFeatureEvent(type, id, eventId) {
    console.log("delete");
    return axios.delete(`${baseURL}/${type}/${id}/evenements/${eventId}`);
}

export function getTypesEvents() {
    return getRequestApi(`types-evenements?asc=true`);
}


/**
 * TIERS
 */

export function getTiers(params = {}) {
    return axios.get(`${baseURL}/tiers`, {params: params}, {});
}

export function getFeatureTiers(type, id) {
    return axios.get(`${baseURL}/${type}/${id}/tiers?asc=true`, null, {})
}

export function getTypesTiers() {
    return getRequestApi(`/types-tiers?asc=true`).then(({ data }) => data);
}

// associate tier
export function associateFeatureTier(type, id, idTier, idType) {
    return axios.post(`${baseURL}/${type}/${id}/tiers`, {
        tiersId: idTier,
        typeTiersId: idType
    });
}

// change association type
export function changeFeatureTierAssociation(type, id, idTier, idType) {
    return axios.put(`${baseURL}/${type}/${id}/tiers/${idTier}`, {
        tiersId: idTier,
        typeTiersId: idType
    });
}

// add tier to general tiers list
export function createTier(tier) {
    return axios.post(`${baseURL}/tiers`, tier);
}

export function changeFeatureTier(tier) {
    return axios.put(`${baseURL}/tiers`, tier);
}

export function deleteFeatureTier(type, id, tierId) {
    return axios.delete(`${baseURL}/${type}/${id}/tiers/${tierId}`);
}

export function inactivateTier(tierId) {
    return axios.put(`${baseURL}/tiers/${tierId}/inactivate`, tier);
}

export function getPDFProgramme(type, id) {
    return axios.get(`${baseURL}/${type}/${id}/fiche-suivi`, {responseType: 'arraybuffer'});
}

/**
 * PANEL IDENTIFY INFOS
 */

export function getProgramme(id) {
    return axios.get(`${baseURL}/programmes/${id}`);
}

export function getProgrammeAgapeo(id) {
    return axios.get(`${baseURL}/programmes/${id}/agapeo`);
}

export function getProgrammePermis(id) {
    return axios.get(`${baseURL}/programmes/${id}/permis`);
}

export function getOperationProgrammes(id) {
    return axios.get(`${baseURL}/operations/${id}/programmes`);
}

export function getOperation(id) {
    return axios.get(`${baseURL}/operations/${id}`);
}

export function getSecteur(id) {
    return axios.get(`${baseURL}/operations`)
    .catch(error => {})
    .then(response => (
        {
            ...response,
            data: find(response.data.elements, ["id", id])
        }
    ));
}
