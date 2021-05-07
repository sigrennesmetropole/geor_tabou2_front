import * as Rx from 'rxjs';
import { get, keys } from 'lodash';
import { loadEvents, loadTiers, SELECT_FEATURE, ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT,
    ADD_FEATURE_TIER, DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER, loadFicheInfos
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
    getOperationProgrammes
} from '@ext/api/search';

import { getSelection, getLayer, getPluginCfg, isTabou2Activate } from '@ext/selectors/tabou2';
import { LAYER_FIELD_OPTION, URL_ADD } from '@ext/constants';
import { getOperations } from '@mapstore/utils/WMTSUtils';

const actionOnUpdate = {
    "ADD_FEATURE_EVENT": (layer, idFeature, event) => addFeatureEvent(layer, idFeature, event),
    "DELETE_FEATURE_EVENT": (layer, idFeature, event) => deleteFeatureEvent(layer, idFeature, event.id),
    "CHANGE_FEATURE_EVENT": (layer, idFeature, event) => changeFeatureEvent(layer, idFeature, event),
    "ADD_FEATURE_TIER": (layer, idFeature, tier) => addFeatureTier(layer, idFeature, tier),
    "DELETE_FEATURE_TIER": (layer, idFeature, tier) => deleteFeatureTier(layer, idFeature, tier.id),
    "CHANGE_FEATURE_TIER": (layer, idFeature, tier) => changeFeatureTier(layer, idFeature, tier),
    "INACTIVATE_TIER": (layer, idFeature, tier) => inactivateTier(layer, idFeature, tier.id),
};

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
export function getTabou2Logs(action$, store) {
    return action$.ofType(SELECT_FEATURE)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            // get infos from layer's feature directly
            //const idTabou = get(action.selectedFeature.feature, "properties.id_tabou");
            const idTabou = 3;
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
            let observable$ = Rx.Observable.empty();
            if(layerCfg === "layerOA" || layerCfg === "layerSA") {
                observable$ = Rx.Observable.defer(() => getOperationProgrammes(searchItem.id)).switchMap( programmes => {
                    // load info to store
                    let infos = {...selectInfos, programmes: programmes.data, operation: searchItem, tiers: tiers, mapFeature: mapFeature};
                    return Rx.Observable.of(loadFicheInfos(infos));
                    }
                )
            } else {
                observable$ = Rx.Observable.defer(() => getOperation(searchItem.operationId))
                    .switchMap( operation => {
                        // permis for selected programme
                        return Rx.Observable.defer(() => getProgrammePermis(searchItem.id)).switchMap( permis => {
                            // load info to store
                            let infos = {...selectInfos, programme: searchItem, permis: permis.data, tiers: tiers, operation: operation.data, mapFeature: mapFeature};
                            return Rx.Observable.of(loadFicheInfos(infos))
                            }
                        )
                    })
            }

            return Rx.Observable.defer(() => getFeatureEvents(layerUrl, idTabou))
                .switchMap( response => {
                    return Rx.Observable.of(loadEvents(response?.data || []))
                })
                .concat(
                    Rx.Observable.defer(() => getTiers(layerUrl, idTabou))
                    .switchMap( r => {
                        tiers = r?.data?.elements;
                        return Rx.Observable.of(loadTiers(r?.data?.elements || []))
                    })
                ).concat(
                    Rx.Observable.defer(() => layerCfg === "layerPA" ? getProgramme(idTabou) : getOperation(idTabou))
                    .switchMap((response) => {
                        searchItem = response.data;
                        return observable$
                    })
                );
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
                        return Rx.Observable.of(loadEvents(events?.data || []))
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