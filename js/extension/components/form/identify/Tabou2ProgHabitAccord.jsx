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

export default function Tabou2ProgHabitatAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const getFields = () => [{
        name: "nbLogementsPrevu",
        layers:["layerSA", "layerOA"],
        label: "Nombre de logements",
        field: "nbLogementsPrevu",
        type: "number",
        placeholder: "Nombre de logements...",
        source: values?.nbLogementsPrevu ? values : operation,
        readOnly: false
    }, {
        name: "plhLogementsPrevus",
        layers:["layerSA", "layerOA"],
        label: "PLH-Nombre de logements prévus",
        field: "plhLogementsPrevus",
        type: "number",
        placeholder: "PLH-Nombre de logements prévus...",
        source: values?.plhLogementsPrevus ? values : operation,
        readOnly: false
    }, {
        name: "plhLogementsLivres",
        layers:["layerSA", "layerOA"],
        label: "PLH-Nombre de logements livrés",
        field: "plhLogementsLivres",
        type: "number",
        placeholder: "PLH-Nombre de logements prévus...",
        source: values?.plhLogementsLivres ? values : operation,
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
                            item.type !== "boolean" ? <ControlLabel>{item.label}</ControlLabel> :  null
                        }{
                            item.type === "text" || item.type === "number" ?
                                (<FormControl
                                    type={item.type}
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
