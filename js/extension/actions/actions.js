export const INCREASE_COUNTER = "INCREASE_COUNTER";

/**
 * Set the style of highlight
 * @param {string} styleType the type of the style, one of selected/default
 * @param {object} value the style object ({color, fillColor, ...})
 */
export const setNewValue = (value) => ({
    type: INCREASE_COUNTER,
    value
});