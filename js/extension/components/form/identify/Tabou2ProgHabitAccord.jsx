import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, has, get, capitalize } from "lodash";
import { Col, Row, Table, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { DateTimePicker } from "react-widgets";
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
    // OPERATION
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
    },// PROGRAMME
    {
        name: "attributionFonciereAnnee",
        label: "Année attribution foncière",
        field: "attributionFonciereAnnee",
        layers:["layerPA"],
        type: "number",
        placeholder: "Année...",
        source: has(values, "attributionFonciereAnnee") ? values : programme,
        readOnly: false
    }, {
        name: "attributionDate",
        label: "Date attribution",
        field: "attributionDate",
        type: "date",
        layers:["layerPA"],
        placeholder: "Date attribution...",
        source: has(values, "attributionDate") ? values : programme,
        readOnly: false
    }, {
        name: "commercialisationDate",
        label: "Date commercialisation",
        field: "commercialisationDate",
        type: "date",
        layers:["layerPA"],
        placeholder: "Date commercialisation...",
        source: has(values, "commercialisationDate") ? values : programme,
        readOnly: false
    }, {
        name: "logementsTotal",
        label: "Logements total",
        field: "logementsTotal",
        layers:["layerPA"],
        type: "number",
        placeholder: "Logements total...",
        source: has(values, "logementsTotal") ? values : programme,
        readOnly: false
    }, {
        name: "logementsAccessAidePrevu",
        label: "Accession aidée",
        field: "logementsAccessAidePrevu",
        layers:["layerPA"],
        type: "number",
        placeholder: "Accession aidée...",
        source: has(values, "logementsAccessAidePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsAccessLibrePrevu",
        label: "Accession libre",
        field: "logementsAccessLibrePrevu",
        layers:["layerPA"],
        type: "number",
        placeholder: "Accession libres...",
        source: has(values, "logementsAccessLibrePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsAccessMaitrisePrevu",
        label: "Accession maîtrisée",
        field: "logementsAccessMaitrisePrevu",
        layers:["layerPA"],
        type: "number",
        placeholder: "Accession libres...",
        source: has(values, "logementsAccessMaitrisePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsLocatifAidePrevu",
        label: "Locatif Aidé",
        field: "logementsLocatifAidePrevu",
        layers:["layerPA"],
        type: "number",
        placeholder: "Locatif Aidé...",
        source: has(values, "logementsLocatifAidePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsLocatifReguleHlmPrevu",
        label: "Locatif régulé HLM",
        field: "logementsLocatifReguleHlmPrevu",
        layers:["layerPA"],
        type: "number",
        placeholder: "Locatif régulé HLM...",
        source: has(values, "logementsLocatifReguleHlmPrevu") ? values : programme,
        readOnly: false
    }, {
        name: "logementsLocatifRegulePrivePrevu",
        label: "Locatif régulé privé",
        field: "logementsLocatifRegulePrivePrevu",
        layers:["layerPA"],
        type: "number",
        placeholder: "Locatif régulé privé...",
        source: has(values, "logementsLocatifRegulePrivePrevu") ? values : programme,
        readOnly: false
    }, {
        name: "agapeo",
        label: "Données Agapéo",
        type: "table",
        fields: ["anneeProg", "numDossier", "logementsLocatAide", "logementsLocatRegulHlm", "logementsLocatRegulPrive", "logementsAccessAide"],
        labels: ["Année prog", "N° dossier", "Loc. Aidé","Loc. rég. HLM", "Loc. reg. privé", "Acc. aidée"],
        layers:["layerPA"],
        source: props?.tabouInfos?.agapeo || [],
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

    const getValue = (item) => {
        if (isEmpty(values) || isEmpty(operation)) return null;
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field);
    }

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
                            item.type !== "boolean" ? <ControlLabel>{item.label}</ControlLabel> :  null
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
                        {
                            item.type === "date" ? (
                                <UTCDateTimePicker
                                    type="date"
                                    className="identifyDate"
                                    inline
                                    readOnly={!allowChange || item.readOnly}
                                    dropUp
                                    placeholder={item?.placeholder}
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
                                    placeholder={item.label}
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
