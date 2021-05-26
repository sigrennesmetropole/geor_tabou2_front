import React, {useEffect, useState, useRef} from "react";
import { isEmpty, isEqual, pick, has, get, zipObject, keys } from "lodash";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { getRequestApi } from "@ext/api/search";
import { Multiselect } from "react-widgets";
import "@ext/css/identify.css";

export default function Tabou2GouvernanceAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const getFields = () => [{
        name: "promoteur",
        label: "Promoteur",
        type: "multi",
        data: props.tiers.filter(t => t.libelle === "Maître d'ouvrage").map(t => t.nom),
        readOnly: true
    }, {
        name: "decision",
        label: "Décision",
        field: "decision.libelle",
        layers:["layerSA", "layerOA"],
        type: "combo",
        apiLabel: "libelle",
        api: "decisions",
        placeholder: "Décisions...",
        source: operation,
        readOnly: false
    }, {
        name: "maitriseOuvrage",
        label: "Maîtrise d'ouvrage",
        field: "maitriseOuvrage.libelle",
        layers:["layerSA", "layerOA"],
        type: "combo",
        apiLabel: "libelle",
        api: "maitrise-ouvrage",
        placeholder: "Maîtrise d'ouvrage...",
        source: operation,
        readOnly: false
    }, {
        layers:["layerSA", "layerOA"],
        name: "modeAmenagement",
        label: "Mode d'aménagement",
        field: "modeAmenagement.libelle",
        type: "combo",
        apiLabel: "libelle",
        api: "mode-amenagement",
        placeholder: "Mode d'aménagement...",
        source: initialItem,
        readOnly: false
    }, {
        name: "amenageur",
        field: "nom",
        label: "Aménageurs",
        layers:["layerSA", "layerOA"],
        type: "multi",
        data: props.tiers.filter(t => t.libelle === "Maître d'ouvrage").map(t => t.nom),
        readOnly: true
    },{
        name: "moe",
        label: "Maîtrise d'oeuvre",
        type: "multi",
        data: props.tiers.filter(t => t.libelle === "Maître d'oeuvre").map(t => t.nom),
        readOnly: true
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
        console.log(itemSrc);
        return get(itemSrc, item?.field);
    }

    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        props.change(accordValues, pick(accordValues, required));
    }

    /**
     * COMPONENT
     */
    const marginTop = "10px";
    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                        {
                            item.type !== "boolean" ? <ControlLabel>{item.label}</ControlLabel> :  null
                        }
                        {
                            item.type === "boolean" ?
                                (<Checkbox 
                                    inline="true"
                                    checked={item.value(item) || false}
                                    disabled={item.readOnly}
                                    id={`chbox-${item.name}`}
                                    className="col-xs-5">
                                    <ControlLabel>{item.label}</ControlLabel>
                                </Checkbox>) : null
                        }
                        </Col>
                        <Col xs={8}>
                        {
                            item.type === "text" ?
                                (<FormControl 
                                    placeholder={item.label}
                                    value={getValue(item) || ""}
                                    readOnly={item.readOnly}
                                    onChange={(v) => changeInfos({[item.name]: v.target.value})}
                                />) : null
                        }{
                            item.type === "combo" ? (
                                <Tabou2Combo
                                    load={() => getRequestApi(item.api, props.pluginCfg.apiCfg, {})}
                                    disabled={item?.readOnly || false}
                                    placeholder={item?.placeholder || ""}
                                    filter="contains"
                                    textField={item.apiLabel}
                                    onLoad={(r) => r?.elements || r}
                                    name={item.name}
                                    value={get(values, item.name)}
                                    onSelect={(v) => changeInfos({[item.name]: v})}
                                    onChange={(v) => !v ? changeInfos({[item.name]: v}) : null}
                                    messages={{
                                        emptyList: 'La liste est vide.',
                                        openCombobox: 'Ouvrir la liste'
                                    }}
                                />
                            ) : null
                        }{
                            item.type === "multi" ? (
                                <Multiselect
                                    readOnly={item.readOnly}
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
