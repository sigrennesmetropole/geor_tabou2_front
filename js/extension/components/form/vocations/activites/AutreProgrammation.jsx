import React, { useState } from 'react';
import Message from "@mapstore/components/I18N/Message";
import { has, get, isEmpty, find, set } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel, Button, Panel } from "react-bootstrap";
import "@js/extension/css/vocation.css";
import { findValueInfoProg, changeInfoProg } from "./utils";
import FooterButtons from '../common/FooterButtons';


export default function AutreProgrammation({
    operation = {},
    owner = {},
    layer = ""
}) {
    if (isEmpty(operation)) return "Aucune Opération à afficher !";
    const [values, setValues] = useState(operation);

    const getFields = () => [
        {
            name: "test",
            label: "Type de programmation de test TBR",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueInfoProg("CODE_TYPE_PROG_1_TBR", values),
            change: (value) => setValues(changeInfoProg("CODE_TYPE_PROG_1_TBR", value, values)),
            code: "CODE_TYPE_PROG_1_TBR",
            readOnly: false
        },
        {
            name: "equipement",
            label: "Programmation équipement",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueInfoProg("Equipement", values),
            change: (value) => setValues(changeInfoProg("Equipement", value, values)),
            code: "Equipement",
            readOnly: false
        },
        {
            name: "programmationAutre",
            label: "Programmation autre",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueInfoProg("Autres", values),
            change: (value) => setValues(changeInfoProg("Autres", value, values)),
            code: "Autres",
            readOnly: false
        }
    ];

    const allowChange = owner.isContrib || owner.isReferent;
    const save = (v) => { console.log(v); };
    const close = (v) => { console.log(v); };
    const reset = () => setValues(operation);
    return (
        <Panel
            className="contribPaddOap-style"
            footer={<FooterButtons save={save} close={close} reset={reset}/>}
        >
            <Row className="attributeInfos">
                <h4 style={{ marginBottom: "25px" }}>
                    <strong>Autre programmation</strong>
                </h4>
                {
                    getFields().filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                        <Row>
                            <Col xs={4}>
                                {/* <ControlLabel><Message msgId={item.label}/></ControlLabel> */}
                                {item.label}
                            </Col>
                            <Col xs={4}>
                                {
                                    item.type === "text" || item.type === "number" ?
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
                            </Col>
                        </Row>
                    ))
                }
            </Row>
        </Panel>
    );
}
