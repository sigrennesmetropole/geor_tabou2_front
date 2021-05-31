import { CONTROL_NAME } from '@ext/constants';
import { keys, pickBy } from 'lodash';
import { userGroupSecuritySelector, userRoleSelector, userSelector, userParamsSelector } from '@mapstore/selectors/security';

export function currentActiveTabSelector(state) {
    return state?.tabou2.activeTab;
}

export function isTabou2Activate(state) {
    return (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false;
}

export function currentTabouFilters(state) {
    return state?.tabou2.filterObj;
}

export function defaultInfoFormat(state) {
    return state?.tabou2.infoFormat;
}

export function getTabouResponse(state) {
    return state?.tabou2.response;
}

export function getTabouResponseLayers(state) {
    return keys(state?.tabou2.response);
}

export function getTabouIndexSelectors(state) {
    return state?.tabou2.selectorsIndex;
}

export function getLayerFilterObj(state) {
    return state?.tabou2.layerFilterObj;
}

export function getPluginCfg(state) {
    return state?.tabou2.pluginCfg;
}

export function getSelection(state) {
    return state?.tabou2?.selectedFeature;
}
export function getLayer(state) {
    return state?.tabou2?.selectedLayer;
}

export function getSelectedCfgLayer(state) {
    return keys(pickBy(getPluginCfg(state).layersCfg, lyr => lyr.nom === getLayer(state)))[0];
}

export function getEvents(state) {
    return state?.tabou2?.events;
}

export function getFicheInfos(state) {
    return state?.tabou2?.ficheInfos;
}

export function getTiers(state) {
    return state?.tabou2?.tiers;
}

/**
 * Get security infos.
 * @param {any} state 
 * @returns 
 */
export function getAuthInfos(state) {
    const groups = userGroupSecuritySelector(state) ?? [];
    const groupNames = groups.map(({ groupName }) => `${groupName}`);
    return {
        isAdmin: groupNames.includes("MAPSTORE_ADMIN"),
        isReferent: true,
        isContrib: false,
        isConsult: false
    }
}

// loading of search
export function searchLoading(state) {
    return state?.tabou2?.loadFlags?.search;
}

// loading for identify info
export function identifyLoading(state) {
    return state?.tabou2?.loadFlags?.identify;
}