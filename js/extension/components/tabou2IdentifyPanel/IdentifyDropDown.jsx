import React from 'react';
import { Row } from 'react-bootstrap';
import { DropdownList } from 'react-widgets';
import Message from "@mapstore/components/I18N/Message";

export default function IdentifyDropDown({
    icon,
    reloadValue,
    ...props
}) {
    return (
        <Row style={{ margin: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0', zIndex: '10' }}>
                <span className={`identify-icon glyphicon ${icon}`} />
                <div style={{ flex: "1 1 0%", padding: "0px 4px" }}>
                    <DropdownList
                        disabled={false}
                        placeholder={<Message msgId="tabou2.identify.noData" />}
                        {...props}
                    />
                </div>
            </div>
        </Row>
    );
}
