import { set } from '@mapstore/utils/ImmutableUtils';
import {
    SET_MAIN_ACTIVE_TAB,
    SET_TABOU_FILTERS,
    SET_DEFAULT_INFO_FORMAT,
    LOAD_TABOU_FEATURE_INFO,
    SET_SELECTOR_INDEX,
    SET_TABOU_FILTEROBJ,
    UPDATE_LAYER_PARAMS,
    RESET_SEARCH_FILTERS
} from '../actions/tabou2';

const initialState = {
    activeTab: 'search',
    filterObj: {'tabou2:v_oa_programme':{},'tabou2:oa_secteur':{}, 'tabou2:za_sae':{}, 'tabou2:zac': {}},
    infoFormat: 'text/plain',
    response: {},
    selectorsIndex: {},
    layerFilterObj: {},
    layerToFilter: ''

}

export default function tabou2(state = initialState, action) {
    switch (action.type) {
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
            return set('response', response, state)
        case SET_SELECTOR_INDEX:
            const { selectorsIndex } = action;
            return set('index', selectorsIndex, state)
        case SET_TABOU_FILTEROBJ:
            return set('layerFilterObj', layerFilterObj, state)
        case RESET_SEARCH_FILTERS:
            return set('layerFilterObj', {}, state)
        case UPDATE_LAYER_PARAMS:
            const { layerToFilter } = action;
            return set('layerToFilter', layerToFilter, state)
        default:
            return state;
    }
}