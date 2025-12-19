import * as Rx from 'rxjs';
import {get, isEmpty} from 'lodash';
import {
    loadEvents,
    RELOAD_LAYER,
    CREATE_FEATURE,
    SELECT_FEATURE,
    loadFicheInfos,
    loading,
    mapTiers,
    reloadLayer,
    displayFeature,
    getTabouVocationsInfos,
    setSelectedFeature
} from '../actions/tabou2';
import {getMessageById} from "@mapstore/utils/LocaleUtils";

import {
    isTabou2Activate,
    getSelection,
    getInfos
} from '../selectors/tabou2';

import {
    getFeatureEvents,
    getProgramme,
    getProgrammePermis,
    getOperation,
    getOperationProgrammes,
    getSecteur,
    getProgrammeAgapeo,
    createNewTabouFeature
} from '../api/requests';

import {URL_ADD} from '../constants';
import {wrapStartStop} from "@mapstore/observables/epics";
import {error, success} from "@mapstore/actions/notifications";
import {refreshLayerVersion} from "@mapstore/actions/layers";
import {layersSelector} from '@mapstore/selectors/layers';

import uuid from "uuid";

// get feature from API according to selected layer feature
const resetFeatureBylayer = {
    "layerOA": (id) => getOperation(id),
    "layerPA": (id) => getProgramme(id),
    "layerSA": (id) => getSecteur(id)
};

const selectInfos = {
    operation: null,
    programme: null,
    programmes: null,
    tiers: null,
    permis: null
};

/**
 * Helper: Create info object for OA layer
 * @param {object} programmes - Programmes data
 * @param {object} searchItem - Search item
 * @param {array} tiers - Tiers array
 * @param {object} mapFeature - Map feature
 * @returns Observable
 */
const createOAInfos = (programmes, searchItem, tiers, mapFeature) => {
    const identifyPanelInfos = {
        ...selectInfos,
        uuid: uuid.v1(),
        programmes: programmes.data,
        operation: {...searchItem},
        tiers: tiers,
        mapFeature: mapFeature
    };
    return Rx.Observable.of(loadFicheInfos(identifyPanelInfos))
        .concat(Rx.Observable.of(getTabouVocationsInfos(searchItem?.id)));
};

/**
 * Helper: Create info object for SA layer
 * @param {object} parentData - Parent operation data
 * @param {object} searchItem - Search item
 * @param {array} tiers - Tiers array
 * @param {object} mapFeature - Map feature
 * @returns Observable
 */
const createSAInfos = (parentData, searchItem, tiers, mapFeature) => {
    const identifyPanelInfos = {
        ...selectInfos,
        uuid: uuid.v1(),
        operation: {...searchItem},
        operationParent: {...parentData?.data},
        tiers: tiers,
        mapFeature: mapFeature
    };
    return Rx.Observable.of(loadFicheInfos(identifyPanelInfos))
        .concat(Rx.Observable.of(getTabouVocationsInfos(searchItem?.id)));
};

/**
 * Helper: Create info object for PA layer
 * @param {object} agapeo - Agapeo data
 * @param {object} permis - Permis data
 * @param {object} operation - Operation data
 * @param {object} searchItem - Search item
 * @param {array} tiers - Tiers array
 * @param {object} mapFeature - Map feature
 * @returns object
 */
const createPAInfos = (agapeo, permis, operation, searchItem, tiers, mapFeature) => {
    return {
        ...selectInfos,
        uuid: uuid.v1(),
        agapeo: agapeo.data.elements,
        programme: searchItem,
        permis: permis.data,
        tiers: tiers,
        operation: operation?.data,
        mapFeature: mapFeature
    };
};

/**
 * Helper: Fetch agapeo and permis data for PA layer
 * @param {object} searchItem - Search item
 * @returns Observable
 */
const fetchAgapeoAndPermis = (searchItem) => {
    const agapeo$ = Rx.Observable.defer(() => getProgrammeAgapeo(searchItem?.id))
        .catch(e => {
            console.log("Error on get Agapeo data request");
            console.log(e);
            return Rx.Observable.of({elements: []});
        });

    const permis$ = Rx.Observable.defer(() => getProgrammePermis(searchItem?.id))
        .catch(e => {
            console.log("Error retrieving PA permis request");
            console.log(e);
            return Rx.Observable.of({data: []});
        });

    return {agapeo$, permis$};
};

/**
 * Helper: Process PA layer data
 * @param {object} operation - Operation data
 * @param {object} searchItem - Search item
 * @param {array} tiers - Tiers array
 * @param {object} mapFeature - Map feature
 * @param {object} messages - Messages object
 * @returns Observable
 */
const processPALayerData = (operation, searchItem, tiers, mapFeature, messages) => {
    if (!searchItem?.operationId) {
        console.log("Can't read correct infos !");
        return Rx.Observable.of(
            error({
                title: getMessageById(messages, "tabou2.infos.failApi"),
                message: getMessageById(messages, "tabou2.infos.failErrorData")
            })
        );
    }

    const {agapeo$, permis$} = fetchAgapeoAndPermis(searchItem);

    return agapeo$.switchMap(agapeo => {
        return permis$.switchMap(permis => {
            const infos = createPAInfos(agapeo, permis, operation, searchItem, tiers, mapFeature);
            return Rx.Observable.of(loadFicheInfos(infos));
        });
    });
};

/**
 * Helper: Build second observable based on layer type
 * @param {string} layerCfg - Layer configuration
 * @param {object} searchItem - Search item
 * @param {array} tiers - Tiers array
 * @param {object} mapFeature - Map feature
 * @param {object} messages - Messages object
 * @returns Observable
 */
const buildSecondObservable = (layerCfg, searchItem, tiers, mapFeature, messages) => {
    if (layerCfg === "layerOA") {
        return Rx.Observable.defer(() => getOperationProgrammes(searchItem?.id))
            .catch(e => {
                console.log("Error retrieving on OA or SA programmes request");
                console.log(e);
                return Rx.Observable.of({data: []});
            })
            .switchMap(programmes => createOAInfos(programmes, searchItem, tiers, mapFeature));
    }

    if (layerCfg === "layerSA") {
        return Rx.Observable.defer(() => {
            if (searchItem?.parentId) {
                return getOperation(searchItem.parentId);
            }
            return Rx.Observable.of(null);
        })
            .catch(e => {
                console.log("Error retrieving get operation request");
                console.log(e);
                return Rx.Observable.of({data: []});
            })
            .switchMap(parentData => createSAInfos(parentData, searchItem, tiers, mapFeature));
    }

    // PA layer
    return Rx.Observable.defer(() => getOperation(searchItem.operationId))
        .catch(e => {
            console.log("Error retrieving get operation request");
            console.log(e);
            return Rx.Observable.of({data: []});
        })
        .switchMap(operation => processPALayerData(operation, searchItem, tiers, mapFeature, messages));
};

/**
 * Process to get all info from selected feature.
 * Many services was called, and some infos was keep from clicked map feature.
 * @param {any} action$
 * @param {any} store
 * @returns action
 */
export function getSelectionInfos(action$, store) {
    return action$.ofType(SELECT_FEATURE)
        .filter((action) => isTabou2Activate(store.getState()) && get(action?.selectedFeature?.feature, "properties.id_tabou"))
        .switchMap((action) => {
            const messages = store.getState()?.locale.messages;
            const idTabou = get(action.selectedFeature.feature, "properties.id_tabou");
            const tiers = [];
            const layerCfg = action.selectedFeature.layer;
            const layerUrl = get(URL_ADD, layerCfg);
            let searchItem = null;
            const mapFeature = action.selectedFeature.feature;

            const firstObservable$ = Rx.Observable.defer(() => getFeatureEvents(layerUrl, idTabou))
                .catch(e => {
                    console.log("Error retrieving on OA or SA events request");
                    console.log(e);
                    return Rx.Observable.of({data: []});
                })
                .switchMap(response => {
                    return Rx.Observable.of(loadEvents(response?.data?.elements || []));
                })
                .concat(Rx.Observable.of(mapTiers()))
                .concat(
                    Rx.Observable.defer(() => resetFeatureBylayer[layerCfg](idTabou))
                        .catch(e => {
                            console.log("Fail to get selected tabou feature infos");
                            console.log(e);
                            return Rx.Observable.of(e);
                        })
                        .switchMap((response) => {
                            if (isEmpty(response?.data)) {
                                return Rx.Observable.of(
                                    error({
                                        title: getMessageById(messages, "tabou2.infos.failApi"),
                                        message: getMessageById(messages, "tabou2.infos.apiGETError")
                                    })
                                );
                            }
                            searchItem = response.data;
                            return buildSecondObservable(layerCfg, searchItem, tiers, mapFeature, messages);
                        })
                );

            return firstObservable$.let(
                wrapStartStop(
                    [loading(true, "identify")],
                    loading(false, "identify"),
                    () => {
                        return Rx.Observable.of(
                            error({
                                title: getMessageById(messages, "tabou2.infos.failApi"),
                                message: getMessageById(messages, "tabou2.infos.failIdentify")
                            }),
                            loading(false, "identify")
                        );
                    }
                )
            );
        });
}

/**
 * Epic to create PA, OA, SA Feature. This action will create new Tabou feature from selected geom.
 * @param {any} action$
 * @param {any} store
 * @returns empty
 */
export function createTabouFeature(action$, store) {
    return action$.ofType(CREATE_FEATURE)
        .switchMap(action => {
            let infos = getInfos(store.getState());
            let messages = store.getState()?.locale.messages;
            let layerUrl = infos?.layerUrl || get(URL_ADD, action.layer.value);
            let layer = infos.layer || action.layer.name;
            const selected = getSelection(store.getState());
            return Rx.Observable.defer(() => createNewTabouFeature(layerUrl, action.params))
                .catch(e => {
                    console.log("Error to save feature change or feature creation");
                    console.log(e);
                    return Rx.Observable.of(e,
                        reloadLayer(layer),
                        setSelectedFeature({...selected, id: selected.id, feature: selected.feature})
                    );
                })
                .switchMap((el) => {
                    // create new feature with updated id tabou after new tabou item
                    const newFeature = {...selected.feature, properties: {...selected.feature.properties, id: el.data.id}};
                    return el?.status !== 200 ? Rx.Observable.of(
                    // fail message
                        error({
                            title: getMessageById(messages, "tabou2.infos.failApi"),
                            message: getMessageById(messages, "tabou2.infos.failAddFeature")
                        })
                    ) : Rx.Observable.of(
                    // success message
                        success({
                            title: getMessageById(messages, "tabou2.infos.successApi"),
                            message: getMessageById(messages, "tabou2.infos.successAddFeature")
                        }),
                        reloadLayer(layer),
                        displayFeature({feature: el.data, layer: layer}),
                        setSelectedFeature({...selected, id: selected.id, feature: newFeature})
                    );
                });
        });
}

/**
 * Epic force refresh layer
 * @param {any} action$
 * @param {any} store
 * @returns empty
 */
export function onLayerReload(action$, store) {
    return action$.ofType(RELOAD_LAYER)
        .switchMap(action => {
            let layer = layersSelector(store.getState()).filter(lyr => lyr.name === action.layer);
            return Rx.Observable.of(refreshLayerVersion(layer[0].id));
        });
}
