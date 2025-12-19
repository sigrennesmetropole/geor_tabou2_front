import * as Rx from 'rxjs';
import {keys} from 'lodash';
import {
    resetCqlFilters,
    RESET_SEARCH_FILTERS,
    UPDATE_LAYER_PARAMS,
    SEARCH_IDS,
    setTabouFilterObj,
    loading,
    setTabouErrors,
    setTabouFilteredFeatures,
    resetTabouFilteredFeatures
} from '../actions/tabou2';
import {layersSelector} from '@mapstore/selectors/layers';
import {
    currentTabouFilters,
    getLayerFilterObj,
    isTabou2Activate,
    getPluginCfg,
    getFilteredFeatures
} from '../selectors/tabou2';
import {changeLayerParams, changeLayerProperties} from "@mapstore/actions/layers";
import {wrapStartStop} from "@mapstore/observables/epics";
import {error, success} from "@mapstore/actions/notifications";
import {getMessageById} from "@mapstore/utils/LocaleUtils";
import {newfilterLayerByList} from "../utils/search";
import {createOGCRequest} from "../api/requests";
import VectorSource from 'ol/source/Vector';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Feature from 'ol/Feature';
import {zoomToExtent} from "@mapstore/actions/map";


/**
 * From Tabou2 search panel, apply filter for each Tabou layers.
 * This action create filter replace filters inside TOC filter panel.
 * @param {*} action$
 * @param {*} store
 */
export function tabouApplyFilter(action$, store) {
    return action$.ofType(UPDATE_LAYER_PARAMS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(action => {
            let filterObj = getLayerFilterObj(store.getState()) ?? {};
            const tocLayers = layersSelector(store.getState()) ?? [];
            let layer = tocLayers.filter(lyr => lyr.name === action.layerToFilter);
            if (!action.layerToFilter || !filterObj[action.layerToFilter] || !layer.length) {
                return Rx.Observable.empty();
            }
            filterObj = filterObj[action.layerToFilter];
            layer = layer[0];
            filterObj.filterFields = filterObj?.filterFields || [];
            filterObj.crossLayerFilter = filterObj?.crossLayerFilter || null;
            filterObj.spatialField = filterObj?.spatialField || null;
            let filteredFeatures = getFilteredFeatures(store.getState());
            let zoom = false;
            let vectorSource = new VectorSource();
            if (filteredFeatures !== undefined && filteredFeatures.length !== 0) {
                const features = filteredFeatures.map(feature => new Feature(new MultiPolygon(feature.geometry.coordinates)));
                vectorSource.addFeatures(features);
                zoom = true;
            }
            return Rx.Observable.of(
                changeLayerProperties(layer.id, {layerFilter: filterObj.tocFilter}),
                zoom && zoomToExtent(vectorSource.getExtent(), 'EPSG:3948', 21, {})
            );
        });
}

/**
 * Reset filters for each layers.
 * This affect layer filter and reset TOC filter panel.
 * @param {*} action$
 * @param {*} store
 */
export function tabouResetFilter(action$, store) {
    return action$.ofType(RESET_SEARCH_FILTERS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            const layers = action.layers || keys(currentTabouFilters(store.getState()));
            const tocLayers = layersSelector(store.getState()) ?? [];
            const layersId = tocLayers.filter(layer => layers.indexOf(layer.name) > -1).map(layer => layer.id);
            return Rx.Observable.from((layersId)).mergeMap(id => {
                return Rx.Observable.of(
                    resetCqlFilters(),
                    changeLayerParams(id, {cql_filter: undefined}),
                    changeLayerProperties(id, {layerFilter: undefined}),
                    setTabouErrors(false, "filter", "", ""),
                    resetTabouFilteredFeatures()
                );
            });
        });
}

// Fonctions helper définies avant leur utilisation
function handleRequestError(e) {
    console.log("Error retrieving ids from filter", e);
    return Rx.Observable.of({totalFeatures: 0, features: [], fail: true});
}

function processFeatures(response, filter, searchLimit) {
    if (!response?.totalFeatures || response.features.length >= searchLimit) {
        if (response.features.length > searchLimit) {
            return {isOverLimit: true};
        }
        const idsCql = `${filter.idField} = -1`;
        return {ids: [], idsCql, displayNoResult: true, isOverLimit: false};
    }

    const ids = response.features
        .map(feature => feature.properties.id_tabou || '')
        .filter(id => id);

    let correctIds;
    if (filter.idType === 'string') {
        correctIds = ids.map(i => `'${i}'`);
    } else {
        correctIds = ids.length ? ids : [0];
    }

    const idsCql = correctIds.map(id => `${filter.idField} = ${id}`).join(' OR ');

    return {ids, idsCql, displayNoResult: false, isOverLimit: false};
}

function createNotificationAction(displayNoResult, messages) {
    return displayNoResult
        ? setTabouErrors(false, "filter", "warning", getMessageById(messages, "tabou2.search.noResultLayer"))
        : success({
            title: getMessageById(messages, "tabou2.search.filterLayer"),
            message: getMessageById(messages, "tabou2.search.requestSuccess")
        });
}

function handleResponse(response, filter, messages, searchLimit, store) {
    if (response?.fail) {
        return Rx.Observable.empty();
    }

    const {ids, idsCql, displayNoResult, isOverLimit} = processFeatures(response, filter, searchLimit);

    if (isOverLimit) {
        return Rx.Observable.of(
            setTabouErrors(true, "filter", "danger", getMessageById(messages, "tabou2.search.maxSearchLimit"))
        );
    }

    return Rx.Observable.of(
        createNotificationAction(displayNoResult, messages),
        setTabouFilterObj({
            ...getLayerFilterObj(store.getState()),
            [filter.layer]: newfilterLayerByList(filter.layer, ids, "id_tabou", idsCql)
        }),
        setTabouFilteredFeatures(response.features)
    );
}

function processFilter(filter, messages, searchLimit, store) {
    return Rx.Observable.defer(() => createOGCRequest(filter.params, getPluginCfg(store.getState()).geoserverURL))
        .catch(handleRequestError)
        .switchMap(response => handleResponse(response, filter, messages, searchLimit, store));
}

function wrapObservableWithErrorHandling(observable$, messages) {
    return observable$.let(
        wrapStartStop(
            [loading(true, "search"), setTabouErrors(false, "filter")],
            loading(false, "search"),
            () => Rx.Observable.of(
                error({
                    title: getMessageById(messages, "tabou2.infos.error"),
                    message: getMessageById(messages, "tabou2.infos.failFilter")
                }),
                loading(false, "search")
            )
        )
    );
}

/**
 * Reset filters for each layers.
 * This affect layer filter and reset TOC filter panel.
 * @param {*} action$
 * @param {*} store
 */

export function tabouGetSearchIds(action$, store) {
    return action$.ofType(SEARCH_IDS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            resetTabouFilteredFeatures();
            const messages = store.getState()?.locale.messages;
            const searchLimit = getPluginCfg(store.getState()).searchCfg?.limit || 100000;

            const observable$ = Rx.Observable.from(action.params)
                .mergeMap(filter => processFilter(filter, messages, searchLimit, store));

            return wrapObservableWithErrorHandling(observable$, messages);
        });
}
