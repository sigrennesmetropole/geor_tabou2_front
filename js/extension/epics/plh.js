import * as Rx from 'rxjs';
import {
    ADD_PLH_PROGRAMME,
    DELETE_PLH_PROGRAMME,
    GET_PLH_PROGRAMME,
    GET_PLHS_PROGRAMME,
    GET_TYPES_PLH_AVAILABLE,
    getPLHsProgramme,
    getTypesPLHAvailable, setPLHIsLoading,
    setPLHProgramme,
    setPLHsProgramme,
    setTabouFicheInfos,
    setTypesPLH,
    UPDATE_PLH_PROGRAMME
} from '../actions/tabou2';

import {
    createOperationTypePLH,
    createProgrammeTypePLH,
    deleteOperationTypePLH,
    deleteProgrammeTypePLH,
    getOperation,
    getOperationPLHs,
    getOperationTypePLH,
    getProgramme, getProgrammeTypePLH,
    getTypesPLH,
    updateOperationTypePLH,
    updateProgrammeTypePLH
} from '../api/requests';

import { isTabou2Activate, getInfos } from '../selectors/tabou2';
import {error, success} from "@mapstore/actions/notifications";
import {wrapStartStop} from "@mapstore/observables/epics";

const isOperationLayer = (layerCfg) => layerCfg === "layerOA" || layerCfg === "layerSA";

/**
 * Epics to load typePLH for a programme
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function getTypesPLHAvailableEpic(action$, store) {
    return action$.ofType(GET_TYPES_PLH_AVAILABLE)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(() => {
            let {featureId, layerCfg} = getInfos(store.getState());
            const programmeId = isOperationLayer(layerCfg) ? undefined : featureId;
            const operationId = isOperationLayer(layerCfg) ? featureId : undefined;
            return Rx.Observable.defer(() => getTypesPLH(programmeId, operationId))
                .switchMap( response => {
                    return Rx.Observable.of(setTypesPLH(response?.elements || []));
                }).catch(() => {
                    return Rx.Observable.of(error({message: "tabou2.suiviPLH.get-typeplh-failure"}));
                });
        });
}

export function getPLHSProgrammeEpic(action$, store) {
    return action$.ofType(GET_PLHS_PROGRAMME)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(() => {
            let {featureId, layerCfg} = getInfos(store.getState());
            const isOperation = isOperationLayer(layerCfg);
            const fetchPLHs = isOperation
                ? () => getOperationPLHs(featureId).then(data => data || [])
                : () => getProgramme(featureId).then(response => response?.data?.typePLHsBeans || []);
            return Rx.Observable.defer(() => fetchPLHs())
                .switchMap( plhs => {
                    return Rx.Observable.of(setPLHsProgramme(plhs));
                }).catch(() => {
                    return Rx.Observable.of(error({message: "tabou2.suiviPLH.get-plhs-programme-failure"}));
                });
        });
}

export function deletePLHProgrammeEpic(action$, store) {
    return action$.ofType(DELETE_PLH_PROGRAMME)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let {featureId, layerCfg} = getInfos(store.getState());
            const deletePLH = isOperationLayer(layerCfg) ? deleteOperationTypePLH : deleteProgrammeTypePLH;
            return Rx.Observable.defer(() => deletePLH(featureId, action.idTypePLH))
                .switchMap( () => {
                    const currentPlhs = store.getState().tabou2?.plhsProgramme || [];
                    const filteredPlhs = currentPlhs.filter(p => p.id !== action.idTypePLH);
                    return Rx.Observable.of(
                        setPLHsProgramme(filteredPlhs),
                        getTypesPLHAvailable(),
                        getPLHsProgramme(),
                        success({
                            title: "tabou2.infos.successApi",
                            message: "tabou2.suiviPLH.delete-success"})
                    );
                }).let(
                    wrapStartStop(
                        setPLHIsLoading(true),
                        setPLHIsLoading(false),
                        () => {
                            return Rx.Observable.of(
                                error({
                                    title: "tabou2.infos.error",
                                    message: "tabou2.suiviPLH.delete-failure"
                                }),
                                setPLHIsLoading(false)
                            );
                        }
                    )
                );
        });
}

export function updatePLHProgrammeEpic(action$, store) {
    return action$.ofType(UPDATE_PLH_PROGRAMME)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let {featureId, layerCfg} = getInfos(store.getState());
            const isOperation = isOperationLayer(layerCfg);
            const updatePLH = isOperation
                ? () => updateOperationTypePLH(featureId, action?.plh?.id, action.plh)
                : () => updateProgrammeTypePLH(featureId, action.plh);
            return Rx.Observable.defer(() => updatePLH())
                .switchMap((response) => {
                    if (isOperation) {
                        return Rx.Observable.defer(() => getOperation(featureId))
                            .switchMap(({data}) => Rx.Observable.of(
                                setPLHProgramme(response?.data || {}),
                                setTabouFicheInfos("operation", data || {}),
                                getPLHsProgramme(),
                                success({
                                    title: "tabou2.infos.successApi",
                                    message: "tabou2.suiviPLH.update-success"
                                })
                            ));
                    }
                    return Rx.Observable.of(
                        setPLHProgramme(response?.data || {}),
                        success({
                            title: "tabou2.infos.successApi",
                            message: "tabou2.suiviPLH.update-success"
                        })
                    );
                }).let(
                    wrapStartStop(
                        setPLHIsLoading(true),
                        setPLHIsLoading(false),
                        () => {
                            return Rx.Observable.of(
                                error({
                                    title: "tabou2.infos.error",
                                    message: "tabou2.suiviPLH.update-failure"
                                }),
                                setPLHIsLoading(false)
                            );
                        }
                    )
                );
        });
}

export function addPLHProgrammeEpic(action$, store) {
    return action$.ofType(ADD_PLH_PROGRAMME)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let {featureId, layerCfg} = getInfos(store.getState());

            const addPLHRequest = isOperationLayer(layerCfg)
                ? () => Rx.Observable.defer(() => createOperationTypePLH(featureId, action.idTypePLH))
                : () => Rx.Observable.defer(() => createProgrammeTypePLH(featureId, action.idTypePLH));

            return addPLHRequest()
                .switchMap(() => {
                    return Rx.Observable.of(getTypesPLHAvailable(),
                        getPLHsProgramme(),
                        success({
                            title: "tabou2.infos.successApi",
                            message: "tabou2.suiviPLH.add-success"}
                        ));
                }).let(
                    wrapStartStop(
                        setPLHIsLoading(true),
                        setPLHIsLoading(false),
                        () => {
                            return Rx.Observable.of(
                                error({
                                    title: "tabou2.infos.error",
                                    message: "tabou2.suiviPLH.add-failure"
                                }),
                                setPLHIsLoading(false)
                            );
                        }
                    )
                );
        });
}

export function getPLHProgrammeEpic(action$, store) {
    return action$.ofType(GET_PLH_PROGRAMME)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let {featureId, layerCfg} = getInfos(store.getState());
            const isOperation = isOperationLayer(layerCfg);
            const getPLH = isOperation ? getOperationTypePLH : getProgrammeTypePLH;
            return Rx.Observable.defer(() => getPLH(featureId, action.idTypePLH))
                .switchMap( response => {
                    return Rx.Observable.of(setPLHProgramme(response?.data || {}));
                }).let(
                    wrapStartStop(
                        setPLHIsLoading(true),
                        setPLHIsLoading(false),
                        () => {
                            const errorMessage = isOperation ? "tabou2.suiviPLH.get-plh-operation-failure" : "tabou2.suiviPLH.get-plh-programme-failure";
                            return Rx.Observable.of(
                                error({
                                    title: "tabou2.infos.error",
                                    message: errorMessage
                                }),
                                setPLHIsLoading(false)
                            );
                        }
                    )
                );
        });
}
