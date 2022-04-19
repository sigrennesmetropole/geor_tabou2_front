export function getProgOperation = (values, dataSource) => [
    {
        name: "operation",
        label: "Opération",
        field: "operation",
        type: "text",
        layers: ["layerOA", "layerSA"],
        source: has(values, "operation") ? values : dataSource,
        readOnly: false
    }
];
export function getProgLogements = (values, dataSource) => [
    {
        name: "operation",
        label: "Programmation activités",
        field: "operation",
        type: "text",
        layers: ["layerOA", "layerSA"],
        source: has(values, "operation") ? values : dataSource,
        readOnly: false
    },
    {
        name: "operation",
        label: "Opération",
        field: "operation",
        type: "text",
        layers: ["layerOA", "layerSA"],
        source: has(values, "operation") ? values : dataSource,
        readOnly: false
    },
    {
        name: "operation",
        label: "Opération",
        field: "operation",
        type: "text",
        layers: ["layerOA", "layerSA"],
        source: has(values, "operation") ? values : dataSource,
        readOnly: false
    },
    {
        name: "operation",
        label: "Opération",
        field: "operation",
        type: "text",
        layers: ["layerOA", "layerSA"],
        source: has(values, "operation") ? values : dataSource,
        readOnly: false
    },
    {
        name: "operation",
        label: "Opération",
        field: "operation",
        type: "text",
        layers: ["layerOA", "layerSA"],
        source: has(values, "operation") ? values : dataSource,
        readOnly: false
    }
];
