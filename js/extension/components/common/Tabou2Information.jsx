import React from 'react';
import { Glyphicon } from "react-bootstrap";
import { isEmpty } from "lodash";

/**
 * A simple component to display a message with title, text and icon
 * @param {object} props
 * @returns component
 */
export default function Tabou2Information(props) {
    let className = props.isVisible ? null : "collapse";
    let style = { textAlign: "center", margin: "25% auto", ...props.style };
    if (props?.style && !isEmpty(props.style)) {
        style = { ...style, ...props.style };
    }

    return (
        <div className={className} style={style}>
            <Glyphicon glyph={props.glyph}
                style={{
                    margin: "0px",
                    fontSize: "36px"
                }}/>
            <h3 style={{ marginLeft: "0px", marginTop: "20px" }}>{props.title}</h3>
            <h4 style={{ marginLeft: "0px", marginTop: "20px" }}>{props.message}</h4>
            { props.content }
        </div>
    );
}
