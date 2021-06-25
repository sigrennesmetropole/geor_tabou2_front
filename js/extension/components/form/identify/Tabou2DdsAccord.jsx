import React, { useEffect, useState } from "react";
import { isEmpty, isEqual, pick, has, get, capitalize } from "lodash";
import { Col, Row, Grid, ControlLabel, Table } from "react-bootstrap";
import { DateTimePicker } from "react-widgets";
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import "@ext/css/identify.css";
import Message from "@mapstore/components/I18N/Message";

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

/**
 * Accordion to display info for DDS panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
export default function Tabou2DdsAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

    /**
     * Create fields to display into table
     * @returns Array of fields
     */
    const getFields = () => [{
        name: "adsDate",
        label: "tabou2.identify.accordions.adsDate",
        field: "adsDate",
        type: "date",
        layers: ["layerPA"],
        source: has(values, "adsDate") ? values : programme,
        readOnly: false
    }, {
        name: "docDate",
        label: "tabou2.identify.accordions.docDate",
        field: "docDate",
        type: "date",
        layers: ["layerPA"],
        source: has(values, "docDate") ? values : programme,
        readOnly: false
    }, {
        name: "datDate",
        label: "tabou2.identify.accordions.daactDate",
        field: "datDate",
        type: "date",
        layers: ["layerPA"],
        source: has(values, "datDate") ? values : programme,
        readOnly: false
    }, {
        name: "ddc",
        label: "tabou2.identify.accordions.ddcData",
        type: "table",
        fields: ["nom", "promoteur", "etape", "dateLiv"],
        labels: [
            "tabou2.identify.accordions.numAds",
            "tabou2.identify.accordions.adsDate",
            "tabou2.identify.accordions.docDate",
            "tabou2.identify.accordions.daactDate"
        ],
        layers: ["layerPA"],
        source: props?.tabouInfos?.permis?.elements || [],
        readOnly: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    /**
     * Effect
     */
    useEffect(() => {
        const calculFields = getFields();
        const mandatoryFields = calculFields.filter(f => f.require).map(f => f.name);
        if (!isEqual(initialItem, values)) {
            setValues(initialItem);
            setFields(calculFields);
            setRequired(mandatoryFields);
        }
    }, [initialItem]);

    /**
     * Get a value to display inside table cell according to a field
     * @param {string} field
     * @param {any} val
     * @returns any
     */
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
    };

    /**
     * Manage info modification
     * @param {Array} item
     */
    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        props.change(accordValues, pick(accordValues, required));
    };

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
                                item.type !== "boolean" ? <ControlLabel><Message msgId={item.label}/></ControlLabel> :  null
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
                                        disabled={!allowChange}
                                        placeholder={props.i18n(props.messages, item?.placeholder || item?.label)}
                                        calendar
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
                                                {item.fields.map((fieldName, i) => (
                                                    <th>{capitalize(props.i18n(props.messages, item.labels[i]))}</th>)
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                item.source.map(programmeItem => (
                                                    <tr>
                                                        {item.fields.map(field => (
                                                            <>
                                                                <td>{getValueByField(field, get(programmeItem, field))}</td>
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
