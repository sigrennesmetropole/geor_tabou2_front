import Rx from 'rxjs';

import { updateAdditionalLayer } from '@mapstore/actions/additionallayers';
import { CLICK_ON_MAP } from '@mapstore/actions/map';
import { get, keys, isEmpty } from "lodash";
import { TABOU_VECTOR_ID, TABOU_OWNER } from '../constants';
import { createParams, reprojectFeatures } from '../utils/layers';
import {
    cleanTabouSelection,
    updateVectorTabouFeatures,
    tabouChangeFeatures,
    TABOU_CHANGE_FEATURES,
    UPDATE_TABOU_STYLE
} from "../actions/tabou2";
import uuid from 'uuid';

import { layersSelector } from '@mapstore/selectors/layers';

import { identifyOptionsSelector } from '@mapstore/selectors/mapInfo';

import { localizedLayerStylesEnvSelector } from "@mapstore/selectors/localizedLayerStyles";
import { buildIdentifyRequest } from '@mapstore/utils/MapInfoUtils';

import { getFeatureInfo } from "@mapstore/api/identify";

import { isTabou2Activate, getPluginCfg, getTabouVectorLayer, getSelection, getGfiData, getClickedFeatures } from "../selectors/tabou2";

export const onSelectionUpdate = (action$, store) =>
    action$.ofType(TABOU_CHANGE_FEATURES, UPDATE_TABOU_STYLE)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap((action) => {
            let overlayFeatures = [];
            let responses = action?.data || getGfiData(store.getState());
            const options = getTabouVectorLayer(store.getState());
            const styles = getPluginCfg(store.getState()).styles;
            const userSelection = getSelection(store.getState());
            // get features from each layers and reproject
            if (!isEmpty(responses)) {
                const selectedId = get(userSelection, "feature")?.id || "";
                const userFeaturesSelection = get(getClickedFeatures(store.getState()), userSelection.tocLayer);
                // only style selected layer's features
                const features = userFeaturesSelection.map(d => {
                    let newFeatures =  reprojectFeatures(d);
                    return newFeatures.features.map(f => ({
                        ...f,
                        style: f?.id === selectedId ? styles.selection : styles.default
                    })).flat(1);
                });
                overlayFeatures = Array.prototype.concat.apply([], features);
            }
            // insert features into layer
            return Rx.Observable.of(
                updateAdditionalLayer(
                    TABOU_VECTOR_ID,
                    TABOU_OWNER,
                    "overlay",
                    {
                        ...options,
                        features: overlayFeatures
                    }
                )
            );
        });

export const onTabouMapClick = (action$, store) =>
    action$.ofType(CLICK_ON_MAP)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(({point}) => {
            let layers = getPluginCfg(store.getState()).layersCfg;
            let list = keys(layers).map(l => ({
                name: l,
                params: createParams(point, get(layers, l).nom),
                tocLayer: layersSelector(store.getState()).filter(lyr => lyr.name === get(layers, l).nom)[0]
            })).filter(a => a.tocLayer.visibility);

            return Rx.Observable.concat(
                Rx.Observable.of(cleanTabouSelection()),
                Rx.Observable.from(list).map(r => {
                    let env = localizedLayerStylesEnvSelector(store.getState());
                    let tocLayer = layersSelector(store.getState()).filter(lyr => lyr.name === get(layers, r.name).nom)[0];
                    let { url, request, metadata } = buildIdentifyRequest(tocLayer, {...identifyOptionsSelector(store.getState()), env, point: point});
                    request.info_format = "application/json";
                    return Rx.Observable.defer(() => getFeatureInfo(url, request, tocLayer, {}))
                        .switchMap(response => {
                            return Rx.Observable.of(
                                {
                                    [tocLayer.name]: {
                                        data: response.data,
                                        layer: tocLayer,
                                        layerMetadata: { ...metadata, features: response.features, featuresCrs: response.featuresCrs },
                                        requestParams: request,
                                        reqId: uuid.v1()
                                    }
                                }
                            );
                        });
                }).toArray().switchMap((requestArray) =>
                    Rx.Observable.forkJoin(requestArray).flatMap(elementArray => {
                        let toObject = Object.assign({}, ...elementArray);
                        const features = Object.assign({}, ...elementArray.map(m => keys(m)[0]).map(r => ({[r]: toObject[r].data.features})));
                        return Rx.Observable.of(
                            updateVectorTabouFeatures(features),
                            tabouChangeFeatures(toObject)
                        );
                    })
                )
            );
        });
