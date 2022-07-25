import React, { useEffect, useState } from "react";
import { isEmpty, isEqual, pick, has, get, capitalize } from "lodash";
import { Col, Row, Grid, ControlLabel, Table } from "react-bootstrap";
import { DateTimePicker } from "react-widgets";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import ControlledPopover from '@mapstore/components/widgets/widget/ControlledPopover';
momentLocalizer(moment);

/**
 * Accordion to display info for DDS panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
export default function Tabou2DdsAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;
    let getFields;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

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
    }, [props.infos]);

    /**
     * Create fields to display into table
     * @returns Array of fields
     */
    getFields = () => [{
        name: "adsDatePrevu",
        label: "tabou2.identify.accordions.adsDate",
        field: "adsDatePrevu",
        type: "date",
        layers: ["layerPA"],
        source: has(values, "adsDatePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "docDatePrevu",
        label: "tabou2.identify.accordions.docDate",
        field: "docDatePrevu",
        type: "date",
        layers: ["layerPA"],
        source: has(values, "docDatePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "datDatePrevu",
        label: "tabou2.identify.accordions.daactDate",
        field: "datDatePrevu",
        type: "date",
        layers: ["layerPA"],
        source: has(values, "datDatePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "ddc",
        label: "tabou2.identify.accordions.ddcData",
        msg: ["tabou2.getHelp", props.help?.ddc || props.help?.url || ""],
        type: "table",
        fields: ["numAds", "depotDossier", "adsDate", "docDate", "datDatePrevu "],
        labels: [
            "tabou2.identify.accordions.numAds",
            "tabou2.identify.accordions.depotDossier",
            "tabou2.identify.accordions.adsDate",
            "tabou2.identify.accordions.docDate",
            "tabou2.identify.accordions.daactDate"
        ],
        layers: ["layerPA"],
        source: props?.tabouInfos?.permis?.elements || [],
        readOnly: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    /**
     * Get a value to display inside table cell according to a field
     * @param {string} field
     * @param {any} val
     * @returns any
     */
    const getValueByField = (field, val) => {
        let isDate = ["depotDossier", "adsDate", "docDate", "datDatePrevu"].includes(field);
        return isDate && val ? new Date(val).toLocaleDateString() : val;
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

    const changeDate = (field, str) => {
        changeInfos({[field.name]: str ? new Date(str).toISOString() : ""});
    };

    const getDateValue = item => {
        let defaultValue = null;
        if (item.name !== item.field) {
            defaultValue = get(initialItem, `${item.name}.${item.field}`);
        } else if (initialItem[item.name]) {
            defaultValue = get(initialItem, item.name);
        }
        return defaultValue ? new Date(defaultValue) : null;
    };

    /**
     * COMPONENT
     */
    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className = {item.type === "table" ? "tableDisplay" : ""}>
                        <Col xs={item.type === "table" ? 12 : 4}>
                            {
                                item.type !== "boolean" && (
                                    <ControlLabel>
                                        <Message msgId={item.label}/>
                                        {
                                            item.msg && (
                                                <a href={item.msg[1]} className="link-deactivate" target="_blank">
                                                    <ControlledPopover text={<Message msgId={ item.msg[0] }/>} />
                                                </a>)
                                        } :
                                    </ControlLabel>
                                )
                            }
                        </Col>
                        {
                            item.type === "date" && (
                                <Col xs={8}>
                                    <DateTimePicker
                                        type="date"
                                        className="identifyDate"
                                        inline
                                        dropUp
                                        disabled={!allowChange}
                                        placeholder={props.i18n(props.messages, item?.placeholder || item?.label)}
                                        calendar
                                        time={false}
                                        culture="fr"
                                        value={getDateValue(item) || null}
                                        format="DD/MM/YYYY"
                                        onSelect={(v) => changeDate(item, v)}
                                        onChange={(v) => changeDate(item, v)}
                                    />
                                </Col>
                            )
                        }{
                            item.type === "table" && (
                                <Col xs={12} className={"table-accord"}>
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
                            )
                        }
                    </Row>
                ))
            }
        </Grid>
    );
}
