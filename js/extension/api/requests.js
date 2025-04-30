import axios from "@mapstore/libs/ajax";
import { API_BASE_URL } from "../constants";
import { keys } from "lodash";
const baseURL = "/tabou2";

/**
 * Create geoserver request to get features IDs
 * @param {*} params - request params
 * @param {*} geoserverURL - Geoserver URL or path
 * @returns - geoserver response
 */
export function createOGCRequest(params, geoserverURL) {
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
 * @param {string} service - service type name
 * @param {integer} id - id tabou
 * @return {object} - API response
 */
export function getFeatureEvents(service, id) {
    return axios.get(`${baseURL}/${service}/${id}/evenements`, null, {});
}
/**
 * Add event to Tabou feature
 * @param {string} service - service type name
 * @param {integer} id - id Tabou
 * @param {object} event - event infos
 * @returns
 */
export function addFeatureEvent(service, id, event) {
    return axios.post(`${baseURL}/${service}/${id}/evenements`, event);
}
/**
 * Change event for a given tabou feature
 * @param {string} service - service type name
 * @param {integer} id - id tabou
 * @param {object} event - event infos
 * @returns {any} - API response
 */
export function changeFeatureEvent(service, id, event) {
    return axios.put(`${baseURL}/${service}/${id}/evenements`, event);
}
/**
 *
 * @param {string} service - service type name
 * @param {integer} id - id tabou
 * @param {integer} eventId - event id
 * @returns {object} - API response
 */
export function deleteFeatureEvent(service, id, eventId) {
    return axios.delete(`${baseURL}/${service}/${id}/evenements/${eventId}`);
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
 * @param {string} service - service type name
 * @param {integer} id - id tabou
 * @returns {object} - API response
 */
export function getFeatureTiers(service, id) {
    return axios.get(`${baseURL}/${service}/${id}/tiers?asc=true`, null, {});
}
/**
 * Get all tiers types from API
 * @returns {object} - all tiers type
 */
export function getTypesTiers() {
    return getRequestApi(`/types-tiers?asc=true`).then(({ data }) => data);
}
/**
 * Create association between tiers and feature
 * @param {string} service - service type name
 * @param {integer} id - feature's id tabou
 * @param {integer} idTier - targeted tiers id to change
 * @param {string} idType - id's tiers type
 * @returns {object} - axios response
 */
export function associateFeatureTier(service, id, idTier, idType) {
    return axios.post(`${baseURL}/${service}/${id}/tiers?tiersId=${idTier}&typeTiersId=${idType}`, {
        tiersId: idTier,
        typeTiersId: idType
    });
}
/**
 * Modify tiers association info
 * @param {string} service - service type name
 * @param {integer} id - feature's id tabou
 * @param {integer} idTier - targeted tiers id to change
 * @param {integer} idType - id's tiers type
 * @param {integer} associationId - association id
 * @returns {object} - axios response
 */
export function changeFeatureTierAssociation(service, id, idTier, idType, associationId) {
    return axios.put(`${baseURL}/${service}/${id}/tiers/${associationId}`, {
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
 * @param {string} service - service type name
 * @param {integer} id - id tabou
 * @param {*} associationId - association id
 * @returns {object} - axios response
 */
export function dissociateFeatureTier(service, id, associationId) {
    return axios.delete(`${baseURL}/${service}/${id}/tiers/${associationId}`);
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
 * Call PDF document
 * @param {integer} id - tabou feature id
 * @returns {object} - contain pdf document as buffer
 */
export function getPDFOperation(id) {
    return axios.get(`${baseURL}/operations/${id}/fiche-suivi`, {responseType: 'arraybuffer'});
}
/**
 * Call PDF document
 * @param {integer} id - tabou feature id
 * @returns {object} - contain pdf document as buffer
 */
export function getPDFSecteur(id) {
    return axios.get(`${baseURL}/secteurs-speu/${id}/fiche-suivi`, {responseType: 'arraybuffer'});
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
 * Get all the operations for a given programme id
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
    return axios.get(`${baseURL}/v2/operations/${id}`);
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
 * @param {string} service - service type name
 * @param {object} params - tabou feature infos
 * @returns {object} - axios response
 */
export function createNewTabouFeature(service, params) {
    return axios.post(`${baseURL}/${service}`, params);
}
/**
 * Autocomplete PLUI text with API
 * @param {string} text - string to search
 * @returns {object} - autocompletion result
 */
export function searchPlui(text) {
    return axios.get(`${baseURL}/plui`, { params: {libelle: `${text}*`, asc: true}}).then(({ data }) => data);
}
/**
 * Autocomplete tiers by name
 * @param {string} text - string to search
 * @returns {object} - autocompletion result
 */
export function searchTiers(text) {
    return axios.get(`${baseURL}/tiers`, { params: {nom: `*${text}*`, inactif: false, asc: true}}).then(({ data }) => data);
}

// FEATURE'S DOCUMENT
export function getTabouDocuments(url, id, page, result, nom = "", libelleTypeDocument = "", typeMime = "") {
    const params = (page || page > -1) && result ? {
        start: page,
        resultsNumber: result
    } : {};
    return axios.get(`${baseURL}/${url}/${id}/documents`, {params: {
        ...params,
        asc: true,
        nom: nom.length >= 3 ? `*${nom}*` : "**",
        libelleTypeDocument: libelleTypeDocument ? `*${libelleTypeDocument}*` : "**",
        typeMime: typeMime ? `*${typeMime}*` : "**"
    }}).then(({ data }) => data);
}
export function addDocument(url, id, file, metadata) {
    let formData = new FormData();
    formData.append("fileToUpload", file);
    return axios.post(`${baseURL}/${url}/${id}/documents`,
        formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            params: {
                dateDocument: metadata.dateDocument,
                nom: metadata.nom,
                libelleTypeDocument: metadata.libelleTypeDocument
            }
        });
}
export function deleteDocuments(service, id, docId) {
    return axios.delete(`${baseURL}/${service}/${id}/documents/${docId}`);
}

// DOCUMENT METADATA
export function getDocumentMetadata(service, id, docId) {
    return axios.get(`${baseURL}/${service}/${id}/documents/${docId}`).then(({ data }) => data);
}
export function updateMetadataDocument(type, id, metadata) {
    return axios.put(`${baseURL}/${type}/${id}/documents/${metadata.id}`, metadata);
}

// DOCUMENT CONTENT
export function getDocumentContent(service, id, docId) {
    return axios.get(`${baseURL}/${service}/${id}/documents/${docId}/content`, {responseType: 'arraybuffer'}).then(( data ) => data);
}
export function updateDocumentContent(service, id, metadata, file) {
    let formData = new FormData();
    formData.append("fileToUpload", file);
    formData.append("nom", metadata.nom);
    formData.append("libelleTypeDocument", metadata.libelleTypeDocument);
    formData.append("dateDocument", metadata.dateDocument);
    return axios.put(`${baseURL}/${service}/${id}/documents/${metadata.id}/content`,
        formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
}

export function searchDocumentsTypes(text) {
    return axios.get(`${baseURL}/types-documents`, {params: {libelleTypeDocument: `*${text}*`, asc: true}}).then(( data ) => data.data);
}

/**
 * Autocomplete vocations-za combo
 * @param {string} text - string to search
 * @returns {object} - autocompletion result
 */
export function searchVocationZa(text) {
    return axios.get(`${baseURL}/vocations-za`, { params: {libelle: `*${text}*`, asc: true}}).then(({ data }) => data);
}
export function getVocationZa() {
    return axios.get(`${baseURL}/vocations-za`, { params: { asc: true}}).then(({ data }) => data);
}

export const changeOperation = (operation) => axios.put(`${baseURL}/v2/operations`, operation);

export const getTypesProgrammationId = () => axios.get(`${baseURL}/types-programmations`, { params: { asc: true } });

export const getTypesContributionsId = () => axios.get(`${baseURL}/types-contributions`, { params: { asc: true } });

export const getTypesVocationsId = () => axios.get(`${baseURL}/vocations`, { params: { asc: true } });

export const getTypesFoncier = () => axios.get(`${baseURL}/types-fonciers`, { params: { asc: true } });

export const getTypesActions = () => axios.get(`${baseURL}/types-actions-operations`, { params: { asc: true } });

export const getTypesActeurs = () => axios.get(`${baseURL}/types-acteurs`, { params: { asc: true } });


/** SuiviPLH requests **/

/**
 * Get all typePLH
 * @returns {object} - axios response
 */
export const getTypesPLH = (programmeId) => axios.get(`${baseURL}/type-plh`, { params: { programmeId: programmeId, asc: true } }).then(({ data }) => data);


/**
 * Add typePLH to a program
 * @param {integer} programmeId - id program
 * @param {integer} typePLHId - id typePLH
 * @returns {object} - axios response
 */
export function createProgrammeTypePLH(programmeId, typePLHId) {
    return axios.post(`${baseURL}/programmes/${programmeId}/plh/${typePLHId}`).then(data => data);
}

/**
 * Update typePLH of a program
 * @param {integer} programmeId - id program
 * @param {object} data - typePLH
 * @returns {object} - axios response
 */
export function updateProgrammeTypePLH(programmeId, data) {
    return axios.put(`${baseURL}/programmes/${programmeId}/plh`, data).then(data => data);
}


/**
 * Get typePLH of a given programme
 * @param {integer} programmeId - id program
 * @param {integer} typePLHId - id typePLH
 * @returns {object} - axios response
 */
export function getProgrammeTypePLH(programmeId, typePLHId) {
    return axios.get(`${baseURL}/programmes/${programmeId}/plh/${typePLHId}`).then(data => data);
}


/**
 * Delete a typePLH of a programm
 * @param {integer} programmeId - id tabou
 * @param {integer} typePLHId - id typePLH
 * @returns {object} - axios response
 */
export function deleteProgrammeTypePLH(programmeId, typePLHId) {
    return axios.delete(`${baseURL}/programmes/${programmeId}/plh/${typePLHId}`).then(data => data);
}

/**--------------------------------------------------------------------------------------------------**/

/**
 * Update a typePLH
 * @param {object} data - typePLH
 * @returns {object} - axios response
 */
export function updateTypePLH(data) {
    return axios.put(`${baseURL}/type-plh`, data);
}

/**
 * Get a typePLH detail
 * @param {integer} typePLHId - id typePLH
 * @returns {object} - axios response
 */
export function getTypePLH(typePLHId) {
    return axios.get(`${baseURL}/type-plh/${typePLHId}`);
}


/**
 * Add typePLH to a parent
 * @param {integer} typePLHId - id typePLH Parent
 * @param {object} data - typePLH
 * @returns {object} - axios response
 */
export function createTypePLHParent(typePLHId, data) {
    return axios.post(`${baseURL}/type-plh/${typePLHId}`, data);
}


/**
 * Get every typePLH
 * @param {integer} typePLHId - id typePLH
 * @returns {object} - axios response
 */
export function deleteTypePLH(typePLHId) {
    return axios.delete(`${baseURL}/type-plh/${typePLHId}`);
}

/**
 * Get every typePLH
 * @param {integer} typePLHId - id typePLH
 * @returns {object} - axios response
 */
export const getTypePLHParent = () => axios.get(`${baseURL}/type-plh/${typePLHId}/searchParent`);
