import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, get } from "lodash";
import { Checkbox, Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
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

export default function Tabou2SuiviOpAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    const getFields = () => [{
        name: "etape",
        label: "Etape",
        field: "etape.libelle",
        type: "combo",
        apiLabel: "libelle",
        api: `${layer === "layerPA" ? "programmes":"operations"}/${initialItem.id}/etapes`,
        placeholder: "Maîtrise d'ouvrage...",
        source: values?.etape ? values : initialItem,
        readOnly: false
    }, {
        name: "livraisonDate",
        label: "Date de livraison",
        field: "livraisonDate",
        layers:["layerPA"],
        type: "date",
        placeholder: "Date de livraison...",
        source: values?.livraisonDate ? values : operation,
        readOnly: false
    }, {
        name: "autorisationDate",
        label: "Date d'autorisation",
        layers:["layerSA", "layerOA"],
        type: "date",
        placeholder: "Date d'autorisation...",
        source: values?.autorisationDate ? values : operation,
        readOnly: false
    }, {
        name: "operationnelDate",
        label: "Date de démarrage",
        field: "operationnelDate",
        layers:["layerSA", "layerOA"],
        type: "date",
        placeholder: "Date de démarrage...",
        source: values?.operationnelDate ? values : operation,
        readOnly: false
    }, {
        name: "clotureDate",
        label: "Date de clôture",
        field: "clotureDate",
        type: "date",
        placeholder: "Date de clôture...",
        source: values?.clotureDate ? values : operation,
        readOnly: false
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    const allowChange = props.authent.isContrib || props.authent.isReferent;

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
        console.log(itemSrc);
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
    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                        {
                            item.type !== "boolean" ? <ControlLabel>{item.label}</ControlLabel> :  null
                        }
                        {
                            item.type === "boolean" ?
                                (<Checkbox 
                                    inline="true"
                                    checked={item.value(item) || false}
                                    disabled={item.readOnly || !allowChange}
                                    id={`chbox-${item.name}`}
                                    className="col-xs-5">
                                    <ControlLabel>{item.label}</ControlLabel>
                                </Checkbox>) : null
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
                        }{
                            item.type === "combo" ? (
                                <Tabou2Combo
                                    load={() => getRequestApi(item.api, props.pluginCfg.apiCfg, {})}
                                    disabled={item?.readOnly || !allowChange}
                                    placeholder={item?.placeholder || ""}
                                    textField={item.apiLabel}
                                    onLoad={(r) => r?.elements || r}
                                    name={item.name}
                                    readOnly={item.readOnly || !allowChange}
                                    defaultValue={get(values, item.name)}
                                    onSelect={(v) => changeInfos({[item.name]: v})}
                                    onChange={(v) => !v ? changeInfos({[item.name]: v}) : null}
                                    messages={{
                                        emptyList: 'La liste est vide.',
                                        openCombobox: 'Ouvrir la liste'
                                    }}
                                />
                            ) : null
                        }{
                            item.type === "multi" ? (
                                <Multiselect
                                    readOnly={item.readOnly || !allowChange}
                                    value={item.data}
                                    className={ item.readOnly ? "tagColor noClick" : "tagColor"}
                                />
                            ) : null
                        }{
                            item.type === "date" ? (
                                <UTCDateTimePicker
                                    type="date"
                                    className="identifyDate"
                                    inline
                                    dropUp
                                    placeholder={item?.placeholder}
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
