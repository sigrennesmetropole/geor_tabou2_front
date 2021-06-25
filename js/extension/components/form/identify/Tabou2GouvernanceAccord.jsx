import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, get } from "lodash";
import { Checkbox, Col, Row, Grid, ControlLabel } from "react-bootstrap";
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { getRequestApi } from "@ext/api/search";
import { Multiselect } from "react-widgets";
import "@ext/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
/**
 * Accordion to display info for Gouvernance panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
export default function Tabou2GouvernanceAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

    const getFields = () => [{
        name: "promoteur",
        label: "tabou2.identify.accordions.promoteur",
        layers: ["layerPA"],
        type: "multi",
        data: props.tiers.filter(t => t.typeTiers.id === 1).map(t => t.tiers.nom),
        readOnly: true
    }, {
        name: "decision",
        label: "tabou2.identify.accordions.decision",
        field: "decision.libelle",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        apiLabel: "libelle",
        api: "decisions",
        source: operation,
        readOnly: false
    }, {
        name: "maitriseOuvrage",
        label: "tabou2.identify.accordions.moa",
        field: "maitriseOuvrage.libelle",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        apiLabel: "libelle",
        api: "maitrise-ouvrage",
        source: operation,
        readOnly: false
    }, {
        layers: ["layerSA", "layerOA"],
        name: "modeAmenagement",
        label: "tabou2.identify.accordions.modeAmenagement",
        field: "modeAmenagement.libelle",
        type: "combo",
        apiLabel: "libelle",
        api: "mode-amenagement",
        source: initialItem,
        readOnly: false
    }, {
        name: "amenageur",
        field: "nom",
        label: "tabou2.identify.accordions.amenageur",
        layers: ["layerSA", "layerOA"],
        type: "multi",
        data: props.tiers.filter(t => t.typeTiers.id === 1).map(t => t.tiers.nom),
        readOnly: true
    }, {
        name: "moe",
        label: "tabou2.identify.accordions.moe",
        type: "multi",
        data: props.tiers.filter(t => t.typeTiers.id === 2).map(t => t.tiers.nom),
        readOnly: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    const allowChange = props.authent.isContrib || props.authent.isReferent;
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

    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        props.change(accordValues, pick(accordValues, required));
    };

    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                            {
                                item.type !== "boolean" ? <ControlLabel><Message msgId={item.label}/></ControlLabel> :  null
                            }
                            {
                                item.type === "boolean" ?
                                    (<Checkbox
                                        inline="true"
                                        checked={item.value(item) || false}
                                        disabled={item.readOnly || !allowChange}
                                        id={`chbox-${item.name}`}
                                        className="col-xs-5">
                                        <ControlLabel><Message msgId={item.label}/></ControlLabel>
                                    </Checkbox>) : null
                            }
                        </Col>
                        <Col xs={8}>
                            {
                                item.type === "combo" ? (
                                    <Tabou2Combo
                                        load={() => getRequestApi(item.api, props.pluginCfg.apiCfg, {})}
                                        placeholder={props.i18n(props.messages, item?.label || "")}
                                        filter="contains"
                                        textField={item.apiLabel}
                                        disabled={item?.readOnly || !allowChange}
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
                            }{
                                item.type === "multi" ? (
                                    <Multiselect
                                        placeholder={props.i18n(props.messages, item?.label || "")}
                                        readOnly={item.readOnly || !allowChange}
                                        value={item.data}
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
