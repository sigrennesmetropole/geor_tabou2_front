import { CONTROL_NAME } from '@ext/constants';
import { keys } from 'lodash';
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

export function getEvents(state) {
    return state?.tabou2?.events;
}