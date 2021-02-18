import React from "react";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid } from "react-bootstrap";
import { isEmpty } from "lodash";

export default function Tabou2SecProgLiesAccord({ keyVal, layer }) {
    const fields = [
        {
            name: "lisecoa",
            fieldApi: "lisecoa",
            label: "Liste des secteurs de L'OA",
            api: "/",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "lisecpa",
            label: "Liste des programmes de L'OA",
            fieldApi: "lisecpa",
            api: "/",
            type: "date",
            layers: ["layerOA", "layerSA"]
        }
    ];

    const marginTop = "10px";
    return (
        <Grid style={{ width: "100%" }} className={""} key={keyVal}>
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
