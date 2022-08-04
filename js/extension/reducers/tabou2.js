import { set } from '@mapstore/utils/ImmutableUtils';
import { get, isNumber } from 'lodash';
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
    SET_TABOU_FICHE_INFOS
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
    typesActeur: []
};

export default function tabou2(state = initialState, action) {
    switch (action.type) {
    case SETUP:
        const { pluginCfg } = action;
        return set(`pluginCfg`, pluginCfg, state);
    case SET_MAIN_ACTIVE_TAB:
        const { activeTab } = action;
        return set(`activeTab`, activeTab, state);
    case SET_TABOU_FILTERS:
        const { filterObj } = action;
        return set(`filterObj`, filterObj, state);
    case SET_DEFAULT_INFO_FORMAT:
        const { infoFormat } = action;
        return set(`infoFormat`, infoFormat, state);
    case LOAD_TABOU_FEATURE_INFO:
        const { response } = action;
        return set('response', response, state);
    case CLEAN_TABOU_INFOS:
        return set('response', {}, state);
    case SET_SELECTOR_INDEX:
        const { selectorsIndex } = action;
        return set('index', selectorsIndex, state);
    case SET_TABOU_FILTEROBJ:
        const { layerFilterObj } = action;
        return set('layerFilterObj', layerFilterObj, state);
    case RESET_SEARCH_FILTERS:
        return set('layerFilterObj', {}, state);
    case RESET_CQL_FILTERS:
        return set('filterObj', {}, state);
    case UPDATE_LAYER_PARAMS:
        const { layerToFilter } = action;
        return set('layerToFilter', layerToFilter, state);
    case SELECT_FEATURE:
        const { selectedFeature } = action;
        return set('selectedFeature', selectedFeature, state);
    case SELECT_LAYER:
        const { selectedLayer } = action;
        return set('selectedLayer', selectedLayer, state);
    case LOAD_EVENTS:
        const { events } = action;
        return set('events', events, state);
    case LOAD_TIERS:
        const { tiers } = action;
        return set('tiers', tiers, state);
    case LOAD_FICHE_INFOS :
        const { ficheInfos } = action;
        return set('ficheInfos', ficheInfos, state);
    case DISPLAY_TABOU_MARKER:
        return set('point', action.point, state);
    case LOADING: {
        let newValue = action.value;
        if (action.mode === 'count') {
            const oldValue = get(state, `loadFlags.${action.name}`) ?? 0;
            newValue = isNumber(newValue)
                ? newValue // set with passed value if number
                : newValue
                    ? oldValue + 1 // increment if true
                    : Math.max(oldValue - 1, 0); // decrement if false
        }
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, newValue, state);
    }
    case SET_IDENTIFY_INFOS:
        return set('identifyInfos', action.infos, state);
    case DISPLAY_FEATURE:
        const { featureAdded } = action;
        return set('featureAdded', featureAdded, state);
    case SET_TABOU_ERROR:
        return set('errors', action, state);
    case SET_TIERS_FILTER:
        return set('tiersFilter', action, state);
    case UPDATE_TABOU_SELECTION:
    {
        const {infos} = action;
        return set("features[0]", infos, state);
    }
    case TABOU_CHANGE_FEATURES:
        return set('gfiData', action?.data, state);
    case CLEAN_TABOU_SELECTION:
        return set("features", [], state);
    case SET_TABOU_DOCUMENTS:
        return set("documents", action?.documents || {}, state);
    case SET_TABOU_VOCATIONS_INFOS:
        return set(action.key, action.data || {}, state);
    case SET_TABOU_FICHE_INFOS:
        return set(action.key, action.data || {}, state);
    default:
        return state;
    }
}
