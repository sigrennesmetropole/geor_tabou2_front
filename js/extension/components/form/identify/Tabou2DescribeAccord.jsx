import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, has, get } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { getRequestApi } from "@ext/api/search";
import "@ext/css/identify.css";
import Message from "@mapstore/components/I18N/Message";

/**
 * Accordion to display info for describe panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
export default function Tabou2DescribeAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

    const getFields = () => [{
        name: "operation",
        type: "text",
        label: "tabou2.identify.accordions.operation",
        field: "operation",
        source: has(values, "operation") ? values : operation,
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
        name: "consommationEspace",
        field: "consommationEspace.libelle",
        label: "tabou2.identify.accordions.space",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        api: `consommation-espace`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.spaceEmpty",
        source: operation,
        readOnly: false
    }, {
        name: "vocation",
        label: "tabou2.identify.accordions.vocation",
        field: "vocation.libelle",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        apiLabel: "libelle",
        api: "vocations",
        placeholder: "tabou2.identify.accordions.vocationEmpty",
        source: operation,
        readOnly: false

    }, {
        name: "surfaceTotale",
        field: "surfaceTotale",
        label: "tabou2.identify.accordions.totalSpace",
        type: "number",
        step: 0.1,
        layers: ["layerSA", "layerOA"],
        source: values
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
    }, [initialItem]);

    const getValue = (item) => {
        if (isEmpty(values) || isEmpty(operation)) return null;
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field);
    };

    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        props.change(accordValues, pick(accordValues, required));
    };

    const allowChange = props.authent.isContrib || props.authent.isReferent;
    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                            <ControlLabel><Message msgId={item.label}/></ControlLabel>
                        </Col>
                        <Col xs={8}>
                            {
                                item.type === "text" || item.type === "number" ?
                                    (<FormControl
                                        componentClass={item.isArea ? "textarea" : "input"}
                                        placeholder={props.i18n(props.messages, item?.placeholder || item.label)}
                                        style={{height: item.isArea ? "100px" : "auto"}}
                                        type={item.type}
                                        min="0"
                                        step={item?.step}
                                        value={getValue(item) || ""}
                                        readOnly={item.readOnly || !allowChange}
                                        onChange={(v) => {
                                            return changeInfos({
                                                [item.name]: item.type === "number" && v.target.value < 0 ? "" : v.target.value
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
                                        load={() => getRequestApi(item.api, props.pluginCfg.apiCfg, {})}
                                        placeholder={props.i18n(props.messages, item?.placeholder || "")}
                                        filter="contains"
                                        disabled={item.readOnly || !allowChange}
                                        textField={item.apiLabel}
                                        onLoad={(r) => r?.elements || r}
                                        name={item.name}
                                        value={get(values, item.name)}
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
