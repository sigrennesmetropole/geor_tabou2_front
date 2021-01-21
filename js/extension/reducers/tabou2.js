import { set } from '@mapstore/utils/ImmutableUtils';
import {
    SET_MAIN_ACTIVE_TAB,
    SET_TABOU_FILTERS
} from '../actions/tabou2';

const initialState = {
    activeTab: 'search',
    filterObj: {}
}

export default function tabou2(state = initialState, action) {
    switch (action.type) {
        case SET_MAIN_ACTIVE_TAB:
            const { activeTab } = action;
            return set(`activeTab`, activeTab, state);

        case SET_TABOU_FILTERS:
            const { filterObj } = action;
            return set(`filterObj`, filterObj, state);
        default:
            return state;
    }
}