import React from "react";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { isEmpty } from "lodash";

export default function Tabou2ProgHabitAccord({ keyVal, layer }) {
    const fields = [
        {
            name: "nbLogementsPrevu",
            fieldApi: "nbLogementsPrevu",
            label: "Nombre de logement",
            api: "/",
            type: "text",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "plhLogementsPrevus",
            fieldApi: "plhLogementsPrevus",
            label: "PLH - Nb. logements prévus",
            api: "/",
            type: "date",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "plhLogementsLivres",
            fieldApi: "plhLogementsLivres",
            label: "PLH - Nb. logements livrés",
            api: "/",
            type: "date",
            layers: ["layerOA", "layerSA"]
        }, {
            name: "attributionFonciereAnnee",
            fieldApi: "attributionFonciereAnnee",
            label: "Année Attribution Foncière",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "attributionDate",
            fieldApi: "attributionFonciereAnnee",
            label: "Date attribution",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "commercialisationDate",
            fieldApi: "commercialisationDate",
            label: "Date commercialisation",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "logementsTotal",
            fieldApi: "logementsTotal",
            label: "Logement total",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "logementsAccessAidePrevu",
            fieldApi: "logementsAccessAidePrevu",
            label: "Accession aidée",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "logementsAccessLibrePrevu",
            fieldApi: "logementsAccessLibrePrevu",
            label: "Accession libre",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "logementsAccessMaitrisePrevu",
            fieldApi: "logementsAccessMaitrisePrevu",
            label: "Accession maitrisée",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "logementsLocatifAidePrevu",
            fieldApi: "logementsLocatifAidePrevu",
            label: "Locatif Aidé",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "logementsLocatifReguleHlmPrevu",
            fieldApi: "logementsLocatifReguleHlmPrevu",
            label: "Locatif régulé  HLM",
            api: "/",
            type: "number",
            layers: ["layerPA"]
        }, {
            name: "logementsLocatifRegulePrivePrevu",
            fieldApi: "logementsLocatifRegulePrivePrevu",
            label: "Locatif régulé privé",
            api: "/",
            type: "number",
            layers: ["layerPA"]
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
