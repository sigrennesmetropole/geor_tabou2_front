import React, {useEffect, useState, memo} from "react";
import {isEmpty, isEqual, pick, has, get} from "lodash";
import {Col, Row, FormControl, Grid, ControlLabel, Button} from "react-bootstrap";
import Tabou2Select from '@js/extension/components/form/Tabou2Select';
import {getRequestApi} from "@js/extension/api/requests";
import {
    isVocationPlae,
    VOCATIONS_PLAE_API,
    RENOUVELLEMENTS_ECONOMIQUES_PLAE_API
} from "@js/extension/components/form/vocations/utils";
import "@js/extension/css/identify.css";
import "@js/extension/css/vocation.css";
import Message from "@mapstore/components/I18N/Message";

import Tabou2VocationModal from "../../tabou2IdentifyPanel/modals/Tabou2VocationModal";

const avoidReRender = (prevProps, nextProps) => {
    let avoid = false;
    if (
        isEqual(prevProps.initialItem, nextProps.initialItem)
            && isEqual(prevProps.vocationsInfos, nextProps.vocationsInfos)
            && isEqual(prevProps.operation, nextProps.operation)
            && isEqual(prevProps.layer, nextProps.layer)
            && isEqual(prevProps.programme, nextProps.programme)
    ) {
        avoid = true;
    }
    return avoid; // re render if false
};
/**
 * Accordion to display info for describe panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
const Tabou2DescribeAccord = ({
    initialItem,
    mapFeature,
    programme,
    operation,
    layer,
    authent,
    change = () => {
    },
    changeProp = () => {
    },
    messages,
    apiCfg,
    i18n = () => {
    },
    vocationsInfos
}) => {
    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const [opened, setOpened] = useState(false);
    let getValue;

    const getFields = () => [{
        name: "localisation",
        type: "text",
        label: "tabou2.identify.accordions.localisation",
        field: "localisation",
        source: has(values, "localisation") ? values : operation,
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true
    }, {
        name: "description",
        label: "tabou2.identify.accordions.describe",
        type: "text",
        field: "description",
        source: has(values, "description") ? values : initialItem,
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true
    }, {
        name: "vocationPlae",
        label: "tabou2.vocation.vocationPlae",
        type: "combo",
        apiLabel: "libelle",
        api: VOCATIONS_PLAE_API,
        placeholder: "tabou2.identify.accordions.emptySelect",
        layers: ["layerSA", "layerOA"],
        showIf: isVocationPlae,
        readOnly: false
    }, {
        name: "renouvellementEconomiquePlae",
        label: "tabou2.vocation.renouvellementEconomiquePlae",
        type: "combo",
        apiLabel: "libelle",
        api: RENOUVELLEMENTS_ECONOMIQUES_PLAE_API,
        placeholder: "tabou2.identify.accordions.emptySelect",
        layers: ["layerSA", "layerOA"],
        showIf: isVocationPlae,
        readOnly: false
    }, {
        name: "description",
        label: "tabou2.identify.accordions.localisation",
        type: "text",
        field: "description",
        source: has(values, "description") ? values : initialItem,
        layers: ["layerPA"],
        readOnly: false,
        isArea: true
    }, {
        name: "programme",
        field: "programme",
        label: "tabou2.identify.accordions.describe",
        type: "text",
        layers: ["layerPA"],
        source: has(values, "programme") ? values : programme,
        readOnly: false,
        isArea: true
    }, {
        name: "vocation",
        label: "tabou2.identify.accordions.vocation",
        field: "vocation.libelle",
        layers: ["layerSA", "layerOA"],
        type: "vocation",
        apiLabel: "libelle",
        api: "vocations",
        placeholder: "tabou2.identify.accordions.vocationEmpty",
        source: operation,
        readOnly: false

    }, {
        name: "vocation",
        label: "tabou2.identify.accordions.vocation",
        field: "vocation",
        layers: ["layerPA"],
        type: "combo",
        apiLabel: "libelle",
        api: "vocations?orderBy=id&asc=true",
        placeholder: "tabou2.identify.accordions.vocationEmpty",
        allowClear: false,
        readOnly: false
    }, {
        name: "vocationPlae",
        label: "tabou2.vocation.vocationPlae",
        type: "combo",
        apiLabel: "libelle",
        api: VOCATIONS_PLAE_API,
        placeholder: "tabou2.identify.accordions.emptySelect",
        layers: ["layerPA"],
        readOnly: false
    }, {
        name: "renouvellementEconomiquePlae",
        label: "tabou2.vocation.renouvellementEconomiquePlae",
        type: "combo",
        apiLabel: "libelle",
        api: RENOUVELLEMENTS_ECONOMIQUES_PLAE_API,
        placeholder: "tabou2.identify.accordions.emptySelect",
        layers: ["layerPA"],
        readOnly: false
    }, {
        layers: ["layerPA"],
        name: "aireGeoHa",
        label: "tabou2.identify.accordions.programSpace",
        value: () => mapFeature?.properties?.aire_geo_ha ?? null,
        type: "number",
        readOnly: true
    }, {
        layers: ["layerPA"],
        name: "surfacePrevisionnelle",
        field: "surfacePrevisionnelle",
        label: "tabou2.identify.accordions.surfacePrevisionnelle",
        type: "number",
        integer: true,
        step: 1,
        source: values,
        readOnly: false
    }, {
        layers: ["layerPA"],
        name: "aireGeoHaParent",
        label: "tabou2.identify.accordions.totalSpace",
        value: () => mapFeature?.properties?.aire_geo_ha_parent ?? null,
        type: "number",
        readOnly: true
    }, {
        // Même donnée que la SHAB de l'onglet "Programmation habitat"
        layers: ["layerPA"],
        name: "surfaceSHAB",
        field: "surfaceSHAB",
        label: "tabou2.identify.accordions.SHABSpace",
        type: "number",
        step: 0.1,
        habitat: true,
        source: {surfaceSHAB: has(values, "surfaceSHAB") ? values.surfaceSHAB : get(values, "programmationHabitat.surfaceSHAB")},
        readOnly: false
    }, {
        layers: ["layerPA"],
        name: "surfaceConstruite",
        field: "surfaceConstruite",
        label: "tabou2.identify.accordions.surfaceConstruite",
        type: "number",
        step: 0.1,
        source: values,
        readOnly: false
    }, {
        layers: ["layerSA"],
        name: "aireGeoHaParent",
        label: "tabou2.identify.accordions.totalSpace",
        value: () => mapFeature?.properties?.aire_geo_ha_parent ?? null,
        type: "number",
        readOnly: true
    }, {
        name: "aireGeoHa",
        field: "aireGeoHa",
        label: "tabou2.identify.accordions.totalSpace",
        type: "number",
        layers: ["layerOA"],
        value: () => mapFeature?.properties?.aire_geo_ha ?? null,
        readOnly: true
    }, {
        name: "aireGeoHa",
        label: "tabou2.identify.accordions.sectorSpace",
        type: "number",
        layers: ["layerSA"],
        value: () => mapFeature?.properties?.aire_geo_ha ?? null,
        readOnly: true
    }, {
        name: "mos",
        type: "text",
        label: "tabou2.identify.accordions.mos",
        field: "mos",
        layers: ["layerSA", "layerOA"],
        readOnly: true,
        isArea: true
    }, {
        name: "objectifs",
        type: "text",
        label: "tabou2.identify.accordions.objectifs",
        field: "objectifs",
        source: has(values, "objectifs") ? values : operation,
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    /**
     * Effect
     */
    // return writable fields as object-keys

    useEffect(() => {
        const calculFields = getFields();
        const mandatoryFields = calculFields.filter(f => f.require).map(f => f.name);
        if (!isEqual(initialItem, values)) {
            setValues(initialItem);
            setFields(calculFields);
            setRequired(mandatoryFields);
        }
    }, [JSON.stringify(initialItem)]);

    getValue = (item) => {
        if (isEmpty(values) && isEmpty(operation)) return null;
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field);
    };

    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        change(accordValues, pick(accordValues, required));
    };

    // La SHAB est portée par la programmation habitat du programme
    const changeSurfaceSHAB = (surfaceSHAB) => {
        const programmationHabitat = {...(values?.programmationHabitat || {}), surfaceSHAB};
        setValues({...values, surfaceSHAB, programmationHabitat});
        change({surfaceSHAB, programmationHabitat}, {});
    };

    const parseNumber = (item, raw) => {
        if (raw === "" || raw === null || raw === undefined) return null;
        const val = item.integer ? parseInt(raw, 10) : parseFloat(raw);
        return isNaN(val) || val < 0 ? null : val;
    };

    const allowChange = authent.isContrib || authent.isReferent;
    const currentVocation = values?.vocation || operation?.vocation;
    const visibleFields = fields
        .filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1)
        .filter(f => !f.showIf || f.showIf(currentVocation));
    return (
        <Grid style={{width: "100%"}} className={""}>
            {
                visibleFields.map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                            <ControlLabel style={item.labelStyle || {}}><Message msgId={item.label}/></ControlLabel>
                        </Col>
                        <Col xs={8}>
                            {
                                item.type === "text" || item.type === "number" ?
                                    (<FormControl
                                        componentClass={item.isArea ? "textarea" : "input"}
                                        placeholder={i18n(messages, item?.placeholder || item.label)}
                                        style={{height: item.isArea ? "100px" : "auto"}}
                                        type={item.type}
                                        min="0"
                                        step={item?.step}
                                        value={item.value ? item.value(item) : (getValue(item) ?? "")}
                                        readOnly={item.readOnly || !allowChange}
                                        onChange={(v) => {
                                            if (item.type !== "number") {
                                                return changeInfos({[item.name]: v.target.value});
                                            }
                                            const val = parseNumber(item, v.target.value);
                                            return item.habitat ? changeSurfaceSHAB(val) : changeInfos({[item.name]: val});
                                        }}
                                        onKeyDown={(v) => {
                                            if (item.type !== "number") return;
                                            // only keep numeric and special key control as "Delete" or "Backspace"
                                            const allowed = item.integer ? /^\d/ : /^[0-9.,]/;
                                            if (!allowed.test(v.key) && v.key.length < 2) {
                                                v.returnValue = false;
                                                if (v.preventDefault) v.preventDefault();
                                            }
                                        }}
                                    />) : null
                            }{
                                item.type === "combo" ? (
                                    <Tabou2Select
                                        textField={item.apiLabel}
                                        valueField="id"
                                        value={get(values, item.name)}
                                        search={() => {
                                            return getRequestApi(item.api, apiCfg, {})
                                                .then(results => Array.isArray(results) ? results : (results.elements || []));
                                        }}
                                        onSelect={(v) => changeInfos({[item.name]: v})}
                                        onChange={(v) => !v ? changeInfos({[item.name]: v}) : null}
                                        placeholder={i18n(messages, item?.placeholder || "")}
                                        disabled={item.readOnly || !allowChange}
                                        allowClear={item.allowClear ?? true}
                                    />
                                ) : null
                            }{
                                item.type === "vocation" && (
                                    <>
                                        <FormControl readOnly value={get(values, "vocation.libelle")}
                                            className={"vocation-libelle "}/>
                                        <Button
                                            tooltip="Vocations"
                                            className="vocation-btn"
                                            bsStyle="primary"
                                            onClick={() => setOpened(true)}>
                                            {i18n(messages, "tabou2.vocation.btnLabel")}
                                        </Button>
                                        {opened && (
                                            // Montée à l'ouverture pour repartir des valeurs courantes de la fiche
                                            <Tabou2VocationModal
                                                i18n={i18n}
                                                messages={messages}
                                                operation={operation}
                                                initialItems={initialItem}
                                                update={changeProp}
                                                opened={opened}
                                                allowChange={allowChange}
                                                close={() => setOpened(false)}
                                                {...vocationsInfos}
                                            />
                                        )}
                                    </>
                                )
                            }
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
};

export default memo(Tabou2DescribeAccord, avoidReRender);
