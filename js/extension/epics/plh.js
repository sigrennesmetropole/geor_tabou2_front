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
    setTypesPLH,
    UPDATE_PLH_PROGRAMME
} from '../actions/tabou2';

import {
    createProgrammeTypePLH,
    deleteProgrammeTypePLH,
    getProgramme, getProgrammeTypePLH,
    getTypesPLH,
    updateProgrammeTypePLH
} from '../api/requests';

import { isTabou2Activate, getInfos } from '../selectors/tabou2';
import {error, success} from "@mapstore/actions/notifications";
import {wrapStartStop} from "@mapstore/observables/epics";

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
            let {featureId} = getInfos(store.getState());
            return Rx.Observable.defer(() => getTypesPLH(featureId))
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
            let {featureId} = getInfos(store.getState());
            return Rx.Observable.defer(() => getProgramme(featureId))
                .switchMap( response => {
                    return Rx.Observable.of(setPLHsProgramme(response?.data?.typePLHsBeans || []));
                }).catch(() => {
                    return Rx.Observable.of(error({message: "tabou2.suiviPLH.get-plhs-programme-failure"}));
                });
        });
}

export function deletePLHProgrammeEpic(action$, store) {
    return action$.ofType(DELETE_PLH_PROGRAMME)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let {featureId} = getInfos(store.getState());
            return Rx.Observable.defer(() => deleteProgrammeTypePLH(featureId, action.idTypePLH))
                .switchMap( () => {
                    return Rx.Observable.of(getTypesPLHAvailable(),
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
            let {featureId} = getInfos(store.getState());
            return Rx.Observable.defer(() => updateProgrammeTypePLH(featureId, action.plh))
                .switchMap( (response) => {
                    return Rx.Observable.of(setPLHProgramme(response.data),
                        success({
                            title: "tabou2.infos.successApi",
                            message: "tabou2.suiviPLH.update-success"}));
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
            let {featureId} = getInfos(store.getState());

            return Rx.Observable.defer(() => createProgrammeTypePLH(featureId, action.idTypePLH))
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
            let {featureId} = getInfos(store.getState());
            return Rx.Observable.defer(() => getProgrammeTypePLH(featureId, action.idTypePLH))
                .switchMap( response => {
                    return Rx.Observable.of(setPLHProgramme(response?.data || {}));
                }).let(
                    wrapStartStop(
                        setPLHIsLoading(true),
                        setPLHIsLoading(false),
                        () => {
                            return Rx.Observable.of(
                                error({
                                    title: "tabou2.infos.error",
                                    message: "tabou2.suiviPLH.get-plh-programme-failure"
                                }),
                                setPLHIsLoading(false)
                            );
                        }
                    )
                );
        });
}
