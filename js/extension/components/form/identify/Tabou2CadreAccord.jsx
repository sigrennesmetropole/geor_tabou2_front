import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, get, find } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { getRequestApi } from "@js/extension/api/requests";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
import SearchCombo from '@js/extension/components/form/SearchCombo';
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';

import { DateTimePicker } from "react-widgets";

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);
/**
 * Accordion to display info for Identity panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
export default function Tabou2CadreAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

    let changeInfos = () => { };
    let getFields = () => { };

    // hooks
    useEffect(() => {
        const calculFields = getFields();
        const mandatoryFields = calculFields.filter(f => f.require).map(f => f.name);
        if (!isEqual(initialItem, values)) {
            setValues(initialItem);
            setFields(calculFields);
            setRequired(mandatoryFields);
        }
    }, [initialItem, JSON.stringify(props.typesFicheInfos)]);
    // ex : "descriptionsFoncier", ["typesFonciers.code", "FONCIER_PUBLIC"], "description", "myNewvValue"
    let changeFoncier = (types, fieldArray, search, field, value) => {
        // get item by type code
        let itemByCode = find(get(initialItem, fieldArray), search);
        if (!itemByCode) {
            itemByCode = { typeFoncier: find(types.typesFonciers, ['code', search[1]]) };
        }
        // change value
        itemByCode[field] = value;
        // filter others item whithout changed item
        const othersItems = initialItem[fieldArray].filter(item => item.typeFoncier.code !== itemByCode.typeFoncier.code);
        // send to parent
        const concatAll = [...othersItems, itemByCode];
        changeInfos({ descriptionsFoncier: concatAll });
    };

    // create fields from const func
    getFields = () => [{
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
        value: () => find(get(initialItem, "descriptionsFoncier"), ["typeFoncier.code", "PUBLIQUE"])?.description,
        change: (v, types) => changeFoncier(types, "descriptionsFoncier", ["typeFoncier.code", "PUBLIQUE"], "description", v)
    }, {
        name: "descriptionsFoncier",
        type: "number",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPublicTaux",
        field: "descriptionsFoncier.taux",
        readOnly: false,
        value: () => find(get(initialItem, "descriptionsFoncier"), ["typeFoncier.code", "PUBLIQUE"])?.taux,
        change: (v, types) => changeFoncier(types, "descriptionsFoncier", ["typeFoncier.code", "PUBLIQUE"], "taux", v)
    }, {
        name: "descriptionsFoncier",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPriveDescription",
        field: "descriptionsFoncier.description",
        readOnly: false,
        value: () => find(get(initialItem, "descriptionsFoncier"), ["typeFoncier.code", "PRIVEE"])?.description,
        change: (v, types) => changeFoncier(types, "descriptionsFoncier", ["typeFoncier.code", "PRIVEE"], "description", v)
    }, {
        name: "descriptionsFoncier",
        type: "number",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPriveTaux",
        field: "descriptionsFoncier.taux",
        readOnly: false,
        value: () => find(get(initialItem, "descriptionsFoncier"), ["typeFoncier.code", "PRIVEE"])?.taux,
        change: (v, types) => changeFoncier(types, "descriptionsFoncier", ["typeFoncier.code", "PRIVEE"], "taux", v)
    }, {
        name: "typeOccupation",
        field: "typeOccupation",
        label: "tabou2.identify.accordions.typeOccupation",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: false,
        api: `types-occupations?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: () => get(initialItem, "typeOccupation.libelle"),
        select: (v) => changeInfos({ typeOccupation: v }),
        change: (v) => changeInfos(v ? { typeOccupation: v } : { typeOccupation: null })
    }, {
        name: "outilFoncier",
        field: "outilFoncier",
        label: "tabou2.identify.accordions.outilFoncier",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: false,
        api: `outils-fonciers?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: () => get(initialItem, "outilFoncier.libelle"),
        select: (v) => changeInfos({ outilFoncier: v }),
        change: (v) => changeInfos(v ? { outilFoncier: v } : { outilFoncier: null })
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
        value: () => get(initialItem, "plui.pluiDisposition"),
        change: (v) => changeInfos({ plui: { ...initialItem.plui, pluiDisposition: v } })
    }, {
        name: "plui",
        type: "text",
        label: "tabou2.identify.accordions.pluiAdaptation",
        field: "plui.pluiAdaptation",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: () => get(initialItem, "plui.pluiAdaptation"),
        change: (v) => changeInfos({ plui: { ...initialItem.plui, pluiAdaptation: v } })
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
        value: () => get(initialItem, "etude"),
        change: (v) => changeInfos({ etude: v })
    }, {
        name: "autorisationDate",
        field: "autorisationDate",
        label: "tabou2.identify.accordions.dateAuth",
        layers: ["layerSA", "layerOA"],
        type: "date",
        value: () => get(values, "autorisationDate"),
        readOnly: false
    }, {
        name: "operationnelDate",
        label: "tabou2.identify.accordions.dateStart",
        field: "operationnelDate",
        layers: ["layerSA", "layerOA"],
        type: "date",
        value: () => values.operationnelDate ? values.operationnelDate : initialItem.operationnelDate,
        readOnly: false
    }, {
        name: "clotureDate",
        label: "tabou2.identify.accordions.dateClose",
        field: "clotureDate",
        type: "date",
        value: () => values.clotureDate ? values.clotureDate : initialItem.clotureDate,
        readOnly: false
    }, {
        name: "amenageurs",
        field: "amenageurs.typeAmenageur",
        label: "tabou2.identify.accordions.typeAmenageur",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: false,
        api: `types-amenageurs?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: () => get(initialItem, "amenageurs")[0]?.typeAmenageur?.libelle,
        change: (v) => changeInfos({
            amenageurs: v ? [{nom: "", typeAmenageur: v }] : []
        }),
        select: (v) => changeInfos({
            amenageurs: v ? [{nom: "", typeAmenageur: v }] : []
        })
    }, {
        name: "amenageurs",
        type: "text",
        label: "tabou2.identify.accordions.nameAmenageur",
        field: "amenageurs",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: () => isEmpty(initialItem.amenageurs) ? "" : get(initialItem, "amenageurs")[0]?.nom,
        change: (v) => !isEmpty(initialItem.amenageurs) ? changeInfos({ amenageurs: [{ ...initialItem.amenageurs[0], nom: v }] }) : null
    }, {
        name: "outilAmenagement",
        type: "text",
        label: "tabou2.identify.accordions.outilAmenagement",
        field: "outilAmenagement",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: () => get(initialItem, "outilAmenagement"),
        change: (v) => changeInfos({ outilAmenagement: v })
    }, {
        name: "concertation",
        label: "tabou2.identify.accordions.dateDebut",
        field: "dateDebut",
        type: "date",
        value: () => values?.concertation?.dateDebut || initialItem?.concertation?.dateDebut,
        readOnly: false
    }, {
        name: "concertation",
        label: "tabou2.identify.accordions.dateFin",
        field: "dateFin",
        type: "date",
        value: () => values?.concertation?.dateFin || initialItem?.concertation?.dateFin,
        readOnly: false
    }, {
        name: "avancementAdministratif",
        type: "text",
        label: "tabou2.identify.accordions.avancementAdministratif",
        field: "avancementAdministratif",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: () => get(initialItem, "avancementAdministratif"),
        change: (v) => changeInfos({ avancementAdministratif: v })
    }, {
        name: "surfaceRealisee",
        type: "number",
        label: "tabou2.identify.accordions.surfaceRealisee",
        field: "surfaceRealisee",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: () => get(initialItem, "surfaceRealisee"),
        change: (v) => changeInfos({ surfaceRealisee: v })
    }, {
        name: "environnement",
        type: "text",
        label: "tabou2.identify.accordions.environnement",
        field: "environnement",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: () => get(initialItem, "environnement"),
        change: (v) => changeInfos({ environnement: v })
    }, {
        name: "financements",
        field: "financements[0].typesFinancement",
        label: "tabou2.identify.accordions.typesFinancement",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: false,
        api: `types-financements-operations?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: () => get(initialItem, "financements[0].typeFinancement.libelle"),
        change: (v) => changeInfos({
            financements: v ? [{...initialItem.financements[0], typeFinancement: v }] : []
        }),
        select: (v) => changeInfos({
            financements: v ? [{...initialItem.financements[0], typeFinancement: v }] : []
        })
    }, {
        name: "financements",
        type: "text",
        label: "tabou2.identify.accordions.financements",
        field: "financements[0].description",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: () => isEmpty(initialItem.financements) ? "" : get(initialItem, "financements[0")?.description,
        change: (v) => !isEmpty(initialItem.financements) ? changeInfos({ financements: [{ ...initialItem.financements[0], description: v }] }) : null
    }];

    const allowChange = props.authent.isContrib || props.authent.isReferent;

    // manage change info
    changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        props.change(accordValues, pick(accordValues, required));
    };

    const changeDate = (item, str) => {
        if (item.name !== item.field) {
            // only to change a key inside object as field.child
            changeInfos({
                [item.name]: {
                    ...initialItem[item.name],
                    [item.field]: str ? new Date(str).toISOString() : ""
                }
            });
        } else {
            changeInfos({[item.name]: str ? new Date(str).toISOString() : ""});
        }
    };

    const getDateValue = item => {
        let defaultValue = null;
        if (item.name !== item.field) {
            defaultValue = get(initialItem, `${item.name}.${item.field}`);
        } else if (initialItem[item.name]) {
            defaultValue = get(initialItem, item.name);
        }
        return defaultValue ? new Date(defaultValue) : null;
    };

    return (
        <Grid style={{ width: "100%" }}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        {
                            item.type === "title" ? (
                                <Col xs={12}>
                                    <h4 style={{borderBottom: "1px solid"}}>
                                        <ControlLabel><Message msgId={item.label} /></ControlLabel>
                                    </h4>
                                </Col>
                            ) : (<>
                                <Col xs={4}>
                                    <ControlLabel><Message msgId={item.label}/></ControlLabel>
                                </Col>
                                <Col xs={8}>
                                    {
                                        item.type === "combo" && item?.autocomplete ? (
                                            <SearchCombo
                                                minLength={3}
                                                textField={item.apiLabel}
                                                valueField={item.apiField}
                                                forceSelection
                                                value={item.value()}
                                                search={
                                                    text => getRequestApi(item.api, props.pluginCfg.apiCfg, {[item.autocomplete]: `${text}*`})
                                                        .then(results =>
                                                            results.elements.map(v => v)
                                                        )
                                                }
                                                onSelect={item.select}
                                                onChange={item.change}
                                                name={item.name}
                                                placeholder={props.i18n(props.messages, item?.label || "")}
                                            />
                                        ) : null
                                    }
                                    {
                                        item.type === "text" || item.type === "number" ?
                                            (<FormControl
                                                componentClass={item.isArea ? "textarea" : "input"}
                                                placeholder={props.i18n(props.messages, item?.label || "")}
                                                value={item.value() || ""}
                                                type={item.type}
                                                min="0"
                                                style={{height: item.isArea ? "100px" : "auto"}}
                                                readOnly={item.readOnly || !allowChange}
                                                onChange={(v) => item.change(v.target.value, props.typesFicheInfos)}
                                            />) : null
                                    }{
                                        item.type === "combo" && !item?.autocomplete ? (
                                            <Tabou2Combo
                                                load={() => getRequestApi(item.api, props.pluginCfg.apiCfg, {})}
                                                placeholder={props.i18n(props.messages, item?.placeholder || "")}
                                                filter="contains"
                                                disabled={item.readOnly || !allowChange}
                                                textField={item.apiLabel}
                                                onLoad={(r) => r?.elements || r}
                                                name={item.name}
                                                value={item.value()}
                                                onSelect={item.select ? item.select : (v) => changeInfos({[item.name]: v})}
                                                onChange={item.change ? item.change : (v) => !v ? changeInfos({[item.name]: v}) : null}
                                                messages={{
                                                    emptyList: props.i18n(props.messages, "tabou2.emptyList"),
                                                    openCombobox: props.i18n(props.messages, "tabou2.displayList")
                                                }}
                                            />
                                        ) : null
                                    }{
                                        item.type === "date" ? (
                                            <DateTimePicker
                                                type="date"
                                                className="identifyDate"
                                                inline="true"
                                                dropUp
                                                placeholder={props.i18n(props.messages, item?.label || "")}
                                                readOnly={item.readOnly || !allowChange}
                                                calendar
                                                time={false}
                                                culture="fr"
                                                value={getDateValue(item) || null}
                                                format="DD/MM/YYYY"
                                                onSelect={(v) => changeDate(item, v)}
                                                onChange={(v) => changeDate(item, v)}
                                            />
                                        ) : null
                                    }
                                </Col></>
                            )
                        }

                    </Row>
                ))
            }
        </Grid>
    );
}
