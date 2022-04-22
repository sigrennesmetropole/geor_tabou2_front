import React, { useState } from 'react';
import Message from "@mapstore/components/I18N/Message";
import { has, get, isEmpty, find, set } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel, Button, Panel } from "react-bootstrap";
import "@js/extension/css/vocation.css";
import { findValueInfoProg, changeInfoProg } from "./utils";
import FooterButtons from '../common/FooterButtons';


export default function ContributionPaddOap({
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
            name: "enjeux",
            label: "Enjeux généraux",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueInfoProg("Enjeux", values),
            change: (value) => setValues(changeInfoProg("Enjeux", value, values)),
            code: "Enjeux",
            readOnly: false
        },
        {
            name: "traitee",
            label: "Principales prises en compte",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueInfoProg("Traitee", values),
            change: (value) => setValues(changeInfoProg("Traitee", value, values)),
            code: "Traitee",
            readOnly: false
        },
        {
            name: "avenir",
            label: "Comment aller plus loin ?",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueInfoProg("Avenir", values),
            change: (value) => setValues(changeInfoProg("Avenir", value, values)),
            code: "Avenir",
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
                    <strong>Contribution à la mise en œuvre du PADD et des OAP métropolitaines</strong>
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
