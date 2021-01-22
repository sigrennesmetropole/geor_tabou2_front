import * as Rx from 'rxjs';
import { get, find, reverse } from 'lodash';
import { CONTROL_NAME } from '../constants';
import uuid from 'uuid';

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
    featureInfoClick, updateCenterToMarker, purgeMapInfoResults,
    exceptionsFeatureInfo, loadFeatureInfo, errorFeatureInfo,
    noQueryableLayers, newMapInfoRequest, getVectorInfo,
    showMapinfoMarker, hideMapinfoMarker, setCurrentEditFeatureQuery,
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
    changeMapInfoFormat, PURGE_MAPINFO_RESULTS
} from "@mapstore/actions/mapInfo";

import { TOGGLE_CONTROL } from '@mapstore/actions/controls';

import { isTabou2Activate, defaultInfoFormat } from '../selectors/tabou2';

import { loadTabouFeatureInfo, setDefaultInfoFormat } from '../actions/tabou2';

/**
 * Catch GFI on map click event
 * @param {*} action$ 
 * @param {*} store 
 */
export function tabouGetInfoOnClick(action$, store) {
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
        .switchMap(({
            data = []
        }) => {
            console.log(data);
            console.log(store.getState());
            const isIdentifyTabName = store.getState()?.tabou2.activeTab === 'identify';
            return Rx.Observable.of(loadTabouFeatureInfo(data))
                .concat(isIdentifyTabName ? Rx.Observable.of(closeIdentify()) : Rx.Observable.empty());
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
            return Rx.Observable.of(closeIdentify())
                .concat(Rx.Observable.of(setDefaultInfoFormat(defaultMime)))
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


export function testPurge(action$, store) {
    return action$.ofType(PURGE_MAPINFO_RESULTS).switchMap((action) => {
        console.log(action);
        return Rx.Observable.empty();
    });
}


export const tabouGfiClick = (action$, { getState = () => { } }) =>
    action$.ofType(FEATURE_INFO_CLICK)
        .switchMap(({ point, filterNameList = [], overrideParams = {} }) => {
            console.log('TABOU -- FEATURE INFO CLICK IDENTIFY');
            closeIdentify();
            // Reverse - To query layer in same order as in TOC
            let queryableLayers = reverse(queryableLayersSelector(getState()));
            const queryableSelectedLayers = queryableSelectedLayersSelector(getState());
            if (queryableSelectedLayers.length) {
                queryableLayers = queryableSelectedLayers;
            }

            const selectedLayers = selectedNodesSelector(getState());

            if (queryableLayers.length === 0 || queryableSelectedLayers.length === 0 && selectedLayers.length !== 0) {
                return Rx.Observable.of(purgeMapInfoResults(), noQueryableLayers());
            }

            // TODO: make it in the application getState()
            const excludeParams = ["SLD_BODY"];
            const includeOptions = [
                "buffer",
                "cql_filter",
                "filter",
                "propertyName"
            ];
            const out$ = Rx.Observable.from((queryableLayers.filter(l => {
                // filtering a subset of layers
                return filterNameList.length ? (filterNameList.filter(name => name.indexOf(l.name) !== -1).length > 0) : true;
            })))
                .mergeMap(layer => {
                    let env = localizedLayerStylesEnvSelector(getState());
                    let { url, request, metadata } = buildIdentifyRequest(layer, { ...identifyOptionsSelector(getState()), env });
                    // request override
                    if (itemIdSelector(getState()) && overrideParamsSelector(getState())) {
                        request = { ...request, ...overrideParamsSelector(getState())[layer.name] };
                    }
                    if (overrideParams[layer.name]) {
                        request = { ...request, ...overrideParams[layer.name] };
                    }
                    if (url) {
                        const basePath = url;
                        const requestParams = request;
                        const lMetaData = metadata;
                        const appParams = filterRequestParams(layer, includeOptions, excludeParams);
                        const attachJSON = isHighlightEnabledSelector(getState());
                        const itemId = itemIdSelector(getState());
                        const reqId = uuid.v1();
                        const param = { ...appParams, ...requestParams };
                        return getFeatureInfo(basePath, param, layer, { attachJSON, itemId })
                            .map((response) => {
                                console.log('TABOU2 RESPONSE');
                                console.log(response);
                                response.data.exceptions
                                    ? exceptionsFeatureInfo(reqId, response.data.exceptions, requestParams, lMetaData)
                                    : loadFeatureInfo(reqId, response.data, requestParams, { ...lMetaData, features: response.features, featuresCrs: response.featuresCrs }, layer)
                            }
                            )
                            .catch((e) => Rx.Observable.of(errorFeatureInfo(reqId, e.data || e.statusText || e.status, requestParams, lMetaData)))
                            .startWith(newMapInfoRequest(reqId, param));
                    }
                    return Rx.Observable.of(getVectorInfo(layer, request, metadata, queryableLayers));
                });
            // NOTE: multiSelection is inside the event
            // TODO: move this flag in the application state
            if (point && point.modifiers && point.modifiers.ctrl === true && point.multiSelection) {
                return out$;
            }
            return out$.startWith(purgeMapInfoResults());
        });