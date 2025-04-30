import * as Rx from 'rxjs';
import { get, keys, find } from 'lodash';
import { loadTiers, ADD_FEATURE_TIER, ASSOCIATE_TIER, DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER,
    MAP_TIERS, mapTiers
} from '../actions/tabou2';

import {
    getFeatureTiers,
    associateFeatureTier,
    getTiers,
    changeFeatureTier,
    createTier,
    inactivateTier,
    dissociateFeatureTier,
    changeFeatureTierAssociation
} from '../api/requests';

import { getSelection, getLayer, getPluginCfg, isTabou2Activate } from '../selectors/tabou2';
import { URL_ADD } from '../constants';

// get service to request according to action type
const actionOnUpdate = {
    "ASSOCIATE_TIER": (layer, idFeature, tiers) => associateFeatureTier(layer, idFeature, tiers),
    "DELETE_FEATURE_TIER": (layer, idFeature, tiers) => dissociateFeatureTier(layer, idFeature, tiers.id),
    "CHANGE_FEATURE_TIER": (layer, idFeature, tiers) => changeFeatureTier(tiers.tiers),
    "INACTIVATE_TIER": (layer, idFeature, tiers) => inactivateTier(tiers.tiers.id)
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

/**
 * New tier creation. Will associate the created tier next.
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function addCreateTabou2Tier(action$, store) {
    return action$.ofType(ADD_FEATURE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            // create tier first
            return Rx.Observable.defer(() => createTier(action.tier))
                // refresh tiers list
                .switchMap(() => Rx.Observable.of(mapTiers()));
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
    return action$.ofType(DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            // selected feature and selected layer
            let toDoOnUpdate = get(actionOnUpdate, action.type);
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.tier))
                .switchMap(() => {
                    if (action.type !== "CHANGE_FEATURE_TIER") return Rx.Observable.of(mapTiers());
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
