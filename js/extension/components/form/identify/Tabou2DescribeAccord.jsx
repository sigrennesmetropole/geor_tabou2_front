import React, {useEffect, useState, memo } from "react";
import { isEmpty, isEqual, pick, has, get } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel, Button } from "react-bootstrap";
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import { getRequestApi } from "@js/extension/api/requests";
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
    programme,
    operation,
    layer,
    authent,
    change = () => { },
    changeProp = () => { },
    messages,
    apiCfg,
    i18n = () => { },
    vocationsInfos
}) => {
    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const [opened, setOpened] = useState(false);
    let getValue = () => { };

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
        name: "programme",
        field: "programme",
        label: "tabou2.identify.accordions.programme",
        type: "text",
        layers: ["layerPA"],
        source: has(values, "programme") ? values : programme,
        readOnly: false,
        isArea: true
    }, {
        name: "description",
        label: "tabou2.identify.accordions.describe",
        type: "text",
        field: "description",
        source: has(values, "description") ? values : initialItem,
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
        name: "surfaceParent",
        field: "surfaceParent",
        label: "tabou2.identify.accordions.totalSpace",
        type: "number",
        step: 0.1,
        layers: ["layerSA"],
        source: initialItem,
        readOnly: true
    }, {
        name: "surfaceTotale",
        field: "surfaceTotale",
        label: layer === "layerSA" ? "tabou2.identify.accordions.sectorSpace" : "tabou2.identify.accordions.totalSpace",
        type: "number",
        step: 0.1,
        layers: ["layerSA", "layerOA"],
        source: initialItem
    }, {
        name: "usageActuel",
        type: "text",
        label: "tabou2.identify.accordions.usageActuel",
        field: "usageActuel",
        source: has(values, "usageActuel") ? values : operation,
        layers: ["layerSA", "layerOA"],
        readOnly: false,
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
        let newValues = { ...values, ...item };
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        change(accordValues, pick(accordValues, required));
    };

    const allowChange = authent.isContrib || authent.isReferent;
    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                            <ControlLabel><Message msgId={item.label} /></ControlLabel>
                        </Col>
                        <Col xs={8}>
                            {
                                item.type === "text" || item.type === "number" ?
                                    (<FormControl
                                        componentClass={item.isArea ? "textarea" : "input"}
                                        placeholder={i18n(messages, item?.placeholder || item.label)}
                                        style={{ height: item.isArea ? "100px" : "auto" }}
                                        type={item.type}
                                        min="0"
                                        step={item?.step}
                                        value={item.value ? item.value(item) : getValue(item) || ""}
                                        readOnly={item.readOnly || !allowChange}
                                        onChange={(v) => {
                                            const val = item.type === "number" ? parseFloat(v.target.value) : v.target.value;
                                            return changeInfos({
                                                [item.name]: item.type === "number" && val < 0 ? "" : val
                                            });
                                        }}
                                        onKeyDown={(v) => {
                                            if (item.type !== "number") return;
                                            // only keep numeric and special key control as "Delete" or "Backspace"
                                            if (!new RegExp('^[0-9\.\,]').test(v.key) && v.key.length < 2) {
                                                v.returnValue = false;
                                                if (v.preventDefault) v.preventDefault();
                                            }
                                        }}
                                    />) : null
                            }{
                                item.type === "combo" ? (
                                    <Tabou2Combo
                                        load={() => getRequestApi(item.api, apiCfg, {})}
                                        placeholder={i18n(messages, item?.placeholder || "")}
                                        filter="contains"
                                        disabled={item.readOnly || !allowChange}
                                        textField={item.apiLabel}
                                        onLoad={(r) => r?.elements || r}
                                        name={item.name}
                                        value={get(values, item.name)}
                                        onSelect={(v) => changeInfos({ [item.name]: v })}
                                        onChange={(v) => !v ? changeInfos({ [item.name]: v }) : null}
                                        messages={{
                                            emptyList: i18n(messages, "tabou2.emptyList"),
                                            openCombobox: i18n(messages, "tabou2.displayList")
                                        }}
                                    />
                                ) : null
                            }{
                                item.type === "vocation" && (
                                    <>
                                        <FormControl readOnly value={get(values, "vocation.libelle")} className={"vocation-libelle "} />
                                        <Button
                                            tooltip="Vocations"
                                            className="vocation-btn"
                                            bsStyle="primary"
                                            onClick={() => setOpened(true)}>
                                            {i18n(messages, "tabou2.vocation.btnLabel")}
                                        </Button>
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
