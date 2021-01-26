import { set } from '@mapstore/utils/ImmutableUtils';
import {
    SET_MAIN_ACTIVE_TAB,
    SET_TABOU_FILTERS,
    SET_DEFAULT_INFO_FORMAT,
    LOAD_TABOU_FEATURE_INFO,
    SET_SELECTOR_INDEX,
    PURGE_INFOS
} from '../actions/tabou2';

const initialState = {
    activeTab: 'search',
    filterObj: {},
    infoFormat: 'text/plain',
    response: {},
    selectorsIndex: {}
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
        default:
            return state;
    }
}