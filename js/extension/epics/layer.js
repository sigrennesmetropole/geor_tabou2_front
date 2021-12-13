import Rx from 'rxjs';
import { updateAdditionalLayer } from '@mapstore/actions/additionallayers';
import { CLICK_ON_MAP } from '@mapstore/actions/map';
import { get, keys } from "lodash";
import { } from '@mapstore/selectors/map';
import { TABOU_VECTOR_ID, TABOU_OWNER } from '../constants';
import { createOGCRequest } from '../api/search';
import { createParams } from '../utils/layers';

import {
    UPDATE_TABOU_SELECTION,
    SET_TABOU_SELECT_FEATURE,
    UNSET_TABOU_SELECT_FEATUREE,
    updateVectorTabouFeatures,
    cleanTabouSelection
} from "../actions/tabou2";

import {
    getPluginCfg
} from '@ext/selectors/tabou2';
import { getTabouVectorLayer, getVectorTabouFeatures } from "../selectors/tabou2";

export const syncLayerForPlots = (action$, {getState = () => {}})=>
    action$.ofType(UPDATE_TABOU_SELECTION, SET_TABOU_SELECT_FEATURE, UNSET_TABOU_SELECT_FEATUREE) // actions that modify the layer, so it needs an update.
        .switchMap(() => {
            const features = getVectorTabouFeatures(getState());
            const options = getTabouVectorLayer(getState());
            return Rx.Observable.of(
                updateAdditionalLayer(
                    TABOU_VECTOR_ID,
                    TABOU_OWNER,
                    "overlay",
                    {
                        ...options,
                        features
                    }
                )
            );
        });

export const onTabouMapClick = (action$, {getState = () => {}}) =>
    action$.ofType(CLICK_ON_MAP)
        .switchMap(({point}) =>{
            let layers = getPluginCfg(getState()).layersCfg;
            let list = keys(layers).map(l => ({
                name: l,
                params: createParams(point, get(layers, l).nom)
            }));
            return Rx.Observable.concat(
                // clean selection
                Rx.Observable.of(cleanTabouSelection()),
                // add features to selection
                Rx.Observable.from(list)
                    .concatMap(r => createOGCRequest(r.params, getPluginCfg(getState()).geoserverURL))
                    .concatMap(response => {
                        return Rx.Observable.of(updateVectorTabouFeatures(response.features));
                    })
            );
        });

export const onSelectionUpdate = (action$, {getState = () => {}}) =>
    action$.ofType(UPDATE_TABOU_SELECTION).switchMap(() => {
        const features = getVectorTabouFeatures(getState());
        const options = getTabouVectorLayer(getState());
        return Rx.Observable.of(
            updateAdditionalLayer(
                TABOU_VECTOR_ID,
                TABOU_OWNER,
                "overlay",
                {
                    ...options,
                    features
                }
            )
        );
    });

