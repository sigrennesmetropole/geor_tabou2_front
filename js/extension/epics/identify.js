import * as Rx from 'rxjs';
import { get, find, reverse, keys } from 'lodash';
import { CONTROL_NAME } from '../constants';

import {
    queryableLayersSelector,
    queryableSelectedLayersSelector,
    selectedNodesSelector
} from '@mapstore/selectors/layers';

import { generalInfoFormatSelector } from '@mapstore/selectors/mapInfo';

import { updateUserPlugin } from '@mapstore/actions/context';

import {
    LOAD_FEATURE_INFO,
    FEATURE_INFO_CLICK,
    closeIdentify,
    changeMapInfoFormat
} from "@mapstore/actions/mapInfo";

import { TOGGLE_CONTROL } from '@mapstore/actions/controls';

import { isTabou2Activate, defaultInfoFormat, getTabouResponse, getPluginCfg } from '../selectors/tabou2';

import { loadTabouFeatureInfo, setDefaultInfoFormat } from '../actions/tabou2';
import FilterLayer from '@mapstore/plugins/FilterLayer';

/**
 * Catch GFI on map click event
 * @param {*} action$ 
 * @param {*} store 
 */
export function tabouGetInfoOnClick(action$, store) {
    return Rx.Observable.empty();
    return action$.ofType(FEATURE_INFO_CLICK).switchMap(({ point, filterNameList = [], overrideParams = {} }) => {
        // Reverse - To query layer in same order as in TOC
        let queryableLayers = reverse(queryableLayersSelector(store.getState()));
        const queryableSelectedLayers = queryableSelectedLayersSelector(store.getState());
        if (queryableSelectedLayers.length) {
            queryableLayers = queryableSelectedLayers;
        }
        const selectedLayers = selectedNodesSelector(store.getState());
        return Rx.Observable.empty()
    });
}


/**
 * Catch GFI response on identify load event and close identify if Tabou2 identify tabs is selected
 * @param {*} action$ 
 * @param {*} store 
 */
export function tabouLoadIdentifyContentOld(action$, store) {
    return action$.ofType(LOAD_FEATURE_INFO)
        .filter(action => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            if (action.layer && action.layer.id) {
                const cfg = getPluginCfg(store.getState());
                let resp = getTabouResponse(store.getState());
                resp[action.layer.id] = action;

                console.log(resp);
                resp = keys(resp).forEach(r => {
                    if(!resp[r].data?.features.length) {
                        delete resp[r];
                    }
                });
                console.log(resp);

                
                return Rx.Observable.of(loadTabouFeatureInfo(resp)).concat(
                   cfg.showIdentify ?  Rx.Observable.empty(): Rx.Observable.of(closeIdentify())
                );
            }
        })
}

/**
 * Catch GFI response on identify load event and close identify if Tabou2 identify tabs is selected
 * @param {*} action$ 
 * @param {*} store 
 */
export function tabouLoadIdentifyContent(action$, store) {
    return action$.ofType(LOAD_FEATURE_INFO)
        .filter(action => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            if (action.layer && action.layer.id) {
                const cfg = getPluginCfg(store.getState());
                let resp = getTabouResponse(store.getState());
                
                // delete response for this GFI layer response
                delete resp[action.layer.name];

                // just keep response with features
                if(action?.data?.features && action.data.features.length) {
                    resp[action.layer.name] = action;    
                }
                
                return Rx.Observable.of(loadTabouFeatureInfo(resp)).concat(
                   cfg.showIdentify ?  Rx.Observable.empty(): Rx.Observable.of(closeIdentify())
                );
            }
        })
}

/**
 * Allow to change GetFeatureInfo format on plugin open and restore it on close
 * Change to application/json
 * @param {*} action$ 
 * @param {*} store 
 */
export function tabouSetGFIFormat(action$, store) {
    return action$.ofType(TOGGLE_CONTROL).switchMap((action) => {
        if (action.control != CONTROL_NAME) return Rx.Observable.empty();
        if (store.getState().controls[CONTROL_NAME].enabled) {
            // to save default info format from config or default MS2 config
            const defaultMime = generalInfoFormatSelector(store.getState());
            // change format to application/json
            return Rx.Observable.of(setDefaultInfoFormat(defaultMime))
                .concat(Rx.Observable.of(changeMapInfoFormat('application/json')))
                .concat(Rx.Observable.of(updateUserPlugin("Identify", { active: false })));
        } else {
            // restore default info format
            const firstDefaultMime = defaultInfoFormat(store.getState());
            return Rx.Observable.of(changeMapInfoFormat(firstDefaultMime))
                .concat(Rx.Observable.of(updateUserPlugin("Identify", { active: true })));
        }
    });
}

/**
 * Purge info from Tabou identify panel.
 * @param {any} action$ 
 * @param {any} store 
 */
export function purgeTabou(action$, store) {
    return action$.ofType(FEATURE_INFO_CLICK).switchMap(() => {
        return Rx.Observable.of(loadTabouFeatureInfo({}));
    });
}


/**
 * Purge info from Tabou identify panel.
 * @param {any} action$ 
 * @param {any} store 
 */
export function setAccordions(action$, store) {
    return action$.ofType(SET_SELECTOR_INDEX).switchMap((action) => {
        let cfg = getPluginCfg(store.getState());
        let layerType = keys(cfg.layersCfg).map((lyr) => cfg.layersCfg[lyr].nom == action.layer);
        return Rx.Observable.empty();
    });
}
