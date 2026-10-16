import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import isEmpty from "lodash/isEmpty";
import {Panel, Row} from "react-bootstrap";
import "@js/extension/css/vocation.css";
import "@js/extension/css/tabou.css";
import { shouldShowField, renderProgrammationField, getPlaeFields} from "../utils";
import {getVocationZa} from "@js/extension/api/requests";

export default function ProgrammationActivite({
    operation = {},
    layer = "",
    setValues = () => {
    },
    i18n = () => {
    },
    messages,
    values,
    allowChange
}) {
    if (isEmpty(operation)) return <Message msgId={"tabou2.vocation.noDisplay"}/>;


    const getFields = () => {
        return [
            {
                name: "vocationZa",
                label: "tabou2.vocation.vocZa",
                apiLabel: "libelle",
                apiField: "code",
                field: "vocationZa",
                type: "combo",
                api: getVocationZa,
                layers: [],
                source: () => values,
                change: (value) => setValues({vocationZa: value}),
                code: "Autres",
                readOnly: false
            },
            ...getPlaeFields(values, setValues),
            {
                name: "scot",
                label: "tabou2.vocation.scot",
                field: "scot",
                type: "checkbox",
                layers: ["layerOA"],
                source: () => values,
                change: () => setValues({scot: !values.scot}),
                readOnly: false
            },
            {
                name: "densiteMiniScot",
                label: "tabou2.vocation.densitySCOT",
                field: "densiteScot",
                type: "number",
                layers: [],
                source: () => values,
                change: (value) => setValues({densiteScot: value}),
                readOnly: false
            },
            {
                name: "densiteMiniOapq",
                label: "tabou2.vocation.densityOAPQ",
                field: "plui.densiteOap",
                type: "number",
                layers: [],
                source: () => values,
                change: (value) => setValues({plui: {...values.plui, densiteOap: value}}),
                readOnly: false
            }
        ];
    };

    return (
        <Panel
            className="contribPaddOap-style"
        >
            <Row className="attributeInfos">
                <h4>
                    <strong><Message msgId="tabou2.vocation.progActivity"/></strong>
                </h4>
                {
                    getFields().filter(field => shouldShowField(field, layer)).map(item => renderProgrammationField(item, i18n, messages, allowChange, values))
                }
            </Row>
        </Panel>
    );
}
