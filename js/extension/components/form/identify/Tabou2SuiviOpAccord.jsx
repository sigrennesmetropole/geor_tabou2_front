import React, { useEffect, useState, memo } from "react";
import { isEmpty, isEqual, pick, get, has } from "lodash";
import { Col, Row, Grid, ControlLabel } from "react-bootstrap";
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import { getRequestApi } from "@js/extension/api/requests";
import { Multiselect } from "react-widgets";
import Tabou2Date from "../../common/Tabou2Date";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);

const avoidReRender = (prevProps, nextProps) => {
    if (isEqual(prevProps.initialItem, nextProps.initialItem)) {
        return true;
    }
    return false; // re render
};

const Tabou2SuiviOpAccord = ({
    initialItem,
    operation,
    layer,
    authent,
    change = () => { },
    i18n = () => { },
    messages,
    apiCfg
}) => {
    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    // get fields for this section
    const getFields = () => [{
        name: "etape",
        label: "tabou2.identify.accordions.step",
        field: "etape.libelle",
        type: "combo",
        apiLabel: "libelle",
        layers: ["layerPA"],
        filter: false,
        api: `programmes/${initialItem.id}/etapes?orderBy=id&asc=true`,
        source: values?.etape ? values : initialItem,
        readOnly: false
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

    // manage change infos
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
                    <Row className="attributeInfos">
                        <Col xs={4}>
                            <ControlLabel><Message msgId={item.label} /></ControlLabel>
                        </Col>
                        <Col xs={8}>
                            {
                                item.type === "combo" ? (
                                    <Tabou2Combo
                                        load={() => getRequestApi(item.api, apiCfg, {})}
                                        disabled={item?.readOnly || !allowChange}
                                        placeholder={i18n(messages, item?.label || "")}
                                        textField={item.apiLabel}
                                        onLoad={(r) => r?.elements || r}
                                        name={item.name}
                                        filter={has(item, "filter") ? item.filter : "contains"}
                                        readOnly={item.readOnly || !allowChange}
                                        defaultValue={get(values, item.name)}
                                        onSelect={(v) => changeInfos({ [item.name]: v })}
                                        onChange={(v) => !v ? changeInfos({ [item.name]: v }) : null}
                                        messages={{
                                            emptyList: i18n(messages, "tabou2.emptyList"),
                                            openCombobox: i18n(messages, "tabou2.displayList")
                                        }}
                                    />
                                ) : null
                            }{
                                item.type === "multi" ? (
                                    <Multiselect
                                        readOnly={item.readOnly || !allowChange}
                                        value={item.data}
                                        className={item.readOnly ? "tagColor noClick" : "tagColor"}
                                        placeholder={i18n(messages, item?.label || "")}
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
                            }
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
};

export default memo(Tabou2SuiviOpAccord, avoidReRender);
