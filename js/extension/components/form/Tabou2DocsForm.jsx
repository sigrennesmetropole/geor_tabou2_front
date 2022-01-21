import React from "react";
import { Col, FormGroup, Row, FormControl, ControlLabel, Glyphicon} from "react-bootstrap";
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import "../../css/tabou.css";
import { has, get } from "lodash";
import Message from "@mapstore/components/I18N/Message";
import Dropzone from 'react-dropzone';

/**
 * Form to display when a tier is edit or created.
 * @param {any} param
 * @returns component
 */
export default function Tabou2DocsForm({document, action = -1, onClick = () => {}}) {
    const triggerAction = (action) => {
        return onClick({document: document, action: action});
    };
    const marginTop = "10px";
    const fieldsMetadata = [{
        key: "id",
        visible: action !== 6,
        libelle: "ID",
        type: "text",
        readOnly: true,
        required: false

    }, {
        key: "nom",
        libelle: "Nom",
        type: "text",
        visible: action,
        required: false

    }, {
        key: "libelle",
        libelle: "Libellé",
        type: "text",
        required: false,
        visible: action
    }, {
        key: "modifDate",
        libelle: "Modifié le",
        visible: action !== 6,
        type: "date",
        readOnly: true,
        required: false

    }, {
        key: "modifUser",
        visible: action !== 6,
        libelle: "Modifié par",
        type: "text",
        readOnly: true,
        required: false
    }, {
        key: "typeMime",
        visible: action !== 6,
        libelle: "Format",
        type: "text",
        required: false
    }].filter(f => f.visible);
    const uploadFiles = (files) => {
        console.log(files);
    };
    return (
        <>
            <Row className="text-center tabou-tbar-panel">
                <Toolbar
                    btnDefaultProps={{
                        className: "square-button-lg",
                        bsStyle: "primary"
                    }}
                    btnGroupProps={{
                        style: {
                            margin: 10
                        }
                    }}
                    buttons={[
                        {
                            glyph: "ok",
                            disabled: false,
                            tooltip: "Valider",
                            id: "saveDocDetail",
                            visible: true,
                            onClick: () => triggerAction(1)
                        }, {
                            glyph: "remove",
                            tooltip: "Annuler",
                            id: "closeDocDetail",
                            onClick: () => triggerAction(0)
                        }]}
                />
            </Row>
            <FormGroup>
                <Col xs={8}>
                    {fieldsMetadata.map(field => (
                        <Col xs={12}>
                            <Col xs={3} style={{marginTop: marginTop}}>
                                <ControlLabel>
                                    <Message msgId={field.libelle}/>{field.required ? "*" : ""} :
                                </ControlLabel>
                            </Col>
                            <Col xs={9}>
                                <FormControl
                                    type="text"
                                    required={field?.required || false}
                                    readOnly={field?.readOnly || false}
                                    value={has(document, field?.key) ? get(document, field?.key) : ""}
                                    placeholder={field.libelle}
                                    onChange={(t) => console.log(t)}
                                />
                            </Col>
                        </Col>
                    ))}
                </Col>
                {action === 6 && (<Col xs={4}>
                    <Dropzone
                        key="dropzone"
                        rejectClassName="alert-danger"
                        className="alert alert-info"
                        onDrop={uploadFiles}
                        style={{
                            borderStyle: "dashed",
                            borderWidth: "3px",
                            transition: "all 0.3s ease-in-out"
                        }}
                        activeStyle={{
                            backgroundColor: "#eee",
                            borderWidth: "5px",
                            boxShadow: "0px 0px 25px 14px #d9edf7"
                        }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                            justifyContent: "center"
                        }}>
                            <span style={{
                                width: "100px",
                                height: "100px",
                                textAlign: "center"
                            }}>
                                <Glyphicon glyph="upload" />
                                Upload file
                            </span>
                        </div>
                    </Dropzone>
                </Col>)}
            </FormGroup>
        </>
    );
}
