import React from "react";
import { isEmpty, pick, get, find, isEqual } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { getRequestApi } from "@js/extension/api/requests";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
import SearchCombo from '@js/extension/components/form/SearchCombo';
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import Tabou2Date from "../../common/Tabou2Date";
/**
 * Accordion to display info for Identity panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
const Tabou2CadreAccord = ({
    initialItem,
    layer,
    authent,
    change = () => { },
    i18n = () => { },
    messages,
    apiCfg,
    types,
    changeProp = () => {}
}) => {

    let changeInfos = () => { };

    // ex : "descriptionsFoncier", ["typesFonciers.code", "FONCIER_PUBLIC"], "description", "myNewvValue"
    let changeFoncier = (t, fieldArray, search, field, value, src) => {
        // get item by type code
        let itemByCode = find(src[fieldArray], search);
        if (!itemByCode) {
            itemByCode = { typeFoncier: find(t.typesFonciers, ['code', search[1]]) };
        }
        // change value
        itemByCode[field] = value;
        // filter others item whithout changed item
        const othersItems = src[fieldArray].filter(item => item.typeFoncier.code !== itemByCode.typeFoncier.code);
        // send to parent
        const concatAll = [...othersItems, itemByCode];
        changeInfos({ descriptionsFoncier: concatAll });
    };

    // create fields from const func
    const fields = [{
        type: "title",
        label: "tabou2.identify.accordions.foncierOccTitle",
        layers: ["layerSA", "layerOA"]
    }, {
        // BLOC Foncier et occupation
        name: "descriptionsFoncier",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPublicDescription",
        field: "descriptionsFoncier.description",
        readOnly: false,
        value: find(initialItem?.descriptionsFoncier, ["typeFoncier.code", "PUBLIQUE"])?.description,
        change: (v, t, src) => changeFoncier(t, "descriptionsFoncier", ["typeFoncier.code", "PUBLIQUE"], "description", v, src)
    }, {
        name: "descriptionsFoncier",
        type: "number",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPublicTaux",
        field: "descriptionsFoncier.taux",
        readOnly: false,
        value: find(initialItem?.descriptionsFoncier, ["typeFoncier.code", "PUBLIQUE"])?.taux,
        change: (v, t, src) => changeFoncier(t, "descriptionsFoncier", ["typeFoncier.code", "PUBLIQUE"], "taux", v, src)
    }, {
        name: "descriptionsFoncier",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPriveDescription",
        field: "descriptionsFoncier.description",
        readOnly: false,
        value: find(initialItem?.descriptionsFoncier, ["typeFoncier.code", "PRIVEE"])?.description,
        change: (v, t, src) => changeFoncier(t, "descriptionsFoncier", ["typeFoncier.code", "PRIVEE"], "description", v, src)
    }, {
        name: "descriptionsFoncier",
        type: "number",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.foncierPriveTaux",
        field: "descriptionsFoncier.taux",
        readOnly: false,
        value: find(initialItem?.descriptionsFoncier, ["typeFoncier.code", "PRIVEE"])?.taux,
        change: (v, t, src) => changeFoncier(t, "descriptionsFoncier", ["typeFoncier.code", "PRIVEE"], "taux", v, src)
    }, {
        name: "typeOccupation",
        field: "typeOccupation",
        label: "tabou2.identify.accordions.typeOccupation",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: false,
        api: `types-occupations?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: get(initialItem, "typeOccupation.libelle"),
        select: (v) => changeInfos({ typeOccupation: v }),
        change: (v) => changeInfos(v ? { typeOccupation: v } : { typeOccupation: null })
    }, {
        name: "outilFoncier",
        field: "outilFoncier",
        label: "tabou2.identify.accordions.outilFoncier",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: false,
        api: `outils-fonciers?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: get(initialItem, "outilFoncier.libelle"),
        select: (v) => changeInfos({ outilFoncier: v }),
        change: (v) => changeInfos(v ? { outilFoncier: v } : { outilFoncier: null })
    }, {
        type: "title",
        label: "tabou2.identify.accordions.pluiTitle",
        layers: ["layerSA", "layerOA"]
    }, {
        name: "plui",
        type: "text",
        label: "tabou2.identify.accordions.pluiDisposition",
        field: "plui.pluiDisposition",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "plui.pluiDisposition"),
        change: (v, t, src) => changeInfos({ plui: { ...src.plui, pluiDisposition: v } })
    }, {
        name: "plui",
        type: "text",
        label: "tabou2.identify.accordions.pluiAdaptation",
        field: "plui.pluiAdaptation",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "plui.pluiAdaptation"),
        change: (v, t, src) => changeInfos({ plui: { ...src.plui, pluiAdaptation: v } })
    }, {
        type: "title",
        label: "tabou2.identify.accordions.processOpTitle",
        layers: ["layerSA", "layerOA"]
    }, {
        name: "etude",
        type: "text",
        label: "tabou2.identify.accordions.studyToPlan",
        field: "etude",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "etude"),
        change: (v) => changeInfos({ etude: v })
    }, {
        name: "autorisationDate",
        field: "autorisationDate",
        label: "tabou2.identify.accordions.dateAuth",
        layers: ["layerSA", "layerOA"],
        type: "date",
        value: get(initialItem, "autorisationDate"),
        readOnly: false
    }, {
        name: "operationnelDate",
        label: "tabou2.identify.accordions.dateStart",
        field: "operationnelDate",
        layers: ["layerSA", "layerOA"],
        type: "date",
        value: initialItem?.operationnelDate || null,
        readOnly: false
    }, {
        name: "clotureDate",
        label: "tabou2.identify.accordions.dateClose",
        field: "clotureDate",
        type: "date",
        value: initialItem?.clotureDate || null,
        readOnly: false
    }, {
        name: "amenageurs",
        field: "amenageurs.typeAmenageur",
        label: "tabou2.identify.accordions.typeAmenageur",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: false,
        api: `types-amenageurs?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: get(initialItem, "amenageurs")[0]?.typeAmenageur?.libelle,
        change: (v) => changeInfos({
            amenageurs: v ? [{ nom: "", typeAmenageur: v }] : []
        }),
        select: (v) => changeInfos({
            amenageurs: v ? [{ nom: "", typeAmenageur: v }] : []
        })
    }, {
        name: "amenageurs",
        type: "text",
        label: "tabou2.identify.accordions.nameAmenageur",
        field: "amenageurs",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: get(initialItem, "amenageurs")[0]?.nom,
        change: (v, t, src) => !isEmpty(src.amenageurs) ? changeInfos({ amenageurs: [{ ...src.amenageurs[0], nom: v }] }) : null
    }, {
        name: "outilAmenagement",
        type: "text",
        label: "tabou2.identify.accordions.outilAmenagement",
        field: "outilAmenagement",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: get(initialItem, "outilAmenagement"),
        change: (v) => changeInfos({ outilAmenagement: v })
    }, {
        name: "concertation",
        label: "tabou2.identify.accordions.dateDebut",
        field: "dateDebut",
        type: "date",
        value: initialItem?.concertation?.dateDebut || null,
        readOnly: false
    }, {
        name: "concertation",
        label: "tabou2.identify.accordions.dateFin",
        field: "dateFin",
        type: "date",
        value: initialItem?.concertation?.dateFin || null,
        readOnly: false
    }, {
        name: "avancementAdministratif",
        type: "text",
        label: "tabou2.identify.accordions.avancementAdministratif",
        field: "avancementAdministratif",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "avancementAdministratif"),
        change: (v) => changeInfos({ avancementAdministratif: v })
    }, {
        name: "surfaceRealisee",
        type: "number",
        label: "tabou2.identify.accordions.surfaceRealisee",
        field: "surfaceRealisee",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: get(initialItem, "surfaceRealisee"),
        change: (v) => changeInfos({ surfaceRealisee: v })
    }, {
        name: "environnement",
        type: "text",
        label: "tabou2.identify.accordions.environnement",
        field: "environnement",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "environnement"),
        change: (v) => changeInfos({ environnement: v })
    }, {
        name: "financements",
        field: "financements[0].typesFinancement",
        label: "tabou2.identify.accordions.typesFinancement",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        autocomplete: false,
        api: `types-financements-operations?asc=true`,
        apiLabel: "libelle",
        placeholder: "tabou2.identify.accordions.emptySelect",
        readOnly: false,
        value: get(initialItem, "financements[0].typeFinancement.libelle"),
        change: (v, src) => changeInfos({
            financements: v ? [{ ...src.financements[0], typeFinancement: v }] : []
        }),
        select: (v, t, src) => changeInfos({
            financements: v ? [{ ...src.financements[0], typeFinancement: v }] : []
        })
    }, {
        name: "financements",
        type: "text",
        label: "tabou2.identify.accordions.financements",
        field: "financements[0].description",
        layers: ["layerSA", "layerOA"],
        readOnly: false,
        isArea: false,
        value: get(initialItem, "financements[0]")?.description,
        change: (v, t, src) => changeInfos({
            financements: src.financements[0] ? [{ ...src.financements[0], description: v }] : [{description: v}]
        })
    }];

    const required = fields.filter(f => f.require).map(f => f.name);

    const allowChange = authent.isContrib || authent.isReferent;

    // manage change info
    changeInfos = (item) => {
        // get readOnly field name
        let editableFields = fields.filter(f => !f.readOnly).map(f => f.name);
        // send to parent to save
        change(item, pick(editableFields, required));
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

    return (
        <Grid style={{ width: "100%" }}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        {
                            item.type === "title" ? (
                                <Col xs={12}>
                                    <h4 style={{ borderBottom: "1px solid" }}>
                                        <ControlLabel><Message msgId={item.label} /></ControlLabel>
                                    </h4>
                                </Col>
                            ) : (<>
                                <Col xs={4}>
                                    <ControlLabel><Message msgId={item.label} /></ControlLabel>
                                </Col>
                                <Col xs={8}>
                                    {
                                        item.type === "combo" && item?.autocomplete ? (
                                            <SearchCombo
                                                minLength={3}
                                                textField={item.apiLabel}
                                                valueField={item.apiField}
                                                forceSelection
                                                value={item.value}
                                                search={
                                                    text => getRequestApi(item.api, apiCfg, { [item.autocomplete]: `${text}*` })
                                                        .then(results =>
                                                            results.elements.map(v => v)
                                                        )
                                                }
                                                onSelect={(e) => item.select(e, initialItem)}
                                                onChange={(e) => item.change(e, initialItem)}
                                                name={item.name}
                                                placeholder={i18n(messages, item?.label || "")}
                                            />
                                        ) : null
                                    }
                                    {
                                        item.type === "text" || item.type === "number" ?
                                            (<FormControl
                                                componentClass={item.isArea ? "textarea" : "input"}
                                                placeholder={i18n(messages, item?.label || "")}
                                                value={item.value}
                                                type={item.type}
                                                min="0"
                                                style={{ height: item.isArea ? "100px" : "auto" }}
                                                readOnly={item.readOnly || !allowChange}
                                                onChange={(v) => item.change(v.target.value, types, initialItem)}
                                            />) : null
                                    }{
                                        item.type === "combo" && !item?.autocomplete ? (
                                            <Tabou2Combo
                                                load={() => getRequestApi(item.api, apiCfg, {})}
                                                placeholder={i18n(messages, item?.placeholder || "")}
                                                filter="contains"
                                                disabled={item.readOnly || !allowChange}
                                                textField={item.apiLabel}
                                                onLoad={(r) => r?.elements || r}
                                                name={item.name}
                                                value={item.value}
                                                onSelect={item.select ? item.select : (v) => changeInfos({ [item.name]: v })}
                                                onChange={item.change ? (v) => item.change(v, initialItem) : (v) => !v ? changeInfos({ [item.name]: v }) : null}
                                                messages={{
                                                    emptyList: i18n(messages, "tabou2.emptyList"),
                                                    openCombobox: i18n(messages, "tabou2.displayList")
                                                }}
                                            />
                                        ) : null
                                    }{
                                        item.type === "date" ? (
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
                                                refresh={(o, n) => {
                                                    return isEqual(o, n);
                                                }}
                                                onSelect={(v) => {
                                                    if (item.name !== item.field) {
                                                        // only to change a key inside object as field.child
                                                        changeProp({
                                                            [item.name]: {
                                                                ...initialItem[item.name],
                                                                [item.field]: v ? new Date(v).toISOString() : ""
                                                            }
                                                        });
                                                    } else {
                                                        changeProp({ [item.name]: v ? new Date(v).toISOString() : "" });
                                                    }
                                                }}
                                                onChange={(v) => {
                                                    if (item.name !== item.field) {
                                                        // only to change a key inside object as field.child
                                                        changeProp({
                                                            [item.name]: {
                                                                ...initialItem[item.name],
                                                                [item.field]: v ? new Date(v).toISOString() : ""
                                                            }
                                                        });
                                                    } else {
                                                        changeProp({ [item.name]: v ? new Date(v).toISOString() : "" });
                                                    }
                                                }}
                                            />
                                        ) : null
                                    }
                                </Col></>
                            )
                        }

                    </Row>
                ))
            }
        </Grid>
    );
};

export default Tabou2CadreAccord;
