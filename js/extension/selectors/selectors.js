const CONTROL_NAME = "tabou2";

export function enable(state) {
    return state.controls?.[CONTROL_NAME]?.enabled || state[CONTROL_NAME]?.closing || false;
}
