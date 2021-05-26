import * as Rx from 'rxjs';
import { get, keys } from 'lodash';
import { loadEvents, loadTiers, SELECT_FEATURE, ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT,
    ADD_FEATURE_TIER, DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER, loadFicheInfos, loading
 } from '@ext/actions/tabou2';

import {
    getFeatureEvents,
    addFeatureEvent,
    deleteFeatureEvent,
    changeFeatureEvent,
    getFeatureTiers,
    addFeatureTier,
    changeFeatureTier,
    getTiers,
    createTier,
    inactivateTier,
    getProgramme,
    getProgrammePermis,
    getOperation,
    getOperationProgrammes,
    getSecteur,
    getProgrammeAgapeo
} from '@ext/api/search';

import { getSelection, getLayer, getPluginCfg, isTabou2Activate } from '@ext/selectors/tabou2';
import { URL_ADD } from '@ext/constants';
import { wrapStartStop } from "@mapstore/observables/epics";
import { error } from "@mapstore/actions/notifications";

const actionOnUpdate = {
    "ADD_FEATURE_EVENT": (layer, idFeature, event) => addFeatureEvent(layer, idFeature, event),
    "DELETE_FEATURE_EVENT": (layer, idFeature, event) => deleteFeatureEvent(layer, idFeature, event.id),
    "CHANGE_FEATURE_EVENT": (layer, idFeature, event) => changeFeatureEvent(layer, idFeature, event),
    "ADD_FEATURE_TIER": (layer, idFeature, tier) => addFeatureTier(layer, idFeature, tier),
    "DELETE_FEATURE_TIER": (layer, idFeature, tier) => deleteFeatureTier(layer, idFeature, tier.id),
    "CHANGE_FEATURE_TIER": (layer, idFeature, tier) => changeFeatureTier(layer, idFeature, tier),
    "INACTIVATE_TIER": (layer, idFeature, tier) => inactivateTier(layer, idFeature, tier.id),
};

const resetFeatureBylayer = {
    "layerOA": (id) => getOperation(id),
    "layerPA": (id) => getProgramme(id),
    "layerSA": (id) => getSecteur(id)
}

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
    }
}

const selectInfos = {
    operation: null,
    programme: null,
    programmes: null,
    tiers: null,
    permis: null
}

/**
 * call API to get events logs on feature selection
 * @param {any} action$
 * @param {any} store
 */
export function getSelectionInfos(action$, store) {
    return action$.ofType(SELECT_FEATURE)
        .filter((action) => isTabou2Activate(store.getState()) && get(action?.selectedFeature?.feature, "properties.id_tabou"))
        .switchMap((action) => {
            // get infos from layer's feature directly
            const idTabou = get(action.selectedFeature.feature, "properties.id_tabou");

            //const idTabou = 3;
            let tiers = [];
            let layerCfg = action.selectedFeature.layer;
            let layerUrl = get(URL_ADD, layerCfg);
            let searchItem = null;
            let mapFeature = action.selectedFeature.feature;
            layerUrl = "operations";

            // get events from API
            /**
             * TODO
             * - dynamic type layer
             * - dynamic idTabou
             */
            let secondObservable$ = Rx.Observable.empty();
            if(layerCfg === "layerOA" || layerCfg === "layerSA") {
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
                            mapFeature:mapFeature};
                        return Rx.Observable.of(loadFicheInfos(infos));
                    }
                )
            } else {
                secondObservable$ = Rx.Observable.defer(() => getOperation(searchItem.operationId))
                    .catch(e => {
                        console.log("Error retrieving on PA Agapeo request");
                        console.log(e);
                        return Rx.Observable.of({elements: []});
                    })
                    .switchMap( operation => {
                        // GET programme's permis
                        return Rx.Observable.defer(() => getProgrammeAgapeo(searchItem?.id))
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
                                        agapeo: agapeo.elements,
                                        programme: searchItem,
                                        permis: permis.data,
                                        tiers: tiers,
                                        operation: operation.data,
                                        mapFeature: mapFeature
                                    };
                                    return Rx.Observable.of(loadFicheInfos(infos))
                                }
                            )
                        })
                    })
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
                    return Rx.Observable.of(loadEvents(response?.data?.elements || []))
                })
                .concat(
                    Rx.Observable.defer(() => getTiers(layerUrl, idTabou))
                    .catch(e => {
                        console.log("Error retrieving on OA or SA tiers request");
                        console.log(e);
                        return Rx.Observable.of({data: []});
                    })
                    .switchMap( r => {
                        // GET Feature's tiers list
                        tiers = r?.data?.elements;
                        return Rx.Observable.of(loadTiers(r?.data?.elements || []))
                    })
                ).concat(
                    Rx.Observable.defer(() => resetFeatureBylayer[layerCfg](idTabou))
                    // GET OA, PA or SA clicked Feature
                    .switchMap((response) => {
                        searchItem = response.data;
                        return secondObservable$
                    })
                );
                return firstObservable$.let(
                    wrapStartStop(
                        [loading(true, "identify")],
                        loading(false, "identify"),
                        () => {
                            return Rx.Observable.of(
                                error({
                                    title: "Erreur API",
                                    message: "Echec de la récupération des informations"
                                }),
                                loading(false, "identify")
                            );
                        }
                    )
                )
        })
}

export function updateTabou2Logs(action$, store) {
    return action$.ofType(ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.objectid || action?.selectedFeature?.properties.objectid;
            let {featureId, layerUrl} = getInfos(store.getState());
            featureId = 3;
            layerUrl = "operations";
            let toDoOnUpdate = get(actionOnUpdate, action.type);

            // get events from API
            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.event))
            .switchMap(() => {
                    return Rx.Observable.defer(() => getFeatureEvents(layerUrl, featureId)).switchMap( events => {
                        return Rx.Observable.of(loadEvents(events?.data?.elements || []))
                        }
                    )
                }
            )
        });
}

export function addCreateTabou2Tier(action$, store) {
    return action$.ofType(ADD_FEATURE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.objectid || action?.selectedFeature?.properties.objectid;
            // selected feature and selected layer
            let {featureId, layerUrl} = getInfos(store.getState());
            // create tier first
            return Rx.Observable.defer(() => createTier(layerUrl, featureId, action.tier))
                .switchMap(() => {
                    // Now we associate this tier to element
                    return Rx.Observable.defer(() => addFeatureTier(layerUrl, featureId)).switchMap( tiers => {
                        // refresh tiers list now
                        Rx.Observable.defer(() => getTiers("operations", idTabou))
                        .switchMap( r => {
                            return Rx.Observable.of(loadTiers(r?.data?.elements || []))
                        })
                    })
                })
        });
};

export function updateTabou2Tier(action$, store) {
    return action$.ofType(DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER)
        .filter(() => isTabou2Activate(store.getState()))        
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.objectid || action?.selectedFeature?.properties.objectid;
            // selected feature and selected layer
            let toDoOnUpdate = get(actionOnUpdate, action.type);
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.tier))
            .switchMap( () => {
                    return Rx.Observable.defer(() => getFeatureTiers(layerUrl, featureId)).switchMap( tiers => {
                        return Rx.Observable.of(loadTiers(tiers?.data || []))
                        }
                    )
                }
            )
        });
}