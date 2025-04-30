import Rx from 'rxjs';
import { UPDATE_OPERATION, GET_TABOU_VOCATIONS_INFOS, setTabouVocationsInfos  } from '../actions/tabou2';
import {
    getTypesContributionsId, getTypesProgrammationId, changeOperation, getTypesVocationsId
} from '../api/requests';
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

export const onGetInfos = (action$, store) =>
    action$.ofType(GET_TABOU_VOCATIONS_INFOS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(({ id }) => {
            return Rx.Observable.from([
                { name: "typesContribution", api: getTypesContributionsId },
                { name: "typesProgrammation", api: getTypesProgrammationId },
                { name: "typesVocation", api: getTypesVocationsId }
            ]).map(r =>
                Rx.Observable.defer(() => r.api(id))
                    .catch(e => {
                        console.log("Error on get getTabouVocationsInfos data request");
                        console.log(e);
                        return Rx.Observable.of({ data: [] });
                    })
                    .switchMap(({ data }) => {
                        return Rx.Observable.of({...r, data: data?.elements || [] });
                    })
            ).toArray().switchMap((requestArray) => {
                return Rx.Observable.forkJoin(requestArray).flatMap(elementArray =>
                    Rx.Observable.of(
                        setTabouVocationsInfos(elementArray[0].name, elementArray[0].data),
                        setTabouVocationsInfos(elementArray[1].name, elementArray[1].data),
                        setTabouVocationsInfos(elementArray[2].name, elementArray[2].data)
                    )
                );
            });
        });
