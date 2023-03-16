const CONTROL_NAME = "tabou2";

export function enable(state) {
    return (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false;
}
