import { set } from "@mapstore/utils/ImmutableUtils";

const initialState = {
    // default counter value
    value: 1,
};

// reducer
export default function tabou2 (state = initialState, action) {
    switch (action.type) {
        case "INCREASE_COUNTER":
            return set("value", action.value, state);
        default:
            return state;
    }
}
