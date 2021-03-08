import React from "react";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { isEmpty } from "lodash";

export default function Tabou2DescribeAccord({ keyVal, layer }) {
    const fields = [
        {
            name: "programme",
            fieldApi: "programme",
            label: "Programme",
            api: "/programmes",
            type: "text",
            layers: ["layerPA"]
        }, {
            name: "operation",
            fieldApi: "operation",
            label: "Opération",
            api: "/",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "description",
            fieldApi: "description",
            label: "Description",
            api: "/",
            type: "text",
            layers: []
        }, {
            name: "consommationespace",
            fieldApi: "consommationEspace.libelle",
            label: "Consommation espace",
            api: "/operation",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "vocation",
            fieldApi: "vocation.libelle",
            label: "Opération",
            api: "/",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "surfacetotale",
            fieldApi: "surfaceTotale",
            label: "Surface Totale",
            api: "/operations",
            type: "text",
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
                                    field.type !== "boolean" ? <ControlLabel>{field.label}</ControlLabel> : null
                                }
                                {
                                    field.type === "boolean" ?
                                        (<Checkbox inline="true" key={`key-chbox-${field.name}`} className="col-xs-3">{field.label}</Checkbox>) : null

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
