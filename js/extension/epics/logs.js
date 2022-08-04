import * as Rx from 'rxjs';
import { get } from 'lodash';
import {
    loadEvents,
    ADD_FEATURE_EVENT,
    DELETE_FEATURE_EVENT,
    CHANGE_FEATURE_EVENT,
    getApiEvents,
    GET_EVENTS
} from '../actions/tabou2';

import {
    getFeatureEvents,
    addFeatureEvent,
    deleteFeatureEvent,
    changeFeatureEvent
} from '../api/requests';

import { isTabou2Activate, getInfos } from '../selectors/tabou2';

// get service to request according to action type
const actionOnUpdate = {
    "ADD_FEATURE_EVENT": (layer, idFeature, event) => addFeatureEvent(layer, idFeature, event),
    "DELETE_FEATURE_EVENT": (layer, idFeature, event) => deleteFeatureEvent(layer, idFeature, event.id),
    "CHANGE_FEATURE_EVENT": (layer, idFeature, event) => changeFeatureEvent(layer, idFeature, event)
};

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
