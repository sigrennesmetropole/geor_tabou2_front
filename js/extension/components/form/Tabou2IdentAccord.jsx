import React from "react";
import { isEmpty } from "lodash";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";


export default function Tabou2IdentAccord({keyVal, layer}) {
    const fields = [{
        name: "estoff",
        fieldApi: "diffusionRestreinte",
        label: "Est off",
        api: "/operations",
        type: "boolean",
        layers: ["layerOA", "layerSA"],
        write: true
    }, {
        name: "ID_Tabou",
        api: "/operations",
        type: "text",
        label: "ID Tabou",
        fieldApi: "id",
        layers: ["layerOA", "layerSA"],
        write: false
    }, {
        name: "code",
        api: "/operations",
        label: "Code",
        type: "text",
        fieldApi: "code",
        layers: ["layerOA", "layerSA"]
    }, {
        name: "code",
        api: "/programmes",
        label: "Code",
        type: "text",
        fieldApi: "code",
        layers: ["layerPA"]
    }, {
        name: "commune",
        fieldApi: "",
        api: "/operations",
        label: "Commune",
        type: "string",
        layers: [],
        write: false
    }, {
        name: "nature",
        api: "/operations",
        label: "Nature",
        fieldApi: "libelle",
        type: "string",
        layers: [],
        write: false
    }, {
        name: "nom",
        fieldApi: "nom",
        label: "Nom",
        api: "/operations",
        type: "string",
        layers: ["layerOA", "layerSA"]
    }, {
        name: "nomoa",
        fieldApi: "nom",
        label: "Nom OA Parent",
        api: "/operations",
        type: "string",
        layers: ["layerPA"]
    }, {
        name: "nompa",
        fieldApi: "nom",
        label: "Nom PA Parent",
        api: "/programmes",
        type: "string",
        layers: ["layerPA"]
    }, {
        name: "estoff",
        fieldApi: "diffusionRestreinte",
        label: "Est off",
        api: "/programmes",
        type: "boolean",
        layers: ["layerPA"],
        write: true
    }, {
        name: "numads",
        label: "Num ADS",
        fieldApi: "numAds",
        api: "/programmes",
        type: "string",
        layers: ["layerPA"]
    },
    {
        name: "numads",
        label: "Num ADS",
        fieldApi: "numAds",
        api: "/operations",
        type: "string",
        layers: ["layerOA", "layerSA"]
    }];

    const marginTop = "10px";
    return (
        <Grid style={{ width: "100%" }} className={""} key={keyVal}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(field => (
                    <Row style={{ marginTop: marginTop }} key={`key-formrow-${field.name}`}>
                        <Col xs={12}>
                            <FormGroup key={`key-formgp-${field.name}`}>
                                {
                                    field.type !== "boolean" ? <ControlLabel>{field.label}</ControlLabel> :  null
                                }
                                {
                                    field.type === "boolean" ?
                                        (<Checkbox inline="true" key={`key-chbox-${field.name}`} className="col-xs-3"><ControlLabel>{field.label}</ControlLabel></Checkbox>) : null

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
