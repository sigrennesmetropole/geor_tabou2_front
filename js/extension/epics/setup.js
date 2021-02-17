import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import { isTabou2Activate } from '../selectors/tabou2';
import { PANEL_SIZE } from '../constants';

export const setTbarPosition = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(({ source }) => {
            return source !== 'tabou2';
        })
        .map(({ layout }) => {
            const size = isTabou2Activate(store.getState()) ? PANEL_SIZE : 0;
            const action = updateMapLayout({
                layout,
                right: size,
                boundingMapRect: {
                    ...(layout.boundingMapRect || {}),
                    right: size
                }
            });
            return { ...action, source: 'tabou2' }; // add an argument to avoid infinite loop.
        });
