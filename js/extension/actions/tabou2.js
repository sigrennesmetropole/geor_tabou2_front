export const SETUP = "TABOU2:SETUP";
export const TEAR_DOWN = "TABOU2:TEAR_DOWN";
export const SET_MAIN_ACTIVE_TAB = "TABOU2:SET_MAIN_ACTIVE_TAB";
export const APPLY_SEARCH_QUERY = "TABOU2:APPLY_SEARCH_QUERY";
export const RESET_SEARCH_FILTERS = "TABOU2:RESET_SEARCH_FILTERS";
export const SET_TABOU_FILTERS = "TABOU2:SET_TABOU_FILTERS";
export const SET_DEFAULT_INFO_FORMAT = "TABOU2:SET_DEFAULT_INFO_FORMAT";
export const LOAD_TABOU_FEATURE_INFO = "TABOU2:LOAD_TABOU_FEATURE_INFO";
export const SET_SELECTOR_INDEX = "TABOU2:SET_SELECTOR_INDEX";
export const SET_TABOU_FILTEROBJ = "TABOU2:SET_TABOU_FILTEROBJ";
export const UPDATE_LAYER_PARAMS = "TABOU2:UPDATE_LAYER_PARAMS";
export const RESET_CQL_FILTERS = "TABOU2:RESET_CQL_FILTERS";


export const setUp = () => ({
    type: SETUP
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

export const updateAllTabouLayers = (layer) => ({
    type: UPDATE_TABOU_LAYER,
    layer
});

export const setTabouFilters = (filterObj) => ({
    type: SET_TABOU_FILTERS,
    filterObj
});

export const setDefaultInfoFormat = (infoFormat) => ({
    type: SET_DEFAULT_INFO_FORMAT,
    infoFormat
});


export const loadTabouFeatureInfo = (response) => ({
    type: LOAD_TABOU_FEATURE_INFO,
    response
});

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