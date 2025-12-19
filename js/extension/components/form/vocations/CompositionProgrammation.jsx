import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import isEmpty from "lodash/isEmpty";
import {Row, Panel} from "react-bootstrap";
import "@js/extension/css/vocation.css";
import {renderField, shouldShowField, getCompositionProgrammationFields} from "./utils";

/**
 * Composant partagé pour afficher la composition de programmation
 * Utilisé par habitat, activités, mixte et mobilité
 */
export default function CompositionProgrammation({
    operation = {},
    allowChange = false,
    layer = "",
    setValues = () => {
    },
    values,
    i18n = () => {
    },
    messages
}) {
    if (isEmpty(operation)) return <Message msgId="tabou2.vocation.noDisplay"/>;

    const getFields = () => getCompositionProgrammationFields(values, setValues);

    return (
        <Panel className="contribPaddOap-style">
            <Row className="attributeInfos">
                <h4>
                    <strong><Message msgId="tabou2.vocation.compoTitle"/></strong>
                </h4>
                {
                    getFields().filter(field => shouldShowField(field, layer)).map(item => renderField(item, i18n, messages, allowChange))
                }
            </Row>
        </Panel>
    );
}

