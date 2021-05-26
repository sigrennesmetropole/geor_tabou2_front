export const SETUP = "SETUP";
export const TEAR_DOWN = "TEAR_DOWN";
export const SET_MAIN_ACTIVE_TAB = "SET_MAIN_ACTIVE_TAB";
export const APPLY_SEARCH_QUERY = "APPLY_SEARCH_QUERY";
export const RESET_SEARCH_FILTERS = "RESET_SEARCH_FILTERS";
export const SET_TABOU_FILTERS = "SET_TABOU_FILTERS";
export const SET_DEFAULT_INFO_FORMAT = "SET_DEFAULT_INFO_FORMAT";
export const LOAD_TABOU_FEATURE_INFO = "LOAD_TABOU_FEATURE_INFO";
export const SET_SELECTOR_INDEX = "SET_SELECTOR_INDEX";
export const SET_TABOU_FILTEROBJ = "SET_TABOU_FILTEROBJ";
export const UPDATE_LAYER_PARAMS = "UPDATE_LAYER_PARAMS";
export const RESET_CQL_FILTERS = "RESET_CQL_FILTERS";
export const SELECT_FEATURE = "SELECT_FEATURE";
export const SELECT_LAYER = "SELECT_LAYER";
export const LOAD_EVENTS = "LOAD_EVENTS";
export const ADD_FEATURE_EVENT = "ADD_FEATURE_EVENT";
export const DELETE_FEATURE_EVENT = "DELETE_FEATURE_EVENT";
export const CHANGE_FEATURE_EVENT = "CHANGE_FEATURE_EVENT";
export const LOAD_TIERS = "LOAD_TIERS";
export const ADD_FEATURE_TIER = "ADD_FEATURE_TIER";
export const DELETE_FEATURE_TIER = "DELETE_FEATURE_TIER";
export const CHANGE_FEATURE_TIER = "CHANGE_FEATURE_TIER";
export const INACTIVATE_TIER = "INACTIVATE_TIER";
export const SET_TABOU_CONFIG = "SET_TABOU_CONFIG";
export const PRINT_PROGRAMME_INFOS = "PRINT_FICHE_PROGRAMME";
export const SEARCH_IDS = "SEARCH_IDS";
export const LOADING = "LOADING";
export const LOAD_FICHE_INFOS = "LOAD_FICHE_INFOS";
export const CHANGE_FEATURE = "CHANGE_FEATURE";
export const CREATE_FEATURE = "CREATE_FEATURE";

export const changeFeature = (params) => ({
    type: CHANGE_FEATURE,
    params
});

export const createFeature = (params) => ({
    type: CREATE_FEATURE,
    params
});

export const searchIds = (params) => ({
    type: SEARCH_IDS,
    params
});

export const setUp = (pluginCfg) => ({
    type: SETUP,
    pluginCfg
});
/**
 * Triggered when plugin is close
 */
export const tearDown = () => ({
    type: TEAR_DOWN
});

export const setMainActiveTab = (activeTab) => ({
    type: SET_MAIN_ACTIVE_TAB,
    activeTab
});

export const applySearchQuery = () => ({
    type: APPLY_SEARCH_QUERY
});

export const resetSearchFilters = () => ({
    type: RESET_SEARCH_FILTERS
});

export const resetCqlFilters = () => ({
    type: RESET_CQL_FILTERS
});

export const setTabouFilters = (filterObj) => ({
    type: SET_TABOU_FILTERS,
    filterObj
});

export const setDefaultInfoFormat = (infoFormat) => ({
    type: SET_DEFAULT_INFO_FORMAT,
    infoFormat
});


export const loadTabouFeatureInfo = (response) => {
    return ({
    type: LOAD_TABOU_FEATURE_INFO,
    response
})};

export const setSelectorIndex = (selectorsIndex) => ({
    type: SET_SELECTOR_INDEX,
    selectorsIndex
});

export const setTabouFilterObj = (layerFilterObj) => ({
    type: SET_TABOU_FILTEROBJ,
    layerFilterObj
});

export const applyFilterObj = (layerToFilter) => ({
    type: UPDATE_LAYER_PARAMS,
    layerToFilter
});

export const setSelectedFeature = (selectedFeature) => ({
    type: SELECT_FEATURE,
    selectedFeature
});

export const setSelectedLayer = (selectedLayer) => ({
    type: SELECT_LAYER,
    selectedLayer
});

export const loadEvents = (events) => ({
    type: LOAD_EVENTS,
    events
});

export const addFeatureEvent = (event) => ({
    type: ADD_FEATURE_EVENT,
    event
});

export const deleteFeatureEvent = (event) => ({
    type: DELETE_FEATURE_EVENT,
    event
});

export const changeFeatureEvent = (event) => ({
    type: CHANGE_FEATURE_EVENT,
    event
});

export const loadTiers = (tiers) => ({
    type: LOAD_TIERS,
    tiers
});

export const addFeatureTier = (tier) => ({
    type: ADD_FEATURE_TIER,
    tier
});

export const deleteFeatureTier = (tier) => ({
    type: DELETE_FEATURE_TIER,
    tier
});

export const changeFeatureTier = (tier) => ({
    type: CHANGE_FEATURE_TIER,
    tier
});

export const inactivateTier = (tier) => ({
    type: INACTIVATE_TIER,
    tier
});

export const setTabouConfig = (config) => ({
    type: SET_TABOU_CONFIG,
    config
});

export const printProgInfos = (id) => ({
    type: PRINT_PROGRAMME_INFOS,
    id
});

export const loadFicheInfos = (ficheInfos) => ({
    type: LOAD_FICHE_INFOS,
    ficheInfos
});

export const loading = (value, name, mode) => ({
    type: LOADING,
    value,
    name,
    mode
});