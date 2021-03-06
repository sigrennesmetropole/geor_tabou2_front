import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, get } from "lodash";
import { Checkbox, Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { getRequestApi } from "@ext/api/search";
import { Multiselect, DateTimePicker } from "react-widgets";
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import "@ext/css/identify.css";
import Message from "@mapstore/components/I18N/Message";

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

export default function Tabou2SuiviOpAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

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
        api: `${layer === "layerPA" ? "programmes":"operations"}/${initialItem.id}/etapes`,
        source: values?.etape ? values : initialItem,
        readOnly: false
    }, {
        name: "livraisonDate",
        label: "tabou2.identify.accordions.dateLiv",
        field: "livraisonDate",
        layers:["layerPA"],
        type: "date",
        source: values?.livraisonDate ? values : operation,
        readOnly: false
    }, {
        name: "autorisationDate",
        label: "tabou2.identify.accordions.dateAuth",
        layers:["layerSA", "layerOA"],
        type: "date",
        source: values?.autorisationDate ? values : operation,
        readOnly: false
    }, {
        name: "operationnelDate",
        label: "tabou2.identify.accordions.dateStart",
        field: "operationnelDate",
        layers:["layerSA", "layerOA"],
        type: "date",
        source: values?.operationnelDate ? values : operation,
        readOnly: false
    }, {
        name: "clotureDate",
        label: "tabou2.identify.accordions.dateClose",
        field: "clotureDate",
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
                            item.type === "combo" ? (
                                <Tabou2Combo
                                    load={() => getRequestApi(item.api, props.pluginCfg.apiCfg, {})}
                                    disabled={item?.readOnly || !allowChange}
                                    placeholder={props.i18n(props.messages, item?.label || "")}
                                    textField={item.apiLabel}
                                    onLoad={(r) => r?.elements || r}
                                    name={item.name}
                                    readOnly={item.readOnly || !allowChange}
                                    defaultValue={get(values, item.name)}
                                    onSelect={(v) => changeInfos({[item.name]: v})}
                                    onChange={(v) => !v ? changeInfos({[item.name]: v}) : null}
                                    messages={{
                                        emptyList: props.i18n(props.messages, "tabou2.emptyList"),
                                        openCombobox: props.i18n(props.messages, "tabou2.displayList")
                                    }}
                                />
                            ) : null
                        }{
                            item.type === "multi" ? (
                                <Multiselect
                                    readOnly={item.readOnly || !allowChange}
                                    value={item.data}
                                    className={ item.readOnly ? "tagColor noClick" : "tagColor"}
                                    placeholder={props.i18n(props.messages, item?.label || "")}
                                />
                            ) : null
                        }{
                            item.type === "date" ? (
                                <UTCDateTimePicker
                                    type="date"
                                    className="identifyDate"
                                    inline
                                    dropUp
                                    placeholder={props.i18n(props.messages, item?.label || "")}
                                    readOnly={item.readOnly || !allowChange}
                                    calendar={true}
                                    time={false}
                                    culture="fr"
                                    value={get(values, item.name) ? new Date(get(values, item.name)) : null}
                                    format="DD/MM/YYYY"
                                    onSelect={(v) => changeInfos({[item.name]: new Date(v).toISOString()})}
                                    onChange={(v) => !v ? changeInfos({[item.name]: new Date(v).toISOString()}) : null} />
                            ) : null
                        }
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
}
