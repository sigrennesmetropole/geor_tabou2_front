import * as Rx from 'rxjs';
import { DISPLAY_MSG } from '../actions/tabou2';
import { isTabou2Activate } from '../selectors/tabou2';
import { error, success, warning, info } from "@mapstore/actions/notifications";
import { getMessageById } from "@mapstore/utils/LocaleUtils";

export { onTabouMapClick, onSelectionUpdate, showTabouClickMarker } from "./layer";
export { tabouApplyFilter, tabouResetFilter, tabouGetSearchIds } from "./search";
export { tabouLoadIdentifyContent, printProgramme, createChangeFeature,
    displayFeatureInfos, dipslayPASAByOperation, getFicheInfoValues } from './identify';
export { getSelectionInfos, createTabouFeature, onLayerReload } from './featureEvents';
export { updateTabou2Tier, addCreateTabou2Tier, getTiersElements, associateTabou2Tier } from './tiers';
export { updateTabou2Logs, getEventsElements } from "./logs";
export { listTabouDocuments, downloadTabouDocuments, deleteTabouDocuments, addNewDocument, updateDocument } from "./documents";
export { onUpdateOperation, onGetInfos } from "./vocations";
export { setTbarPosition, initMap, closeTabouExt } from "./setup";

const levels = {
    success: success,
    error: error,
    warning: warning,
    info: info
};

/**
 * Display a MapStore2 notification
 * The level of the notification. (one of "success"|"warning"|"info"|"error")
 * @param {*} action$
 * @param {*} store
 */
export function showNotification(action$, store) {
    return action$.ofType(DISPLAY_MSG)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap( action => {
            let messages = store.getState()?.locale.messages;
            return Rx.Observable.of(
                // error message
                levels[action.level]({
                    title: getMessageById(messages, action.title),
                    message: getMessageById(messages, action.message)
                })
            );
        });
}
