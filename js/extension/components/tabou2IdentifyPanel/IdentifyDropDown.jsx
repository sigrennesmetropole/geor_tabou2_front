import React from 'react';
import { Row } from 'react-bootstrap';
import { DropdownList } from 'react-widgets';
import Message from "@mapstore/components/I18N/Message";
/**
 * Custom drop down for identify panel
 * @param {any} param
 * @returns component
 */
export default function IdentifyDropDown({
    icon,
    ...props
}) {
    let visible = props.visible ? {
        margin: '10px'
    } : {
        margin: '10px',
        display: 'none'
    };
    return (
        <Row style={visible}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0', zIndex: '10' }}>
                <span className={`identify-icon glyphicon ${icon}`} />
                <div style={{ flex: "1 1 0%", padding: "0px 4px" }}>
                    <DropdownList
                        disabled={false}
                        placeholder="Aucune donnée"
                        {...props}
                    />
                </div>
            </div>
        </Row>
    );
}
