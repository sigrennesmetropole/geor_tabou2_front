import React, {useEffect, useState } from "react";
import { isEmpty, isEqual, pick, get, find } from "lodash";
import { Col, Row, Grid, Glyphicon, ControlLabel, FormControl } from "react-bootstrap";
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import { getRequestApi } from "@js/extension/api/requests";
import { Multiselect } from "react-widgets";
import "@js/extension/css/identify.css";
import "@js/extension/css/tabou.css";
import Message from "@mapstore/components/I18N/Message";

import ButtonRB from '@mapstore/components/misc/Button';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
const Button = tooltip(ButtonRB);

/**
 * Accordion to display info for Gouvernance panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
const Tabou2GouvernanceAccord = ({
    initialItem,
    programme,
    operation,
    layer,
    messages,
    types,
    tiers,
    setTiersFilter,
    authent,
    change = () => { },
    apiCfg,
    i18n = () => { }
}) => {

    let changeInfos = () => { };

    let changeAction = (t, fieldArray, search, field, value, src) => {
        // get item by type code
        let itemByCode = find(get(src, fieldArray), search);
        if (!itemByCode) {
            itemByCode = { typeAction: find(t.typesAction, ['code', search[1]]) };
        }
        // change value
        itemByCode[field] = value;
        // filter others item whithout changed item
        const othersItems = src[fieldArray].filter(item => item.typeAction.code !== itemByCode.typeAction.code);
        // send to parent
        const concatAll = [...othersItems, itemByCode];
        changeInfos({ actions: concatAll });
    };

    let changeActeur = (t, fieldArray, search, field, value, src) => {
        // get item by type code
        let itemByCode = find(get(src, fieldArray), search);
        if (!itemByCode) {
            itemByCode = { typeActeur: find(t.typesActeurs, ['code', search[1]]) };
        }
        // change value
        itemByCode[field] = value;
        // filter others item whithout changed item
        const othersItems = src[fieldArray].filter(item => item.typeActeur.code !== itemByCode.typeActeur.code);
        // send to parent
        const concatAll = [...othersItems, itemByCode];
        changeInfos({ acteurs: concatAll });
    };

    const fields = [{
        name: "promoteur",
        label: "tabou2.identify.accordions.promoteur",
        layers: ["layerPA"],
        type: "multi",
        data: tiers.filter(t => t.typeTiers.id === 1).map(t => t.tiers.nom),
        readOnly: true
    }, {
        name: "decision",
        label: "tabou2.identify.accordions.decision",
        field: "decision.libelle",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        apiLabel: "libelle",
        api: "decisions",
        source: operation,
        readOnly: false
    }, {
        name: "maitriseOuvrage",
        label: "tabou2.identify.accordions.moa",
        field: "maitriseOuvrage.libelle",
        layers: ["layerSA", "layerOA"],
        type: "combo",
        apiLabel: "libelle",
        api: "maitrise-ouvrage",
        source: operation,
        readOnly: false
    }, {
        layers: ["layerSA", "layerOA"],
        name: "modeAmenagement",
        label: "tabou2.identify.accordions.modeAmenagement",
        field: "modeAmenagement.libelle",
        type: "combo",
        apiLabel: "libelle",
        api: "mode-amenagement",
        source: initialItem,
        readOnly: false
    }, {
        name: "amenageur",
        field: "nom",
        label: "tabou2.identify.accordions.amenageur",
        layers: ["layerSA", "layerOA"],
        type: "multi",
        data: tiers.filter(t => t.typeTiers.id === 1).map(t => t.tiers.nom),
        readOnly: true
    }, {
        name: "moe",
        label: "tabou2.identify.accordions.moe",
        type: "multi",
        data: tiers.filter(t => t.typeTiers.id === 2).map(t => t.tiers.nom),
        readOnly: true
    }, {
        name: "actions",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.rmActions",
        field: "actions.description",
        readOnly: false,
        value: find(initialItem.actions, ["typeAction.code", "ACTION"])?.description,
        change: (v, t, src) => changeAction(t, "actions", ["typeAction.code", "ACTION"], "description", v, src)
    }, {
        name: "acteurs",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.acteursInt",
        field: "acteurs.description",
        readOnly: false,
        value: find(initialItem.acteurs, ["typeActeur.code", "ACT_INT"])?.description,
        change: (v, t, src) => changeActeur(t, "acteurs", ["typeActeur.code", "ACT_INT"], "description", v, src)
    }, {
        name: "acteurs",
        type: "text",
        layers: ["layerSA", "layerOA"],
        label: "tabou2.identify.accordions.acteursExt",
        field: "acteurs.description",
        readOnly: false,
        value: find(initialItem.acteurs, ["typeActeur.code", "ACT_EXT"])?.description,
        change: (v, t, src) => changeActeur(t, "acteurs", ["typeActeur.code", "ACT_EXT"], "description", v, src)
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);
    const required = fields.filter(f => f.require).map(f => f.name);

    const allowChange = authent.isContrib || authent.isReferent;

    changeInfos = (item) => {
        // get readOnly field name
        let editableFields = fields.filter(f => !f.readOnly).map(f => f.name);
        // send to parent to save
        change(item, pick(editableFields, required));
    };

    const openTierModal = (type) => {
        let tiersBtn = document.getElementById('tiers');
        if (setTiersFilter && type && tiersBtn) {
            setTiersFilter(operation?.id || programme?.id, type);
            tiersBtn.click();
        }
    };

    const allTiersButtons = {
        moe: {
            type: "button",
            tooltip: "tabou2.identify.accordions.tiersDetail",
            click: () => openTierModal(2)
        },
        promoteur: {
            type: "button",
            tooltip: "tabou2.identify.accordions.tiersDetail",
            click: () => openTierModal(1)
        },
        amenageur: {
            type: "button",
            tooltip: "tabou2.identify.accordions.tiersDetail",
            click: () => openTierModal(1)
        }
    };

    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={4}>
                            {
                                item.label && (<ControlLabel><Message msgId={item.label} /></ControlLabel>)
                            }
                        </Col>
                        <Col xs={allTiersButtons[item.name] ? 7 : 8}>
                            {
                                item.type === "text" || item.type === "number" ?
                                    (<FormControl
                                        componentClass={item.isArea ? "textarea" : "input"}
                                        placeholder={i18n(messages, item?.placeholder || item.label)}
                                        style={{ height: item.isArea ? "100px" : "auto" }}
                                        type={item.type}
                                        min="0"
                                        step={item?.step}
                                        value={item.value || ""}
                                        readOnly={item.readOnly || !allowChange}
                                        onChange={(v) => item.change(v.target.value, types, initialItem)}
                                    />) : null
                            }{
                                item.type === "button" && (
                                    <Button
                                        tooltip={i18n(messages, item.tooltip || "")}
                                        onClick={() => item.click()}
                                        bsStyle="primary"
                                        bsSize={item.size || "xs"}>
                                        <Glyphicon glyph="user" />
                                    </Button>
                                )
                            }{
                                item.type === "combo" && (
                                    <Tabou2Combo
                                        load={() => getRequestApi(item.api, apiCfg, {})}
                                        placeholder={i18n(messages, item?.label || "")}
                                        filter="contains"
                                        textField={item.apiLabel}
                                        disabled={item?.readOnly || !allowChange}
                                        onLoad={(r) => r?.elements || r}
                                        name={item.name}
                                        value={get(initialItem, item.name)}
                                        onSelect={(v) => changeInfos({ [item.name]: v })}
                                        onChange={(v) => !v ? changeInfos({ [item.name]: v }) : null}
                                        messages={{
                                            emptyList: i18n(messages, "tabou2.emptyList"),
                                            openCombobox: i18n(messages, "tabou2.displayList")
                                        }}
                                    />
                                )
                            }{
                                item.type === "multi" && (
                                    <Multiselect
                                        placeholder={i18n(messages, item?.label || "")}
                                        readOnly={item.readOnly || !allowChange}
                                        value={item.data}
                                        className={item.readOnly ? "tagColor noClick" : "tagColor"}
                                        onChange={() => { }}
                                    />
                                )
                            }
                        </Col>
                        {
                            allTiersButtons[item.name] && (
                                <Col xs={1} className="no-padding">
                                    <Button
                                        tooltip={i18n(messages, allTiersButtons[item.name].tooltip || "")}
                                        onClick={() => allTiersButtons[item.name].click()}
                                        bsStyle="primary"
                                        bsSize="small">
                                        <Glyphicon glyph="user" />
                                    </Button>
                                </Col>
                            )
                        }
                    </Row>
                ))
            }
        </Grid>
    );
};

export default Tabou2GouvernanceAccord;
