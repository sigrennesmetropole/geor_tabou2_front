import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, get, find } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { getRequestApi } from "@js/extension/api/requests";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
import SearchCombo from '@js/extension/components/form/SearchCombo';
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
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
    // "descriptionsFoncier", ["typesFonciers.code", "FONCIER_PUBLIC"], "description", "myNewvValue"
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
        // BLOC Foncier et occupation
        name: "descriptionsFoncier",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPublicDescription",
        field: "descriptionsFoncier.description",
        readOnly: false,
        value: () => find(get(initialItem, "descriptionsFoncier"), ["typeFoncier.code", "FONCIER_PUBLIC"])?.description,
        change: (v, types) => changeFoncier(types, "descriptionsFoncier", ["typeFoncier.code", "FONCIER_PUBLIC"], "description", v)
    }, {
        name: "descriptionsFoncier",
        type: "number",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPublicTaux",
        field: "descriptionsFoncier.taux",
        readOnly: false,
        value: () => find(get(initialItem, "descriptionsFoncier"), ["typeFoncier.code", "FONCIER_PUBLIC"])?.taux,
        change: (v, types) => changeFoncier(types, "descriptionsFoncier", ["typeFoncier.code", "FONCIER_PUBLIC"], "taux", v)
    }, {
        name: "descriptionsFoncier",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPriveDescription",
        field: "descriptionsFoncier.description",
        readOnly: false,
        value: () => find(get(initialItem, "descriptionsFoncier"), ["typeFoncier.code", "FONCIER_PRIVE"])?.description,
        change: (v, types) => changeFoncier(types, "descriptionsFoncier", ["typeFoncier.code", "FONCIER_PRIVE"], "description", v)
    }, {
        name: "descriptionsFoncier",
        type: "number",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPriveTaux",
        field: "descriptionsFoncier.taux",
        readOnly: false,
        value: () => find(get(initialItem, "descriptionsFoncier"), ["typeFoncier.code", "FONCIER_PRIVE"])?.taux,
        change: (v, types) => changeFoncier(types, "descriptionsFoncier", ["typeFoncier.code", "FONCIER_PRIVE"], "taux", v)
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
        source: initialItem,
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
        api: `types-fonciers?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        source: initialItem,
        readOnly: false,
        value: () => get(initialItem, "outilFoncier.libelle"),
        select: (v) => changeInfos({ outilFoncier: v }),
        change: (v) => changeInfos(v ? { outilFoncier: v } : { outilFoncier: null })
    }, {
        name: "plui",
        type: "text",
        label: "tabou2.identify.accordions.pluiDisposition",
        field: "plui.pluiDisposition",
        source: () => initialItem,
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
        source: () => initialItem,
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: () => get(initialItem, "plui.pluiAdaptation"),
        change: (v) => changeInfos({ plui: { ...initialItem.plui, pluiAdaptation: v } })
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

    return (
        <Grid style={{ width: "100%" }}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
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
                                        value={item.value()}
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
                                        value={get(item.source, item.field)}
                                        onSelect={(v) => changeInfos({[item.name]: v})}
                                        onChange={(v) => !v ? changeInfos({[item.name]: v}) : null}
                                        messages={{
                                            emptyList: props.i18n(props.messages, "tabou2.emptyList"),
                                            openCombobox: props.i18n(props.messages, "tabou2.displayList")
                                        }}
                                    />
                                ) : null
                            }
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
}
