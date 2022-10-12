import * as Rx from 'rxjs';
import { CONTROL_NAME, ID_TABOU, URL_ADD } from '../constants';

import { get, keys, find, isEmpty, pickBy } from 'lodash';

import {
    generalInfoFormatSelector, identifyOptionsSelector, clickPointSelector
} from '@mapstore/selectors/mapInfo';
import { localizedLayerStylesEnvSelector } from "@mapstore/selectors/localizedLayerStyles";
import { updateUserPlugin } from '@mapstore/actions/context';
import { buildIdentifyRequest } from '@mapstore/utils/MapInfoUtils';
import { layersSelector } from '@mapstore/selectors/layers';
import { error, success } from "@mapstore/actions/notifications";
import { getMessageById } from "@mapstore/utils/LocaleUtils";
import { newfilterLayerByList, getNewCrossLayerFilter } from '../utils/search';
import {
    changeMapInfoFormat,
    updateFeatureInfoClickPoint
} from "@mapstore/actions/mapInfo";

import {
    clickOnMap
} from "@mapstore/actions/map";

import { TOGGLE_CONTROL } from '@mapstore/actions/controls';
import {
    isTabou2Activate,
    defaultInfoFormat,
    getPluginCfg,
    getSelection,
    getLayerFilterObj,
    getSelectionPoint
} from '../selectors/tabou2';
import {
    loadTabouFeatureInfo,
    setDefaultInfoFormat,
    setMainActiveTab,
    PRINT_PDF_INFOS,
    CHANGE_FEATURE,
    DISPLAY_FEATURE,
    reloadLayer,
    LOAD_FICHE_INFOS,
    DISPLAY_PA_SA_BY_OA,
    setTabouFilterObj,
    applyFilterObj,
    cleanTabouInfos,
    TABOU_CHANGE_FEATURES,
    setSelectedFeature,
    setTabouFicheInfos
} from "../actions/tabou2";
import { getPDFProgramme, getPDFOperation, putRequestApi, getTypesFoncier, getTypesActeurs, getTypesActions } from '../api/requests';

import { getFeatureInfo } from "@mapstore/api/identify";

import { downloadToBlob } from "../utils/identify";
/**
 * Catch GFI response on identify load event and close identify if Tabou2 identify tabs is selected
 * @param {*} action$
 * @param {*} store
 */
export function tabouLoadIdentifyContent(action$, store) {
    return action$.ofType(TABOU_CHANGE_FEATURES)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            const resp = action.data;
            const respNotEmpty = keys(resp).filter(k => get(resp, k).data.features.length);
            const picked = pickBy(resp, (a, b) => respNotEmpty.includes(b));
            return Rx.Observable.of(
                setMainActiveTab("identify"),
                loadTabouFeatureInfo(picked)
            );
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
 * Get fiche-suivi from tabou2 API as document
 * @param {*} action$
 * @param {*} store
 * @returns
 */
export function printProgramme(action$, store) {
    return action$.ofType(PRINT_PDF_INFOS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let messages = store.getState()?.locale.messages;
            let feature = getSelection(store.getState())?.feature.properties;
            return Rx.Observable.defer(() => action.layer === "layerPA" ? getPDFProgramme(action.id) : getPDFOperation(action.id))
                .catch(e => {
                    console.log("Error on get PDF request");
                    console.log(e);
                    // fail message
                    return Rx.Observable.of({ ...e, data: null });
                })
                .switchMap(response => {
                    if (response?.status === 200 && response?.data) {
                        let nomOA = action.layer === "layerPA" ? feature.nomopa.split(" ")
                            .map(e => e[0].toUpperCase() + e.slice(1)).join('') : feature.nom;
                        let name =
                            `FicheSuivi_${action.id}_${feature.code}_${nomOA}`;
                        downloadToBlob(response, response.data.type || 'application/pdf', name);
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
        .switchMap(action => {
            let messages = store.getState()?.locale.messages;
            let layersToc = find(getPluginCfg(store.getState()).layersCfg, (o, i) => i === action.params.layer);
            return Rx.Observable.defer(() => putRequestApi(`${get(URL_ADD, action.params.layer)}`, getPluginCfg(store.getState()).apiCfg, action.params.feature))
                .catch(e => {
                    console.log("Error to save feature change or feature creation");
                    console.log(e);
                    return Rx.Observable.of(e);
                })
                .switchMap((response) => {
                    if (response?.status === 200 && response?.data) {
                        return Rx.Observable.of(
                            // success message
                            success({
                                title: getMessageById(messages, "tabou2.infos.successApi"),
                                message: getMessageById(messages, "tabou2.infos.successSaveInfos")
                            }),
                            // we just update last GFI request to refresh panel
                            reloadLayer(layersToc.nom),
                            setSelectedFeature(getSelection(store.getState()))
                        );
                    }
                    return Rx.Observable.of(
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.infos.failChangeFeature")
                        })
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
        .switchMap(action => {

            // only if user create tabou feature from clicked map feature
            if (!action?.infos || !action.infos?.feature) return Rx.Observable.isEmpty();

            let tocLayer = layersSelector(store.getState()).filter(lyr => lyr.name === action.infos.layer)[0];
            let env = localizedLayerStylesEnvSelector(store.getState());
            const identifyOptionsInfos = { ...identifyOptionsSelector(store.getState()), point: getSelectionPoint(store.getState()) };
            let { url, request } = buildIdentifyRequest(tocLayer, { ...identifyOptionsInfos, env });
            request.cql_filter = `${ID_TABOU} = ${action.infos.feature.id}`;
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
                    let isSelected = selected && selected.properties?.id_tabou === response.features[0]?.properties?.id_tabou;
                    // if not we load the entire response to trigger fake map click response and display response into indentify panel
                    if (!isSelected) {
                        return Rx.Observable.of(
                            cleanTabouInfos(),
                            clickOnMap(getSelectionPoint(store.getState())),
                            updateFeatureInfoClickPoint(clickPointSelector(store.getState()))
                        );
                    }
                    // if same we just update last GFI request
                    return Rx.Observable.of(
                        updateFeatureInfoClickPoint(clickPointSelector(store.getState()))
                    );
                });
        });
}

/**
 * create and apply filter on SA, PA, OA according to clicked OA
 * @param {*} action$
 * @param {*} store
 * @returns some actions
 */
export function dipslayPASAByOperation(action$, store) {
    return action$.ofType(DISPLAY_PA_SA_BY_OA)
        .switchMap(() => {
            const idTabou = getSelection(store.getState()).id;
            const idsPA = store.getState().tabou2.ficheInfos.programmes.elements.map(p => p.id);
            let layers = getPluginCfg(store.getState()).layersCfg;
            let layerPA = get(layers, "layerPA").nom;
            let layerOA = get(layers, "layerOA").nom;
            let layerSA = get(layers, "layerSA").nom;
            // SA filter
            let crossLayerFilter = getNewCrossLayerFilter("INTERSECTS", "the_geom", "", [], "the_geom", layerOA);
            // prepare filter
            let filters = {
                ...getLayerFilterObj(store.getState()),
                [layerPA]: newfilterLayerByList(layerPA, idsPA, ID_TABOU),
                [layerOA]: newfilterLayerByList(layerOA, [idTabou], ID_TABOU),
                [layerSA]: {
                    ...newfilterLayerByList(layerSA, [idTabou], ID_TABOU, "", crossLayerFilter),
                    groupLevels: 5,
                    maxFeaturesWPS: 5
                }
            };
            return Rx.Observable.of(
                setTabouFilterObj(filters),
                applyFilterObj(layerPA),
                applyFilterObj(layerOA),
                applyFilterObj(layerSA),
            );
        });
}

export const getFicheInfoValues = (action$, store) =>
    action$.ofType(LOAD_FICHE_INFOS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(({ id }) => {
            return Rx.Observable.from([
                { name: "typesFonciers", api: getTypesFoncier },
                { name: "typesActeur", api: getTypesActeurs },
                { name: "typesAction", api: getTypesActions}
            ]).map(r =>
                Rx.Observable.defer(() => r.api(id))
                    .catch(e => {
                        console.log("Error on get getTabouVocationsInfos data request");
                        console.log(e);
                        return Rx.Observable.of({ data: [] });
                    })
                    .switchMap(({ data }) => {
                        return Rx.Observable.of({...r, data: data?.elements || [] });
                    })
            ).toArray().switchMap((requestArray) => {
                return Rx.Observable.forkJoin(requestArray).flatMap((elementArray) => {
                    return Rx.Observable.of(
                        setTabouFicheInfos(elementArray[0].name, elementArray[0].data),
                        setTabouFicheInfos(elementArray[1].name, elementArray[1].data),
                        setTabouFicheInfos(elementArray[2].name, elementArray[2].data),
                    );
                });
            });
        });
