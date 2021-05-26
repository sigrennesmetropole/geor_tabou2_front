import React, {useEffect, useState, useRef} from "react";
import { capitalize, isEmpty, isEqual, pick, has, get, zipObject, keys } from "lodash";
import { Table, Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { getRequestApi } from "@ext/api/search";
import { Multiselect, DateTimePicker } from "react-widgets";
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import "@ext/css/identify.css";

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

export default function Tabou2SecProgLiesAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const getFields = () => [{
        name: "programmes",
        label: "Liste des programmes",
        type: "table",
        fields: ["nom", "promoteur", "etape", "dateLiv"],
        labels: ["Nom", "Promoteur", "Etape", "Date de livraison"],
        layers:["layerOA","layerSA"],
        source: props?.tabouInfos?.programmes?.elements || [],
        readOnly: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

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
                    <Row className="attributeInfos">
                        <Col xs={12}>
                        {
                            item.type !== "checkbox" ? <ControlLabel>{item.label + ' :'}</ControlLabel> :  null
                        }
                        </Col>
                        <Col xs={12}>
                        {
                            item.type === "table" ? (
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
                            ) : null
                        }
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
}
