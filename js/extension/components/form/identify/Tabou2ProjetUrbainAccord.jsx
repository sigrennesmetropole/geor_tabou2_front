import React from "react";
import { isEmpty, pick, get, isEqual } from "lodash";
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
const Tabou2ProjetUrbainAccord = ({
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
        change: (v, t, src) => changeInfos({ projetUrbain: { ...src.projetUrbain, title: v }})
    },  {
        name: "chapeau",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.chapeau",
        field: "projetUrbain.chapeau",
        layers: ["layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "projetUrbain.chapeau"),
        change: (v, t, src) => changeInfos({ projetUrbain: { ...src.projetUrbain, chapeau: v }})
    },  {
        name: "projet",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.projet",
        field: "projetUrbain.projet",
        layers: ["layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "projetUrbain.projet"),
        change: (v, t, src) => changeInfos({ projetUrbain: { ...src.projetUrbain, projet: v }})
    },  {
        name: "actualites",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.actualites",
        field: "projetUrbain.actualites",
        layers: ["layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "projetUrbain.actualites"),
        change: (v, t, src) => changeInfos({ projetUrbain: { ...src.projetUrbain, actualites: v }})
    },  {
        name: "savoir",
        type: "text",
        label: "tabou2.identify.accordions.projetUrbain.savoir",
        field: "projetUrbain.savoir",
        layers: ["layerOA"],
        readOnly: false,
        isArea: true,
        value: get(initialItem, "projetUrbain.savoir"),
        change: (v, t, src) => changeInfos({ projetUrbain: { ...src.projetUrbain, savoir: v }})
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
                                                onSelect={item.select ? (v) => item.select(v, initialItem) : null}
                                                onChange={(v) => !v ? item.change(v, initialItem) : null}
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

export default Tabou2ProjetUrbainAccord;
