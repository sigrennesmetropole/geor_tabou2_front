import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import { SET_CONTROL_PROPERTIES, setControlProperty } from '@mapstore/actions/controls';
import {
    CONTROL_NAME, PANEL_SIZE
} from '../constants';

/**
 * utility function to check if the tabou panel is open
 */
function isTabou2Open(store) {
    const state = store.getState();
    return state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled || false;
}

/**
* update tools toolbar position on open
 */
export const tabou2Open = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(() => isTabou2Open(store))
        .filter(({source}) => {
            return source !== 'tabou2';
        })
        .map(({layout}) => {
            const action = updateMapLayout({
                layout,
                right: PANEL_SIZE,
                boundingMapRect: {
                    ...(layout.boundingMapRect || {}),
                    right: PANEL_SIZE
                }
            });
            return { ...action, source: 'tabou2' }; // add an argument to avoid infinite loop.
        });

/**
* update tools toolbar position on close
 */
export const tabou2Close = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(() => !isTabou2Open(store))
        .filter(({source}) => {
            return source !== 'tabou2';
        })
        .map(({layout}) => {
            const action = updateMapLayout({
                layout,
                right: 0,
                boundingMapRect: {
                    ...(layout.boundingMapRect || {}),
                    right: 0
                }
            });
            return { ...action, source: 'tabou2' }; // add an argument to avoid infinite loop.
        });
