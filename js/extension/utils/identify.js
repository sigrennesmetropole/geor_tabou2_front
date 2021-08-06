import { LAYER_FIELD_OPTION } from "@ext/constants";
import { get, find } from 'lodash';

/**
 * Create data to display into layer identify selector - combobox.
 * Will be available if a user click into many layers (OA, PA, SA Layers only) .
 * @param {*} response
 * @returns
 */
export function createOptions(response, layersOrder) {
    let data = response.filter(r => r?.data?.features?.length || false);
    data = data.map((opt, idx) => {
        let label = opt?.layerMetadata?.title;
        return { label: label, value: idx, name: opt?.layer.name };
    });
    // keep order from config or keep TOC layer order by default
    let orderedData = layersOrder ? layersOrder.map(name => find(data, {label: name})) : data;
    return orderedData.filter(v => v);
}

/**
 * Create data to display into features identify selector - combobox.
 * Will be available if a user click into many features.
 * Usefull to select only one feature to dyslay or add.
 * @param {*} response
 * @returns
 */
export function getFeaturesOptions(features, layer) {
    let layerFromConst = LAYER_FIELD_OPTION.filter(f => f.name === layer);
    return features.map((f, i) => { return { label: get(f, layerFromConst[0]?.field) + ' (' + get(f, "properties.nature") + ')', id: get(f, layerFromConst[0]?.id), idx: i }; });
}
