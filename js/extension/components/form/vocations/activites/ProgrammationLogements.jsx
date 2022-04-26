import React, { useEffect } from 'react';
import Message from "@mapstore/components/I18N/Message";
import { get, isEmpty } from "lodash";
import { Col, Row, FormControl, Checkbox, ControlLabel, Panel } from "react-bootstrap";
import "@js/extension/css/vocation.css";
import "@js/extension/css/tabou.css";
import { findValueByType, changeByType, getCodeIdByCode } from "./utils";
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import { getVocationZa } from "@js/extension/api/requests";
export default function ProgrammationLogements({
    operation = {},
    owner = {},
    layer = "",
    typesProgrammation,
    setValues = () => {},
    values
}) {
    if (isEmpty(operation)) return "Aucune Opération à afficher !";
    useEffect(() => {
        return;
    }, [values.informationsProgrammation, values.contributions]);
    const getFields = () => [
        {
            name: "activites",
            label: "Programmation activités",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesProgrammation, "Activites"), values, "informationsProgrammation"),
            change: (value) => {
                setValues(
                    changeByType(
                        getCodeIdByCode(typesProgrammation, "Activites"),
                        value,
                        values,
                        "informationsProgrammation",
                        getCodeIdByCode(typesProgrammation, "Activites")
                    )
                );
            },
            code: "Activites",
            readOnly: false
        },
        {
            name: "vocationZa",
            label: "Vocation ZA",
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
            label: "Scot",
            field: "scot",
            type: "checkbox",
            layers: ["layerOA"],
            source: () => values,
            change: () => setValues({...values, scot: !values.scot}),
            readOnly: false
        },
        {
            name: "densiteMiniScot",
            label: "Densité mini SCoT",
            field: "densiteScot",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, densiteScot: value}),
            readOnly: false
        },
        {
            name: "densiteMiniOapq",
            label: "Densité mini OAPQ",
            field: "plui.densiteOap",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({...values, plui: {...values.plui, densiteOap: value}}),
            readOnly: false
        }
    ];

    const allowChange = owner.isContrib || owner.isReferent;
    return (
        <Panel
            className="contribPaddOap-style"
        >
            <Row className="attributeInfos">
                <h4 style={{ marginBottom: "25px" }}>
                    <strong>Programmation de logements</strong>
                </h4>
                {
                    getFields().filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map((item, i) => (
                        <Row key={`${item.name}-${i}`}>
                            <Col xs={4}>
                                {/* <ControlLabel><Message msgId={item.label}/></ControlLabel> */}
                                {item.label}
                            </Col>
                            <Col xs={4}>
                                {
                                    ["text", "number"].includes(item.type) ?
                                        (<FormControl
                                            componentClass={item.isArea ? "textarea" : "input"}
                                            placeholder={item.label}
                                            style={{height: item.isArea ? "100px" : "auto"}}
                                            type={item.type}
                                            min="0"
                                            step={item?.step}
                                            value={get(item.source(), item.field)}
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
                                            placeholder={item.label}
                                            textField={item.apiLabel}
                                            filter={false}
                                            value={get(values, item.field)}
                                            onLoad={(r) => r?.elements || r}
                                            onSelect={(t) => {
                                                item.change(t);
                                            }}
                                            onChange={(t) => {if (!t) item.change("");}}
                                        />
                                    ) : null
                                }
                            </Col>
                        </Row>
                    ))
                }
            </Row>
        </Panel>
    );
}
