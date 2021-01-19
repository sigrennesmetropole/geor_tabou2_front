export const CLOSE_TABOU2 = 'TABOU2:CLOSE_TABOU2';
export const SETUP = "TABOU2:SETUP";
export const TEAR_DOWN = "TABOU2:TEAR_DOWN";
export const SET_MAIN_ACTIVE_TAB = "TABOU2:SET_MAIN_ACTIVE_TAB";
export const APPLY_SEARCH_QUERY = "TABOU2:APPLY_SEARCH_QUERY";
export const RESET_SEARCH_FILTERS = "TABOU2:RESET_SEARCH_FILTERS";

export const closeTabou2 = () => {
    return {
        type: CLOSE_TABOU2
    };
};

/**
 * Triggered on plugin activation
 */
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

export const updateAllTabouLayers = (layer) => ({
    type: UPDATE_TABOU_LAYER,
    layer
});