import { set } from "@mapstore/utils/ImmutableUtils";

const initialState = {
    // default counter value
    value: 1
};

// reducer
export default function tabou2(state = initialState, action) {
    if (action.type === "INCREASE_COUNTER") {
        return set("value", action.value, state);
    }
    return state;
}
