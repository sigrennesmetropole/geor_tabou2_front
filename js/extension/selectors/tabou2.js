import { CONTROL_NAME, TABOU_VECTOR_ID } from '@ext/constants';
import { keys, pickBy, get } from 'lodash';
import { userGroupSecuritySelector, userSelector } from '@mapstore/selectors/security';
import { additionalLayersSelector } from '@mapstore/selectors/additionallayers';
import { DEFAULT_STYLE, SELECT_STYLE } from "../constants";
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
    return state?.tabou2.response;
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

export function getCurrentTabouData(state) {
    const selected = {...tabouDataSelector(state)[0]};
    const selectedId = get(getSelection(state), "feature")?.id;
    keys(selected).map(lyr => {
        const geomField = (getPluginCfg(state).layersCfg, lyr).geomField;
        selected[lyr] = selected[lyr].map(feature => {
            return {
                ...feature,
                geometry_name: geomField,
                style: feature.id === selectedId ? SELECT_STYLE : DEFAULT_STYLE
            };
        });
    });
    return selected;
}

export function getVectorTabouFeatures(state) {
    const features = getCurrentTabouData(state);
    return keys(features).map(k => features[k]).flat();
}

export function getSelectedVectorTabouFeature(state) {
    const features = getVectorTabouFeatures(state);
    const selectedId = get(getSelection(state), "feature")?.id;
    return features.filter(f => selectedId && f.id === selectedId);
}
