import React, {useEffect, useState, memo} from "react";
import {isEmpty, isEqual, pick, get, has} from "lodash";
import {Col, Row, FormControl, Grid, ControlLabel, Glyphicon} from "react-bootstrap";
import {getRequestApi} from "@js/extension/api/requests";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
import Tabou2Select from '@js/extension/components/form/Tabou2Select';

import ButtonRB from '@mapstore/components/misc/Button';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import Tabou2Date from "@js/extension/components/common/Tabou2Date";

const Button = tooltip(ButtonRB);

const avoidReRender = (prevProps, nextProps) => {
    return isEqual(prevProps.initialItem, nextProps.initialItem);
};
/**
 * Accordion to display info for Prospectif panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
const Tabou2ProspectifAccord = ({
    initialItem,
    programme,
    operation,
    operationParent,
    mapFeature,
    layer,
    tiers,
    setTiersFilter,
    authent,
    change = () => {
    },
    apiCfg,
    i18n = () => {
    },
    messages,
    changeProp = () => {
    }
}) => {
    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});
    let changeInfos = () => {
    };


    // create fields from const func
    const getFields = () => [{
        name: "id",
        type: "text",
        label: "tabou2.identify.accordions.idTabou",
        field: "id",
        source: initialItem,
        readOnly: true
    }, {
        name: "code",
        label: "tabou2.identify.accordions.code",
        type: "text",
        field: "code",
        source: values,
        readOnly: false,
        require: true
    },
    {
        name: "entiteReferente",
        field: "entiteReferente.libelle",
        label: "tabou2.identify.accordions.entiteRefLib",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: true,
        api: `entites-referentes`,
        apiLabel: "libelle",
        valueField: "id",
        placeholder: "tabou2.identify.accordions.emptySelect",
        source: operation,
        readOnly: false,
        isSearchable: true,
        value: () => values.entiteReferente || initialItem.entiteReferente,
        select: (v) => changeInfos({entiteReferente: v}),
        change: (v) => changeInfos(v ? {entiteReferente: v} : {entiteReferente: null})
    }, {
        name: "referents",
        field: "referents",
        label: "tabou2.identify.accordions.referents",
        type: "multi",
        layers: ["layerOA", "layerSA"],
        readOnly: true,
        source: {referents: tiers.filter(t => t.typeTiers.id === 3).map(t => t.tiers.nom).join(",")}
    }, {
        name: "commune",
        field: "properties.commune",
        label: "tabou2.identify.accordions.city",
        type: "multi",
        source: mapFeature,
        readOnly: true,
        api: "communes",
        apiLabel: "nom",
        valueField: "id",
        value: () => {
            return values.commune || get(mapFeature, "properties.commune") || "";
        },
        select: (v) => {
            changeInfos({commune: v});
        },
        change: (v) => {
            changeInfos({commune: v});
        }
    }, {
        name: "nom",
        field: "nom",
        label: "tabou2.identify.accordions.name",
        type: "text",
        source: values,
        readOnly: false,
        require: true
    }, {
        name: "vocation",
        label: "tabou2.identify.accordions.vocation",
        field: "vocation.libelle",
        type: "text",
        source: operation,
        readOnly: true,
        require: true
    }, {
        name: "aireGeoHa",
        field: "aireGeoHa",
        label: "tabou2.identify.accordions.totalSpace",
        type: "number",
        value: () => mapFeature?.properties?.aire_geo_ha ?? null,
        readOnly: true
    }, {
        name: "description",
        label: "tabou2.identify.accordions.describe",
        type: "text",
        field: "description",
        source: has(values, "description") ? values : initialItem,
        readOnly: false,
        isArea: true
    }, {
        name: "etape",
        label: "tabou2.identify.accordions.step",
        field: "etape.libelle",
        type: "combo",
        autocomplete: true,
        apiLabel: "libelle",
        valueField: "id",
        filter: false,
        api: `operations/${initialItem.id}/etapes?orderBy=id&asc=true`,
        source: operation,
        readOnly: false,
        require: true,
        isSearchable: true,
        value: () => values.etape || initialItem.etape,
        select: (v) => changeInfos({etape: v}),
        change: (v) => changeInfos(v ? {etape: v} : {etape: null})
    }, {
        name: "operationnelDate",
        label: "tabou2.identify.accordions.dateStart",
        field: "operationnelDate",
        type: "date",
        value: initialItem?.operationnelDate || null,
        readOnly: false
    }, {
        name: "livraisonDate",
        label: "tabou2.identify.accordions.dateLiv",
        field: "livraisonDate",
        type: "date",
        source: initialItem?.livraisonDate || null,
        readOnly: false
    }
    ];

    const openTierModal = (type) => {
        let tiersBtn = document.getElementById('tiers');
        if (setTiersFilter && type && tiersBtn) {
            setTiersFilter(operation?.id || programme?.id, type);
            tiersBtn.click();
        }
    };

    const allTiersButtons = {
        referents: {
            type: "button",
            tooltip: "tabou2.identify.accordions.tiersDetail",
            click: () => openTierModal(3)
        }
    };

    const allowChange = authent.isContrib || authent.isReferent;

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

    // get value for specific item
    const getValue = (item) => {
        // Pour les champs combo avec une fonction value personnalisée, l'utiliser
        if (item.value && typeof item.value === 'function') {
            return item.value();
        }
        if (isEmpty(values) || isEmpty(operation)) return null;
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field) || [];
    };

    const getDateValue = (item, src) => {
        let defaultValue = null;
        if (item.name !== item.field) {
            defaultValue = get(src, `${item.name}.${item.field}`);
        } else if (src[item.name]) {
            defaultValue = get(src, item.name);
        }
        return defaultValue ? new Date(defaultValue) : null;
    };

    const handleApiSearch = (item) => (text) => {
        // Pour les champs avec autocomplétion, utiliser le bon nom de champ pour la recherche
        const searchField = item.name === 'parentId' ? 'nom' : item.apiLabel;
        return getRequestApi(item.api, apiCfg, {[searchField]: `${text}*`})
            .then(results => Array.isArray(results) ? results : (results.elements || []));
    };

    // manage change info
    changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);

        // send to parent to save
        let accordValues = pick(newValues, getFields().filter(f => !f.readOnly).map(f => f.name));
        change(accordValues, pick(accordValues, required));
    };

    // Handle date change
    const handleDateChange = (item, v) => {
        if (item.name !== item.field) {
            // only to change a key inside object as field.child
            changeProp({
                [item.name]: {
                    ...initialItem[item.name],
                    [item.field]: v ? new Date(v).toISOString() : ""
                }
            });
        } else {
            changeProp({[item.name]: v ? new Date(v).toISOString() : ""});
        }
    };

    // Render field input based on type
    const renderFieldInput = (item) => {
        if (item.type === "combo" && item?.autocomplete) {
            const currentValue = item.value ? item.value() : null;

            return (
                <Tabou2Select
                    textField={item.apiLabel}
                    valueField={item.valueField || "id"}
                    value={currentValue}
                    search={(text) => {
                        // Si pas de texte, charger toutes les options
                        if (!text || text.length < 1) {
                            return getRequestApi(item.api, apiCfg, {})
                                .then(results => Array.isArray(results) ? results : (results.elements || []))
                                .catch(() => {
                                    return [];
                                });
                        }
                        // Sinon utiliser la recherche avec le texte
                        return handleApiSearch(item)(text).then(results => {
                            return results;
                        }).catch(() => {
                            return [];
                        });
                    }}
                    onSelect={(v) => {
                        if (item.select) {
                            item.select(v);
                        } else {
                            changeInfos({[item.name]: v});
                        }
                    }}
                    onChange={item.change}
                    placeholder={i18n(messages, item?.label || "")}
                    disabled={item.readOnly || !allowChange}
                />
            );
        }
        if (item.type === "text" || item.type === "number") {
            return (
                <FormControl
                    componentClass={item.isArea ? "textarea" : "input"}
                    placeholder={i18n(messages, item?.placeholder || item.label)}
                    style={{height: item.isArea ? "100px" : "auto"}}
                    type={item.type}
                    min="0"
                    step={item?.step}
                    value={item.value ? item.value(item) : getValue(item) || ""}
                    readOnly={item.readOnly || !allowChange}
                    onChange={(v) => {
                        const val = item.type === "number" ? parseFloat(v.target.value) : v.target.value;
                        return changeInfos({
                            [item.name]: item.type === "number" && val < 0 ? "" : val
                        });
                    }}
                    onKeyDown={(v) => {
                        if (item.type !== "number") return;
                        // only keep numeric and special key control as "Delete" or "Backspace"
                        if (!/^[0-9.,]/.test(v.key) && v.key.length < 2) {
                            v.returnValue = false;
                            if (v.preventDefault) v.preventDefault();
                        }
                    }}
                />
            );
        }

        if (item.type === "multi") {
            // Vérifier si le champ existe ou si c'est un champ avec API (éditable)
            const hasValue = has(item.source, item.field);
            const isEditableWithApi = item.api && !item.readOnly && allowChange;

            // Afficher le composant si le champ a une valeur OU si c'est éditable avec API
            if (hasValue || isEditableWithApi) {
                // Convertir la valeur string (séparée par "," ou ";") en tableau d'objets
                const rawValue = getValue(item);
                const multiValues = rawValue?.length ?
                    rawValue.split(/[,;]/).map(val => val.trim()).filter(Boolean).map(val => ({
                        id: val,
                        [item.apiLabel || 'label']: val
                    })) : [];

                return (
                    <Tabou2Select
                        isMulti
                        textField={item.apiLabel || 'label'}
                        valueField="id"
                        value={multiValues}
                        search={item.api ? (text) => {
                            return getRequestApi(item.api, apiCfg, text ? {[item.apiLabel]: `${text}*`} : {})
                                .then(results => Array.isArray(results) ? results : (results.elements || []));
                        } : () => Promise.resolve(multiValues)}
                        onSelect={(selectedItems) => {
                            // Convertir le tableau d'objets en string séparée par ";"
                            const newValue = selectedItems.map(selectedItem =>
                                typeof selectedItem === 'object' ? selectedItem[item.apiLabel || 'label'] : selectedItem
                            ).join(";");
                            if (item.select) {
                                item.select(newValue);
                            } else {
                                changeInfos({[item.name]: newValue});
                            }
                        }}
                        placeholder={i18n(messages, item?.label || "")}
                        disabled={item.readOnly || !allowChange}
                        separator="; "
                        maxDisplayItems={3}
                    />
                );
            }
            return null;
        }

        if (item.type === "combo" && !item?.autocomplete) {
            const currentValue = item.value ? item.value() : get(values, item.field);
            return (
                <Tabou2Select
                    key={`${item.name}-${JSON.stringify(currentValue)}`}
                    textField={item.apiLabel}
                    valueField={item.valueField || "id"}
                    value={currentValue}
                    search={() => {
                        return getRequestApi(item.api, apiCfg, {})
                            .then(results => Array.isArray(results) ? results : (results.elements || []));
                    }}
                    onSelect={(v) => {
                        if (item.select) {
                            item.select(v);
                        } else {
                            changeInfos({[item.name]: v});
                        }
                    }}
                    onChange={(v) => {
                        if (item.change) {
                            item.change(v);
                        } else if (!v) {
                            changeInfos({[item.name]: v});
                        }
                    }}
                    placeholder={i18n(messages, item?.placeholder || "")}
                    disabled={item.readOnly || !allowChange}
                    allowClear
                />
            );
        }

        if (item.type === "date") {
            return (
                <Tabou2Date
                    type="date"
                    className="identifyDate"
                    inline="true"
                    dropUp
                    placeholder={i18n(messages, item?.label || "")}
                    readOnly={item.readOnly || !allowChange}
                    calendar
                    time={false}
                    culture="fr"
                    value={getDateValue(item, initialItem) || null}
                    format="DD/MM/YYYY"
                    refreshValue={initialItem}
                    refresh={(o, n) => isEqual(o, n)}
                    onSelect={(v) => handleDateChange(item, v)}
                    onChange={(v) => handleDateChange(item, v)}
                />
            );
        }

        return null;
    };

    // Render field row
    const renderFieldRow = (item) => {
        if (item.type === "title") {
            return (
                <Col xs={12}>
                    <ControlLabel style={item.labelStyle || {}}><Message msgId={item.label}/></ControlLabel>
                </Col>
            );
        }

        return (
            <>
                <Col xs={4}>
                    <ControlLabel style={item.labelStyle || {}}><Message msgId={item.label}/></ControlLabel>
                </Col>
                <Col xs={allTiersButtons[item.name] ? 7 : 8}>
                    {renderFieldInput(item)}
                </Col>
                {allTiersButtons[item.name] && (
                    <Col xs={1} className="no-padding">
                        <Button
                            tooltip={i18n(messages, allTiersButtons[item.name].tooltip || "")}
                            onClick={() => allTiersButtons[item.name].click()}
                            bsStyle="primary"
                            bsSize="small">
                            <Glyphicon glyph="user"/>
                        </Button>
                    </Col>
                )}
            </>
        );
    };

    // Filter fields by layer
    const visibleFields = fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1);

    return (
        <Grid style={{width: "100%"}}>
            {visibleFields.map(item => (
                <Row className="attributeInfos" key={item.name}>
                    {renderFieldRow(item)}
                </Row>
            ))}
        </Grid>
    );
};

export default memo(Tabou2ProspectifAccord, avoidReRender);
