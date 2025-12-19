import React from "react";
import {isEmpty, pick, get, find} from "lodash";
import {Col, Row, Grid, ControlLabel} from "react-bootstrap";
import {getRequestApi} from "@js/extension/api/requests";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
import Tabou2Select from '@js/extension/components/form/Tabou2Select';
import {
    renderIdentifyDateField,
    renderIdentifyTextOrNumberField
} from "../vocations/utils";

/**
 * Accordion to display info for Identity panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
const Tabou2CadreAccord = ({
    initialItem,
    layer,
    authent,
    change = () => {
    },
    i18n = () => {
    },
    messages,
    apiCfg,
    types, // eslint-disable-line no-unused-vars
    changeProp = () => {
    }
}) => {

    let changeInfos;

    // ex : "descriptionsFoncier", ["typesFonciers.code", "FONCIER_PUBLIC"], "description", "myNewvValue"
    let changeFoncier = (t, fieldArray, search, field, value, src) => {
        // get item by type code
        let itemByCode = find(src[fieldArray], search);
        if (!itemByCode) {
            itemByCode = {typeFoncier: find(t.typesFonciers, ['code', search[1]])};
        }
        // change value
        itemByCode[field] = value;
        // filter others item whithout changed item
        const othersItems = src[fieldArray].filter(item => item.typeFoncier.code !== itemByCode.typeFoncier.code);
        // send to parent
        const concatAll = [...othersItems, itemByCode];
        changeInfos({descriptionsFoncier: concatAll});
    };
    const financementPPI = get(initialItem, "financementPPI");
    const financementPPIValue = financementPPI !== null ? (financementPPI ? "Oui" : "Non") : null;

    // create fields from const func
    const fields = [{
        type: "title",
        label: "tabou2.identify.accordions.foncierOccTitle",
        layers: ["layerSA", "layerOA"]
    }, {
        // BLOC Foncier et occupation
        name: "descriptionsFoncier",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPublicDescription",
        field: "descriptionsFoncier.description",
        readOnly: false,
        value: find(initialItem?.descriptionsFoncier, ["typeFoncier.code", "DPUCOM"])?.description,
        change: (v, t, src) => changeFoncier(t, "descriptionsFoncier", ["typeFoncier.code", "DPUCOM"], "description", v, src)
    }, {
        name: "outilFoncier",
        field: "outilFoncier.libelle",
        label: "tabou2.identify.accordions.outilFoncier",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: true,
        api: `outils-fonciers?asc=true`,
        apiLabel: "libelle",
        valueField: "id",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: () => initialItem.outilFoncier,
        select: (v) => changeInfos({outilFoncier: v}),
        change: (v) => changeInfos(v ? {outilFoncier: v} : {outilFoncier: null})
    }, {
        type: "title",
        label: "tabou2.identify.accordions.pluiTitle",
        layers: ["layerSA", "layerOA"]
    }, {
        name: "plui",
        type: "text",
        label: "tabou2.identify.accordions.pluiDisposition",
        field: "plui.pluiDisposition",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "plui.pluiDisposition"),
        change: (v, t, src) => changeInfos({plui: {...src.plui, pluiDisposition: v}})
    }, {
        name: "plui",
        type: "text",
        label: "tabou2.identify.accordions.pluiAdaptation",
        field: "plui.pluiAdaptation",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "plui.pluiAdaptation"),
        change: (v, t, src) => changeInfos({plui: {...src.plui, pluiAdaptation: v}})
    }, {
        type: "title",
        label: "tabou2.identify.accordions.processOpTitle",
        layers: ["layerSA", "layerOA"]
    }, {
        name: "etude",
        type: "text",
        label: "tabou2.identify.accordions.studyToPlan",
        field: "etude",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "etude"),
        change: (v) => changeInfos({etude: v})
    }, {
        name: "autorisationDate",
        field: "autorisationDate",
        label: "tabou2.identify.accordions.dateAuth",
        layers: ["layerSA", "layerOA"],
        type: "date",
        value: get(initialItem, "autorisationDate"),
        readOnly: false
    }, {
        name: "operationnelDate",
        label: "tabou2.identify.accordions.dateStart",
        field: "operationnelDate",
        layers: ["layerSA", "layerOA"],
        type: "date",
        value: initialItem?.operationnelDate || null,
        readOnly: false
    }, {
        name: "livraisonDate",
        label: "tabou2.identify.accordions.dateLiv",
        field: "livraisonDate",
        layers: ["layerSA", "layerOA"],
        type: "date",
        source: initialItem?.livraisonDate || null,
        readOnly: false
    }, {
        name: "clotureDate",
        label: "tabou2.identify.accordions.dateClose",
        field: "clotureDate",
        type: "date",
        value: initialItem?.clotureDate || null,
        readOnly: false
    }, {
        name: "annulationDate",
        label: "tabou2.identify.accordions.dateCancelStep",
        field: "annulationDate",
        layers: ["layerSA", "layerOA"],
        type: "date",
        value: initialItem?.annulationDate || null,
        readOnly: false
    }, {
        name: "concertation",
        label: "tabou2.identify.accordions.dateDebut",
        field: "dateDebut",
        type: "date",
        value: initialItem?.concertation?.dateDebut || null,
        readOnly: false
    }, {
        name: "concertation",
        label: "tabou2.identify.accordions.dateFin",
        field: "dateFin",
        type: "date",
        value: initialItem?.concertation?.dateFin || null,
        readOnly: false
    }, {
        name: "avancementAdministratif",
        type: "text",
        label: "tabou2.identify.accordions.avancementAdministratif",
        field: "avancementAdministratif",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "avancementAdministratif"),
        change: (v) => changeInfos({avancementAdministratif: v})
    }, {
        name: "surfaceRealisee",
        type: "number",
        label: "tabou2.identify.accordions.surfaceRealisee",
        field: "surfaceRealisee",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: get(initialItem, "surfaceRealisee"),
        change: (v) => changeInfos({surfaceRealisee: v})
    }, {
        name: "environnement",
        type: "text",
        label: "tabou2.identify.accordions.environnement",
        field: "environnement",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "environnement"),
        change: (v) => changeInfos({environnement: v})
    }, {
        name: "financementPPI",
        type: "combo",
        autocomplete: true,
        label: "tabou2.identify.accordions.financementPPI",
        values: ["Oui", "Non"],
        field: "financementPPI",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isSimpleValue: true,
        value: () => financementPPIValue,
        select: (v) => changeInfos({financementPPI: v === "Oui"}),
        change: (v) => changeInfos(v ? {financementPPI: v === "Oui"} : {financementPPI: null})
    }, {
        name: "elementsFinanciers",
        type: "text",
        label: "tabou2.identify.accordions.elementsFinanciers",
        field: "elementsFinanciers",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "elementsFinanciers"),
        change: (v) => changeInfos({elementsFinanciers: v})
    }, {
        name: "financements",
        type: "text",
        label: "tabou2.identify.accordions.financements",
        field: "financements[0].description",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: get(initialItem, "financements[0]")?.description,
        change: (v, t, src) => {
            return changeInfos({
                financements: src.financements[0] ? [{...src.financements[0], description: v}] : [{description: v}]
            });
        }
    }];

    const required = fields.filter(f => f.require).map(f => f.name);

    const allowChange = authent.isContrib || authent.isReferent;

    // manage change info
    changeInfos = (item) => {
        // get readOnly field name
        let editableFields = fields.filter(f => !f.readOnly).map(f => f.name);
        // send to parent to save
        change(item, pick(editableFields, required));
    };

    // Render field input based on type
    const renderFieldInput = (item) => {
        if (item.type === "combo" && item?.autocomplete) {
            // Pour financementPPI qui a des valeurs simples (Oui/Non)
            if (item.isSimpleValue && item.values) {
                return (
                    <Tabou2Select
                        textField="label"
                        valueField="value"
                        value={item.value ? {label: item.value(), value: item.value()} : null}
                        search={() => Promise.resolve(item.values.map(v => ({label: v, value: v})))}
                        onSelect={(v) => item.select(v?.value || v?.label)}
                        onChange={(v) => item.change(v?.value || v?.label)}
                        placeholder={i18n(messages, item?.label || "")}
                        disabled={item?.readOnly || !allowChange}
                        allowClear
                    />
                );
            }
            // Pour les autres champs avec API
            return (
                <Tabou2Select
                    textField={item.apiLabel}
                    valueField={item.valueField || "id"}
                    value={item.value ? item.value() : null}
                    search={(text) => {
                        if (!text || text.length < 1) {
                            return getRequestApi(item.api, apiCfg, {})
                                .then(results => Array.isArray(results) ? results : (results.elements || []));
                        }
                        return getRequestApi(item.api, apiCfg, {[item.apiLabel]: `${text}*`})
                            .then(results => Array.isArray(results) ? results : (results.elements || []));
                    }}
                    onSelect={item.select}
                    onChange={item.change}
                    placeholder={i18n(messages, item?.label || "")}
                    disabled={item?.readOnly || !allowChange}
                    allowClear
                />
            );
        }
        if (item.type === "text" || item.type === "number") {
            return renderIdentifyTextOrNumberField(item, i18n, messages, allowChange, types, initialItem);
        }
        if (item.type === "date") {
            return renderIdentifyDateField(item, initialItem, changeProp, i18n, messages, allowChange);
        }
        return null;
    };

    // Render field row
    const renderFieldRow = (item) => {
        if (item.type === "title") {
            return (
                <Col xs={12}>
                    <h4 style={{borderBottom: "1px solid"}}>
                        <ControlLabel><Message msgId={item.label}/></ControlLabel>
                    </h4>
                </Col>
            );
        }

        return (
            <>
                <Col xs={4}>
                    <ControlLabel><Message msgId={item.label}/></ControlLabel>
                </Col>
                <Col xs={8}>
                    {renderFieldInput(item)}
                </Col>
            </>
        );
    };

    return (
        <Grid style={{width: "100%"}}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos" key={item.name}>
                        {renderFieldRow(item)}
                    </Row>
                ))
            }
        </Grid>
    );
};

export default Tabou2CadreAccord;
