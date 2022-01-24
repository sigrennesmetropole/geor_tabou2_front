import Rx from 'rxjs';
import { error, success } from "@mapstore/actions/notifications";
import {getMessageById} from "@mapstore/utils/LocaleUtils";
import { isTabou2Activate, getInfos, getPluginCfg } from "../selectors/tabou2";
import { GET_TABOU_DOCUMENTS,
    setDocuments,
    TABOU_DOWNLOAD_DOC,
    DELETE_TABOU_DOCUMENTS,
    getDocuments,
    ADD_TABOU_DOC } from "../actions/tabou2";
import {
    getTabouDocuments,
    getDocumentContent,
    deleteDocuments,
    addDocument
} from "../api/requests";
import { downloadToBlob } from "../utils/identify";
import uuid from 'uuid';
/**
 * Epics to reload features events
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function listTabouDocuments(action$, store) {
    return action$.ofType(GET_TABOU_DOCUMENTS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            const resultByPage = getPluginCfg(store.getState()).apiCfg.documentsByPage;
            let {featureId, layerUrl} = getInfos(store.getState());
            let observable$ = Rx.Observable.empty();
            if (action.load) {
                observable$ = Rx.Observable.defer(() => getTabouDocuments(layerUrl, featureId, action.page, resultByPage))
                    .catch(e => {
                        console.log("Error - Get list of documents");
                        console.log(e);
                        // fail message
                        return Rx.Observable.of({...e, data: null});
                    })
                    .switchMap(data => {
                        return Rx.Observable.of(setDocuments({...data, id: uuid.v1()}));
                    });
            } else {
                observable$ = Rx.Observable.of(setDocuments({elements: [], id: uuid.v1()}));
            }
            return observable$;
        });
}

export function downloadTabouDocuments(action$, store) {
    return action$.ofType(TABOU_DOWNLOAD_DOC)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(({idDoc}) => {
            let messages = store.getState()?.locale.messages;
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => getDocumentContent(layerUrl, featureId, idDoc))
                .catch(e => {
                    console.log("Error - Can't download document");
                    console.log(e);
                    // fail message
                    return Rx.Observable.of({...e, data: null});
                })
                .switchMap(response => {
                    if (response?.status === 200 && response?.data) {
                        downloadToBlob(response, response.headers["content-type"]);
                        return Rx.Observable.of(
                            success({
                                title: getMessageById(messages, "tabou2.infos.successApi"),
                                message: getMessageById(messages, "tabou2.infos.successPrint")
                            })
                        );
                    }
                    return Rx.Observable.of(
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.infos.failDownload")
                        })
                    );
                });
        });
}

/**
 * Epics to delete a document
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function deleteTabouDocuments(action$, store) {
    return action$.ofType(DELETE_TABOU_DOCUMENTS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let messages = store.getState()?.locale.messages;
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => deleteDocuments(layerUrl, featureId, action.idDoc))
                .catch(e => {
                    console.log("Error - delete documents");
                    console.log(e);
                    // fail message
                    return Rx.Observable.of(
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.infos.failDocDelete")
                        }),
                        {...e, data: null}
                    );
                })
                .switchMap(() => {
                    return Rx.Observable.of(
                        success({
                            title: getMessageById(messages, "tabou2.infos.successApi"),
                            message: getMessageById(messages, "tabou2.infos.successDocDelete")
                        }),
                        getDocuments()
                    );
                });
        });
}

export function addNewDocument(action$, store) {
    return action$.ofType(ADD_TABOU_DOC)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let messages = store.getState()?.locale.messages;
            let {featureId, layerUrl} = getInfos(store.getState());
            return Rx.Observable.defer(() => addDocument(layerUrl, featureId, action.file, action.metadata))
                .catch(e => {
                    console.log("Error on create documents");
                    console.log(e);
                    // fail message
                    return Rx.Observable.of(
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.infos.failDocCreate")
                        }),
                        {...e, data: null}
                    );
                })
                .switchMap(() => {
                    return Rx.Observable.of(
                        success({
                            title: getMessageById(messages, "tabou2.infos.successApi"),
                            message: getMessageById(messages, "tabou2.infos.successDocCreate")
                        }),
                        getDocuments()
                    );
                });
        });
}
