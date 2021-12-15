import Rx from 'rxjs';

import { updateAdditionalLayer } from '@mapstore/actions/additionallayers';
import { CLICK_ON_MAP } from '@mapstore/actions/map';
import { get, keys, isEmpty } from "lodash";
import { TABOU_VECTOR_ID, TABOU_OWNER, SELECT_STYLE } from '../constants';
import { createParams } from '../utils/layers';
import {
    UPDATE_TABOU_SELECTION,
    loadTabouFeatureInfo,
    cleanTabouSelection,
    UPDATE_TABOU_STYLE,
    updateVectorTabouFeatures
} from "../actions/tabou2";
import uuid from 'uuid';
import GeoJSON from 'ol/format/GeoJSON';

import { loadFeatureInfo } from "@mapstore/actions/mapInfo";

import { layersSelector } from '@mapstore/selectors/layers';
import { localizedLayerStylesEnvSelector } from "@mapstore/selectors/localizedLayerStyles";
import { buildIdentifyRequest } from '@mapstore/utils/MapInfoUtils';
import { identifyOptionsSelector } from '@mapstore/selectors/mapInfo';

import { getFeatureInfo } from "@mapstore/api/identify";

import { isTabou2Activate, getPluginCfg, getTabouVectorLayer, getSelectedVectorTabouFeature } from "../selectors/tabou2";

export const onSelectionUpdate = (action$, {getState = () => {}}) =>
    action$.ofType(UPDATE_TABOU_SELECTION, UPDATE_TABOU_STYLE)
        .filter(() => isTabou2Activate(getState()))
        .switchMap(() => {
            // const features = getVectorTabouFeatures(getState());
            const options = getTabouVectorLayer(getState());
            const features = getSelectedVectorTabouFeature(getState());
            return Rx.Observable.of(
                updateAdditionalLayer(
                    TABOU_VECTOR_ID,
                    TABOU_OWNER,
                    "overlay",
                    {
                        ...options,
                        features: isEmpty(features) ? [] : features
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
                    .concatMap(r => {
                        let env = localizedLayerStylesEnvSelector(getState());
                        let tocLayer = layersSelector(getState()).filter(lyr => lyr.name === get(layers, r.name).nom)[0];
                        if (!tocLayer.visibility) return Rx.Observable.empty();
                        let { url, request, metadata } = buildIdentifyRequest(tocLayer, {...identifyOptionsSelector(getState()), env, point: point});
                        request.info_format = "application/json";
                        return Rx.Observable.defer(() => getFeatureInfo(url, request, tocLayer, {}))
                            .catch(e => {
                                console.log("Error retrieving GFI from " + r.name);
                                console.log(e);
                                return Rx.Observable.of({data: []});
                            }).switchMap((response) => {
                                let reader = new GeoJSON({
                                    defaultDataProjection: 'EPSG:3857'
                                });
                                let features = reader.readFeatures(response.data, {
                                    dataProjection: 'EPSG:3857',
                                    featureProjection: 'EPSG:4326'
                                });
                                let writer = new GeoJSON();
                                let newFeatures = writer.writeFeatures(features);
                                return Rx.Observable.of(
                                    loadTabouFeatureInfo({}),
                                    loadFeatureInfo(uuid.v1(), response.data, request, { ...metadata, features: response.features, featuresCrs: response.featuresCrs }, tocLayer),
                                    updateVectorTabouFeatures(r.name, JSON.parse(newFeatures).features)
                                );
                            });
                    })
            );
        });
