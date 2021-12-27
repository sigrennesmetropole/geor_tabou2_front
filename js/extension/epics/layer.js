import Rx from 'rxjs';

import { updateAdditionalLayer } from '@mapstore/actions/additionallayers';
import { CLICK_ON_MAP } from '@mapstore/actions/map';
import { get, keys } from "lodash";
import { TABOU_VECTOR_ID, TABOU_OWNER, DEFAULT_STYLE, SELECT_STYLE } from '../constants';
import { createParams, reprojectFeatures } from '../utils/layers';
import {
    UPDATE_TABOU_SELECTION,
    cleanTabouSelection,
    UPDATE_TABOU_STYLE,
    updateVectorTabouFeatures,
    tabouChangeFeatures
} from "../actions/tabou2";
import uuid from 'uuid';

import { layersSelector } from '@mapstore/selectors/layers';

import { identifyOptionsSelector } from '@mapstore/selectors/mapInfo';

import { localizedLayerStylesEnvSelector } from "@mapstore/selectors/localizedLayerStyles";
import { buildIdentifyRequest } from '@mapstore/utils/MapInfoUtils';

import { getFeatureInfo } from "@mapstore/api/identify";

import { isTabou2Activate, getPluginCfg, getTabouVectorLayer, getSelection, getTabouResponse } from "../selectors/tabou2";

const prepareFeatures = (data, id) => {
    console.log(data);
    let newFeatures =  reprojectFeatures(data);
    return newFeatures.features.map(f => ({
        ...f,
        style: f.id === id ? SELECT_STYLE : DEFAULT_STYLE
    })).flat(1);
};

export const onSelectionUpdate = (action$, store) =>
    action$.ofType(UPDATE_TABOU_SELECTION, UPDATE_TABOU_STYLE)
        .filter(() => isTabou2Activate(store.getState()))
        .switchMap(() => {
            const options = getTabouVectorLayer(store.getState());
            let responses = getTabouResponse(store.getState());
            let features = keys(responses).map(k => responses[k].data).flat();
            const selectedId = get(getSelection(store.getState()), "feature")?.id || "";
            features = features.map(d => prepareFeatures(d, selectedId));
            let overlayFeatures = Array.prototype.concat.apply([], features);
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
                        console.log(features);
                        return Rx.Observable.of(
                            updateVectorTabouFeatures(features),
                            tabouChangeFeatures(toObject)
                        );
                    })
                )
            );
        });
