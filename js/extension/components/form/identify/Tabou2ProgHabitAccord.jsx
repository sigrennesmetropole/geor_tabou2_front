import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, has, get, capitalize } from "lodash";
import { Col, Row, Table, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { DateTimePicker } from "react-widgets";
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import "@ext/css/identify.css";
import Message from "@mapstore/components/I18N/Message";

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
    // create fields from const func
    const getFields = () => [{
    // OPERATION
        name: "nbLogementsPrevu",
        layers:["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.logementPlan",
        field: "nbLogementsPrevu",
        type: "number",
        source: values?.nbLogementsPrevu ? values : operation,
        readOnly: false
    }, {
        name: "plhLogementsPrevus",
        layers:["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.plhPlan",
        field: "plhLogementsPrevus",
        type: "number",
        source: values?.plhLogementsPrevus ? values : operation,
        readOnly: false
    }, {
        name: "plhLogementsLivres",
        layers:["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.plhLiv",
        field: "plhLogementsLivres",
        type: "number",
        source: values?.plhLogementsLivres ? values : operation,
        readOnly: false
    },// PROGRAMME
    {
        name: "attributionFonciereAnnee",
        label: "tabou2.identify.accordions.yearAttrib",
        field: "attributionFonciereAnnee",
        layers:["layerPA"],
        type: "number",
        source: has(values, "attributionFonciereAnnee") ? values : programme,
        readOnly: false
    }, {
        name: "attributionDate",
        label: "tabou2.identify.accordions.dateAttrib",
        field: "attributionDate",
        type: "date",
        layers:["layerPA"],
        source: has(values, "attributionDate") ? values : programme,
        readOnly: false
    }, {
        name: "commercialisationDate",
        label: "tabou2.identify.accordions.dateCom",
        field: "commercialisationDate",
        type: "date",
        layers:["layerPA"],
        source: has(values, "commercialisationDate") ? values : programme,
        readOnly: false
    }, {
        name: "logementsTotal",
        label: "tabou2.identify.accordions.totalLog",
        field: "logementsTotal",
        layers:["layerPA"],
        type: "number",
        source: has(values, "logementsTotal") ? values : programme,
        readOnly: false
    }, {
        name: "logementsAccessAidePrevu",
        label: "tabou2.identify.accordions.helpAccess",
        field: "logementsAccessAidePrevu",
        layers:["layerPA"],
        type: "number",
        source: has(values, "logementsAccessAidePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsAccessLibrePrevu",
        label: "tabou2.identify.accordions.freeAccess",
        field: "logementsAccessLibrePrevu",
        layers:["layerPA"],
        type: "number",
        source: has(values, "logementsAccessLibrePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsAccessMaitrisePrevu",
        label: "tabou2.identify.accordions.controlAccess",
        field: "logementsAccessMaitrisePrevu",
        layers:["layerPA"],
        type: "number",
        source: has(values, "logementsAccessMaitrisePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsLocatifAidePrevu",
        label: "tabou2.identify.accordions.locHelp",
        field: "logementsLocatifAidePrevu",
        layers:["layerPA"],
        type: "number",
        source: has(values, "logementsLocatifAidePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsLocatifReguleHlmPrevu",
        label: "tabou2.identify.accordions.locHlm",
        field: "logementsLocatifReguleHlmPrevu",
        layers:["layerPA"],
        type: "number",
        source: has(values, "logementsLocatifReguleHlmPrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsLocatifRegulePrivePrevu",
        label: "tabou2.identify.accordions.privateLoc",
        field: "logementsLocatifRegulePrivePrevu",
        layers:["layerPA"],
        type: "number",
        source: has(values, "logementsLocatifRegulePrivePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "agapeo",
        label: "tabou2.identify.accordions.agapeoData",
        type: "table",
        fields: ["anneeProg", "numDossier", "logementsLocatAide", "logementsLocatRegulHlm", "logementsLocatRegulPrive", "logementsAccessAide"],
        labels: [
            "tabou2.identify.accordions.progYear",
            "tabou2.identify.accordions.numFolder",
            "tabou2.identify.accordions.numFolder",
            "tabou2.identify.accordions.locHelpTitle",
            "tabou2.identify.accordions.locRegHlm",
            "tabou2.identify.accordions.locRegPriv",
            "tabou2.identify.accordions.accessHelpTitle"
        ],
        layers:["layerPA"],
        source: props?.tabouInfos?.agapeo || [],
        readOnly: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    // hooks
    useEffect(() => {
        const calculFields = getFields();
        const mandatoryFields = calculFields.filter(f => f.require).map(f => f.name);
        if (!isEqual(initialItem, values)) {
            setValues(initialItem);
            setFields(calculFields);
            setRequired(mandatoryFields);
        }
    }, [initialItem]);

    // get value for a specific item
    const getValue = (item) => {
        if (isEmpty(values) || isEmpty(operation)) return null;
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field);
    }

    // get value - usefull for date component
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

    // manage change info
    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        props.change(accordValues, pick(accordValues, required));
    }

    const allowChange = props.authent.isContrib || props.authent.isReferent;
    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                            <ControlLabel><Message msgId={item.label}/></ControlLabel>
                        </Col>
                        <Col xs={8}>
                        {
                            item.type === "date" ? (
                                <UTCDateTimePicker
                                    type="date"
                                    className="identifyDate"
                                    inline
                                    readOnly={!allowChange || item.readOnly}
                                    dropUp
                                    placeholder={props.i18n(props.messages, item?.label || "")}
                                    calendar={true}
                                    time={false}
                                    culture="fr"
                                    value={get(values, item.name) ? new Date(get(values, item.name)) : null}
                                    format="DD/MM/YYYY"
                                    onSelect={(v) => changeInfos({[item.name]: new Date(v).toISOString()})}
                                    onChange={(v) => !v ? changeInfos({[item.name]: null}) : null} />
                            ) : null
                        }
                        {
                            item.type === "text" || item.type === "number" ?
                                (<FormControl
                                    type={item.type}
                                    placeholder={props.i18n(props.messages, item?.label || "")}
                                    value={getValue(item) || ""}
                                    readOnly={!allowChange || item.readOnly}
                                    onChange={(v) => changeInfos({[item.name]: v.target.value})}
                                />) : null
                        }
                        </Col>
                        <Col xs={12}>
                        {
                            item.type === "table" ? (
                                <Table striped bordered condensed hover>
                                    <thead>
                                        <tr>
                                            {item.fields.map((fieldName,i) => 
                                                (
                                                    <th>{capitalize(props.i18n(props.messages, item.labels[i]))}</th>
                                                )
                                            )}
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
