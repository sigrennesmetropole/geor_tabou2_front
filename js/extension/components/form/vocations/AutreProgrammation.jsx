import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import isEmpty from "lodash/isEmpty";
import {Row, Panel} from "react-bootstrap";
import "@js/extension/css/vocation.css";
import {findValueByType, changeByType, getCodeIdByCode, renderField, shouldShowField} from "./utils";

/**
 * Composant partagé pour afficher les autres programmations (équipements, autre)
 * Utilisé par habitat, activités, mixte et mobilité
 */
export default function AutreProgrammation({
    operation = {},
    allowChange = false,
    layer = "",
    typesProgrammation,
    setValues = () => {
    },
    values,
    i18n = () => {
    },
    messages
}) {
    if (isEmpty(operation)) return <Message msgId="tabou2.vocation.noDisplay"/>;

    const getFields = () => [
        {
            name: "equipement",
            label: "tabou2.vocation.progItems",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesProgrammation, "EQUIPEMENT"), values, "informationsProgrammation"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesProgrammation, "EQUIPEMENT"),
                    values,
                    "informationsProgrammation",
                    value
                )
            ),
            code: "EQUIPEMENT",
            readOnly: false
        },
        {
            name: "programmationAutre",
            label: "tabou2.vocation.otherProg",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesProgrammation, "AUTRE"), values, "informationsProgrammation"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesProgrammation, "AUTRE"),
                    values,
                    "informationsProgrammation",
                    value
                )
            ),
            code: "AUTRE",
            readOnly: false
        }
    ];

    return (
        <Panel className="contribPaddOap-style">
            <Row className="attributeInfos">
                <h4>
                    <strong><Message msgId="tabou2.vocation.otherProgTitle"/></strong>
                </h4>
                {
                    getFields().filter(field => shouldShowField(field, layer)).map(item => renderField(item, i18n, messages, allowChange))
                }
            </Row>
        </Panel>
    );
}

