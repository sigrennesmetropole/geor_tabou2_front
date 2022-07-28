import { LAYER_FIELD_OPTION } from "../constants";
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
    if (!features) {
        return [];
    }
    return features.map((f, i) => (
        {
            label: get(f, layerFromConst[0]?.field) + ' (' + get(f, "properties.nature") + ')',
            id: get(f, layerFromConst[0]?.id),
            idx: i }
    ));
}

/**
 * From API, download file
 * @param {object} response object from API
 * @param {string} type like text/plain or application/pdf
 * @param {string} name
 */
export function downloadToBlob(response, type, name) {
    const blob = new Blob([response.data], { type: type });
    let docTitle = name || "unknown";
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const contentDisposition = response.headers['content-disposition'];
    if (!name && contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch.length > 2 && fileNameMatch[1]) {
            docTitle = fileNameMatch[1];
        }
    }
    link.setAttribute('download', docTitle);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
