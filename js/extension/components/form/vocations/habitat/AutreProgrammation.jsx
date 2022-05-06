import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import { get, isEmpty } from "lodash";
import { Col, Row, FormControl, Panel, ControlLabel } from "react-bootstrap";
import "@js/extension/css/vocation.css";
import { findValueByType, changeByType, getCodeIdByCode } from "../utils";

export default function AutreProgrammation({
    operation = {},
    layer = "",
    typesProgrammation,
    setValues = () => { },
    values,
    allowChange,
    i18n,
    messages
}) {
    if (isEmpty(operation)) return "Aucune Opération à afficher !";

    const getFields = () => [
        {
            name: "equipement",
            label: "tabou2.vocation.progItems",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesProgrammation, "Equipement"), values, "informationsProgrammation"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesProgrammation, "Equipement"),
                    value,
                    values,
                    "informationsProgrammation"
                )
            ),
            code: "Equipement",
            readOnly: false
        },
        {
            name: "programmationAutre",
            label: "tabou2.vocation.otherProg",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesProgrammation, "Autres"), values, "informationsProgrammation"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesProgrammation, "Autres"),
                    value,
                    values,
                    "informationsProgrammation"
                )
            ),
            code: "Autres",
            readOnly: false
        }
    ];

    return (
        <Panel
            className="contribPaddOap-style"
        >
            <Row className="attributeInfos">
                <h4>
                    <strong><Message msgId="tabou2.vocation.otherProg"/></strong>
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
                                        />) : ""
                                }
                            </Col>
                        </Row>
                    ))
                }
            </Row>
        </Panel>
    );
}
