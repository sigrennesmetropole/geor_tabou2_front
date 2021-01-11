export const CLOSE_TABOU2 = 'TABOU2:CLOSE_TABOU2';
export const SETUP = "TABOU2:SETUP";
export const TEAR_DOWN = "TABOU2:TEAR_DOWN";

export const closeTabou2 = () => {
    return {
        type: CLOSE_TABOU2
    };
};

/**
 * Triggered on plugin activation
 */
export const setUp = () => ({
    type: SETUP
});

/**
 * Triggered when plugin is close
 */
export const tearDown = () => ({
    type: TEAR_DOWN
});