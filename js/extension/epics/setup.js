import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import { isTabou2Activate } from '../selectors/tabou2';
import { PANEL_SIZE } from '../constants';

export const setTbarPosition = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(() => isTabou2Activate(store.getState()))
        .filter(({ source }) => {
            return source !== 'tabou2';
        })
        .map(({ layout }) => {
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
