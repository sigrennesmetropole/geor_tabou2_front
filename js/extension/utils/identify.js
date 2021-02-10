export function createOptions (data) {
    data = data.filter(r => r?.data?.features?.length || false);
    data = data.map((opt, idx) => {
        let label = opt?.layerMetadata?.title;
        return { label: label, value: idx, name: opt?.layer.name };
    })
    return data.filter(v => v);
}