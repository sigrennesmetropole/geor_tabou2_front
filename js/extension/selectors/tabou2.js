import { CONTROL_NAME, TABOU_VECTOR_ID, TABOU_MARKER_LAYER_ID, URL_ADD } from '../constants';
import { keys, pickBy, isEmpty, get } from 'lodash';
import { userGroupSecuritySelector, userSelector } from '@mapstore/selectors/security';
import { additionalLayersSelector } from '@mapstore/selectors/additionallayers';

/**
 * Get active tab id
 * @param {*} state
 * @returns {string}
 */
export function currentActiveTabSelector(state) {
    return state?.tabou2.activeTab;
}
/**
 * Get tabou2 status
 * @param {*} state
 * @returns {boolean}
 */
export function isTabou2Activate(state) {
    return (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false;
}
/**
 * Get current tabou filers
 * @param {*} state
 * @returns {object}
 */
export function currentTabouFilters(state) {
    return state?.tabou2.filterObj;
}
/**
 * Get default infoformat for right query panel
 * @param {*} state
 * @returns {string}
 */
export function defaultInfoFormat(state) {
    return state?.tabou2.infoFormat;
}
/**
 * Get original OGC map click response
 * @param {*} state
 * @returns {object}
 */
export function getTabouResponse(state) {
    return state?.tabou2?.response;
}
/**
 * Get OGC map click response for each OA, PA, SA layers
 * @param {*} state
 * @returns {object}
 */
export function getTabouResponseLayers(state) {
    return keys(state?.tabou2.response);
}
/**
 * Get feature index selected if many map features was clicked
 * @param {*} state
 * @returns {integer}
 */
export function getTabouIndexSelectors(state) {
    return state?.tabou2.selectorsIndex;
}
/**
 * Get search filter applied for every layer
 * @param {*} state
 * @returns {object}
 */
export function getLayerFilterObj(state) {
    return state?.tabou2.layerFilterObj;
}
/**
 * Get Tabou plugin config
 * @param {*} state
 * @returns {object}
 */
export function getPluginCfg(state) {
    return state?.tabou2.pluginCfg;
}
/**
 * Get layer name from tabou config
 * @param {any} state
 * @returns {array} - name of layers
 */
export function getLayersName(state) {
    let layerCfg = getPluginCfg(state).layersCfg;
    return keys(layerCfg).map(k => layerCfg[k].nom);
}
/**
 * Get selected feature from identify panel
 * @param {any} state
 * @returns {object}
 */
export function getSelection(state) {
    return state?.tabou2?.selectedFeature;
}

export function getSelectionPoint(state) {
    return state.tabou2?.point || {};
}
/**
 * Get Selected layer from identify panel
 * @param {any} state
 * @returns {object} - layer info
 */
export function getLayer(state) {
    return state?.tabou2?.selectedLayer;
}
/**
 * Get config fot selected layer from identify panel
 * @param {any} state
 * @returns {object} - layer info
 */
export function getSelectedCfgLayer(state) {
    return keys(pickBy(getPluginCfg(state).layersCfg, lyr => lyr.nom === getLayer(state)))[0];
}
/**
 * Get events for the selected tabou map feature
 * @param {any} state
 * @returns {object}
 */
export function getEvents(state) {
    return state?.tabou2?.events;
}
/**
 * Get all infos for the identify panel fields
 * @param {any} state
 * @returns {Object}
 */
export function getFicheInfos(state) {
    return state?.tabou2?.ficheInfos;
}
/**
 * Get all tiers for clicked map tabou feature
 * @param {*} state
 * @returns {object}
 */
export function getTiers(state) {
    return state?.tabou2?.tiers;
}
/**
 * Get security infos.
 * @param {any} state
 * @returns {any}
 */
export function getAuthInfos(state) {
    const groups = userGroupSecuritySelector(state) ?? [];
    const groupNames = groups.map(({ groupName }) => `${groupName}`);
    return {
        user: userSelector(state)?.name ?? "",
        isAdmin: groupNames.includes("MAPSTORE_ADMIN"),
        isReferent: groupNames.includes("EL_APPLIS_TABOU_REFERENT"),
        isContrib: groupNames.includes("EL_APPLIS_TABOU_CONTRIB"),
        isConsult: groupNames.includes("EL_APPLIS_TABOU_CONSULT")
    };
}
/**
 * Get search loader status
 * @param {any} state
 * @returns {boolean}
 */
export function searchLoading(state) {
    return state?.tabou2?.loadFlags?.search;
}
/**
 * Get documents loader status
 * @param {any} state
 * @returns {boolean}
 */
export function documentsLoading(state) {
    return state?.tabou2?.loadFlags?.documents;
}
/**
 * Get identify loader status
 * @param {any} state
 * @returns {boolean}
 */
export function identifyLoading(state) {
    return state?.tabou2?.loadFlags?.identify;
}
/**
 * Get security infos.
 * @param {any} state
 * @returns {any}
 */
export function getFeatureAdded(state) {
    return state?.tabou2?.featureAdded;
}
/**
 * Get info from identify panel after map feature click
 * @param {any} state
 * @returns {object}
 */
export function getIdentifyInfos(state) {
    return state?.tabou2?.identifyInfos;
}
/**
 * Get all tabou errors info
 * @param {any} state
 * @returns {object}
 */
export function getTabouErrors(state) {
    return state?.tabou2?.errors;
}
/**
 * Get filter use to filter tiers table
 * @param {any} state
 * @returns {object}
 */
export function getTiersFilter(state) {
    return state?.tabou2?.tiersFilter;
}

export function tabouDataSelector(state) {
    return state?.tabou2?.features;
}

export function getClickedFeatures(state) {
    return pickBy(state?.tabou2?.features[0], (a) => !isEmpty(a));
}

export function layerStylesSelector(state) {
    return state.tabou2?.styles;
}
export function getSelectedStyle(state) {
    return layerStylesSelector(state)?.selected;
}

export function getDefaultStyle(state) {
    return layerStylesSelector(state)?.default;
}

export function getTabouVectorLayer(state) {
    const additionalLayers = additionalLayersSelector(state) ?? [];
    return additionalLayers.filter(({ id }) => id === TABOU_VECTOR_ID)?.[0]?.options;
}

export function getTabouMarkerLayer(state) {
    const additionalLayers = additionalLayersSelector(state) ?? [];
    return additionalLayers.filter(({ id }) => id === TABOU_MARKER_LAYER_ID)?.[0]?.options;
}

export function getGfiData(state) {
    return state?.tabou2?.gfiData;
}

export function getParentSA(state) {
    const oaTocName = getPluginCfg(state).layersCfg.layerOA.nom;
    const clicked = getClickedFeatures(state);
    if (clicked && clicked[oaTocName] && clicked[oaTocName].length === 1) {
        return getClickedFeatures(state)[oaTocName][0];
    }
    return [];
}

export function getInfos(state) {
    const feature = getSelection(state).feature;
    const layer = getLayer(state);
    // get plugin config
    const layersCfg = getPluginCfg(state).layersCfg;
    // layerOA, layerPa, layerSA
    const configName = keys(layersCfg).filter(k => layer === layersCfg[k].nom)[0];
    // return correct name field id according to layer
    const featureId = get(feature, "properties.id_tabou");
    // find correct api name
    const layerUrl = get(URL_ADD, configName);
    return {
        featureId: featureId,
        layerUrl: layerUrl,
        layer: layer,
        layerCfg: configName
    };
}

export function getFeatureDocuments(state) {
    return state.tabou2?.documents;
}

export function getVocationsActivitesInfos(state) {
    return {
        typesContribution: state.tabou2.typesContribution,
        typesProgrammation: state.tabou2.typesProgrammation,
        typesVocation: state.tabou2.typesVocation
    };
}

export function getTypesFicheInfos(state) {
    return {
        typesFonciers: state.tabou2.typesFonciers,
        typesAction: state.tabou2.typesAction,
        typesActeurs: state.tabou2.typesActeur
    };
}
