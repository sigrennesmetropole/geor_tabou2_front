import React from "react";
import {isEmpty, pick, get} from "lodash";
import {Col, Row, Grid, ControlLabel} from "react-bootstrap";
import {getRequestApi} from "@js/extension/api/requests";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
import {
    renderIdentifyDateField,
    renderIdentifyAutoCompleteCombo,
    renderIdentifyStandardCombo,
    renderIdentifyTextOrNumberField
} from "../vocations/utils";

/**
 * Accordion to display info for Identity panel section - only for feature linked with id tabou
 * @param {any} param
 * @returns component
 */
const Tabou2ProjetUrbainAccord = ({
    initialItem,
    layer,
    authent,
    change = () => {
    },
    i18n = () => {
    },
    messages,
    apiCfg,
    types,
    changeProp = () => {
    }
}) => {

    let changeInfos;

    // create fields from const func
    const fields = [{
        name: "title",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.title",
        field: "projetUrbain.title",
        layers: ["layerOA"],
        readOnly: false,
        isArea: false,
        value: get(initialItem, "projetUrbain.title"),
        change: (v, t, src) => changeInfos({projetUrbain: {...src.projetUrbain, title: v}})
    }, {
        name: "chapeau",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.chapeau",
        field: "projetUrbain.chapeau",
        layers: ["layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "projetUrbain.chapeau"),
        change: (v, t, src) => changeInfos({projetUrbain: {...src.projetUrbain, chapeau: v}})
    }, {
        name: "projet",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.projet",
        field: "projetUrbain.projet",
        layers: ["layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "projetUrbain.projet"),
        change: (v, t, src) => changeInfos({projetUrbain: {...src.projetUrbain, projet: v}})
    }, {
        name: "actualites",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.actualites",
        field: "projetUrbain.actualites",
        layers: ["layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "projetUrbain.actualites"),
        change: (v, t, src) => changeInfos({projetUrbain: {...src.projetUrbain, actualites: v}})
    }, {
        name: "savoir",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.savoir",
        field: "projetUrbain.savoir",
        layers: ["layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "projetUrbain.savoir"),
        change: (v, t, src) => changeInfos({projetUrbain: {...src.projetUrbain, savoir: v}})
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

    const handleApiSearch = (item) => (text) => {
        return getRequestApi(item.api, apiCfg, {[item.autocomplete]: `${text}*`})
            .then(results => results.elements);
    };

    // Render field input based on type
    const renderFieldInput = (item) => {
        if (item.type === "combo" && item?.autocomplete) {
            return renderIdentifyAutoCompleteCombo(item, handleApiSearch, i18n, messages, initialItem);
        }
        if (item.type === "text" || item.type === "number") {
            return renderIdentifyTextOrNumberField(item, i18n, messages, allowChange, types, initialItem);
        }
        if (item.type === "combo" && !item?.autocomplete) {
            return renderIdentifyStandardCombo(item, apiCfg, i18n, messages, allowChange, initialItem);
        }
        if (item.type === "date") {
            return renderIdentifyDateField(item, initialItem, changeProp, i18n, messages, allowChange);
        }
        return null;
    };

    // Render field row
    const renderFieldRow = (item) => {
        if (item.type === "title") {
            return (
                <Col xs={12}>
                    <h4 style={{borderBottom: "1px solid"}}>
                        <ControlLabel style={item.labelStyle || {}}><Message msgId={item.label}/></ControlLabel>
                    </h4>
                </Col>
            );
        }

        return (
            <>
                <Col xs={4}>
                    <ControlLabel style={item.labelStyle || {}}><Message msgId={item.label}/></ControlLabel>
                </Col>
                <Col xs={8}>
                    {renderFieldInput(item)}
                </Col>
            </>
        );
    };

    return (
        <Grid style={{width: "100%"}}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos" key={item.name}>
                        {renderFieldRow(item)}
                    </Row>
                ))
            }
        </Grid>
    );
};

export default Tabou2ProjetUrbainAccord;
