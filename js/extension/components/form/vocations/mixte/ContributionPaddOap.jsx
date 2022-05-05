import React, { useEffect } from 'react';
import Message from "@mapstore/components/I18N/Message";
import { get, isEmpty } from "lodash";
import { Col, Row, FormControl, ControlLabel, Panel } from "react-bootstrap";
import "@js/extension/css/vocation.css";
import { findValueByType, changeByType, getCodeIdByCode } from "../utils";


export default function ContributionPaddOap({
    operation = {},
    owner = {},
    layer = "",
    typesContribution,
    setValues = () => {},
    values
}) {
    if (isEmpty(operation)) return "Aucune Opération à afficher !";

    const getFields = () => [
        {
            name: "enjeux",
            label: "Enjeux généraux",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesContribution, "CONTRIBUTION_ENJEUX"), values, "contributions"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesContribution, "CONTRIBUTION_ENJEUX"),
                    value,
                    values,
                    "contributions"
                )
            ),
            code: "CONTRIBUTION_ENJEUX",
            readOnly: false
        },
        {
            name: "traitee",
            label: "Principales prises en compte",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesContribution, "CONTRIBUTION_TRAITEE"), values, "contributions"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesContribution, "CONTRIBUTION_TRAITEE"),
                    value,
                    values,
                    "contributions"
                )
            ),
            code: "CONTRIBUTION_TRAITEE",
            readOnly: false
        },
        {
            name: "avenir",
            label: "Comment aller plus loin ?",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesContribution, "CONTRIBUTION_AVENIR"), values, "contributions"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesContribution, "CONTRIBUTION_AVENIR"),
                    value,
                    values,
                    "contributions"
                )
            ),
            code: "CONTRIBUTION_AVENIR",
            readOnly: false
        }
    ];

    const allowChange = owner.isContrib || owner.isReferent;
    return (
        <Panel
            className="contribPaddOap-style"
        >
            <Row className="attributeInfos">
                <h4>
                    <strong>Contribution à la mise en œuvre du PADD et des OAP métropolitaines</strong>
                </h4>
                {
                    getFields().filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map((item,i) => (
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
                            </Col>
                        </Row>
                    ))
                }
            </Row>

        </Panel>
    );
}
