import * as Rx from 'rxjs';
import { get, keys, find, isEmpty } from 'lodash';
import { loadEvents, loadTiers, RELOAD_LAYER, CREATE_FEATURE, SELECT_FEATURE,
    ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT, ADD_FEATURE_TIER,
    ASSOCIATE_TIER, DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER,
    loadFicheInfos, loading, MAP_TIERS, mapTiers, reloadLayer, displayFeature, getApiEvents, GET_EVENTS
} from '@ext/actions/tabou2';
import {getMessageById} from "@mapstore/utils/LocaleUtils";

import {
    getFeatureEvents,
    addFeatureEvent,
    deleteFeatureEvent,
    changeFeatureEvent,
    getFeatureTiers,
    associateFeatureTier,
    getTiers,
    changeFeatureTier,
    createTier,
    inactivateTier,
    dissociateFeatureTier,
    getProgramme,
    getProgrammePermis,
    getOperation,
    getOperationProgrammes,
    getSecteur,
    getProgrammeAgapeo,
    changeFeatureTierAssociation,
    createNewTabouFeature
} from '@ext/api/search';

import { getSelection, getLayer, getPluginCfg, isTabou2Activate } from '@ext/selectors/tabou2';
import { URL_ADD } from '@ext/constants';
import { wrapStartStop } from "@mapstore/observables/epics";
import { error, success } from "@mapstore/actions/notifications";
import { refreshLayerVersion } from "@mapstore/actions/layers";
import { layersSelector } from '@mapstore/selectors/layers';

// get service to request according to action type
const actionOnUpdate = {
    "ADD_FEATURE_EVENT": (layer, idFeature, event) => addFeatureEvent(layer, idFeature, event),
    "DELETE_FEATURE_EVENT": (layer, idFeature, event) => deleteFeatureEvent(layer, idFeature, event.id),
    "CHANGE_FEATURE_EVENT": (layer, idFeature, event) => changeFeatureEvent(layer, idFeature, event),
    "ASSOCIATE_TIER": (layer, idFeature, tiers) => associateFeatureTier(layer, idFeature, tiers),
    "DELETE_FEATURE_TIER": (layer, idFeature, tiers) => dissociateFeatureTier(layer, idFeature, tiers.id),
    "CHANGE_FEATURE_TIER": (layer, idFeature, tiers) => changeFeatureTier(tiers.tiers),
    "INACTIVATE_TIER": (layer, idFeature, tiers) => inactivateTier(tiers.tiers.id)
};

// get feature from API according to selected layer feature
const resetFeatureBylayer = {
    "layerOA": (id) => getOperation(id),
    "layerPA": (id) => getProgramme(id),
    "layerSA": (id) => getSecteur(id)
};

/**
 * Get infos from store
 * @param {any} state
 * @returns object
 */
const getInfos = (state) => {
    const feature = getSelection(state).feature;
    const layer = getLayer(state);
    // get plugin config
    const layersCfg = getPluginCfg(state).layersCfg;
    // layerOA, layerPa, layerSA
    const configName = keys(layersCfg).filter(k => layer === layersCfg[k].nom)[0];
    // return correct name field id according to layer
    const featureId = get(feature, "properties.id_tabou");
    // find correct api name
    const layerUrl = get(URL_ADD, configName);
    return {
        featureId: featureId,
        layerUrl: layerUrl,
        layer: layer,
        layerCfg: configName
    };
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

            // get events from API
            /**
             * TODO
             * - dynamic type layer
             * - dynamic idTabou
             *
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
                        return Rx.Observable.of({data: []});
                    })
                    .switchMap( programmes => {
                        // store data
                        let infos = {
                            ...selectInfos,
                            programmes: programmes.data,
                            operation: searchItem,
                            tiers: tiers,
                            mapFeature: mapFeature};
                        return Rx.Observable.of(loadFicheInfos(infos));
                    });
            } else {
                secondObservable$ = Rx.Observable.defer(() => getOperation(searchItem.operationId))
                    .catch(e => {
                        console.log("Error retrieving get operation request");
                        console.log(e);
                        return Rx.Observable.of({data: []});
                    })
                    .switchMap( operation => {
                        // GET programme's permis
                        return Rx.Observable.defer(() => getProgrammeAgapeo(searchItem?.id))
                            .catch(e => {
                                console.log("Error on get Agapeo data request");
                                console.log(e);
                                return Rx.Observable.of({elements: []});
                            })
                            .switchMap( agapeo => {
                                return Rx.Observable.defer(() => getProgrammePermis(searchItem?.id))
                                    .catch(e => {
                                        console.log("Error retrieving PA permis request");
                                        console.log(e);
                                        return Rx.Observable.of({data: []});
                                    })
                                    .switchMap( permis => {
                                    // store data
                                        let infos = {...selectInfos,
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
            firstObservable$ =  Rx.Observable.defer(() => getFeatureEvents(layerUrl, idTabou))
                .catch(e => {
                    console.log("Error retrieving on OA or SA events request");
                    console.log(e);
                    return Rx.Observable.of({data: []});
                })
                .switchMap( response => {
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
 * Add, change, delete events from feature diary
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function updateTabou2Logs(action$, store) {
    return action$.ofType(ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let {featureId, layerUrl} = getInfos(store.getState());
            let toDoOnUpdate = get(actionOnUpdate, action.type);
            // get events from API
            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.event))
                .catch(e => {
                    console.log("Error retrieving log's info");
                    console.log(e);
                    return Rx.Observable.of({data: []});
                })
            // refresh tiers
                .switchMap(() => Rx.Observable.of(getApiEvents()));
        });
}

/**
 * New tier creation. Will associate the created tier next.
 * TODO: trigger ASSOCIATE_TIER action istead of same behavior.
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function addCreateTabou2Tier(action$, store) {
    return action$.ofType(ADD_FEATURE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            // const idTabou = action?.selectedFeature?.properties?.id_tabou || action?.selectedFeature?.properties?.id_tabou;
            // selected feature and selected layer
            let {featureId, layerUrl} = getInfos(store.getState());
            // create tier first
            return Rx.Observable.defer(() => createTier(action.tier))
                .switchMap((tier) => {
                    // Now we associate this tier to element
                    return Rx.Observable.defer(() => associateFeatureTier(layerUrl, featureId, tier?.data?.id, action.tier.type.id))
                        .catch(e => {
                            console.log("Error to create association between feature and tier");
                            console.log(e);
                            return Rx.Observable.of({data: []});
                        })
                    // refresh tiers
                        .switchMap(() => Rx.Observable.of(mapTiers()));
                });
        });
}

/**
 * Tier assiciation
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function associateTabou2Tier(action$, store) {
    return action$.ofType(ASSOCIATE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            // selected feature and selected layer
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => getTiers({nom: action.tier.tiers.nom}))
                .switchMap(tiers => {
                    return Rx.Observable.defer(() => associateFeatureTier(layerUrl, featureId, tiers?.data?.elements[0]?.id, action.tier.typeTiers.id))
                        .catch(e => {
                            console.log("Error on tier association");
                            console.log(e);
                            return Rx.Observable.of({data: []});
                        });
                })
                .switchMap(() => Rx.Observable.of(mapTiers()));
        });
}

/**
 * Trigger when user delete, change or inactivate a tier. Will refresh all tiers next.
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function updateTabou2Tier(action$, store) {
    /**
     * TODO : use id association (not available yet from API) to change feature association
     */
    return action$.ofType(DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            // selected feature and selected layer
            let toDoOnUpdate = get(actionOnUpdate, action.type);
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.tier))
                .switchMap(() => {
                    return Rx.Observable.defer(() => changeFeatureTierAssociation(layerUrl, featureId, action.tier.tiers.id, action.tier.typeTiers.id, action.tier.id))
                        .catch(e => {
                            console.log("Error on change feature tier association");
                            console.log(e);
                            return Rx.Observable.of({data: []});
                        });
                })
            // refresh tiers
                .switchMap(() => Rx.Observable.of(mapTiers()));
        });
}

/**
 * Epics to match tiers with tiers type and return only one object to store
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function getTiersElements(action$, store) {
    return action$.ofType(MAP_TIERS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(() => {
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => getTiers())
                .switchMap( tiers => {
                    if (tiers?.data?.elements) {
                        return Rx.Observable.defer(() => getFeatureTiers(layerUrl, featureId))
                            .switchMap( featureTiers => {
                                if (featureTiers?.data?.elements) {
                                    let allTiers = featureTiers.data.elements.map(t => ({...find(tiers.data.elements, ["tiers.nom", t.tiers.nom]), ...t}));
                                    return Rx.Observable.of(loadTiers(allTiers));
                                }
                                return Rx.Observable.empty();
                            });
                    }
                    return Rx.Observable.empty();
                });
        });
}

/**
 * Epics to reload features events
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function getEventsElements(action$, store) {
    return action$.ofType(GET_EVENTS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(() => {
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => getFeatureEvents(layerUrl, featureId))
                .switchMap( response => {
                    if (response?.data?.elements) {
                        return Rx.Observable.of(loadEvents(response?.data?.elements || []));
                    }
                    return Rx.Observable.empty();
                });
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
        .switchMap( action => {
            let infos = getInfos(store.getState());
            let messages = store.getState()?.locale.messages;
            return Rx.Observable.defer( () => createNewTabouFeature(infos.layerUrl, action.params))
                .catch(e => {
                    console.log("Error to save feature change or feature creation");
                    console.log(e);
                    return Rx.Observable.of(e);
                })
                .switchMap((el)=> {
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
                        reloadLayer(infos.layer),
                        displayFeature({feature: el.data, layer: infos.layer})
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
        .switchMap( action => {
            let layer = layersSelector(store.getState()).filter(lyr => lyr.name === action.layer);
            return Rx.Observable.of(refreshLayerVersion(layer[0].id));
        });
}
