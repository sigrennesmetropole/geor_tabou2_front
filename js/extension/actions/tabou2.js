export const SETUP = "SETUP";
export const CLOSE_TABOU = "CLOSE_TABOU";
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
export const ASSOCIATE_TIER = "ASSOCIATE_TIER";
export const DELETE_FEATURE_TIER = "DELETE_FEATURE_TIER";
export const CHANGE_FEATURE_TIER = "CHANGE_FEATURE_TIER";
export const INACTIVATE_TIER = "INACTIVATE_TIER";
export const SET_TABOU_CONFIG = "SET_TABOU_CONFIG";
export const PRINT_PDF_INFOS = "PRINT_PDF_PROGRAMME";
export const SEARCH_IDS = "SEARCH_IDS";
export const LOADING = "LOADING";
export const LOAD_FICHE_INFOS = "LOAD_FICHE_INFOS";
export const CHANGE_FEATURE = "CHANGE_FEATURE";
export const CREATE_FEATURE = "CREATE_FEATURE";
export const MAP_TIERS = "MAP_TIERS";
export const RELOAD_LAYER = "RELOAD_LAYER";
export const DISPLAY_FEATURE = "DISPLAY_FEATURE";
export const SET_GFI_REQUEST = "SET_GFI_REQUEST";
export const SET_IDENTIFY_INFOS = "SET_IDENTIFY_INFOS";
export const SET_TABOU_ERROR = "SET_ERROR";
export const GET_EVENTS = "GET_EVENTS";
export const DISPLAY_MSG = "DISPLAY_MSG";
export const DISPLAY_PA_SA_BY_OA = "DISPLAY_PA_BY_OA";
export const SET_TIERS_FILTER = "SET_TIERS_FILTER";
export const UPDATE_TABOU_SELECTION = "UPDATE_FEATURES_SELECTION";
export const SET_TABOU_SELECT_FEATURE = "SET_SELECT_FEATURE";
export const UNSET_TABOU_SELECT_FEATUREE = "UNSET_SELECT_FEATURE";
export const TOGGLE_TABOU_SELECTION = "TOGGLE_TABOU_SELECTION";
export const CLEAN_TABOU_SELECTION = "CLEAN_TABOU_SELECTION";
export const TABOU_CHANGE_FEATURES = "TABOU_CHANGE_FEATURES";
export const UPDATE_TABOU_STYLE = "UPDATE_TABOU_STYLE";
export const CLEAN_TABOU_INFOS = "CLEAN_TABOU_INFOS";
export const DISPLAY_TABOU_MARKER = "DISPLAY_TABOU_MARKER";
export const GET_TABOU_DOCUMENTS = "GET_TABOU_DOCUMENTS";
export const SET_TABOU_DOCUMENTS = "SET_TABOU_DOCUMENTS";
export const TABOU_DOWNLOAD_DOC = "TABOU_DOWNLOAD_DOC";
export const DELETE_TABOU_DOCUMENTS = "DELETE_TABOU_DOCUMENTS";
export const ADD_TABOU_DOC = "ADD_TABOU_DOC";
export const MODIFY_TABOU_DOC = "MODIFY_TABOU_DOC";
export const UPDATE_OPERATION = "UPDATE_OPERATION";
export const GET_TABOU_VOCATIONS_INFOS = "GET_TABOU_VOCATIONS_INFOS";
export const SET_TABOU_VOCATIONS_INFOS = "SET_TABOU_VOCATIONS_INFOS";
export const SET_TABOU_FICHE_INFOS = "SET_TABOU_FICHE_INFOS";


export const setTabouFicheInfos = (key, data) => ({
    type: SET_TABOU_FICHE_INFOS,
    key,
    data
});

export const setTabouVocationsInfos = (key, data) => ({
    type: SET_TABOU_VOCATIONS_INFOS,
    key,
    data
});

export const getTabouVocationsInfos = (id) => ({
    type: GET_TABOU_VOCATIONS_INFOS,
    id
});

export const closeTabou = (pluginsCfg) => ({
    type: CLOSE_TABOU,
    pluginsCfg
});

export const displayMsg = (level, title, message) => ({
    type: DISPLAY_MSG,
    level,
    title,
    message
});


export const reloadLayer = (layer) => ({
    type: RELOAD_LAYER,
    layer
});

export const mapTiers = (params) => ({
    type: MAP_TIERS,
    params
});

export const getApiEvents = (params) => ({
    type: GET_EVENTS,
    params
});

export const changeFeature = (params) => ({
    type: CHANGE_FEATURE,
    params
});

export const createFeature = (params, layer) => ({
    type: CREATE_FEATURE,
    params,
    layer
});

export const searchIds = (params) => ({
    type: SEARCH_IDS,
    params
});

export const setUp = (pluginCfg) => ({
    type: SETUP,
    pluginCfg
});

export const setMainActiveTab = (activeTab, params = {}) => ({
    type: SET_MAIN_ACTIVE_TAB,
    activeTab,
    params
});

export const applySearchQuery = () => ({
    type: APPLY_SEARCH_QUERY
});

export const resetSearchFilters = (layers) => ({
    type: RESET_SEARCH_FILTERS,
    layers
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
    });
};

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

export const associateTier = (tier) => ({
    type: ASSOCIATE_TIER,
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

export const printPDFInfos = (id, layer) => ({
    type: PRINT_PDF_INFOS,
    id,
    layer
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

export const displayFeature = infos => ({
    type: DISPLAY_FEATURE,
    infos
});

export const setIdentifyInfos = infos => ({
    type: SET_IDENTIFY_INFOS,
    infos
});

export const setTabouErrors = (value, name, typeMsg = "", msg = "") => ({
    type: SET_TABOU_ERROR,
    value,
    name,
    typeMsg,
    msg
});

export const displayPASAByOA = (id) => ({
    type: DISPLAY_PA_SA_BY_OA,
    id: id
});

export const setTiersFilter = (id, filter) => ({
    type: SET_TIERS_FILTER,
    id,
    filter
});

export const toggleTabouSelectionTool = (selectionType) => ({
    type: TOGGLE_TABOU_SELECTION,
    selectionType
});

export const updateVectorTabouFeatures = (infos) => ({
    type: UPDATE_TABOU_SELECTION,
    infos
});

export const updateVectorTabouStyle = () => ({
    type: UPDATE_TABOU_STYLE
});

export const setTabouSelectedFeature = (feature) => ({
    type: SET_TABOU_SELECT_FEATURE,
    feature
});

export const unsetTabouSelectedFeature = () => ({
    type: UNSET_TABOU_SELECT_FEATUREE
});

export const cleanTabouSelection = () => ({
    type: CLEAN_TABOU_SELECTION
});

export const tabouChangeFeatures = (data) => ({
    type: TABOU_CHANGE_FEATURES,
    data
});

export const cleanTabouInfos = () => ({
    type: CLEAN_TABOU_INFOS
});

export const displayTabouMarker = (point) => ({
    type: DISPLAY_TABOU_MARKER,
    point
});

export const getDocuments = (load = true, page = 0, filters = {}) => ({
    type: GET_TABOU_DOCUMENTS,
    load,
    page,
    typeMime: filters?.typeMime,
    libelleTypeDocument: filters?.libelleTypeDocument,
    nom: filters?.nom
});

export const setDocuments = (documents) => ({
    type: SET_TABOU_DOCUMENTS,
    documents
});

export const downloadDocument = (idDoc) => ({
    type: TABOU_DOWNLOAD_DOC,
    idDoc
});

export const deleteDocument = (idDoc) => ({
    type: DELETE_TABOU_DOCUMENTS,
    idDoc
});

export const addTabouDocument = (file, metadata) => ({
    type: ADD_TABOU_DOC,
    file,
    metadata
});

export const modifyDocument = (file, metadata) => ({
    type: MODIFY_TABOU_DOC,
    file,
    metadata
});

export const updateOperation = (operation) => ({
    type: UPDATE_OPERATION,
    operation
});
