import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import isEmpty from "lodash/isEmpty";
import {Panel, Row} from "react-bootstrap";
import "@js/extension/css/vocation.css";
import {findValueByType, changeByType, getCodeIdByCode, renderField, shouldShowField} from "../utils";


export default function ContributionPaddOap({
    operation = {},
    layer = "",
    typesContribution,
    setValues = () => {
    },
    i18n = () => {
    },
    messages,
    values,
    allowChange
}) {
    if (isEmpty(operation)) return <Message msgId={"tabou2.vocation.noDisplay"}/>;

    const getFields = () => [
        {
            name: "enjeux",
            label: "tabou2.vocation.generalTarget",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesContribution, "CONTRIBUTION_ENJEUX"), values, "contributions"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesContribution, "CONTRIBUTION_ENJEUX"),
                    values,
                    "contributions",
                    value
                )
            ),
            code: "CONTRIBUTION_ENJEUX",
            readOnly: false
        },
        {
            name: "traitee",
            label: "tabou2.vocation.mainChecked",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesContribution, "CONTRIBUTION_TRAITEE"), values, "contributions"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesContribution, "CONTRIBUTION_TRAITEE"),
                    values,
                    "contributions",
                    value
                )
            ),
            code: "CONTRIBUTION_TRAITEE",
            readOnly: false
        },
        {
            name: "avenir",
            label: "tabou2.vocation.howFar",
            field: "description",
            type: "text",
            layers: [],
            source: () => findValueByType(getCodeIdByCode(typesContribution, "CONTRIBUTION_AVENIR"), values, "contributions"),
            change: (value) => setValues(
                changeByType(
                    getCodeIdByCode(typesContribution, "CONTRIBUTION_AVENIR"),
                    values,
                    "contributions",
                    value
                )
            ),
            code: "CONTRIBUTION_AVENIR",
            readOnly: false
        }
    ];

    return (
        <Panel
            className="contribPaddOap-style"
        >
            <Row className="attributeInfos">
                <h4>
                    <strong><Message msgId="tabou2.vocation.contribPADDOAP"/></strong>
                </h4>
                {
                    getFields().filter(field => shouldShowField(field, layer)).map(item => renderField(item, i18n, messages, allowChange))
                }
            </Row>

        </Panel>
    );
}
