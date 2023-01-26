import Rx from 'rxjs';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import { updateAdditionalLayer, removeAdditionalLayer } from '@mapstore/actions/additionallayers';
import { hideMapinfoMarker, purgeMapInfoResults, toggleMapInfoState } from '@mapstore/actions/mapInfo';
import { isTabou2Activate } from '../selectors/tabou2';
import { PANEL_SIZE, TABOU_VECTOR_ID, TABOU_OWNER, TABOU_MARKER_LAYER_ID } from '../constants';
import { SETUP, CLOSE_TABOU, cleanTabouInfos } from "../actions/tabou2";
import { get } from "lodash";
import { defaultIconStyle } from "@mapstore/utils/SearchUtils";
import iconUrl from "@mapstore/components/map/openlayers/img/marker-icon.png";

export const CONTROL_NAME = 'tabou2';

import {
    registerEventListener,
    unRegisterEventListener,
} from "@mapstore/actions/map";

const OFFSET = PANEL_SIZE;
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
                ...layout,
                right: OFFSET + (layout?.boundingSidebarRect?.right ?? 0),
                boundingMapRect: {
                    ...(layout.boundingMapRect || {}),
                    right: OFFSET + (layout?.boundingSidebarRect?.right ?? 0)
                },
                rightPanel: true
            });
            return { ...action, source: 'tabou2' }; // add an argument to avoid infinite loop.
        });
/**
 * Create additional layers
 * @param {*} action$
 * @param {*} store
 * @returns
 */
export const initMap = (action$, store) =>
    action$.ofType(SETUP).switchMap(() => {
        const mapInfoEnabled = get(store.getState(), "mapInfo.enabled");
        return Rx.Observable.defer(() => {
            // replace red marker icon by default ol blue marker
            let defaultStyle = {...defaultIconStyle, iconUrl: iconUrl};
            return Rx.Observable.from([
                purgeMapInfoResults(),
                hideMapinfoMarker(),
                registerEventListener("click", CONTROL_NAME),
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
                ),
                updateAdditionalLayer(
                    TABOU_MARKER_LAYER_ID,
                    TABOU_OWNER,
                    "overlay",
                    {
                        id: TABOU_MARKER_LAYER_ID,
                        features: [],
                        type: "vector",
                        name: "tabouClicPointMarker",
                        visibility: true,
                        style: defaultStyle
                    }
                )
            // disable click info right panel
            ]).concat([...(mapInfoEnabled ? [toggleMapInfoState()] : [])]);
        }).startWith({
            type: 'MAP_LAYOUT:UPDATE_DOCK_PANELS',
            name: 'tabou2',
            action: 'add',
            location: 'right'
        });
    });

export const closeTabouExt = (action$, {getState = ()=>{}}) =>
    action$.ofType(CLOSE_TABOU).switchMap(() => {
        const mapInfoEnabled = get(getState(), "mapInfo.enabled");
        return Rx.Observable.from([
            cleanTabouInfos(),
            purgeMapInfoResults(),
            hideMapinfoMarker(),
            unRegisterEventListener("click", CONTROL_NAME),
            removeAdditionalLayer({id: TABOU_VECTOR_ID, owner: TABOU_OWNER})
        // enable click info right panel if needed
        ]).concat([...(!mapInfoEnabled ? [toggleMapInfoState()] : [])]);
    });
