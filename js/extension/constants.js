export const TABS = [{
    id: 'search',
    tooltip: 'search',
    glyph: 'search'
}, {
    id: 'add',
    tooltip: 'add',
    glyph: 'plus'
}, {
    id: 'identify',
    tooltip: 'identify',
    glyph: 'map-marker'
}];

export const CONTROL_NAME = 'tabou2';

export const API_BASE_URL = 'https://jdev.stoplight.io/mocks/jdev/tabou_api_swagger/4964747';

export const GEOSERVER_WFS_URL = 'https://public.sig.rennesmetropole.fr/geoserver';

export const COMMUNE_LAYER_ID = 'ladm_terri:commune_emprise';

export const ID_SELECTOR = 'layerTabouId-selector';

export const PANEL_SIZE = 500;

export const SEARCH_ITEMS = [{
    name: 'communes',
    placeholder: 'Toutes communes',
    group: 1
}, {
    name: 'quartiers',
    placeholder: 'Tous quartiers',
    group: 1
}, {
    name: 'iris',
    placeholder: 'Tous iris',
    group: 1
}, {
    name: 'plui',
    disabled: true,
    placeholder: 'Tous zonage PLUI',
    group: 1
}, {
    name: 'type-financement',
    disabled: true,
    placeholder: 'Tous Financement',
    group: 1
}, {
    name: "natures",
    placeholder: "Toutes natures",
    group: 2
}, {
    name: "secteurs-sam",
    placeholder: 'Tous secteurs SAM',
    type: 'string',
    group: 2
}, {
    name: "secteurs-speu",
    placeholder: 'Tous secteurs SPEU',
    type: 'string',
    group: 2
}, {
    name: "secteurs-sds",
    placeholder: 'Tous secteurs SDS',
    type: 'string',
    group: 2
}, {
    name: "secteurs-foncier",
    placeholder: "Tous secteurs Foncier",
    type: 'string',
    group: 2
}, {
    name: "etapeoa",
    placeholder: "Toutes Etapes OA",
    api: "etapes-oa-mock",
    disabled: true,
    group: 2
}, {
    name: "etapepa",
    placeholder: "Toutes Etapes PA",
    api: "etapes-pa-mock",
    disabled: true,
    group: 2
}];

export const SEARCH_CALENDARS = [{
    items: [{
        label: "Date DOC du :"
    },
    {
        label: "A la date du :"
    }]
}, {
    items: [{
        label: "Date DOC du :"
    },
    {
        label: "A la date du :"
    }]
}, {
    items: [{
        label: "Date de livraison du :"
    },
    {
        label: "A la date du :"
    }]
}];

export const ACCORDIONS = [
    {title: 'Identification', id: 'ident'},
    { title: 'Descriptif', id: 'describe'},
    { title: 'Gouvernance', id: 'gouvernance'},
    {title: 'Suivi Opérationnel', id: 'suivi'},
    {title: 'Programmation Habitat', id: 'habitat'},
    {title: 'Programmation Activités', id: 'activite', layers: ['layerOA', 'layerSA']},
    {title: 'Instruction Droit des Sols', id: 'dds', layers: ['layerPA']},
    {title: 'Secteurs et programmes liés', id: 'secteursprog', layers: ['layerOA', 'layerSA']}
];

export const ACC_ATTRIBUTE_IDENT = [{
    name: 'ID_Tabou',
    api: '',
    type: 'number',
    fieldApi: 'id',
    layers: []
}, {
    name: 'code',
    api: '',
    type: 'string',
    fieldApi: 'code',
    layers: []
}, {
    name: 'commune',
    fieldApi: '',
    api: '',
    type: 'string',
    layers: []
}, {
    name: 'nature',
    api: '',
    fieldApi: 'libelle',
    type: 'string',
    layers: []
}, {
    name: 'nom',
    fieldApi: 'nom',
    placeholder: 'nom',
    api: '',
    type: 'string',
    layers: []
}, {
    name: 'estoff',
    fieldApi: 'diffusionRestreinte',
    placeholder: 'Est off',
    api: '',
    type: 'boolean',
    layers: []
}, {
    name: 'numads',
    placeholder: 'Num ADS',
    fieldApi: 'numAds',
    api: '',
    type: 'string',
    layers: []
}];

export const ACC_ATTRIBUTE_DESCRIBE = [{
    name: 'operation',
    placeholder: 'opération',
    api: '',
    fieldApi: 'operation',
    type: 'string',
    layers: []
}, {
    name: 'description',
    placeholder: 'Opération',
    fieldApi: 'description',
    api: '',
    type: 'string',
    layers: []
}, {
    name: 'conso-espace',
    api: '',
    fieldApi: 'libelle',
    type: 'combo',
    layers: ['layerOA', 'layerSA']
}, {
    name: 'vocation',
    api: '',
    type: 'combo',
    layers: ['layerOA', 'layerSA']
}, {
    name: 'surftotal',
    api: '',
    type: 'string',
    layers: ['layerOA', 'layerSA']
}];
