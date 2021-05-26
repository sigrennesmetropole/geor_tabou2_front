import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, get } from "lodash";
import { Checkbox, Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { Multiselect } from "react-widgets";
import "@ext/css/identify.css";

export default function Tabou2IdentAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

    const getFields = () => [{
        name: "id",
        type: "text",
        label: "ID Tabou",
        field: "id",
        source: initialItem,
        readOnly: true
    }, {
        name: "code",
        label: "Code",
        type: "text",
        field: "code",
        source: values,
        readOnly: false,
        require: true
    }, {
        name: "commune",
        field: "properties.commune",
        label: "Commune",
        type: "multi",
        source: mapFeature,
        readOnly: true
    }, {
        name: "nature",
        label: "Nature",
        field: "nature.libelle",
        type: "text",
        source: operation,
        readOnly: true

    }, {
        name: "operation",
        field: "nom",
        label: "Opération",
        type: "text",
        source: operation,
        readOnly: true
    }, {
        name: "nom",
        field: "nom",
        label: "Nom",
        type: "text",
        source: values,
        readOnly: false,
        require: true
    }, {
        name: "numAds",
        label: "Num ADS",
        field: "numAds",
        type: "text",
        source: values,
        readOnly: false
    }];

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
    return (
        <Grid style={{ width: "100%" }}>
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
                                    disabled={item.readOnly || !allowChange}
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
                                    readOnly={item.readOnly || !allowChange}
                                    onChange={(v) => changeInfos({[item.name]: v.target.value})}
                                />) : null
                        }{
                            item.type === "multi" ? (
                                <Multiselect
                                    style={{color:"black !important"}}
                                    value={getValue(item).split(";") || []}
                                    readOnly={item.readOnly || !allowChange}
                                    messages={{
                                        emptyList: item.readOnly ? "Aucune modification possible" : "Liste vide",
                                        openCombobox: 'Ouvrir la liste'
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
