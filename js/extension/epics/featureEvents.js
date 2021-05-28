import * as Rx from 'rxjs';
import { get, keys, find } from 'lodash';
import { loadEvents, loadTiers, SELECT_FEATURE, ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT, ADD_FEATURE_TIER,
    ASSOCIATE_TIER, DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER, loadFicheInfos, loading, MAP_TIERS, mapTiers
 } from '@ext/actions/tabou2';

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
    changeFeatureTierAssociation
} from '@ext/api/search';

import { getSelection, getLayer, getPluginCfg, isTabou2Activate, } from '@ext/selectors/tabou2';
import { URL_ADD } from '@ext/constants';
import { wrapStartStop } from "@mapstore/observables/epics";
import { error } from "@mapstore/actions/notifications";

const actionOnUpdate = {
    "ADD_FEATURE_EVENT": (layer, idFeature, event) => addFeatureEvent(layer, idFeature, event),
    "DELETE_FEATURE_EVENT": (layer, idFeature, event) => deleteFeatureEvent(layer, idFeature, event.id),
    "CHANGE_FEATURE_EVENT": (layer, idFeature, event) => changeFeatureEvent(layer, idFeature, event),
    "ASSOCIATE_TIER": (layer, idFeature, tier) => associateFeatureTier(layer, idFeature, tier),
    "DELETE_FEATURE_TIER": (layer, idFeature, tier) => dissociateFeatureTier(layer, idFeature, tier.id),
    "CHANGE_FEATURE_TIER": (layer, idFeature, tier) => changeFeatureTier(tier),
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
                .concat(Rx.Observable.of(mapTiers()))
                .concat(
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
            let {featureId, layerUrl} = getInfos(store.getState());
            layerUrl = "operations";
            let toDoOnUpdate = get(actionOnUpdate, action.type);

            // get events from API
            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.event))
            .catch(e => {
                console.log("Error retrieving log's info");
                console.log(e);
                return Rx.Observable.of({data: []});
            })
            // refresh tiers
            .switchMap(() => Rx.Observable.of(mapTiers()));
        });
}

export function addCreateTabou2Tier(action$, store) {
    return action$.ofType(ADD_FEATURE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties?.id_tabou || action?.selectedFeature?.properties?.id_tabou;
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
                })
        });
};

export function associateTabou2Tier(action$, store) {
    return action$.ofType(ASSOCIATE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            // selected feature and selected layer
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => getTiers({nom: action.tier.tier.nom}))
            .switchMap(tier => {
                return Rx.Observable.defer(() => associateFeatureTier(layerUrl, featureId, tier?.data?.elements[0]?.id, action.tier.type.id))
                .catch(e => {
                    console.log("Error on tier association");
                    console.log(e);
                    return Rx.Observable.of({data: []});
                })
            })
            .switchMap(() => Rx.Observable.of(mapTiers()));
        });
};

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
                return Rx.Observable.defer(() => changeFeatureTierAssociation(layerUrl, featureId, action.tier.id, action.tier.type.id))
                .catch(e => {
                    console.log("Error on change feature tier association");
                    console.log(e);
                    return Rx.Observable.of({data: []});
                })
            })
            // refresh tiers
            .switchMap(() => Rx.Observable.of(mapTiers()));
        });
}

export function getTiersElements(action$, store) {
    return action$.ofType(MAP_TIERS)
    .filter(() => isTabou2Activate(store.getState()))
    .switchMap( action => {
        let {featureId, layerUrl} = getInfos(store.getState());
        return Rx.Observable.defer(() => getTiers())
        .switchMap( tiers => {
            if (tiers?.data?.elements) {
                return Rx.Observable.defer(() => getFeatureTiers(layerUrl, featureId))
                .switchMap( featureTiers => {
                    if (featureTiers?.data?.elements) {
                        let allTiers = featureTiers.data.elements.map(t => ({...find(tiers.data.elements, ["nom", t.nom]), ...t}));
                        return Rx.Observable.of(loadTiers(allTiers))
                    }
                    return Rx.Observable.empty();
                })
            }
            return Rx.Observable.empty();
        })
    })
}