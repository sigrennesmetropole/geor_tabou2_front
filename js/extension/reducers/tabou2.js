import {set} from '@mapstore/utils/ImmutableUtils';
import {get, isNumber} from 'lodash';
import {
    SETUP,
    SET_MAIN_ACTIVE_TAB,
    SET_TABOU_FILTERS,
    SET_DEFAULT_INFO_FORMAT,
    LOAD_TABOU_FEATURE_INFO,
    SET_SELECTOR_INDEX,
    SET_TABOU_FILTEROBJ,
    UPDATE_LAYER_PARAMS,
    RESET_SEARCH_FILTERS,
    RESET_CQL_FILTERS,
    SELECT_FEATURE,
    SELECT_LAYER,
    LOAD_EVENTS,
    LOAD_TIERS,
    LOADING,
    DISPLAY_FEATURE,
    LOAD_FICHE_INFOS,
    SET_IDENTIFY_INFOS,
    SET_TABOU_ERROR,
    SET_TIERS_FILTER,
    UPDATE_TABOU_SELECTION,
    CLEAN_TABOU_SELECTION,
    CLEAN_TABOU_INFOS,
    TABOU_CHANGE_FEATURES,
    SET_TABOU_DOCUMENTS,
    SET_TABOU_VOCATIONS_INFOS,
    DISPLAY_TABOU_MARKER,
    SET_TABOU_FICHE_INFOS,
    SET_TABOU_FILTERED_FEATURES,
    RESET_TABOU_FILTERED_FEATURES,
    SET_TYPES_PLH,
    SET_PLHS_PROGRAMME,
    SET_PLH_PROGRAMME,
    SET_PLH_IS_LOADING
} from '../actions/tabou2';

const initialState = {
    activeTab: "search",
    infoFormat: "text/plain",
    response: {},
    selectorsIndex: {},
    filterObj: {},
    layerFilterObj: {},
    layerToFilter: "",
    pluginCfg: {},
    selectedFeature: {},
    selectedLayer: "",
    events: [],
    tiers: [],
    ficheInfos: {},
    featureAdded: {},
    filteredFeatures: [],
    identifyInfos: {},
    errors: {},
    tiersFilter: "",
    selectionType: undefined,
    features: [{
        layerOA: [],
        layerPA: [],
        layerSA: []
    }],
    featureSelected: undefined,
    typesContribution: [],
    typesProgrammation: [],
    typesVocation: [],
    typesFonciers: [],
    typesAction: [],
    typesActeur: [],
    typesPLH: [],
    plhsProgramme: [],
    plhProgramme: {},
    plhIsLoading: false
};

function handleLoadingAction(state, action) {
    let newValue = action.value;
    if (action.mode === 'count') {
        const oldValue = get(state, `loadFlags.${action.name}`) ?? 0;
        if (!isNumber(newValue)) {
            if (newValue) {
                newValue = oldValue + 1;
            } else {
                newValue = Math.max(oldValue - 1, 0);
            }
        }
    }
    return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, newValue, state);
}

export default function tabou2(state = initialState, action) {
    switch (action.type) {
    case SETUP:
        return set(`pluginCfg`, action.pluginCfg, state);
    case SET_MAIN_ACTIVE_TAB:
        return set(`activeTab`, action.activeTab, state);
    case SET_TABOU_FILTERS:
        return set(`filterObj`, action.filterObj, state);
    case SET_DEFAULT_INFO_FORMAT:
        return set(`infoFormat`, action.infoFormat, state);
    case LOAD_TABOU_FEATURE_INFO:
        return set('response', action.response, state);
    case CLEAN_TABOU_INFOS:
        return set('response', {}, state);
    case SET_SELECTOR_INDEX:
        return set('index', action.selectorsIndex, state);
    case SET_TABOU_FILTEROBJ:
        return set('layerFilterObj', action.layerFilterObj, state);
    case SET_TABOU_FILTERED_FEATURES:
        return set('filteredFeatures', state.filteredFeatures.concat(action.newFilteredFeatures), state);
    case RESET_TABOU_FILTERED_FEATURES:
        return set('filteredFeatures', [], state);
    case RESET_SEARCH_FILTERS:
        return set('layerFilterObj', {}, state);
    case RESET_CQL_FILTERS:
        return set('filterObj', {}, state);
    case UPDATE_LAYER_PARAMS:
        return set('layerToFilter', action.layerToFilter, state);
    case SELECT_FEATURE:
        return set('selectedFeature', action.selectedFeature, state);
    case SELECT_LAYER:
        return set('selectedLayer', action.selectedLayer, state);
    case LOAD_EVENTS:
        return set('events', action.events, state);
    case LOAD_TIERS:
        return set('tiers', action.tiers, state);
    case LOAD_FICHE_INFOS:
        return set('ficheInfos', action.ficheInfos, state);
    case DISPLAY_TABOU_MARKER:
        return set('point', action.point, state);
    case SET_IDENTIFY_INFOS:
        return set('identifyInfos', action.infos, state);
    case DISPLAY_FEATURE:
        return set('featureAdded', action.featureAdded, state);
    case SET_TABOU_ERROR:
        return set('errors', action, state);
    case SET_TIERS_FILTER:
        return set('tiersFilter', action, state);
    case UPDATE_TABOU_SELECTION:
        return set("features[0]", action.infos, state);
    case TABOU_CHANGE_FEATURES:
        return set('gfiData', action?.data, state);
    case CLEAN_TABOU_SELECTION:
        return set("features", [], state);
    case SET_TABOU_DOCUMENTS:
        return set("documents", action?.documents || {}, state);
    case SET_TABOU_VOCATIONS_INFOS:
    case SET_TABOU_FICHE_INFOS:
        return set(action.key, action.data || {}, state);
    case SET_TYPES_PLH:
        return set("typesPLH", action?.typesPLH || [], state);
    case SET_PLHS_PROGRAMME:
        return set("plhsProgramme", action?.plhsProgramme || [], state);
    case SET_PLH_PROGRAMME:
        return set("plhProgramme", action?.typePLH || {}, state);
    case SET_PLH_IS_LOADING:
        return set("plhIsLoading", action?.isLoading, state);
    case LOADING:
        return handleLoadingAction(state, action);
    default:
        return state;
    }
}
