import * as Rx from 'rxjs';
import { get, find, reverse } from 'lodash';
import { CONTROL_NAME } from '../constants';

import {
    queryableLayersSelector,
    queryableSelectedLayersSelector,
    selectedNodesSelector
} from '@mapstore/selectors/layers';

import {
    responsesSelector,
    generalInfoFormatSelector, itemIdSelector, overrideParamsSelector,
    isHighlightEnabledSelector,

    ERROR_FEATURE_INFO, GET_VECTOR_INFO,
    CLOSE_IDENTIFY, TOGGLE_HIGHLIGHT_FEATURE,
    EDIT_LAYER_FEATURES,
    UPDATE_FEATURE_INFO_CLICK_POINT,
    featureInfoClick, updateCenterToMarker,
    exceptionsFeatureInfo, loadFeatureInfo,
    noQueryableLayers, getVectorInfo,
    showMapinfoMarker, hideMapinfoMarker, setCurrentEditFeatureQuery, identifyOptionsSelector,
    SET_MAP_TRIGGER, CLEAR_WARNING
} from '@mapstore/selectors/mapInfo';

import { updateUserPlugin } from '@mapstore/actions/context';

import { getFeatureInfo } from '@mapstore/api/identify';

import { localizedLayerStylesEnvSelector } from '@mapstore/selectors/localizedLayerStyles';

import { buildIdentifyRequest, filterRequestParams } from '@mapstore/utils/MapInfoUtils';

import {
    LOAD_FEATURE_INFO,
    FEATURE_INFO_CLICK,
    closeIdentify,
    changeMapInfoFormat, PURGE_MAPINFO_RESULTS, purgeMapInfoResults, newMapInfoRequest, errorFeatureInfo
} from "@mapstore/actions/mapInfo";

import { TOGGLE_CONTROL } from '@mapstore/actions/controls';

import { isTabou2Activate, defaultInfoFormat, getTabouResponse } from '../selectors/tabou2';

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
export function tabouLoadIdentifyContent(action$, store) {
    return action$.ofType(LOAD_FEATURE_INFO)
        .filter(action => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            if (action.layer && action.layer.id) {
                const isIdentifyTabName = store.getState()?.tabou2.activeTab === 'identify';
                let resp = getTabouResponse(store.getState());
                resp[action.layer.id] = action;
                return Rx.Observable.of(loadTabouFeatureInfo(resp)).concat(Rx.Observable.of(closeIdentify()));
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


export function purgeTabou(action$, store) {
    return action$.ofType(FEATURE_INFO_CLICK).switchMap(() => {
        return Rx.Observable.of(loadTabouFeatureInfo({}));
    });
}