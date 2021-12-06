import axios from "@mapstore/libs/ajax";
import { API_BASE_URL } from "@ext/constants";
import { keys } from "lodash";

let baseURL = "/tabou2";

/** SEARCH - get ids from cross layer filter */
export function getIdsFromSearch(params, geoserverURL) {
    console.log(params);
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
    return axios.put(`${baseURL}/${type}/${id}/evenements`, event);
}

export function deleteFeatureEvent(type, id, eventId) {
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
    return axios.get(`${baseURL}/${type}/${id}/tiers?asc=true`, null, {});
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
export function changeFeatureTierAssociation(type, id, idTier, idType, associationId) {
    return axios.put(`${baseURL}/${type}/${id}/tiers/${associationId}`, {
        tiersId: idTier,
        typeTiersId: idType
    });
}

export function createTier(tiers) {
    return axios.post(`${baseURL}/tiers`, tiers.tiers);
}
export function changeFeatureTier(tiers) {
    return axios.put(`${baseURL}/tiers`, tiers);
}
export function dissociateFeatureTier(type, id, associationId) {
    return axios.delete(`${baseURL}/${type}/${id}/tiers/${associationId}`);
}
export function inactivateTier(tiersId) {
    return axios.put(`${baseURL}/tiers/${tiersId}/inactivate`, {});
}

/**
 * PRINT TABOU FEATURE INFOS
 */
export function getPDFProgramme(id) {
    return axios.get(`${baseURL}/programmes/${id}/fiche-suivi`, {responseType: 'arraybuffer'});
}

/**
 * IDENTIFY PANEL INFOS
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
    // secteur is an operation with attribute secteur = true
    return getOperation(id);
}

// CREATE TABOU ENTITY FROM FEATURE
export function createNewTabouFeature(layer, params) {
    return axios.post(`${baseURL}/${layer}`, params);
}

// AUTOCOMPLETION
export function searchPlui(text) {
    return axios.get(`${baseURL}/plui`, { params: {libelle: `${text}*`, asc: true}}).then(({ data }) => data);
}
