import React, { useEffect, useState } from "react";
import { isEmpty, isEqual, pick, has, get } from "lodash";
import { Checkbox, Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { DateTimePicker } from "react-widgets";
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import "@ext/css/identify.css";

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

export default function Tabou2ProgActiviteAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const getFields = () => [{
        // OPERATION
        name: "ql3",
        label: "Territoire",
        field: "ql3",
        layers:["layerOA","layerSA"],
        type: "text",
        placeholder: "Territoire...",
        source: values?.ql3 ? values : operation,
        readOnly: false
    }, {
        name: "ql2",
        label: "SCoT",
        field: "ql2",
        type: "checkbox",
        layers:["layerOA","layerSA"],
        source: has(values, "ql2") ? values : operation,
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

    const allowChange = props.authent.isContrib || props.authent.isReferent;
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
                            item.type !== "checkbox" ? <ControlLabel>{item.label}</ControlLabel> :  null
                        }
                        {
                            item.type === "checkbox" ?
                                (<Checkbox 
                                    inline="true"
                                    style={{marginBottom: "10px"}}
                                    checked={getValue(item) || false}
                                    disabled={item.readOnly || !allowChange}
                                    id={`chbox-${item.name}`}
                                    onChange={() => changeInfos({[item.name]: !getValue(item)})}
                                    className="col-xs-12">
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
                        }
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
}
