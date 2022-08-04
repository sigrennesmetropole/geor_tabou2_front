import * as Rx from 'rxjs';
import { get, isEmpty } from 'lodash';
import {
    loadEvents,
    RELOAD_LAYER,
    CREATE_FEATURE,
    SELECT_FEATURE,
    loadFicheInfos,
    loading,
    mapTiers,
    reloadLayer,
    displayFeature,
    getTabouVocationsInfos,
    setSelectedFeature
} from '../actions/tabou2';
import { getMessageById } from "@mapstore/utils/LocaleUtils";

import {
    isTabou2Activate,
    getSelection,
    getInfos,
    getParentSA
} from '../selectors/tabou2';

import {
    getFeatureEvents,
    getProgramme,
    getProgrammePermis,
    getOperation,
    getOperationProgrammes,
    getSecteur,
    getProgrammeAgapeo,
    createNewTabouFeature
} from '../api/requests';

import { URL_ADD } from '../constants';
import { wrapStartStop } from "@mapstore/observables/epics";
import { error, success } from "@mapstore/actions/notifications";
import { refreshLayerVersion } from "@mapstore/actions/layers";
import { layersSelector } from '@mapstore/selectors/layers';
import { getAreaFeature } from '../utils/layers';

import uuid from "uuid";

// get feature from API according to selected layer feature
const resetFeatureBylayer = {
    "layerOA": (id) => getOperation(id),
    "layerPA": (id) => getProgramme(id),
    "layerSA": (id) => getSecteur(id)
};

const selectInfos = {
    operation: null,
    programme: null,
    programmes: null,
    tiers: null,
    permis: null
};

/**
 * Process to get all info from selected feature.
 * Many services was called, and some infos was keep from clicked map feature.
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function getSelectionInfos(action$, store) {
    return action$.ofType(SELECT_FEATURE)
        .filter((action) => isTabou2Activate(store.getState()) && get(action?.selectedFeature?.feature, "properties.id_tabou"))
        .switchMap((action) => {
            let messages = store.getState()?.locale.messages;
            // get infos from layer's feature directly
            const idTabou = get(action.selectedFeature.feature, "properties.id_tabou");
            let tiers = [];
            let layerCfg = action.selectedFeature.layer;
            let layerUrl = get(URL_ADD, layerCfg);
            let searchItem = null;
            let mapFeature = action.selectedFeature.feature;
            const parent = getParentSA(store.getState());
            let parentArea = 0;
            if (!isEmpty(parent)) {
                parentArea = parent.properties?.surfaceTotale || getAreaFeature(parent.geometry);
                parentArea = Math.round(parentArea) / 10000; // ha unit
            }

            // get events from API
            /**
             * WARNING
             * - API GET operations/{id}/programmes not works for SA layer
             */
            let secondObservable$ = Rx.Observable.empty();
            if (layerCfg === "layerOA" || layerCfg === "layerSA") {
                // GET operation's programmes
                secondObservable$ = Rx.Observable.defer(() => getOperationProgrammes(searchItem?.id))
                    .catch(e => {
                        console.log("Error retrieving on OA or SA programmes request");
                        console.log(e);
                        return Rx.Observable.of({ data: [] });
                    })
                    .switchMap(programmes => {
                        // store data
                        let identifyPanelInfos = {
                            ...selectInfos,
                            uuid: uuid.v1(),
                            programmes: programmes.data,
                            operation: {
                                ...searchItem,
                                surfaceParent: parentArea
                            },
                            tiers: tiers,
                            mapFeature: mapFeature
                        };
                        return Rx.Observable.of(loadFicheInfos(identifyPanelInfos))
                            .concat(Rx.Observable.of(getTabouVocationsInfos(searchItem?.id)));
                    });
            } else {
                secondObservable$ = Rx.Observable.defer(() => getOperation(searchItem.operationId))
                    .catch(e => {
                        console.log("Error retrieving get operation request");
                        console.log(e);
                        return Rx.Observable.of({ data: [] });
                    })
                    .switchMap(operation => {
                        return Rx.Observable.of(operation);
                    })
                    .switchMap(operation => {
                        if (!searchItem?.operationId) {
                            return Rx.Observable.of(
                                // error message
                                error({
                                    title: getMessageById(messages, "tabou2.infos.failApi"),
                                    message: getMessageById(messages, "tabou2.infos.failErrorData")
                                }),
                                console.log("Can't read correct infos !")
                            );
                        }
                        // GET programme's permis
                        return Rx.Observable.defer(() => getProgrammeAgapeo(searchItem?.id))
                            .catch(e => {
                                console.log("Error on get Agapeo data request");
                                console.log(e);
                                return Rx.Observable.of({ elements: [] });
                            })
                            .switchMap(agapeo => {
                                return Rx.Observable.defer(() => getProgrammePermis(searchItem?.id))
                                    .catch(e => {
                                        console.log("Error retrieving PA permis request");
                                        console.log(e);
                                        return Rx.Observable.of({ data: [] });
                                    })
                                    .switchMap(permis => {
                                        // store data
                                        let infos = {
                                            ...selectInfos,
                                            uuid: uuid.v1(),
                                            agapeo: agapeo.data.elements,
                                            programme: searchItem,
                                            permis: permis.data,
                                            tiers: tiers,
                                            operation: operation?.data,
                                            mapFeature: mapFeature
                                        };
                                        return Rx.Observable.of(loadFicheInfos(infos));
                                    }
                                    );
                            });
                    });
            }

            let firstObservable$ = Rx.Observable.empty();
            firstObservable$ = Rx.Observable.defer(() => getFeatureEvents(layerUrl, idTabou))
                .catch(e => {
                    console.log("Error retrieving on OA or SA events request");
                    console.log(e);
                    return Rx.Observable.of({ data: [] });
                })
                .switchMap(response => {
                    // GET Feature's Events
                    return Rx.Observable.of(loadEvents(response?.data?.elements || []));
                })
                .concat(Rx.Observable.of(mapTiers()))
                .concat(
                    Rx.Observable.defer(() => resetFeatureBylayer[layerCfg](idTabou))
                        .catch(e => {
                            console.log("Fail to get selected tabou feature infos");
                            console.log(e);
                            return Rx.Observable.of(e);
                        })
                        // GET OA, PA or SA clicked Feature
                        .switchMap((response) => {
                            if (isEmpty(response?.data)) {
                                return Rx.Observable.of(
                                    // error message
                                    error({
                                        title: getMessageById(messages, "tabou2.infos.failApi"),
                                        message: getMessageById(messages, "tabou2.infos.apiGETError")
                                    })
                                );
                            }
                            searchItem = response.data;
                            return secondObservable$;
                        })
                );
            return firstObservable$.let(
                wrapStartStop(
                    [loading(true, "identify")],
                    loading(false, "identify"),
                    () => {
                        return Rx.Observable.of(
                            error({
                                title: getMessageById(messages, "tabou2.infos.failApi"),
                                message: getMessageById(messages, "tabou2.infos.failIdentify")
                            }),
                            loading(false, "identify")
                        );
                    }
                )
            );
        });
}

/**
 * Epic to create PA, OA, SA Feature. This action will create new Tabou feature from selected geom.
 * @param {any} action$
 * @param {any} store
 * @returns empty
 */
export function createTabouFeature(action$, store) {
    return action$.ofType(CREATE_FEATURE)
        .switchMap(action => {
            let infos = getInfos(store.getState());
            let messages = store.getState()?.locale.messages;
            let layerUrl = infos?.layerUrl || get(URL_ADD, action.layer.value);
            let layer = infos.layer || action.layer.name;
            const selected = getSelection(store.getState());
            return Rx.Observable.defer(() => createNewTabouFeature(layerUrl, action.params))
                .catch(e => {
                    console.log("Error to save feature change or feature creation");
                    console.log(e);
                    return Rx.Observable.of(e,
                        reloadLayer(layer),
                        setSelectedFeature({ ...selected, id: selected.id, feature: selected.feature })
                    );
                })
                .switchMap((el) => {
                    // create new feature with updated id tabou after new tabou item
                    const newFeature = { ...selected.feature, properties: { ...selected.feature.properties, id: el.data.id } };
                    return el?.status !== 200 ? Rx.Observable.of(
                        // fail message
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.infos.failAddFeature")
                        })
                    ) : Rx.Observable.of(
                        // success message
                        success({
                            title: getMessageById(messages, "tabou2.infos.successApi"),
                            message: getMessageById(messages, "tabou2.infos.successAddFeature")
                        }),
                        reloadLayer(layer),
                        displayFeature({ feature: el.data, layer: layer }),
                        setSelectedFeature({...selected, id: selected.id, feature: newFeature})
                    );
                });
        });
}

/**
 * Epic force refresh layer
 * @param {any} action$
 * @param {any} store
 * @returns empty
 */
export function onLayerReload(action$, store) {
    return action$.ofType(RELOAD_LAYER)
        .switchMap(action => {
            let layer = layersSelector(store.getState()).filter(lyr => lyr.name === action.layer);
            return Rx.Observable.of(refreshLayerVersion(layer[0].id));
        });
}
