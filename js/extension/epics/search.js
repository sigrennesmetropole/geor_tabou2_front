import * as Rx from 'rxjs';
import { keys } from 'lodash';
import { resetCqlFilters, RESET_SEARCH_FILTERS, UPDATE_LAYER_PARAMS, SEARCH_IDS, setTabouFilterObj, loading, setTabouErrors } from '../actions/tabou2';
import { layersSelector } from '@mapstore/selectors/layers';
import { currentTabouFilters, getLayerFilterObj, isTabou2Activate, getPluginCfg } from '../selectors/tabou2';
import { changeLayerParams, changeLayerProperties } from "@mapstore/actions/layers";
import { wrapStartStop } from "@mapstore/observables/epics";
import { error } from "@mapstore/actions/notifications";
import {getMessageById} from "@mapstore/utils/LocaleUtils";
import { newfilterLayerByList } from "../utils/search";
import { createOGCRequest } from "../api/requests";

/**
 * From Tabou2 search panel, apply filter for each Tabou layers.
 * This action create filter replace filters inside TOC filter panel.
 * @param {*} action$
 * @param {*} store
 */
export function tabouApplyFilter(action$, store) {
    return action$.ofType(UPDATE_LAYER_PARAMS)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap( action => {
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
            return Rx.Observable.of(
                changeLayerProperties(layer.id, { layerFilter: filterObj.tocFilter })
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
                    changeLayerParams(id, { cql_filter: undefined }),
                    changeLayerProperties(id, { layerFilter: undefined }),
                    setTabouErrors(false, "filter", "", "")
                );
            });
        });
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
            let messages = store.getState()?.locale.messages;
            let observable$ = Rx.Observable.empty();
            observable$ = Rx.Observable.from((action.params)).mergeMap( filter => {
                return Rx.Observable.defer(() => createOGCRequest(filter.params, getPluginCfg(store.getState()).geoserverURL))
                    .catch(e => {
                        console.log("Error retrieving ids from filter");
                        console.log(e);
                        return Rx.Observable.of({totalFeatures: 0, features: [], fail: true});
                    })
                    .switchMap(response => {
                        if (response?.fail) {
                            return Rx.Observable.empty();
                        }
                        let layer = filter.layer;
                        let ids = [0];
                        let idsCql = "";
                        let searchLimit = getPluginCfg(store.getState()).searchCfg?.limit || 100000;
                        // Force limit to be sur TOC WMS request is not to huge and could be realize
                        if (response?.totalFeatures && response.features.length < searchLimit) {
                            ids = response.features.map(feature => feature.properties.id_tabou || '');
                            ids = ids.filter(id => id);
                            let correctIds = filter.idType === 'string' ? ids.map(i => `'${i}'`) : (ids.length ? ids : [0]);
                            // create entire filter string
                            idsCql = correctIds.map(id => `${filter.idField} = ${id}`).join(' OR ');
                        } else if (response.features.length > searchLimit) {
                            // reach CQL limit. Display message and avoid TOC filter layer error.
                            return Rx.Observable.of(setTabouErrors(true, "filter", "danger", getMessageById(messages, "tabou2.search.maxSearchLimit")));
                        } else {
                            // no result to filter
                            return Rx.Observable.of(setTabouErrors(false, "filter", "warning", getMessageById(messages, "tabou2.search.noResultLayer")));
                        }
                        // affect filter
                        return Rx.Observable.of(setTabouFilterObj({
                            ...getLayerFilterObj(store.getState()),
                            [layer]: newfilterLayerByList(layer, ids, "id_tabou", idsCql)
                        }));
                    });
            });
            return observable$.let(
                wrapStartStop(
                    [loading(true, "search"), setTabouErrors(false, "filter")],
                    loading(false, "search"),
                    () => {
                        return Rx.Observable.of(
                            error({
                                title: getMessageById(messages, "tabou2.infos.error"),
                                message: getMessageById(messages, "tabou2.infos.failFilter")
                            }),
                            loading(false, "search")
                        );
                    }
                )
            );
        });
}
