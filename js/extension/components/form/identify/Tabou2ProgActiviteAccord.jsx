import React, {useEffect, useState, useRef} from "react";
import { isEmpty, isEqual, pick, has, get, zipObject, keys } from "lodash";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
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

export default function Tabou2ProgActiviteAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const getFields = () => [{
        name: "ql2",
        label: "SCoT",
        field: "ql2",
        type: "checkbox",
        layers:["layerOA","layerSA"],
        source: has(values, "ql2") ? values : operation,
        readOnly: false
    }, {
        name: "ql3",
        label: "Territoire",
        field: "ql3",
        layers:["layerOA","layerSA"],
        type: "text",
        placeholder: "Territoire...",
        source: values?.ql3 ? values : operation,
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
                    <>
                        {
                            item.type !== "checkbox" ? <ControlLabel>{item.label}</ControlLabel> :  null
                        }
                        {
                            item.type === "checkbox" ?
                                (<Checkbox 
                                    inline="true"
                                    style={{marginBottom: "10px"}}
                                    checked={getValue(item) || false}
                                    disabled={item.readOnly}
                                    id={`chbox-${item.name}`}
                                    onChange={() => changeInfos({[item.name]: !getValue(item)})}
                                    className="col-xs-12">
                                    <ControlLabel>{item.label}</ControlLabel>
                                </Checkbox>) : null
                        }{
                            item.type === "text" ?
                                (<FormControl 
                                    placeholder={item.label}
                                    value={getValue(item) || ""}
                                    readOnly={item.readOnly}
                                    onChange={(v) => changeInfos({[item.name]: v.target.value})}
                                />) : null
                        }
                    </>
                ))
            }
        </Grid>
    );
}
