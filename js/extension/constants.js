export const TABS = [{
    id: 'search',
    tooltip: 'tabou2.tabs.search',
    glyph: 'search'
}, {
    id: 'add',
    tooltip: 'tabou2.tabs.add',
    glyph: 'plus'
}, {
    id: 'identify',
    tooltip: 'tabou2.tabs.identify',
    glyph: 'map-marker'
}];

export const ID_TABOU = "id_tabou";

export const CONTROL_NAME = 'tabou2';

export const API_BASE_URL = 'http://localhost:3000';

export const GEOSERVER_WFS_URL = 'https://public.sig.rennesmetropole.fr/geoserver';

export const ID_SELECTOR = 'layerTabouId-selector';

export const PANEL_SIZE = 500;

export const URL_ADD = {
    "tabou2": "",
    "layerPA": "programmes",
    "layerOA": "operations",
    "layerSA": "operations"
};

export const URL_TIERS = {
    "tabou2": "",
    "tabou2:v_oa_programme": "programmes",
    "tabou2:oa_secteur": "operations"
};

export const REQUIRED_TIER = ["adresseRue", "nom","adresseCp","adresseVille", "email"];
export const TIERS_SCHEMA = {
    "id": 0,
    "nom": "",
    "adresseNum": "",
    "adresseRue": "",
    "adresseCp": "",
    "adresseVille": "",
    "telephone": "",
    "telecopie": "",
    "email": "",
    "siteWeb": "",
    "contact": "",
    "estPrive": false,
    "dateInactif": null
};

export const SEARCH_ITEMS = [{
    name: 'communes',
    placeholder: 'Toutes communes',
    group: 1
}, {
    name: 'quartiers',
    placeholder: 'Tous quartiers',
    group: 1,
    parent: 'communes',
    cascadeField: 'codeInsee',
    parentField: 'codeInsee'
}, {
    name: 'iris',
    placeholder: 'Tous iris',
    group: 1,
    parent: 'communes',
    cascadeField: 'ccom',
    parentField: 'codeInsee'
}, {
    name: 'plui',
    disabled: false,
    placeholder: 'Tous zonage PLUI',
    group: 1
}, {
    name: 'types-financements',
    disabled: false,
    placeholder: 'Tous Financement',
    group: 4
}, {
    name: "natures",
    placeholder: "Toutes natures",
    type: 'string',
    group: 3
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
    api: "secteurs-dds",
    type: 'string',
    group: 2
}, {
    name: "secteurs-foncier",
    placeholder: "Tous secteurs Foncier",
    type: 'string',
    group: 2
}, {
    name: "etapesoa",
    placeholder: "Toutes Etapes OA",
    api: "operations/etapes",
    type: 'string',
    disabled: false,
    group: 3
}, {
    name: "etapespa",
    api: "programmes/etapes",
    placeholder: "Toutes Etapes PA",
    disabled: false,
    type: 'string',
    group: 4
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
        label: "Date DAACT du :"
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
    {title: 'Descriptif', id: 'describe'},
    {title: 'Gouvernance', id: 'gouvernance'},
    {title: 'Suivi Opérationnel', id: 'suivi'},
    {title: 'Programmation Habitat', id: 'habitat'},
    {title: 'Programmation Activités', id: 'activite', layers: ['layerOA', 'layerSA']},
    {title: 'Instruction Droit des Sols', id: 'dds', layers: ['layerPA']},
    {title: 'Secteurs et programmes liés', id: 'secteursprog', layers: ['layerOA', 'layerSA']}
];

export const LAYER_FIELD_OPTION = [
    {
        //name: "urba_proj:v_oa_programme",
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
        layerOA : "secteur",
        layerPA : "secteur",
        layerSA : "secteur"
    },
    idEmprise: {
        layerOA : "nom",
        layerPA : "nom",
        layerSA : "nom"
    },
    nom: {
        layerOA : "nom",
        layerPA : "nom",
        layerSA : "nom"
    },
    etape: {
        layerOA : "etape",
        layerPA : "etape",
        layerSA : "etape"
    },
    nature: {
        layerOA : "nature",
        layerPA : "nature",
        layerSA : "nature"
    },
    code: {
        layerOA : "code",
        layerPA : "code",
        layerSA : "code"
    }
}

export const ADD_OA_FORM = [{
    label: " Choisissez si c'est un secteur, puis sélectionnez la nature et l'emprise",
    group: 1,
    type: "alert",
    name: "msgOaCondition",
    icon: "info-sign",
    variant: "info"
}, {
    label: "Secteur",
    name: "secteur",
    apiField: "",
    // parent: (infos) => infos.emprise, // to activate secteur only if emprise name formControl is selected
    required: true,
    group: 1,
    type: "checkbox"
}, {
    label: "Nature",
    api: "natures",
    name: "nature",
    group: 1,
    apiField: "id",
    apiLabel: "libelle",
    parent: null,
    placeholder: "Selectionner une nature",
    type: "combo"
}, {
    label: "Emprise",
    name: "idEmprise",
    group: 1,
    api: "operations/emprises",
    apiField: "id",
    apiLabel: "nom",
    placeholder: "Selectionner une emprise",
    parent: (i) => !i.nature ? true : {nature: i.nature, secteur: i.secteur},
    type: "combo"
}, {
    label: "Nom",
    apiField: "",
    name: "nom",
    placeholder: "Saisir un nom",
    // parent: () => emprise, // to activate nom only if emprise name formControl is selected
    required: true,
    type: "text"
}, {
    label: "Code",
    apiField: "",
    name: "code",
    placeholder: "Saisir un code",
    // parent: (infos) => infos.emprise, // to activate code only if emprise name formControl is selected
    required: true,
    type: "text"
}, {
    label: "Etape",
    apiField: "code",
    apiLabel: "libelle",
    api: "operations/etapes",
    name: "etape",
    // parent: (infos) => infos.emprise, // to activate etape only if emprise name formControl is selected
    placeholder: "Sélectionner une étape",
    required: true,
    type: "combo"
}];

export const ADD_PA_FORM = [ {
    label: "Limiter les emprises selon l'opération",
    apiField: "",
    name: "limitPa",
    required: false,
    type: "checkbox",
    group: 1
}, {
    label: " Commencez par choisir l'opération parente",
    group: 1,
    type: "alert",
    name: "msgPaCondition",
    parent: (i) => i?.limitPa,
    icon: "info-sign",
    variant: "info"
}, {
    label: "Sélectionner l'opération parente :",
    api: "operations",
    name: "parentoa",
    apiLabel: "nom",
    apiField: "nom",
    parent: null,
    placeholder: "Selectionner une opération",
    group: 1,
    type: "combo"
}, {
    label: "Emprise",
    api: "programmes/emprises",
    group: 1,
    parent: (i) => !i.parentoa ? true : {operationId: i.operationId, nomopa: i.parentoa},
    name: "idEmprise",
    apiLabel: "nom",
    apiField: "id",
    placeholder: "Selectionner une emprise",
    type: "combo"
}, {
    label: "Nom",
    apiField: "",
    name: "nom",
    placeholder: "Saisir un nom",
    // parent: () => emprise, // to activate nom only if emprise name formControl is selected
    required: true,
    type: "text"
}, {
    label: "Code",
    apiField: "",
    name: "code",
    placeholder: "Saisir un code",
    // parent: (infos) => infos.emprise, // to activate code only if emprise name formControl is selected
    required: true,
    type: "text"
}, {
    label: "Etape",
    apiField: "code",
    apiLabel: "libelle",
    api: "operations/etapes",
    name: "etape",
    // parent: (infos) => infos.emprise, // to activate etape only if emprise name formControl is selected
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
    "consommationEspace": {  
      "id": 1
    },
    "decision": {  
      "id": 1
    },
    "etape": {  
      "id": 1
    },
    "maitriseOuvrage": {  
      "id": 1
    },
    "modeAmenagement": {
      "id": 1
    },
    "vocation": {
      "id": 1
    }
  };

export const PA_SCHEMA = {
    "operationId": 0,
    "idEmprise": 0,
    "diffusionRestreinte": false,
    "code": "",
    "nom": "",
    "description": "nc",
    "programme": "nc",
    "etape": {
      "id": 0  
    },
    "numAds": "nc"
};

export const LOG_SCHEMA = {
    description: "",
    eventDate: "2021-04-21T14:39:54.176Z",
    id: 0,
    idType: 3,
    new: true
}