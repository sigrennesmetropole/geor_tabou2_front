import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import { get, isEmpty } from "lodash";
import { Col, Row, FormControl, Checkbox, ControlLabel, Panel } from "react-bootstrap";
import "@js/extension/css/vocation.css";
import "@js/extension/css/tabou.css";
import { findValueByType, changeByType, getCodeIdByCode } from "../utils";
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import { getVocationZa } from "@js/extension/api/requests";
import { DateTimePicker } from "react-widgets";
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);
export default function ProgrammationMixte({
    operation = {},
    allowChange = false,
    layer = "",
    typesProgrammation,
    setValues = () => {},
    i18n = () => {},
    messages,
    values
}) {
    if (isEmpty(operation)) return <Message msgId="tabou2.vocation.noDisplay"/>;
    const getFields = () => [
        {
            name: "nbLogementsPrevu",
            field: "nbLogementsPrevu",
            label: "tabou2.vocation.nbHousing",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, nbLogementsPrevu: value}),
            readOnly: false
        },
        {
            name: "habitat",
            label: "tabou2.vocation.progHabitat",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesProgrammation, "HABITAT"), values, "informationsProgrammation"),
            change: (value) => {
                setValues(
                    changeByType(
                        getCodeIdByCode(typesProgrammation, "HABITAT"),
                        value,
                        values,
                        "informationsProgrammation",
                        getCodeIdByCode(typesProgrammation, "HABITAT")
                    )
                );
            },
            readOnly: false
        },
        {
            name: "activites",
            label: "tabou2.vocation.progActivity",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesProgrammation, "ACTIVITES"), values, "informationsProgrammation"),
            change: (value) => {
                setValues(
                    changeByType(
                        getCodeIdByCode(typesProgrammation, "ACTIVITES"),
                        value,
                        values,
                        "informationsProgrammation",
                        getCodeIdByCode(typesProgrammation, "ACTIVITES")
                    )
                );
            },
            readOnly: false
        },
        {
            name: "plhDate",
            label: "tabou2.vocation.datePLH",
            field: "plh.date",
            type: "date",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, plh: {...values.plh, date: value}}),
            readOnly: false
        },
        {
            name: "plhDescription",
            label: "tabou2.vocation.convPLH",
            field: "plh.description",
            type: "text",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, plh: {...values.plh, description: value}}),
            readOnly: false
        },
        {
            name: "nbLogementsPrevu",
            label: "tabou2.vocation.targetPLH",
            field: "plh.logementsPrevus",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, plh: {...values.plh, logementsPrevus: value}}),
            readOnly: false
        },
        {
            name: "nbLogementsLivres",
            label: "tabou2.vocation.delivPLH",
            field: "plh.logementsLivres",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, plh: {...values.plh, logementsLivres: value}}),
            readOnly: false
        },
        {
            name: "vocationZa",
            label: "tabou2.vocation.vocZa",
            apiLabel: "libelle",
            apiField: "code",
            field: "vocationZa.libelle",
            type: "combo",
            api: getVocationZa,
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, vocationZa: {...values.vocationZa, libelle: value}}),
            code: "Autres",
            readOnly: false
        },
        {
            name: "scot",
            label: "tabou2.vocation.scot",
            field: "scot",
            type: "checkbox",
            layers: ["layerOA"],
            source: () => values,
            change: () => setValues({...values, scot: !values.scot}),
            readOnly: false
        },
        {
            name: "densiteMiniScot",
            label: "tabou2.vocation.densitySCOT",
            field: "densiteScot",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, densiteScot: value}),
            readOnly: false
        },
        {
            name: "densiteMiniOapq",
            label: "tabou2.vocation.densityOAPQ",
            field: "plui.densiteOap",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, plui: {...values.plui, densiteOap: value}}),
            readOnly: false
        }
    ];

    return (
        <Panel
            className="contribPaddOap-style"
        >
            <Row className="attributeInfos">
                <h4>
                    <strong><Message msgId="tabou2.vocation.progMixte"/></strong>
                </h4>
                {
                    getFields().filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map((item, i) => (
                        <Row key={`${item.name}-${i}`}>
                            <Col xs={4}>
                                <ControlLabel><Message msgId={item.label}/></ControlLabel>
                            </Col>
                            <Col xs={4}>
                                {
                                    ["text", "number"].includes(item.type) ?
                                        (<FormControl
                                            componentClass={item.isArea ? "textarea" : "input"}
                                            placeholder={i18n(messages, item.label)}
                                            style={{height: item.isArea ? "100px" : "auto"}}
                                            type={item.type}
                                            min="0"
                                            step={item?.step}
                                            value={get(item.source(), item.field) || ""}
                                            readOnly={item.readOnly || !allowChange}
                                            onChange={(v) => {
                                                return item.change(item.type === "number" && v.target.value < 0 ? "" : v.target.value);
                                            }}
                                            onKeyDown={(v) => {
                                                if (item.type !== "number") return;
                                                // only keep numeric and special key control as "Delete" or "Backspace"
                                                if (!new RegExp('^[0-9\.\,]').test(v.key) && v.key.length < 2) {
                                                    v.returnValue = false;
                                                    if (v.preventDefault) v.preventDefault();
                                                }
                                            }}
                                        />) : null
                                }
                                {item.type === "checkbox" && (
                                    <Checkbox
                                        checked={get(values, item.field) || false}
                                        disabled={!allowChange}
                                        style={{marginBottom: "10px"}}
                                        id={`${item.name}-progLogements-${new Date().getTime()}}`}
                                        onChange={() => {
                                            item.change();
                                        }}
                                        change
                                    />)
                                } {
                                    item.type === "combo" ? (
                                        <Tabou2Combo
                                            load={item.api}
                                            defaultValue={get(values, item.field)}
                                            placeholder={i18n(messages, item.label)}
                                            textField={item.apiLabel}
                                            disabled={!allowChange}
                                            filter={false}
                                            value={get(values, item.field)}
                                            onLoad={(r) => r?.elements || r}
                                            onSelect={(t) => {
                                                item.change(t);
                                            }}
                                            onChange={(t) => {if (!t) item.change("");}}
                                        />
                                    ) : null
                                } {item.type === "date" && (
                                    <DateTimePicker
                                        type="date"
                                        className="identifyDate"
                                        placeholder={i18n(messages, item.label)}
                                        readOnly={item?.readOnly || !allowChange}
                                        calendar
                                        culture="fr"
                                        time={false}
                                        value={get(values, item.field)  ? new Date(get(values, item.field)) : null}
                                        format="DD/MM/YYYY"
                                        onSelect={(t) => {
                                            item.change(t ? new Date(t).toISOString() : null);
                                        }}
                                        onChange={(t) => {
                                            item.change(t ? new Date(t).toISOString() : null);
                                        }}
                                    />
                                )}
                            </Col>
                        </Row>
                    ))
                }
            </Row>
        </Panel>
    );
}
