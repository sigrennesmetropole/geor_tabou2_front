import * as Rx from 'rxjs';
import {get, keys, find} from 'lodash';
import {
    loadTiers, ADD_FEATURE_TIER, ASSOCIATE_TIER, DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER,
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

import {getSelection, getLayer, getPluginCfg, isTabou2Activate} from '../selectors/tabou2';
import {URL_ADD} from '../constants';

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
 * Helper: Process feature tiers and merge with tier data
 * @param {object} featureTiers - Feature tiers from API
 * @param {object} tiers - All tiers data
 * @returns Observable
 */
const processFeatureTiers = (featureTiers, tiers) => {
    if (!featureTiers?.data?.elements) {
        return Rx.Observable.empty();
    }
    const allTiers = featureTiers.data.elements.map(t => {
        const matchingTier = find(tiers.data.elements, ["tiers.nom", t.tiers.nom]);
        return {...matchingTier, ...t};
    });
    return Rx.Observable.of(loadTiers(allTiers));
};

/**
 * Helper: Get feature tiers and process them
 * @param {string} layerUrl - Layer URL
 * @param {string} featureId - Feature ID
 * @param {object} tiers - All tiers data
 * @returns Observable
 */
const fetchAndProcessFeatureTiers = (layerUrl, featureId, tiers) => {
    return Rx.Observable.defer(() => getFeatureTiers(layerUrl, featureId))
        .switchMap(featureTiers => processFeatureTiers(featureTiers, tiers));
};

/**
 * Helper: Associate tier after fetching tier data
 * @param {string} layerUrl - Layer URL
 * @param {string} featureId - Feature ID
 * @param {object} tiers - Tiers data
 * @param {object} tierData - Tier to associate
 * @returns Observable
 */
const associateTierWithData = (layerUrl, featureId, tiers, tierData) => {
    const tierId = tiers?.data?.elements[0]?.id;
    const typeTierId = tierData.typeTiers.id;
    return Rx.Observable.defer(() => associateFeatureTier(layerUrl, featureId, tierId, typeTierId))
        .catch(e => {
            console.log("Error on tier association");
            console.log(e);
            return Rx.Observable.of({data: []});
        });
};

/**
 * Helper: Handle tier change association
 * @param {string} layerUrl - Layer URL
 * @param {string} featureId - Feature ID
 * @param {object} tier - Tier data
 * @returns Observable
 */
const handleTierChangeAssociation = (layerUrl, featureId, tier) => {
    return Rx.Observable.defer(() =>
        changeFeatureTierAssociation(
            layerUrl,
            featureId,
            tier.tiers.id,
            tier.typeTiers.id,
            tier.id
        )
    ).catch(e => {
        console.log("Error on change feature tier association");
        console.log(e);
        return Rx.Observable.of({data: []});
    });
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
 * Tier association
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function associateTabou2Tier(action$, store) {
    return action$.ofType(ASSOCIATE_TIER)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            const {featureId, layerUrl} = getInfos(store.getState());
            const tierName = action.tier.tiers.nom;

            return Rx.Observable.defer(() => getTiers({nom: tierName}))
                .switchMap(tiers => associateTierWithData(layerUrl, featureId, tiers, action.tier))
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
            const toDoOnUpdate = get(actionOnUpdate, action.type);
            const {featureId, layerUrl} = getInfos(store.getState());

            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.tier))
                .switchMap(() => {
                    if (action.type !== "CHANGE_FEATURE_TIER") {
                        return Rx.Observable.of(mapTiers());
                    }
                    return handleTierChangeAssociation(layerUrl, featureId, action.tier);
                })
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
            const {featureId, layerUrl} = getInfos(store.getState());

            return Rx.Observable.defer(() => getTiers())
                .switchMap(tiers => {
                    if (!tiers?.data?.elements) {
                        return Rx.Observable.empty();
                    }
                    return fetchAndProcessFeatureTiers(layerUrl, featureId, tiers);
                });
        });
}
