import React, {useEffect, useState, useRef} from "react";
import { isEmpty, isEqual, pick, has, get, zipObject, keys } from "lodash";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { getRequestApi } from "@ext/api/search";

export default function Tabou2DescribeAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

    const getFields = () => [{
        name: "operation",
        type: "text",
        label: "Opération",
        field: "operation",
        source: has(values, "operation") ? values : operation,
        layers:["layerSA", "layerOA"],
        readOnly: false,
        isArea: true
    }, {
        name: "description",
        label: "Descriptif",
        type: "text",
        field: "description",
        source: has(values, "description") ? values : initialItem,
        readOnly: false,
        isArea: true
    }, {
        name: "consommationEspace",
        field: "consommationEspace.libelle",
        label: "Consommation Espace",
        layers:["layerSA", "layerOA"],
        type: "combo",
        api: `consommation-espace`,
        apiLabel: "libelle",
        placeholder: "Consommation Espace...",
        source: operation,
        readOnly: false
    }, {
        name: "vocation",
        label: "Vocation",
        field: "vocation.libelle",
        layers:["layerSA", "layerOA"],
        type: "combo",
        apiLabel: "libelle",
        api: "vocations",
        placeholder: "Vocations...",
        source: operation,
        readOnly: false

    }, {
        name: "surfaceTotale",
        field: "surfaceTotale",
        label: "Surface Totale",
        type: "number",
        layers:["layerSA", "layerOA"],
        source: values
    }, {
        name: "programme",
        field: "programme",
        label: "Programme",
        type: "text",
        layers:["layerPA"],
        source: programme,
        readOnly: false
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
                    <FormGroup>
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
                        }{
                            item.type === "text" || item.type === "number" ? 
                                (<FormControl
                                    componentClass={item.isArea ? "textarea" : "input"}
                                    placeholder={item.label}
                                    type={item.type}
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
                        }
                    </FormGroup>
                ))
            }
        </Grid>
    );
}
