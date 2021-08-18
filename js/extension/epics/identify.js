import * as Rx from 'rxjs';
import { CONTROL_NAME, URL_ADD } from '../constants';

import { get, pickBy, find, isEmpty, has } from 'lodash';

import { generalInfoFormatSelector, identifyOptionsSelector, clickPointSelector } from '@mapstore/selectors/mapInfo';
import uuid from 'uuid';
import { localizedLayerStylesEnvSelector } from "@mapstore/selectors/localizedLayerStyles";
import { updateUserPlugin } from '@mapstore/actions/context';
import { buildIdentifyRequest } from '@mapstore/utils/MapInfoUtils';
import { layersSelector } from '@mapstore/selectors/layers';
import { error, success } from "@mapstore/actions/notifications";
import {getMessageById} from "@mapstore/utils/LocaleUtils";
import {
    LOAD_FEATURE_INFO,
    FEATURE_INFO_CLICK,
    closeIdentify,
    changeMapInfoFormat,
    loadFeatureInfo,
    updateFeatureInfoClickPoint
} from "@mapstore/actions/mapInfo";
import { TOGGLE_CONTROL } from '@mapstore/actions/controls';
import { isTabou2Activate, defaultInfoFormat, getTabouResponse, getPluginCfg, getSelection } from '@ext/selectors/tabou2';
import { loadTabouFeatureInfo, setDefaultInfoFormat, setMainActiveTab, PRINT_PROGRAMME_INFOS,
    CHANGE_FEATURE, DISPLAY_FEATURE, reloadLayer, displayFeature } from '@ext/actions/tabou2';
import { getPDFProgramme, putRequestApi } from '@ext/api/search';

import { getFeatureInfo } from "@mapstore/api/identify";

/**
 * Catch GFI response on identify load event and close identify if Tabou2 identify tabs is selected
 * TODO: take showIdentify pluginCfg param into account
 * @param {*} action$
 * @param {*} store
 */
export function tabouLoadIdentifyContent(action$, store) {
    return action$.ofType(LOAD_FEATURE_INFO)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            if (action?.layer?.id && action?.data?.features && action.data.features.length) {
                let resp = getTabouResponse(store.getState());
                let cfg = getPluginCfg(store.getState()).layersCfg;
                // delete response for this GFI layer response
                delete resp[action.layer.name];

                // just keep tabou feature response with features
                if (action?.data?.features && action.data.features.length) {
                    resp[action.layer.name] = action;
                    // only return response for OA, PA, SA
                    resp = pickBy(resp, (v, k) =>
                        find(cfg, ["nom", k])
                    );
                } else {
                    resp = {};
                }

                return Rx.Observable.of(setMainActiveTab("identify")).concat(
                    Rx.Observable.of(loadTabouFeatureInfo(resp)).concat(
                        Rx.Observable.of(closeIdentify())
                    )
                );
            }
            return  Rx.Observable.of(closeIdentify());
        });
}

/**
 * Allow to change GetFeatureInfo format on plugin open and restore it on close
 * Change to application/json
 * @param {*} action$
 * @param {*} store
 */
export function tabouSetGFIFormat(action$, store) {
    return action$.ofType(TOGGLE_CONTROL)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            if (action.control !== CONTROL_NAME) return Rx.Observable.empty();
            if (store.getState().controls[CONTROL_NAME].enabled) {
            // to save default info format from config or default MS2 config
                const defaultMime = generalInfoFormatSelector(store.getState());
                // change format to application/json
                return Rx.Observable.of(setDefaultInfoFormat(defaultMime))
                    .concat(Rx.Observable.of(changeMapInfoFormat('application/json')))
                    .concat(Rx.Observable.of(updateUserPlugin("Identify", { active: false })));
            }
            // restore default info format
            const firstDefaultMime = defaultInfoFormat(store.getState());
            return Rx.Observable.of(changeMapInfoFormat(firstDefaultMime))
                .concat(Rx.Observable.of(updateUserPlugin("Identify", { active: true })));

        });
}

/**
 * Purge info from Tabou identify panel.
 * @param {any} action$
 * @param {any} store
 */
export function purgeTabou(action$, store) {
    return action$.ofType(FEATURE_INFO_CLICK)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(() => {
            if (document.getElementById('cancelAddForm')) [0]?.click();
            return Rx.Observable.of(loadTabouFeatureInfo({}));
        });
}

/**
 * Get fiche-suivi from tabou2 API as document
 * @param {*} action$
 * @param {*} store
 * @returns
 */
export function printProgramme(action$, store) {
    return action$.ofType(PRINT_PROGRAMME_INFOS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let messages = store.getState()?.locale.messages;
            let feature = getSelection(store.getState())?.feature.properties;
            return Rx.Observable.defer(() => getPDFProgramme(action.id))
                .catch(e => {
                    console.log("Error on get PDF request");
                    console.log(e);
                    // fail message
                    return Rx.Observable.of({...e, data: null});
                })
                .switchMap( response => {
                    if (response?.status === 200 && response?.data) {
                        const blob = new Blob([response.data], { type: response.data.type || 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        let name = `FicheSuivi-${action.id}_${feature.code}_${feature.nomopa.split(" ")
                            .map(e => e[0].toUpperCase() + e.slice(1)).join('')}`;
                        link.setAttribute('download', name);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                        return Rx.Observable.of(
                            success({
                                title: getMessageById(messages, "tabou2.infos.successApi"),
                                message: getMessageById(messages, "tabou2.infos.successPrint")
                            })
                        );
                    }
                    return Rx.Observable.of(
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.infos.failPrint")
                        })
                    );
                });
        });
}

/**
 * Epic to create PA, OA, SA Feature. This action will create new Tabou feature from selected geom.
 * @param {any} action$
 * @param {any} store
 * @returns empty
 */
export function createChangeFeature(action$, store) {
    return action$.ofType(CHANGE_FEATURE)
        .switchMap( action => {
            let messages = store.getState()?.locale.messages;
            let layersToc = find(getPluginCfg(store.getState()).layersCfg, (o, i) => i === action.params.layer);
            return Rx.Observable.defer( () => putRequestApi(`${get(URL_ADD, action.params.layer)}`, getPluginCfg(store.getState()).apiCfg, action.params.feature))
                .catch(e => {
                    console.log("Error to save feature change or feature creation");
                    console.log(e);
                    return Rx.Observable.of(e);
                })
                .switchMap((el)=> {
                    return has(el, "status") && el.status !== 200 ? Rx.Observable.of(
                        // fail message
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.infos.failChangeFeature")
                        })
                    ) : Rx.Observable.of(
                        // success message
                        success({
                            title: getMessageById(messages, "tabou2.infos.successApi"),
                            message: getMessageById(messages, "tabou2.infos.successSaveInfos")
                        }),
                        // we just update last GFI request to refresh panel
                        reloadLayer(layersToc.nom),
                        displayFeature({feature: action.params.feature, layer: layersToc.nom})

                    );
                });
        });
}

/**
 * Behavior to display feature from add tab to identify tab
 * @param {any} action$
 * @param {any} store
 * @returns empty
 *
 */
export function displayFeatureInfos(action$, store) {
    return action$.ofType(DISPLAY_FEATURE)
        .switchMap( action => {
            let tocLayer = layersSelector(store.getState()).filter(lyr => lyr.name === action.infos.layer)[0];
            let env = localizedLayerStylesEnvSelector(store.getState());
            let { url, request, metadata } = buildIdentifyRequest(tocLayer, {...identifyOptionsSelector(store.getState()), env});
            request.cql_filter = `id_tabou = ${action.infos.feature.id}`;
            request.info_format = "application/json";
            return Rx.Observable.defer(() => getFeatureInfo(url, request, tocLayer, {}))
                .catch(e => {
                    console.log("Error to retrieve feature from GFI");
                    console.log(e);
                    return Rx.Observable.of({});
                })
                .switchMap(response => {
                    if (isEmpty(response)) return Rx.Observable.empty();
                    // control this feature is the selected feature from identify tab
                    let selected = !isEmpty(getSelection(store.getState())) ? getSelection(store.getState())?.feature : null;
                    let isSelected = selected && selected.properties?.objectid === response.features[0]?.properties?.objectid;
                    // if not we load the entire response to trigger fake map click response and display response into indentify panel
                    if (!isSelected) {
                        return Rx.Observable.of(
                            loadTabouFeatureInfo({}),
                            loadFeatureInfo(uuid.v1(), response.data, request, { ...metadata, features: response.features, featuresCrs: response.featuresCrs }, tocLayer)
                        );
                    }
                    // if same we just update last GFI request
                    return Rx.Observable.of(
                        updateFeatureInfoClickPoint(clickPointSelector(store.getState()))
                    );
                });
        });
}
