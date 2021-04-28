import * as Rx from 'rxjs';
import { get, keys } from 'lodash';
import { loadEvents, loadTiers, SELECT_FEATURE, ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT,
    ADD_FEATURE_TIER, DELETE_FEATURE_TIER, CHANGE_FEATURE_TIER, INACTIVATE_TIER
 } from '@ext/actions/tabou2';
import { getFeatureEvents, addFeatureEvent, deleteFeatureEvent, changeFeatureEvent, getFeatureTiers, getTiers, createTier, inactivateTier } from '@ext/api/search';
import { getSelection, getLayer, getPluginCfg } from '@ext/selectors/tabou2';
import { LAYER_FIELD_OPTION, URL_ADD } from '@ext/constants';

const actionOnUpdate = {
    "ADD_FEATURE_EVENT": (layer, idFeature, event) => addFeatureEvent(layer, idFeature, event),
    "DELETE_FEATURE_EVENT": (layer, idFeature, event) => deleteFeatureEvent(layer, idFeature, event.id),
    "CHANGE_FEATURE_EVENT": (layer, idFeature, event) => changeFeatureEvent(layer, idFeature, event),
    "DELETE_FEATURE_TIER": (layer, idFeature, tier) => deleteFeatureTier(layer, idFeature, tier.id),
    "CHANGE_FEATURE_TIER": (layer, idFeature, tier) => changeFeatureTier(layer, idFeature, tier),
    "INACTIVATE_TIER": (layer, idFeature, tier) => inactivateTier(layer, idFeature, tier.id),
};

const getInfos = (state) => {
    const feature = getSelection(state);
    const layer = getLayer(state);
    // get plugin config
    const layersCfg = getPluginCfg(state).layersCfg;
    // layerOA, layerPa, layerSA
    const configName = keys(layersCfg).filter(k => layer === layersCfg[k].nom)[0];
    // return correct name field id according to layer
    let featureId = get(feature, find(LAYER_FIELD_OPTION, ["name", configName]).id);
    // find correct api name
    let layerUrl = get(URL_ADD, configName);
    return {
        featureId: featureId,
        layerUrl: layerUrl
    }
}

/**
 * call API to get events logs on feature selection
 * @param {any} action$
 * @param {any} store
 */
export function getTabou2Logs(action$, store) {
    return action$.ofType(SELECT_FEATURE)
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.objectid || action?.selectedFeature?.properties.objectid;
            const idTabou = 3;
            // get events from API
            return Rx.Observable.defer(() => getFeatureEvents("operations", idTabou))
                .switchMap( response => {
                    return Rx.Observable.of(loadEvents(response?.data || []))
                })
                .concat(
                    // Rx.Observable.defer(() => getFeatureTiers("operations", idTabou))
                    Rx.Observable.defer(() => getTiers("operations", idTabou))
                    .switchMap( r => {
                        return Rx.Observable.of(loadTiers(r?.data?.elements || []))
                    })
                )
        });
}

export function updateTabou2Logs(action$, store) {
    return action$.ofType(ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT)
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.objectid || action?.selectedFeature?.properties.objectid;
            // selected feature and selected layer
            const feature = getSelection(store.getState());
            const layer = getLayer(store.getState());
            // get plugin config
            const layersCfg = getPluginCfg(store.getState()).layersCfg;
            // layerOA, layerPa, layerSA
            const configName = keys(layersCfg).filter(k => layer === layersCfg[k].nom)[0];
            // return correct name field id according to layer
            let featureId = get(feature, find(LAYER_FIELD_OPTION, ["name", configName]).id);
            // find correct api name
            let layerUrl = get(URL_ADD, configName);

            featureId = 3;
            layerUrl = "operations";
            let toDoOnUpdate = get(actionOnUpdate, action.type);

            // get events from API
            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.event))
            .switchMap( events => {
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
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.objectid || action?.selectedFeature?.properties.objectid;
            // selected feature and selected layer
            let {featureId, layerUrl} = getInfos(store.getState());
            console.log(action);
            // create tier first
            return Rx.Observable.empty();
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
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.objectid || action?.selectedFeature?.properties.objectid;
            // selected feature and selected layer
            let {featureId, layerUrl} = getInfos(store.getState());
            console.log("CHANGE, DELETE");
            return Rx.Observable.empty();
            return Rx.Observable.defer(() => toDoOnUpdate(layerUrl, featureId, action.tier))
            .switchMap( tiers => {
                    return Rx.Observable.defer(() => getFeatureTiers(layerUrl, featureId)).switchMap( tiers => {
                        return Rx.Observable.of(loadTiers(tiers?.data || []))
                        }
                    )
                }
            )
        });
}