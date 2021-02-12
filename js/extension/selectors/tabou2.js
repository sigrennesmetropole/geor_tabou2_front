import { CONTROL_NAME } from '@ext/constants';
export function currentActiveTabSelector(state) {
    return state?.tabou2.activeTab;
};

export function isTabou2Activate(state) {
    return (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false;
};

export function currentTabouFilters(state) {
    return state?.tabou2.filterObj;
};

export function defaultInfoFormat(state) {
    return state?.tabou2.infoFormat;
};

export function getTabouResponse(state) {
    return state?.tabou2.response;
};

export function getTabouIndexSelectors(state) {
    return state?.tabou2.selectorsIndex;
};

export function getLayerFilterObj(state) {
    return state?.tabou2.layerFilterObj;
};