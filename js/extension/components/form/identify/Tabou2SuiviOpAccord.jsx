import React, {useEffect, useState, memo} from "react";
import {isEmpty, isEqual, pick, get, has} from "lodash";
import {Col, Row, FormControl, Grid, ControlLabel} from "react-bootstrap";
import Tabou2Select from '@js/extension/components/form/Tabou2Select';
import {getRequestApi} from "@js/extension/api/requests";
import Tabou2Date from "../../common/Tabou2Date";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";


const avoidReRender = (prevProps, nextProps) => {
    return isEqual(prevProps.initialItem, nextProps.initialItem);
};

const Tabou2SuiviOpAccord = ({
    initialItem,
    operation,
    programme,
    layer,
    authent,
    change = () => {
    },
    i18n = () => {
    },
    messages,
    apiCfg
}) => {
    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

    // manage change infos
    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // send to parent to save
        let accordValues = pick(newValues, fields.filter(f => !f.readOnly).map(f => f.name));
        change(accordValues, pick(accordValues, required));
    };

    // get fields for this section
    const getFields = () => [{
        name: "etape",
        label: "tabou2.identify.accordions.step",
        field: "etape.libelle",
        type: "combo",
        autocomplete: true,
        apiLabel: "libelle",
        valueField: "id",
        layers: ["layerPA"],
        filter: false,
        api: `programmes/${initialItem.id}/etapes?orderBy=id&asc=true`,
        source: values?.etape ? values : initialItem,
        readOnly: false,
        value: () => values.etape || initialItem.etape,
        select: (v) => changeInfos({etape: v}),
        change: (v) => changeInfos({etape: v || null})
    }, {
        name: "livraisonDate",
        label: "tabou2.identify.accordions.dateLiv",
        field: "livraisonDate",
        layers: ["layerPA"],
        type: "date",
        source: values?.livraisonDate ? values : operation,
        readOnly: false
    }, {
        name: "clotureDate",
        label: "tabou2.identify.accordions.dateClose",
        field: "clotureDate",
        layers: ["layerPA"],
        type: "date",
        source: values?.clotureDate ? values : operation,
        readOnly: false
    }, {
        name: "annulationDate",
        label: "tabou2.identify.accordions.dateCancelStep",
        field: "annulationDate",
        layers: ["layerPA"],
        type: "date",
        source: values?.annulationDate ? values : operation,
        readOnly: false
    }, {
        name: "attributionFonciereAnnee",
        label: "tabou2.identify.accordions.yearAttrib",
        field: "attributionFonciereAnnee",
        layers: ["layerPA"],
        type: "number",
        min: 1950,
        max: 2100,
        step: 1,
        source: has(values, "attributionFonciereAnnee") ? values : programme,
        valid: (v) => {
            return v > 1000;
        },
        errorMsg: "tabou2.identify.accordions.errorFormatYear",
        readOnly: false
    }, {
        name: "attributionDate",
        label: "tabou2.identify.accordions.dateAttrib",
        field: "attributionDate",
        type: "date",
        layers: ["layerPA"],
        source: has(values, "attributionDate") ? values : programme,
        readOnly: false
    }, {
        name: "commercialisationDate",
        label: "tabou2.identify.accordions.dateCom",
        field: "commercialisationDate",
        type: "date",
        layers: ["layerPA"],
        source: has(values, "commercialisationDate") ? values : programme,
        readOnly: false
    }
    ].filter(el => el?.layers?.includes(layer) || !el?.layers);

    // hooks
    useEffect(() => {
        // Toujours synchroniser values avec initialItem si initialItem change (même si values a déjà été modifié)
        setValues(initialItem);
        const calculFields = getFields();
        const mandatoryFields = calculFields.filter(f => f.require).map(f => f.name);
        setFields(calculFields);
        setRequired(mandatoryFields);
    }, [initialItem]);


    // get value for a specific item
    const getValue = (item) => {
        if (isEmpty(values) || isEmpty(operation)) return null;
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field);
    };
    const changeDate = (field, str) => {
        // TODO : valid with moment like that
        // let isValid = moment(str, "DD/MM/YYYY", true);
        changeInfos({[field.name]: str ? new Date(str).toISOString() : ""});
    };

    const allowChange = authent.isContrib || authent.isReferent;

    return (
        <Grid style={{width: "100%"}} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                            <ControlLabel><Message msgId={item.label}/></ControlLabel>
                        </Col>
                        <Col xs={8}>
                            {
                                item.type === "combo" && item?.autocomplete ? (
                                    <Tabou2Select
                                        textField={item.apiLabel}
                                        valueField={item.valueField || "id"}
                                        value={values.etape || null}
                                        search={(text) => {
                                            if (!text || text.length < 1) {
                                                return getRequestApi(item.api, apiCfg, {})
                                                    .then(results => Array.isArray(results) ? results : (results.elements || []));
                                            }
                                            return getRequestApi(item.api, apiCfg, {[item.apiLabel]: `${text}*`})
                                                .then(results => Array.isArray(results) ? results : (results.elements || []));
                                        }}
                                        onSelect={v => changeInfos({etape: v})}
                                        onChange={v => changeInfos({etape: v || null})}
                                        placeholder={i18n(messages, item?.label || "")}
                                        disabled={item?.readOnly || !allowChange}
                                        allowClear
                                    />
                                ) : null
                            }{
                                item.type === "combo" && !item?.autocomplete ? (
                                    <Tabou2Select
                                        textField={item.apiLabel}
                                        valueField={item.valueField || "id"}
                                        value={get(values, item.name)}
                                        search={() => {
                                            return getRequestApi(item.api, apiCfg, {})
                                                .then(results => Array.isArray(results) ? results : (results.elements || []));
                                        }}
                                        onSelect={(v) => changeInfos({[item.name]: v})}
                                        onChange={(v) => !v ? changeInfos({[item.name]: v}) : null}
                                        placeholder={i18n(messages, item?.label || "")}
                                        disabled={item?.readOnly || !allowChange}
                                        allowClear
                                    />
                                ) : null
                            }{
                                item.type === "multi" ? (
                                    <Tabou2Select
                                        isMulti
                                        disabled={item.readOnly || !allowChange}
                                        value={Array.isArray(item.data) ? item.data.map(d => typeof d === 'string' ? {
                                            label: d,
                                            value: d
                                        } : d) : []}
                                        placeholder={i18n(messages, item?.label || "")}
                                        load={() => Promise.resolve(Array.isArray(item.data) ? item.data.map(d => typeof d === 'string' ? {
                                            label: d,
                                            value: d
                                        } : d) : [])}
                                        textField="label"
                                        valueField="value"
                                    />
                                ) : null
                            }{
                                item.type === "date" ? (
                                    <Tabou2Date
                                        type="date"
                                        className="identifyDate"
                                        inline="true"
                                        refreshValue={initialItem}
                                        refresh={(o, n) => {
                                            return isEqual(o, n);
                                        }}
                                        dropUp
                                        placeholder={i18n(messages, item?.label || "")}
                                        readOnly={item.readOnly || !allowChange}
                                        calendar
                                        time={false}
                                        culture="fr"
                                        value={get(values, item.name) ? new Date(get(values, item.name)) : null}
                                        format="DD/MM/YYYY"
                                        onSelect={(v) => changeDate(item, v)}
                                        onChange={(v) => changeDate(item, v)}
                                    />
                                ) : null
                            } {
                                (item.type === "text" || item.type === "number") &&
                                        (<FormControl
                                            type={item.type}
                                            min={item?.min}
                                            max={item?.max}
                                            step={item?.step}
                                            placeholder={i18n(messages, item?.label || "")}
                                            value={getValue(item) || ""}
                                            readOnly={!allowChange || item.readOnly}
                                            onChange={(v) => changeInfos({[item.name]: v.target.value})}
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
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
};

export default memo(Tabou2SuiviOpAccord, avoidReRender);
