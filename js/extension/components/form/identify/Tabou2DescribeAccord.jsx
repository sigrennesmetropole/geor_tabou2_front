import React from "react";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { isEmpty } from "lodash";

export default function Tabou2DescribeAccord({ layer, ...props }) {
    const fields = [
        {
            name: "programme",
            field: "programme",
            label: "Programme",
            type: "text",
            layers: ["layerPA"]
        }, {
            name: "operation",
            field: "operation",
            label: "Opération",
            type: "text",
            layers: []
        }, {
            name: "description",
            field: "description",
            label: "Description",
            type: "text",
            layers: []
        }, {
            name: "consommationespace",
            field: "consommationEspace.libelle",
            label: "Consommation espace",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "vocation",
            field: "vocation.libelle",
            label: "Opération",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "surfacetotale",
            field: "surfaceTotale",
            label: "Surface Totale",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }
    ];

    const marginTop = "10px";
    return (
        <Grid style={{ width: "100%" }} className={""}>
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
