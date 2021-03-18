import { LAYER_FIELD_OPTION } from "@ext/constants";
import { get } from 'lodash';

export function createOptions(response) {
    let data = response.filter(r => r?.data?.features?.length || false);
    data = data.map((opt, idx) => {
        let label = opt?.layerMetadata?.title;
        return { label: label, value: idx, name: opt?.layer.name };
    });
    return data.filter(v => v);
}

export function getFeaturesOptions(features, layer) {
    let layerFromConst = LAYER_FIELD_OPTION.filter(f => f.name === layer);
    return features.map((f, i) => { return { label: get(f, layerFromConst[0]?.field), id: get(f, layerFromConst[0]?.id), idx: i }; });
}
