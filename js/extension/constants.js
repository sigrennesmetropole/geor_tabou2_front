export const TABOU_VECTOR_ID = "__OA_OVRLAY_LAYER__";
export const TABOU_OWNER = "Tabou2";
export const TABOU_MARKER_LAYER_ID = "__OA_OVRLAY_MARKER__";

export const TABS = [{
    id: 'search',
    tooltip: 'tabou2.tabs.search',
    glyph: 'search'
}, {
    id: 'add',
    tooltip: 'tabou2.tabs.add',
    glyph: 'plus',
    roles: ["isReferent"]
}, {
    id: 'identify',
    tooltip: 'tabou2.tabs.identify',
    glyph: 'map-marker'
}];

export const ID_TABOU = "id_tabou";

export const CONTROL_NAME = 'tabou2';

export const API_BASE_URL = 'http://localhost:3000';

export const ID_SELECTOR = 'layerTabouId-selector';

export const PANEL_SIZE = 600;

export const URL_ADD = {
    "tabou2": "",
    "layerPA": "programmes",
    "layerOA": "v2/operations",
    "layerSA": "v2/operations"
};

export const REQUIRED_TIERS = ["nom", "adresseVille"];
export const TIERS_SCHEMA = {
    id: 0,
    tiers: {
        nom: "",
        adresseNum: "",
        adresseRue: "",
        adresseCp: "",
        adresseVille: "",
        telephone: "",
        telecopie: "",
        email: "",
        siteWeb: "",
        contact: "",
        estPrive: true,
        dateInactif: null
    },
    typeTiers: {
        libelle: "",
        createDate: "",
        createUser: "",
        dateInactif: "",
        id: 0
    }
};

export const SEARCH_ITEMS = [{
    name: 'communes',
    placeholder: 'tabou2.search.allCity',
    group: 1
}, {
    name: 'quartiers',
    placeholder: 'tabou2.search.allDistrict',
    group: 1,
    parent: 'communes',
    cascadeField: 'codeInsee',
    parentField: 'codeInsee'
}, {
    name: 'iris',
    placeholder: 'tabou2.search.allIris',
    group: 1,
    parent: 'communes',
    cascadeField: 'ccom',
    parentField: 'codeInsee'
}, {
    name: 'plui',
    disabled: false,
    placeholder: 'tabou2.search.allPlui',
    type: 'string',
    autocomplete: true,
    group: 1
}, {
    name: 'types-financements',
    placeholder: 'tabou2.search.allFinancement',
    disabled: false,
    group: 4
}, {
    name: "natures",
    placeholder: 'tabou2.search.allNatures',
    type: 'string',
    group: 3
}, {
    name: "secteurs-sam",
    placeholder: 'tabou2.search.allSAM',
    type: 'string',
    group: 2
}, {
    name: "secteurs-speu",
    placeholder: 'tabou2.search.allSPEU',
    type: 'string',
    group: 2
}, {
    name: "secteurs-sds",
    placeholder: 'tabou2.search.allSDS',
    api: "secteurs-dds",
    type: 'string',
    group: 2
}, {
    name: "secteurs-foncier",
    placeholder: 'tabou2.search.allFoncier',
    type: 'string',
    group: 2
}, {
    name: "etapesoa",
    placeholder: 'tabou2.search.allEtapesOA',
    api: "operations/etapes?orderBy=id&asc=true",
    type: 'string',
    disabled: false,
    group: 3
}, {
    name: "etapespa",
    api: "programmes/etapes?orderBy=id&asc=true",
    placeholder: 'tabou2.search.allEtapesPA',
    disabled: false,
    type: 'string',
    group: 4
}];

export const SEARCH_CALENDARS = [{
    items: [{
        name: "doc",
        isStart: true,
        label: "tabou2.search.dateDocFrom"
    },
    {
        label: "tabou2.search.dateTo",
        isStart: false,
        name: "doc"
    }]
}, {
    items: [{
        name: "daact",
        isStart: true,
        label: "tabou2.search.dateDaactFrom"
    },
    {
        name: "daact",
        isStart: false,
        label: "tabou2.search.dateTo"
    }]
}, {
    items: [{
        name: "livraison",
        isStart: true,
        label: "tabou2.search.dateLivFrom"
    },
    {
        name: "livraison",
        isStart: false,
        label: "tabou2.search.dateTo"
    }]
}];

export const ACCORDIONS = [
    {title: 'tabou2.identify.accordions.identify', id: 'ident'},
    {title: 'tabou2.identify.accordions.describe', id: 'describe'},
    { title: 'tabou2.identify.accordions.gouv', id: 'gouvernance', layers: ['layerPA'] },
    { title: 'tabou2.identify.accordions.real', id: 'gouvernance', layers: ['layerOA', "layerSA"]},
    // TO DELETE OA SA FIELDS
    {title: 'tabou2.identify.accordions.opTracking', id: 'suivi', layers: ['layerPA']},
    {title: 'tabou2.identify.accordions.progHabitat', id: 'habitat', layers: ['layerPA']},
    //
    {title: 'tabou2.identify.accordions.dds', id: 'dds', layers: ['layerPA']},
    {title: 'tabou2.identify.accordions.secProg', id: 'secteursprog', layers: []},
    {title: 'tabou2.identify.accordions.cadre', id: 'cadre', layers: ['layerOA', 'layerSA']}
];

export const LAYER_FIELD_OPTION = [
    {
        // name: "urba_proj:v_oa_programme",
        name: "layerPA",
        field: "properties.nom",
        id: "properties.id_tabou"
    },
    {
        name: "layerSA",
        field: "properties.nom",
        id: "properties.id_tabou"
    },
    {
        name: "layerOA",
        field: "properties.nom",
        id: "properties.id_tabou"
    }
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
    name: 'natures',
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

export const ADD_FIELDS = {
    secteur: {
        layerOA: "secteur",
        layerPA: "secteur",
        layerSA: "secteur"
    },
    nomEmprise: {
        layerOA: "nom",
        layerPA: "nom",
        layerSA: "nom"
    },
    idEmprise: {
        layerOA: "id_emprise",
        layerPA: "id_emprise",
        layerSA: "id_emprise"
    },
    nom: {
        layerOA: "nom",
        layerPA: "nom",
        layerSA: "nom"
    },
    etape: {
        layerOA: "etape",
        layerPA: "etape",
        layerSA: "etape"
    },
    nature: {
        layerOA: "nature",
        layerPA: "nature",
        layerSA: "nature"
    },
    code: {
        layerOA: "code",
        layerPA: "code",
        layerSA: "code"
    }
};

export const ADD_OA_FORM = [{
    label: "tabou2.add.checkSector",
    group: 1,
    type: "alert",
    name: "msgOaCondition",
    icon: "info-sign",
    variant: "info"
}, {
    label: "tabou2.add.sector",
    name: "secteur",
    apiField: "",
    required: true,
    group: 1,
    type: "checkbox"
}, {
    label: "tabou2.add.nature",
    api: "natures",
    name: "nature",
    group: 1,
    apiField: "id",
    apiLabel: "libelle",
    parent: null,
    type: "combo"
}, {
    label: "tabou2.add.emprise",
    name: "nomEmprise",
    group: 1,
    autocomplete: "nom",
    api: "operations/emprises",
    apiField: "id",
    apiLabel: "nom",
    parent: (i) => !i.nature ? true : {nature: i.natureId, secteur: i.secteur},
    type: "combo"
}, {
    label: "tabou2.add.name",
    apiField: "",
    name: "nom",
    required: true,
    type: "text"
}, {
    label: "tabou2.add.code",
    apiField: "",
    name: "code",
    required: true,
    type: "text"
}, {
    label: "tabou2.add.step",
    apiField: "code",
    apiLabel: "libelle",
    api: "operations/etapes?orderBy=id&asc=true",
    name: "etape",
    placeholder: "Sélectionner une étape",
    required: true,
    distinct: false,
    type: "combo"
}];

export const ADD_PA_FORM = [ {
    label: "tabou2.add.limiteEmprise",
    apiField: "",
    name: "limitPa",
    required: false,
    type: "checkbox",
    group: 1
}, {
    label: "tabou2.add.msgStartPa",
    group: 1,
    type: "alert",
    name: "msgPaCondition",
    parent: (i) => i?.limitPa,
    icon: "info-sign",
    variant: "info"
}, {
    label: "tabou2.add.selectPaParent",
    api: "v1/operations?estSecteur=false&asc=true",
    name: "parentoa",
    autocomplete: "nom",
    min: 3,
    apiLabel: "nom",
    apiField: "nom",
    parent: null,
    group: 1,
    type: "combo"
}, {
    label: "tabou2.add.emprise",
    api: "programmes/emprises",
    group: 1,
    parent: (i) => !i.parentoa ? true : {operationId: i.operationId, nomopa: i.parentoa},
    name: "nomEmprise",
    apiLabel: "nom",
    min: 2,
    autocomplete: "nom",
    apiField: "id",
    placeholder: "Saisir un nom d'emprise",
    type: "combo"
}, {
    label: "tabou2.add.name",
    apiField: "",
    name: "nom",
    placeholder: "Saisir un nom",
    required: true,
    type: "text"
}, {
    label: "tabou2.add.code",
    apiField: "",
    name: "code",
    placeholder: "Saisir un code",
    required: true,
    type: "text"
}, {
    label: "tabou2.add.step",
    apiField: "code",
    apiLabel: "libelle",
    api: "programmes/etapes?orderBy=id&asc=true",
    distinct: false,
    name: "etape",
    placeholder: "Sélectionner une étape",
    required: true,
    type: "combo"
}];

export const OA_SCHEMA = {
    "diffusionRestreinte": false,
    "nature": {
        "id": 1
    },
    "idEmprise": 0,
    "code": "",
    "nom": "",
    "operation": "",
    "description": "",
    "nbLogementsPrevu": 0,
    "secteur": false,
    "surfaceTotale": 0,
    "etape": {
        "id": 0
    }
};

export const PA_SCHEMA = {
    "operationId": 0,
    "idEmprise": 0,
    "diffusionRestreinte": false,
    "code": "",
    "nom": "",
    "description": "",
    "programme": "",
    "etape": {
        "id": 0
    },
    "numAds": ""
};

export const LOG_SCHEMA = {
    description: "",
    eventDate: "2021-04-21T14:39:54.176Z",
    id: 0,
    idType: 3,
    "new": true
};
