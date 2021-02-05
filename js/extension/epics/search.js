import * as Rx from 'rxjs';
import { keys } from 'lodash';
import { RESET_SEARCH_FILTERS, UPDATE_LAYER_PARAMS, setTabouFilterObj, applyFilterObj  } from '../actions/tabou2';
import { layersSelector } from '@mapstore/selectors/layers';
import { currentTabouFilters, getLayerFilterObj } from '../selectors/tabou2';
import { changeLayerProperties, updateNode } from "@mapstore/actions/layers";

export function tabouApplyFilter(action$, store) {
    return action$.ofType(UPDATE_LAYER_PARAMS).switchMap((action) => {

        let filterObj = getLayerFilterObj(store.getState()) ?? {};
        const tocLayers = layersSelector(store.getState()) ?? [];
        let layer = tocLayers.filter(lyr => lyr.name === action.layerToFilter);
        if(!action.layerToFilter || !filterObj[action.layerToFilter] || !layer.length) {
            return Rx.Observable.empty();
        }
        filterObj = filterObj[action.layerToFilter];
        layer = layer[0];
        filterObj.filterFields = filterObj.filterFields || [];
        filterObj.crossLayerFilter = filterObj.crossLayerFilter || null;
        filterObj.spatialField = filterObj.spatialField || null;

        return Rx.Observable.of(changeLayerProperties(layer.id, { layerFilter: filterObj }))
            .concat(Rx.Observable.of(updateNode(layer.id, "id", {})));
    });
}


export function tabouResetFilter(action$, store) {
    return action$.ofType(RESET_SEARCH_FILTERS).switchMap((action) => {
        const newFilterObj = {'tabou2:v_oa_programme':{},'tabou2:oa_secteur':{}, 'tabou2:za_sae':{}, 'tabou2:zac': {}};
        let filterObj = setTabouFilterObj(newFilterObj);
        const layers = keys(newFilterObj);

        const tocLayers = layersSelector(store.getState()) ?? [];
        const layersId = tocLayers.filter(layer => layers.indexOf(layer.name) > -1).map(layer => layer.id);
                
        return Rx.Observable.from((layersId)).mergeMap(id => {
            return Rx.Observable.of(changeLayerProperties(id, { layerFilter: {} }))
        });
    });
}