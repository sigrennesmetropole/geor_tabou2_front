import * as Rx from 'rxjs';
import { keys } from 'lodash';
import { RESET_SEARCH_FILTERS, UPDATE_LAYER_PARAMS, SEARCH_IDS, setTabouFilterObj, loading } from '../actions/tabou2';
import { layersSelector } from '@mapstore/selectors/layers';
import { currentTabouFilters, getLayerFilterObj, isTabou2Activate, getPluginCfg } from '../selectors/tabou2';
import { changeLayerParams, changeLayerProperties } from "@mapstore/actions/layers";
import { wrapStartStop } from "@mapstore/observables/epics";
import { error } from "@mapstore/actions/notifications";
import {getMessageById} from "@mapstore/utils/LocaleUtils";
import { getNewFilter } from "@ext/utils/search";
import { getIdsFromSearch } from "@ext/api/search";

/**
 * From Tabou2 search panel, apply filter for each Tabou layers.
 * This action create filter replace filters inside TOC filter panel.
 * @param {*} action$
 * @param {*} store
 */
export function tabouApplyFilter(action$, store) {
    return action$.ofType(UPDATE_LAYER_PARAMS)
    .filter(() => isTabou2Activate(store.getState()))
    .switchMap((action) => {
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
        return Rx.Observable.of(changeLayerProperties(layer.id, { layerFilter: filterObj.tocFilter }));
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
    .switchMap(() => {
        const layers = keys(currentTabouFilters(store.getState()));
        const tocLayers = layersSelector(store.getState()) ?? [];
        const layersId = tocLayers.filter(layer => layers.indexOf(layer.name) > -1).map(layer => layer.id);

        return Rx.Observable.from((layersId)).mergeMap(id => {
            return Rx.Observable.of(changeLayerParams(id, { cql_filter: undefined }))
            .concat(Rx.Observable.of(changeLayerProperties(id, { layerFilter: undefined })))
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
            return Rx.Observable.defer(() => getIdsFromSearch(filter.params, getPluginCfg(store.getState()).geoserverURL))
            .catch(e => {
                console.log("Error retrieving ids from filter");
                console.log(e);
                return Rx.Observable.of({totalFeatures: 0, features: [], fail: true});
            })
            .switchMap(response => {
                if (response?.fail) {
                    return Rx.Observable.empty();
                }
                let filters = getLayerFilterObj(store.getState());
                let layer = filter.layer;
                let ids = [0];
                let idsCql = "";
                if (response?.totalFeatures) {
                    ids = response.features.map(feature => feature.properties.objectid || '');
                    ids = ids.filter(id => id);
                    let correctIds = filter.idType === 'string' ? ids.map(i => `'${i}'`) : (ids.length ? ids : [0]);
                    // create entire filter string
                    idsCql = correctIds.map(id => `${filter.idField} = ${id}`).join(' OR ');
                }
                // create toc filter
                let newFilter = getNewFilter(layer, null, [], null);
                newFilter.filterFields = ids.map((id,idx) => ({
                    "rowId": new Date().getTime()+ idx,
                    "groupId": 1,
                    "attribute": "objectid",
                    "operator": "=",
                    "value": id,
                    "type": "number",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null
                }));
                // prepare filter
                filters[layer] = {
                    cql: idsCql,
                    layerToFilter: layer,
                    tocFilter : newFilter
                };

                // affect filter
                return Rx.Observable.of(setTabouFilterObj(filters));
            })
        });

        return observable$.let(
            wrapStartStop(
                [loading(true, "search")],
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
        )
    });
}