import React from 'react';
import { Glyphicon } from "react-bootstrap";

export default function Tabou2Information(props) {
    let className = props.isVisible ? null : "collapse";

    return (
        <div className={className} style={{ textAlign: "center", margin: "25% auto"}}>
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