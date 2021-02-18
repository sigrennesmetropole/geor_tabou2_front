import React from "react";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid } from "react-bootstrap";
import { isEmpty } from "lodash";

export default function Tabou2ddsAccord({ keyVal, layer }) {
    const fields = [
        {
            name: "adsDate",
            fieldApi: "adsDate",
            label: "Date ADS",
            api: "/",
            type: "date",
            layers: ["layerPA"]
        }, {
            name: "docDate",
            fieldApi: "docDate",
            label: "Date d'autorisation",
            api: "/",
            type: "date",
            layers: ["layerPA"]
        }, {
            name: "datDate",
            fieldApi: "datDate",
            label: "Date DAACT",
            api: "/",
            type: "date",
            layers: ["layerPA"]
        }
    ];

    const marginTop = "10px";
    return (
        <Grid style={{ width: "100%" }} className={""} key={"grid-ident-form"}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(field => (
                    <Row style={{ marginTop: marginTop }} key={`key-formrow-${field.name}`}>
                        <Col xs={12}>
                            <FormGroup key={`key-formgp-${field.name}`}>
                                {
                                    field.type === "boolean" ?
                                        (<Checkbox inline key={`key-chbox-${field.name}`} className="col-xs-3">{field.label}</Checkbox>) : null

                                }
                                {
                                    field.type !== "boolean" ?
                                        (<FormControl
                                            type="text"
                                            key={`key-ctrl-${field.name}`}
                                            placeholder={field.label} />) : null
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                ))
            }

        </Grid>
    );
}
