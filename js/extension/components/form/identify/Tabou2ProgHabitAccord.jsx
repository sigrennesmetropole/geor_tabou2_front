import React, {useEffect, useState, memo } from "react";
import { isEmpty, isEqual, pick, has, get, capitalize } from "lodash";
import { Col, Row, Table, FormControl, Grid, ControlLabel, Alert, Glyphicon, Button } from "react-bootstrap";
import Tabou2Date from '@js/extension/components/common/Tabou2Date';
import "@js/extension/css/identify.css";
import "@js/extension/css/tabou.css";
import Message from "@mapstore/components/I18N/Message";

import ControlledPopover from '@mapstore/components/widgets/widget/ControlledPopover';
import Tabou2SuiviPLHModal from "@js/extension/components/tabou2IdentifyPanel/modals/Tabou2SuiviPLHModal";

const avoidReRender = (prevProps, nextProps) => {
    if (isEqual(prevProps.initialItem, nextProps.initialItem)) {
        return true;
    }
    return false; // re render
};

const Tabou2ProgHabitatAccord = ({
    initialItem,
    programme,
    operation,
    layer,
    authent,
    change = () => { },
    i18n = () => { },
    messages,
    help,
    agapeo
}) => {
    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const [suiviPlhOpened, setSuiviPlhOpened] = useState(false)
    // create fields from const func
    const getFields = () => [ // PROGRAMME
        {
            name: "logementsTotal",
            label: "tabou2.identify.accordions.totalLog",
            field: "logementsTotal",
            layers: ["layerPA"],
            type: "number",
            min: 0,
            source: has(values, "logementsTotal") ? values : programme,
            readOnly: false
        }, {
            name: "logementsAccessAidePrevu",
            label: "tabou2.identify.accordions.helpAccess",
            field: "logementsAccessAidePrevu",
            layers: ["layerPA"],
            type: "number",
            min: 0,
            source: has(values, "logementsAccessAidePrevu") ? values : programme,
            readOnly: false
        }, {
            name: "logementsAccessLibrePrevu",
            label: "tabou2.identify.accordions.freeAccess",
            field: "logementsAccessLibrePrevu",
            layers: ["layerPA"],
            type: "number",
            min: 0,
            source: has(values, "logementsAccessLibrePrevu") ? values : programme,
            readOnly: false
        }, {
            name: "logementsAccessMaitrisePrevu",
            label: "tabou2.identify.accordions.controlAccess",
            field: "logementsAccessMaitrisePrevu",
            layers: ["layerPA"],
            type: "number",
            min: 0,
            source: has(values, "logementsAccessMaitrisePrevu") ? values : programme,
            readOnly: false
        }, {
            name: "logementsLocatifAidePrevu",
            label: "tabou2.identify.accordions.locHelp",
            field: "logementsLocatifAidePrevu",
            layers: ["layerPA"],
            type: "number",
            min: 0,
            source: has(values, "logementsLocatifAidePrevu") ? values : programme,
            readOnly: false
        }, {
            name: "logementsLocatifReguleHlmPrevu",
            label: "tabou2.identify.accordions.locHlm",
            field: "logementsLocatifReguleHlmPrevu",
            layers: ["layerPA"],
            type: "number",
            min: 0,
            source: has(values, "logementsLocatifReguleHlmPrevu") ? values : programme,
            readOnly: false
        }, {
            name: "logementsLocatifRegulePrivePrevu",
            label: "tabou2.identify.accordions.privateLoc",
            field: "logementsLocatifRegulePrivePrevu",
            layers: ["layerPA"],
            type: "number",
            min: 0,
            source: has(values, "logementsLocatifRegulePrivePrevu") ? values : programme,
            readOnly: false
        }, {
            name: "nbLogementsHFV",
            label: "tabou2.identify.accordions.nbLogementsHFV",
            field: "nbLogementsHFV",
            layers: ["layerPA"],
            type: "number",
            min: 0,
            source: has(values, "nbLogementsHFV") ? values : programme,
            readOnly: false
        }, {
            name: "suiviPLH",
            label: "tabou2.identify.accordions.suiviPLH",
            field: "suiviPLH",
            layers: ["layerPA"],
            type: "suiviPLH",
            source: has(values, "suiviPLH") ? values : programme,
            readOnly: false
        },
        {
            name: "agapeo",
            label: "tabou2.identify.accordions.agapeoData",
            msg: ["tabou2.getHelp", help.agapeo || help?.url || ""],
            type: "table",
            fields: ["anneeProg", "numDossier", "logementsLocatAide", "logementsLocatRegulHlm", "logementsLocatRegulPrive", "logementsAccessAide"],
            labels: [
                "tabou2.identify.accordions.progYear",
                "tabou2.identify.accordions.numFolder",
                "tabou2.identify.accordions.locHelpTitle",
                "tabou2.identify.accordions.locRegHlm",
                "tabou2.identify.accordions.locRegPriv",
                "tabou2.identify.accordions.accessHelpTitle"
            ],
            layers: ["layerPA"],
            source: agapeo || [],
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
    };

    // get value - usefull for date component
    const getValueByField = (field, val) => {
        let fieldVal;
        switch (field) {
        case "dateLiv":
            fieldVal = val ? new Date(val).toLocaleDateString() : val;
            break;
        case "dateCancelStep":
            fieldVal = val ? new Date(val).toLocaleDateString() : val;
            break;
        default:
            fieldVal = val;
            break;
        }
        return fieldVal;
    };

    // manage change info
    const changeInfos = (item) => {
        let newValues = { ...values, ...item };
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        change(accordValues, pick(accordValues, required));
    };

    const changeDate = (field, str) => {
        // TODO : valid with moment like that
        // let isValid = moment(str, "DD/MM/YYYY", true);
        changeInfos({ [field.name]: str ? new Date(str).toISOString() : "" });
    };

    const allowChange = authent.isContrib || authent.isReferent;
    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row key={item.name} className={item.type === "table" ? "tableDisplay" : ""}>
                        {
                            has(item, "valid") && getValue(item) && !item.valid(getValue(item)) ? (
                                <Alert className="alert-danger">
                                    <Glyphicon glyph="warning-sign" />
                                    <Message msgId={i18n(messages, item?.errorMsg || "")} />
                                </Alert>) : null
                        }
                        <Col xs={item.type === "table" ? 12 : 5}>
                            <ControlLabel>
                                <Message msgId={item.label} />
                                {
                                    item.msg && (
                                        <a href={item.msg[1]} className="link-deactivate" target="_blank">
                                            <ControlledPopover text={<Message msgId={item.msg[0]} />} />
                                        </a>
                                    )
                                } :
                            </ControlLabel>
                        </Col>
                        <Col xs={7}>
                            {
                                item.type === "date" && (
                                    <Tabou2Date
                                        type="date"
                                        refreshValue={initialItem}
                                        refresh={(o, n) => {
                                            return isEqual(o, n);
                                        }}
                                        className="identifyDate"
                                        inline
                                        readOnly={!allowChange || item.readOnly}
                                        dropUp
                                        placeholder={i18n(messages, item?.label || "")}
                                        calendar
                                        time={false}
                                        culture="fr"
                                        value={get(values, item.name) ? new Date(get(values, item.name)) : null}
                                        format="DD/MM/YYYY"
                                        onSelect={(v) => changeDate(item, v)}
                                        onChange={(v) => changeDate(item, v)}
                                    />
                                )
                            }
                            {
                                (item.type === "text" || item.type === "number") &&
                                (<FormControl
                                    type={item.type}
                                    min={item?.min}
                                    max={item?.max}
                                    step={item?.step}
                                    placeholder={i18n(messages, item?.label || "")}
                                    value={getValue(item) || ""}
                                    readOnly={!allowChange || item.readOnly}
                                    onChange={(v) => changeInfos({ [item.name]: v.target.value })}
                                    onKeyDown={(v) => {
                                        if (item.type !== "number") return;
                                        // only keep numeric and special key control as "Delete" or "Backspace"
                                        if (!new RegExp('^[0-9]+$').test(v.key) && v.key.length < 2 && v.key !== ",") {
                                            v.returnValue = false;
                                            if (v.preventDefault) v.preventDefault();
                                        }
                                    }}
                                />)
                            }
                            {
                                item.type === "suiviPLH" && (
                                    <>
                                        <FormControl readOnly value={get(values, "suiviPLH.libelle")} className={"vocation-libelle "} />
                                        <Button
                                            tooltip="Suivi PLH"
                                            bsStyle="primary"
                                            onClick={() => setSuiviPlhOpened(true)}>
                                            {i18n(messages, "tabou2.suiviPLH.btnLabel")}
                                        </Button>
                                        <Tabou2SuiviPLHModal
                                            i18n={i18n}
                                            messages={messages}
                                            programme={programme}
                                            opened={suiviPlhOpened}
                                            allowChange={allowChange}
                                            close={() => setSuiviPlhOpened(false)}
                                        />
                                    </>
                                )
                            }
                        </Col>
                        {
                            item.type === "table" && (
                                <Col xs={12} className="table-accord">
                                    <Table striped bordered condensed hover>
                                        <thead>
                                            <tr>
                                                {item.fields.map((fieldName, i) =>
                                                    (
                                                        <th>{capitalize(i18n(messages, item.labels[i]))}</th>
                                                    )
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
};

export default memo(Tabou2ProgHabitatAccord, avoidReRender);
