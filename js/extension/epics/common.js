import * as Rx from 'rxjs';
import { DISPLAY_MSG } from '../actions/tabou2';
import { isTabou2Activate } from '../selectors/tabou2';
import { error, success, warning, info } from "@mapstore/actions/notifications";
import {getMessageById} from "@mapstore/utils/LocaleUtils";

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
