import Rx from 'rxjs';
import { UPDATE_OPERATION } from '../actions/tabou2';
import { changeOperation } from '../api/requests';
import { isTabou2Activate } from '../selectors/tabou2';
import { error, success } from "@mapstore/actions/notifications";
import { getMessageById } from "@mapstore/utils/LocaleUtils";

export const onUpdateOperation = (action$, store) =>
    action$.ofType(UPDATE_OPERATION)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(({ operation }) => {
            let messages = store.getState()?.locale.messages;
            return Rx.Observable.defer(() => changeOperation(operation))
                .catch(e => {
                    console.log("Error on PUT operation");
                    console.log(e);
                    // fail message
                    return Rx.Observable.of({ ...e, data: null });
                })
                .switchMap(response => {
                    if (response?.status === 200 && response?.data) {
                        return Rx.Observable.of(
                            success({
                                title: getMessageById(messages, "tabou2.infos.successApi"),
                                message: getMessageById(messages, "tabou2.vocation.changeSuccess")
                            })
                        );
                    }
                    return Rx.Observable.of(
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.vocation.changeFail")
                        })
                    );
                });
        });
