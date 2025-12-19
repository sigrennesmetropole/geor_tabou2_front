import React, {useEffect, useState, memo} from "react";
import {isEmpty, isEqual, pick, get} from "lodash";
import {Col, Row, FormControl, Grid, ControlLabel} from "react-bootstrap";
import Tabou2Select from '@js/extension/components/form/Tabou2Select';
import {getRequestApi} from "@js/extension/api/requests";
import Tabou2Date from "../../common/Tabou2Date";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";


const avoidReRender = (prevProps, nextProps) => {
    return isEqual(prevProps.initialItem, nextProps.initialItem) &&
            isEqual(prevProps.operation, nextProps.operation) &&
            isEqual(prevProps.operationParent, nextProps.operationParent) &&
            isEqual(prevProps.mapFeature, nextProps.mapFeature);
};

/**
 * Accordion pour afficher les indicateurs principaux - accessible uniquement aux contributeurs
 * @param {any} param
 * @returns component
 */
const Tabou2IndicateursAccord = ({
    initialItem,
    operation,
    operationParent,
    mapFeature,
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

    // Définition des champs pour les indicateurs principaux
    const getFields = () => [{
        name: "commune",
        field: "properties.commune",
        label: "tabou2.identify.accordions.city",
        type: "multi",
        source: mapFeature,
        readOnly: true
    }, {
        name: "nom",
        field: "nom",
        label: "tabou2.identify.accordions.name",
        type: "text",
        source: values?.nom ? values : initialItem,
        readOnly: true
    }, {
        name: "etape",
        label: "tabou2.identify.accordions.step",
        field: "etape",
        type: "select",
        apiLabel: "libelle",
        apiValue: "id",
        api: layer === "layerPA"
            ? `programmes/${initialItem.id}/etapes?orderBy=id&asc=true`
            : `operations/${initialItem.id}/etapes?orderBy=id&asc=true`,
        source: layer === "layerPA" ? values?.etape ? values : initialItem : values?.etape ? values : operation,
        readOnly: false,
        layers: ["layerPA", "layerOA", "layerSA"]
    }, {
        name: "vocation",
        label: "tabou2.identify.accordions.vocation",
        field: "vocation.libelle",
        type: "text",
        source: layer === "layerSA" && !isEmpty(operationParent) ? operationParent : operation,
        readOnly: true
    }, {
        name: "operationnelDate",
        label: "tabou2.identify.accordions.dateStart",
        field: "operationnelDate",
        type: "date",
        source: values?.operationnelDate ? values : (layer === "layerSA" && !isEmpty(operationParent) ? operationParent : operation),
        readOnly: layer === "layerPA"
    }, {
        name: "avancementAdministratif",
        label: "tabou2.identify.accordions.avancementAdministratif",
        field: "avancementAdministratif",
        type: "text",
        source: values?.avancementAdministratif ? values : (layer === "layerSA" && !isEmpty(operationParent) ? operationParent : operation),
        readOnly: layer === "layerPA",
        isArea: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    // Hooks
    useEffect(() => {
        const calculFields = getFields();
        const mandatoryFields = calculFields.filter(f => f.require).map(f => f.name);
        if (!isEqual(initialItem, values)) {
            setValues(initialItem);
            setFields(calculFields);
            setRequired(mandatoryFields);
        }
    }, [initialItem]);

    // Gestion des changements d'informations
    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);
        // Envoyer au parent pour sauvegarder
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        change(accordValues, pick(accordValues, required));
    };

    // Récupérer la valeur pour un item spécifique
    const getValue = (item) => {
        if (isEmpty(values) && isEmpty(operation)) return null;
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field);
    };

    // Gestion du changement de date
    const changeDate = (field, str) => {
        changeInfos({[field.name]: str ? new Date(str).toISOString() : ""});
    };

    // Vérification des droits de modification
    // Les contributeurs et référents peuvent modifier les champs (les autres rôles sont en lecture seule)
    const allowChange = authent.isContrib || authent.isReferent;

    return (
        <Grid style={{width: "100%"}} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos" key={item.name}>
                        <Col xs={4}>
                            <ControlLabel><Message msgId={item.label}/></ControlLabel>
                        </Col>
                        <Col xs={8}>
                            {
                                item.type === "select" && (
                                    <Tabou2Select
                                        textField={item.apiLabel}
                                        valueField={item.apiValue}
                                        search={(text) => getRequestApi(item.api, apiCfg, text ? {libelle: `*${text}*`} : {})
                                            .then(r => r?.elements || r || [])}
                                        value={get(values, item.name) || null}
                                        disabled={item.readOnly || !allowChange}
                                        onSelect={(selected) => changeInfos({[item.name]: selected})}
                                        placeholder={i18n(messages, item.label)}
                                        allowClear
                                        minLength={0}
                                    />
                                )
                            }{
                                item.type === "multi" ? (
                                    <Tabou2Select
                                        isMulti
                                        value={getValue(item) ? getValue(item).split(',').filter(v => v) : []}
                                        disabled={item.readOnly || !allowChange}
                                        placeholder={i18n(messages, item?.label || "")}
                                        load={() => Promise.resolve(getValue(item) ? getValue(item).split(',').filter(v => v).map(v => ({
                                            label: v,
                                            value: v
                                        })) : [])}
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
                                        value={getValue(item) ? new Date(getValue(item)) : null}
                                        format="DD/MM/YYYY"
                                        onSelect={(v) => changeDate(item, v)}
                                        onChange={(v) => changeDate(item, v)}
                                    />
                                ) : null
                            } {
                                (item.type === "text" || item.type === "number") &&
                                        (<FormControl
                                            componentClass={item.isArea ? "textarea" : "input"}
                                            style={{height: item.isArea ? "100px" : "auto"}}
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
                                                // Ne garder que les chiffres et les touches de contrôle spéciales comme "Delete" ou "Backspace"
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

export default memo(Tabou2IndicateursAccord, avoidReRender);
