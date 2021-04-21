import * as Rx from 'rxjs';
import { loadEvents, SELECT_FEATURE } from '@ext/actions/tabou2';
import { getFeatureEvents, addFeatureEvent } from '@ext/api/search';

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

export function addTabou2Logs(action$, store) {
    return action$.ofType(ADD_EVENT)
        .switchMap((action) => {
            //const idTabou = action?.selectedFeature?.properties.id_zac || action?.selectedFeature?.properties.objectid;
            const idTabou = 3;
            // get events from API
            return Rx.Observable.empty();
            return Rx.Observable.defer(() => addFeatureEvent(action))
            .switchMap( events => {
                return Rx.Observable.of(loadEvents(events))
                }
            )
        });
}
