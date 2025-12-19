import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import isEmpty from "lodash/isEmpty";
import {Panel, Row} from "react-bootstrap";
import "@js/extension/css/vocation.css";
import "@js/extension/css/tabou.css";
import {findValueByType, changeByType, getCodeIdByCode, shouldShowField, renderProgrammationField} from "../utils";
import {getVocationZa} from "@js/extension/api/requests";

export default function ProgrammationMixte({
    operation = {},
    allowChange = false,
    layer = "",
    typesProgrammation,
    setValues = () => {
    },
    i18n = () => {
    },
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
            change: (value) => setValues({nbLogementsPrevu: value}),
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
            change: (value) => setValues({plh: {...values.plh, date: value}}),
            readOnly: false
        },
        {
            name: "plhDescription",
            label: "tabou2.vocation.convPLH",
            field: "plh.description",
            type: "text",
            layers: [],
            source: () => values,
            change: (value) => setValues({plh: {...values.plh, description: value}}),
            readOnly: false
        },
        {
            name: "nbLogementsPrevu",
            label: "tabou2.vocation.targetPLH",
            field: "plh.logementsPrevus",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({plh: {...values.plh, logementsPrevus: value}}),
            readOnly: false
        },
        {
            name: "nbLogementsLivres",
            label: "tabou2.vocation.delivPLH",
            field: "plh.logementsLivres",
            type: "number",
            layers: [],
            source: () => values,
            change: (value) => setValues({plh: {...values.plh, logementsLivres: value}}),
            readOnly: false
        },
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

    return (
        <Panel
            className="contribPaddOap-style"
        >
            <Row className="attributeInfos">
                <h4>
                    <strong><Message msgId="tabou2.vocation.progMixte"/></strong>
                </h4>
                {
                    getFields().filter(field => shouldShowField(field, layer)).map(item => renderProgrammationField(item, i18n, messages, allowChange, values))
                }
            </Row>
        </Panel>
    );
}
