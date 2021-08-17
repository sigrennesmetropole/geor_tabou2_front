import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, get, has } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { Multiselect } from "react-widgets";
import { getRequestApi } from "@ext/api/search";
import "@ext/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
import SearchCombo from '@js/extension/components/form/SearchCombo';
/**
 * Accordion to display info for Identity panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
export default function Tabou2IdentAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    let changeInfos = () => {};

    // create fields from const func
    const getFields = () => [{
        name: "id",
        type: "text",
        label: "tabou2.identify.accordions.idTabou",
        field: "id",
        source: initialItem,
        readOnly: true
    }, {
        name: "code",
        label: "tabou2.identify.accordions.code",
        type: "text",
        field: "code",
        source: values,
        readOnly: false,
        require: true
    }, {
        name: "commune",
        field: "properties.commune",
        label: "tabou2.identify.accordions.city",
        type: "multi",
        source: mapFeature,
        readOnly: true
    }, {
        name: "nature",
        label: "tabou2.identify.accordions.nature",
        field: "nature.libelle",
        type: "text",
        source: operation,
        readOnly: true

    }, {
        layers: ["layerPA"],
        name: "operationId",
        label: "tabou2.identify.accordions.operation",
        field: "operationId",
        value: () => has(values, "operationName") ? values.operationName : operation.nom,
        select: (v) => changeInfos({operationId: v?.id || "", operationName: v?.nom || v}),
        change: (v) => changeInfos({operationId: v?.id || "", operationName: v?.nom || v}),
        autocomplete: "nom",
        type: "combo",
        apiLabel: "nom",
        api: "operations?estSecteur=false&asc=true",
        source: operation,
        readOnly: false
    }, {
        name: "nom",
        field: "nom",
        label: "tabou2.identify.accordions.name",
        type: "text",
        source: values,
        readOnly: false,
        require: true
    }, {
        name: "numAds",
        label: "tabou2.identify.accordions.numAds",
        field: "numAds",
        type: "text",
        source: values,
        readOnly: false
    }];

    const allowChange = props.authent.isContrib || props.authent.isReferent;

    // hooks
    useEffect(() => {
        const calculFields = getFields();
        const mandatoryFields = calculFields.filter(f => f.require).map(f => f.name);
        if (!isEqual(initialItem, values)) {
            setValues(initialItem);
            setFields(calculFields);
            setRequired(mandatoryFields);
        }
    }, [initialItem]);

    // get value for specific item
    const getValue = (item) => {
        if (isEmpty(values) || isEmpty(operation)) return null;
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field);
    };

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
                                item.type === "combo" ? (
                                    <SearchCombo
                                        minLength={3}
                                        textField={item.apiLabel}
                                        valueField={item.apiField}
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
                                item.type === "text" ?
                                    (<FormControl
                                        placeholder={props.i18n(props.messages, item?.label || "")}
                                        value={getValue(item) || ""}
                                        readOnly={item.readOnly || !allowChange}
                                        onChange={(v) => changeInfos({[item.name]: v.target.value})}
                                    />) : null
                            }{
                                item.type === "multi" ? (
                                    <Multiselect
                                        style={{color: "black !important"}}
                                        placeholder={props.i18n(props.messages, item?.label || "")}
                                        value={getValue(item).split(";") || []}
                                        readOnly={item.readOnly || !allowChange}
                                        onChange={() => null}
                                        messages={{
                                            emptyList: item.readOnly ? "tabou2.identify.accordions.notAvailable" : "tabou2.emptyList",
                                            openCombobox: "tabou2.displayList"
                                        }}
                                        className={ item.readOnly ? "tagColor noClick" : "tagColor"}
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
