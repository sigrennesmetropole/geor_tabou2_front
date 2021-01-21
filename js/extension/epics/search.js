import * as Rx from 'rxjs';
import { SET_TABOU_FILTERS } from '../actions/tabou2';
import { layersSelector } from '@mapstore/selectors/layers';
import { currentTabouFilters } from '../selectors/tabou2';
import { changeLayerProperties, updateNode } from "@mapstore/actions/layers";

export function tabouApplyFilter(action$, store) {
    return action$.ofType(SET_TABOU_FILTERS).switchMap(() => {

        console.log('APPLY TABOU FILTER');
        const filterObj = currentTabouFilters(store.getState()) ?? {};
        const tocLayers = layersSelector(store.getState()) ?? [];
        let layer = tocLayers.filter(lyr => lyr.name === filterObj.featureTypeName);

        if (!Object.keys(filterObj).length || !layer.length) {
            return Rx.Observable.empty();
        }

        layer = layer.length ? layer[0] : '';
        filterObj.filterFields = filterObj.filterFields || [];
        filterObj.crossLayerFilter = filterObj.crossLayerFilter || null;
        filterObj.spatialField = filterObj.spatialField || null;


        return Rx.Observable.of(changeLayerProperties(layer.id, { layerFilter: filterObj }))
            .concat(Rx.Observable.of(updateNode(layer.id, "id", {})));

    });
}