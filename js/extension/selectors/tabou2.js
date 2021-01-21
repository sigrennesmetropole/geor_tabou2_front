export function currentActiveTabSelector(state) {
    return state?.tabou2.activeTab;
};

export function currentTabouFilters(state) {
    console.log(state);
    return state?.tabou2.filterObj;
};