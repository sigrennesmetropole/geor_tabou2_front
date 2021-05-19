import React from "react";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { isEmpty } from "lodash";

export default function Tabou2GouvernanceAccord({ layer, ...props }) {
    const fields = [
        {
            name: "promoteur",
            fieldApi: "promoteur",
            label: "Promoteur",
            api: "/",
            type: "text",
            layers: ["layerPA"]
        }, {
            name: "maitreoeuvre",
            fieldApi: "maitreOeuvre.libelle",
            label: "Maître d\'oeuvre",
            api: "/",
            type: "text",
            layers: [],
            write: false
        }, {
            name: "decision",
            fieldApi: "desision.libelle",
            label: "Décision",
            api: "/",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "maitriseouvrage",
            fieldApi: "maitriseOuvrage.libelle",
            label: "Maîtrise d'Ouvrage",
            api: "/",
            type: "text",
            layers: []
        }, {
            name: "modeamenagement",
            fieldApi: "modeAmenagement.libelle",
            label: "Mode d'aménagement",
            api: "/",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "amenageur",
            fieldApi: "amenageur.libelle",
            label: "Aménageur",
            api: "/",
            type: "text",
            layers: ["layerOA", "layerSA"],
            write: false
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
