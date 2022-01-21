import Rx from 'rxjs';
import { isTabou2Activate, getInfos, getPluginCfg } from "../selectors/tabou2";
import { GET_TABOU_DOCUMENTS, setDocuments } from "../actions/tabou2";
import {
    getDocuments
} from "../api/requests";
/**
 * Epics to reload features events
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function getTabouDocuments(action$, store) {
    return action$.ofType(GET_TABOU_DOCUMENTS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            const resultByPage = getPluginCfg(store.getState()).apiCfg.documentsByPage;
            let {featureId, layerUrl} = getInfos(store.getState());
            let observable$ = Rx.Observable.empty();
            if (action.load) {
                observable$ = Rx.Observable.defer(() => getDocuments(layerUrl, featureId, action.page, resultByPage))
                    .switchMap(data => {
                        return Rx.Observable.of(setDocuments(data));
                    });
            } else {
                observable$ = Rx.Observable.of(setDocuments([]));
            }
            return observable$;
        });
}
