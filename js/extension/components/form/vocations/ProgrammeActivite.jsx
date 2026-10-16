import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import isEmpty from "lodash/isEmpty";
import {Panel, Row} from "react-bootstrap";
import "@js/extension/css/vocation.css";
import "@js/extension/css/tabou.css";
import {findValueByType, changeByType, getCodeIdByCode, renderProgrammationField} from "./utils";

export default function ProgrammeActivite({
    operation = {},
    typesProgrammation,
    setValues = () => {},
    i18n = () => {},
    messages,
    values,
    allowChange
}) {
    if (isEmpty(operation)) return <Message msgId="tabou2.vocation.noDisplay"/>;

    const activityTypeId = getCodeIdByCode(typesProgrammation, "ACTIVITES");
    const field = {
        name: "activites",
        label: "tabou2.vocation.progActivity",
        field: "description",
        type: "text",
        isArea: true,
        source: () => findValueByType(activityTypeId, values, "informationsProgrammation"),
        change: (value) => setValues(changeByType(activityTypeId, values, "informationsProgrammation", value)),
        readOnly: false
    };

    return (
        <Panel className="contribPaddOap-style">
            <Row className="attributeInfos">
                <h4><strong><Message msgId="tabou2.vocation.progActivity"/></strong></h4>
                {renderProgrammationField(field, i18n, messages, allowChange, values)}
            </Row>
        </Panel>
    );
}
