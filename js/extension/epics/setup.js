import Rx from 'rxjs';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import { updateAdditionalLayer, removeAdditionalLayer } from '@mapstore/actions/additionallayers';
import { hideMapinfoMarker, toggleMapInfoState } from '@mapstore/actions/mapInfo';
import { isTabou2Activate } from '../selectors/tabou2';
import { PANEL_SIZE, TABOU_VECTOR_ID, TABOU_OWNER } from '../constants';
import { SETUP, CLOSE_TABOU } from "../actions/tabou2";
import { get } from "lodash";
/**
 * Manage mapstore toolbar layout
 * @param {any} action$
 * @param {any} store
 * @returns
 */
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
/**
 * Create additional layers
 * TODO :
 *  - add geom
 *  - add layer style
 *  - remove geom
 *  - manage layers on close or open action
 * @param {*} action$
 * @param {*} store
 * @returns
 */
export const initMap = (action$, store) =>
    action$.ofType(SETUP).switchMap(() => {
        const mapInfoEnabled = get(store.getState(), "mapInfo.enabled");
        return Rx.Observable.defer(() => {
            // const config = getPluginCfg(store.getState());
            // let urbaLayersCfg = config.layersCfg;
            // const wfsOA = find(urbaLayersCfg, "layerOA").nom;
            // const wfsSA = find(urbaLayersCfg, "layerSA").nom;
            // const wfsPA = find(urbaLayersCfg, "layerPA").nom;
            // const wfsURL = `${config.geoserverURL}/wfs`;
            return Rx.Observable.from([
                updateAdditionalLayer(
                    TABOU_VECTOR_ID,
                    TABOU_OWNER,
                    "overlay",
                    {
                        id: TABOU_VECTOR_ID,
                        features: [],
                        type: "vector",
                        name: "tabouPolygonResult",
                        visibility: true
                    }
                // TODO : add layer to get feature info from WFS or WMS and display point or geometry instead of keep mapstore GFI request
                )
            // disable click info right panel
            ]).concat([...(mapInfoEnabled ? [toggleMapInfoState(), hideMapinfoMarker()] : [])]);
        });
    });

export const closeTabou = (action$, {getState = ()=>{}}) =>
    action$.ofType(CLOSE_TABOU).switchMap(() =>
        Rx.Observable.from(
            removeAdditionalLayer({id: TABOU_VECTOR_ID, owner: TABOU_OWNER}),
        ).concat([...(!get(getState(), "mapInfo.enabled") ? [toggleMapInfoState()] : [])]));
