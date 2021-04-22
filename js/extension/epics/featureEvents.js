import * as Rx from 'rxjs';
import { get, keys } from 'lodash';
import { loadEvents, SELECT_FEATURE, ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT } from '@ext/actions/tabou2';
import { getFeatureEvents, addFeatureEvent, deleteFeatureEvent, changeFeatureEvent } from '@ext/api/search';
import { getSelection, getLayer, getPluginCfg } from '@ext/selectors/tabou2';
import { LAYER_FIELD_OPTION, URL_ADD } from '@ext/constants';

const actionOnUpdate = {
    "ADD_FEATURE_EVENT": (layer, idFeature, event) => addFeatureEvent(layer, idFeature, event),
    "DELETE_FEATURE_EVENT": (layer, idFeature, event) => deleteFeatureEvent(layer, idFeature, event.id),
    "CHANGE_FEATURE_EVENT": (layer, idFeature, event) => changeFeatureEvent(layer, idFeature, event)
};
/**
 * call API to get events logs on feature selection
 * @param {any} action$
 * @param {any} store
 */
export function getTabou2Logs(action$, store) {
    return action$.ofType(SELECT_FEATURE)
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.id_zac || action?.selectedFeature?.properties.objectid;
            const idTabou = 3;
            // get events from API
            return Rx.Observable.defer(() => getFeatureEvents("operations", idTabou))
            .switchMap( events => {
                return Rx.Observable.of(loadEvents(events?.data || []))
                }
            )
        });
}

export function updateTabou2Logs(action$, store) {
    return action$.ofType(ADD_FEATURE_EVENT, DELETE_FEATURE_EVENT, CHANGE_FEATURE_EVENT)
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.id_zac || action?.selectedFeature?.properties.objectid;
            // selected feature and selected layer
            console.log('GO');
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
