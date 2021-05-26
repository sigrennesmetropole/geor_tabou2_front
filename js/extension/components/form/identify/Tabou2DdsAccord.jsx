import React, { useEffect, useState } from "react";
import { isEmpty, isEqual, pick, has, get, capitalize } from "lodash";
import { Col, Row, Grid, ControlLabel, Table, FormControl } from "react-bootstrap";
import { DateTimePicker } from "react-widgets";
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import "@ext/css/identify.css";

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

export default function Tabou2DdsAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const getFields = () => [{
        name: "adsDate",
        label: "Date ADS",
        field: "adsDate",
        type: "date",
        layers:["layerPA"],
        placeholder: "Date ADS...",
        source: has(values, "adsDate") ? values : programme,
        readOnly: false
    }, {
        name: "docDate",
        label: "Date DOC",
        field: "docDate",
        type: "date",
        layers:["layerPA"],
        placeholder: "Date DOC...",
        source: has(values, "docDate") ? values : programme,
        readOnly: false
    }, {
        name: "datDate",
        label: "Date DAACT",
        field: "datDate",
        type: "date",
        layers:["layerPA"],
        placeholder: "Date DAACT...",
        source: has(values, "datDate") ? values : programme,
        readOnly: false
    }, {
        name: "permis",
        label: "Liste des permis",
        type: "table",
        fields: ["nom", "promoteur", "etape", "dateLiv"],
        labels: ["Nom", "Promoteur", "Etape", "Date de livraison"],
        layers:["layerPA"],
        source: props?.tabouInfos?.permis?.elements || [],
        readOnly: true
    }, {
        name: "ddc",
        label: "Données DDC",
        type: "table",
        fields: ["nom", "promoteur", "etape", "dateLiv"],
        labels: ["N° ADS", "Date ADS", "Date DOC", "Date DAACT"],
        layers:["layerPA"],
        source: props?.tabouInfos?.permis?.elements || [],
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

    const getValueByField = (field, val) => {
        let fieldVal;
        switch (field) {
            case "dateLiv":
                fieldVal = val ? new Date(val).toLocaleDateString() : val;
                break;
            default:
                fieldVal = val;
                break;
        }
        return fieldVal;
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
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                        {
                            item.type !== "boolean" ? <ControlLabel>{item.label}</ControlLabel> :  null
                        }
                        </Col>
                        {
                            item.type === "date" ? (
                                <Col xs={8}>
                                <UTCDateTimePicker
                                    type="date"
                                    className="identifyDate"
                                    inline
                                    dropUp
                                    placeholder={item?.placeholder}
                                    calendar={true}
                                    time={false}
                                    culture="fr"
                                    value={get(values, item.name) ? new Date(get(values, item.name)) : null}
                                    format="DD/MM/YYYY"
                                    onSelect={(v) => changeInfos({[item.name]: new Date(v).toISOString()})}
                                    onChange={(v) => !v ? changeInfos({[item.name]: null}) : null} />
                                </Col>
                            ) : null
                        }{
                            item.type === "table" ? (
                                <Col xs={12}>
                                <Table striped bordered condensed hover>
                                    <thead>
                                        <tr>
                                            {item.fields.map((fieldName,i) => (<th>{capitalize(item.labels[i])}</th>))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            item.source.map(programme => (
                                                <tr>
                                                    {item.fields.map(field => (
                                                        <>
                                                            <td>{getValueByField(field, get(programme, field))}</td>
                                                        </>
                                                    ))}
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                                </Col>
                            ) : null
                        }
                    </Row>
                ))
            }
        </Grid>
    );
}
