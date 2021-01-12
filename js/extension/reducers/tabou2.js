import { set } from '@mapstore/utils/ImmutableUtils';
import {
    SET_MAIN_ACTIVE_TAB
} from '../actions/tabou2';

const initialState = {
    activeTab: 'search'
}

export default function tabou2(state = initialState, action) {
    switch (action.type) {
        case SET_MAIN_ACTIVE_TAB:
            const { activeTab } = action;
            return set(`activeTab`, activeTab, state);
        default:
            return state;
    }
}