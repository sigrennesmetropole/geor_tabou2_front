import React from 'react';
import { Row, Col, Glyphicon } from 'react-bootstrap';
import Message from "@mapstore/components/I18N/Message";
import Tabou2MainTabs from './Tabou2MainTabs';
import Tabou2MainToolContainer from './Tabou2MainToolContainer';
import { PANEL_SIZE } from '../../constants';
import "@js/extension/css/tabou.css";

import {getMessageById} from "@mapstore/utils/LocaleUtils";

import ResponsivePanel from "@mapstore/components/misc/panels/ResponsivePanel";

/**
 * Main tabou2 plugin panel (parent on top)
 * @param {any} param
 * @returns component
 */
export default function Tabou2MainPanel({
    enabled,
    dockStyle,
    onClose = () => { },
    ...props
}) {
    if (!enabled) return null;
    const helpLink = props.help && props.help.url;

    const i18n = getMessageById;

    return (
        <ResponsivePanel
            containerId="urbamap-container"
            containerClassName="dock-container"
            className="urbamap-dock-panel"
            containerStyle={dockStyle}
            open={enabled}
            size={PANEL_SIZE}
            position="right"
            bsStyle="primary"
            title={<Message msgId="tabou2.windowTitle" />}
            onClose={() => onClose()}
            glyph="sheet"
            style={dockStyle}
            header={
                <Row key="ms-tabou-navbar" className="ms-row-tab">
                    {
                        helpLink ? (<a
                            href={helpLink}
                            target="_blank"
                            title={i18n(props.messages, "tabou2.helpTooltip")}
                            className="tabou-help-link">
                            <Glyphicon glyph="question-sign"/> <Message msgId="tabou2.help"/>
                        </a>) : ""
                    }
                    <Col xs={12} style={{marginTop: "10px"}}>
                        {<Tabou2MainTabs {...props} i18n={i18n} />}
                    </Col>
                </Row>
            }
        >
            <Tabou2MainToolContainer {...props} i18n={i18n}/>

        </ResponsivePanel>
    );
}
