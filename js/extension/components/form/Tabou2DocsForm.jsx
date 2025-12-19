import React, {useState, useEffect} from "react";
import {Col, FormGroup, Row, FormControl, ControlLabel, Glyphicon} from "react-bootstrap";
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import "../../css/tabou.css";
import {get, set, isEmpty, isEqual} from "lodash";
import Message from "@mapstore/components/I18N/Message";
import Dropzone from 'react-dropzone';
import Tabou2Select from '@js/extension/components/form/Tabou2Select';
import {searchDocumentsTypes} from "../../api/requests";
import Tabou2Date from "../common/Tabou2Date";

// Schéma par défaut défini en dehors du composant pour éviter les re-créations
const DEFAULT_METADATA_SCHEMA = {nom: "", libelleTypeDocument: "", dateDocument: ""};

/**
 * Form to display when a tier is edit or created.
 * @param {any} param
 * @returns component
 */
export default function Tabou2DocsForm({
    document,
    action = -1,
    onClick = () => {
    },
    translate
}) {
    const [file, setFile] = useState({});
    const [metadata, setMetadata] = useState(DEFAULT_METADATA_SCHEMA);

    useEffect(() => {
        // Initialiser avec les valeurs par défaut + document
        const newMetadata = {
            ...DEFAULT_METADATA_SCHEMA,
            dateDocument: new Date().toISOString(),
            ...document
        };
        setMetadata(newMetadata);
    }, [action, document?.id]);

    const changeMeta = (field, value, metaValues) => {
        let copyField = {
            ...metaValues, [field]: value
        };
        // avoid to change props.tiers directly and broke ref memory
        let metaChanged = set(copyField, field, value);
        setMetadata(metaChanged);
    };

    const marginTop = "10px";

    const fieldsMetadata = [{
        key: "id",
        visible: action !== 6,
        libelle: "tabou2.docsModal.docsForm.id",
        type: "text",
        readOnly: true,
        required: false

    }, {
        key: "nom",
        libelle: "tabou2.docsModal.docsForm.name",
        type: "text",
        visible: action,
        required: true,
        readOnly: action === 2

    }, {
        key: "libelleTypeDocument",
        libelle: "tabou2.docsModal.docsForm.type",
        type: "search",
        required: true,
        visible: action,
        readOnly: action === 2
    }, {
        key: "modifDate",
        libelle: "tabou2.docsModal.docsForm.changeDate",
        visible: action !== 6,
        type: "text",
        readOnly: true,
        required: false
    }, {
        key: "modifUser",
        visible: action !== 6,
        libelle: "tabou2.docsModal.docsForm.changeBy",
        type: "text",
        readOnly: true,
        required: false
    }, {
        key: "typeMime",
        visible: action !== 6,
        libelle: "tabou2.docsModal.docsForm.format",
        type: "text",
        readOnly: true,
        required: false
    }, {
        key: "dateDocument",
        visible: action,
        libelle: "tabou2.docsModal.docsForm.date",
        type: "date",
        required: true,
        readOnly: action === 2

    }].filter(f => f.visible);

    const valid = () => {
        let required = fieldsMetadata.filter(f => f.required);
        let values = required.filter(r => metadata[r.key]);
        let requiredValid = values.length === required.length;
        if (isEmpty(document)) {
            // valid document creation
            return requiredValid && !isEmpty(file);
        }
        // valid document modification
        return requiredValid && (metadata.nom || file?.name);
    };

    const triggerAction = (n) => {
        // Transformer libelleTypeDocument en string avant l'envoi à l'API si c'est un objet
        const metadataToSend = {
            ...metadata,
            libelleTypeDocument: typeof metadata.libelleTypeDocument === 'object' && metadata.libelleTypeDocument !== null
                ? (metadata.libelleTypeDocument.libelle || metadata.libelleTypeDocument)
                : metadata.libelleTypeDocument
        };
        return onClick({document: document, action: n, file: file, metadata: metadataToSend});
    };

    // Fonction de recherche pour les types de documents
    // Charge toutes les données, le filtrage est géré côté client par Tabou2Select
    const handleDocumentSearch = () => {
        return searchDocumentsTypes("")
            .then((response) => {
            // Gérer les deux formats possibles: {elements: [...]} ou [...]
                if (response && response.elements) {
                    return response.elements;
                }
                if (Array.isArray(response)) {
                    return response;
                }
                return [];
            })
            .catch((error) => {
                console.error("Erreur lors de la recherche des types de documents:", error);
                return [];
            });
    };

    return (
        <>
            <Row className="text-center tabou-tbar-panel">
                <Toolbar
                    btnDefaultProps={{
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
                            disabled: !valid(),
                            visible: action !== 2,
                            tooltip: translate.i18n(translate.messages, "tabou2.valid"),
                            id: "saveDocDetail",
                            className: "square-button-md",
                            onClick: () => triggerAction(action === 3 ? 7 : 1),
                            style: {color: "#28a745", background: "none", border: "none"}
                        }, {
                            glyph: "remove",
                            tooltip: translate.i18n(translate.messages, "tabou2.cancel"),
                            className: "square-button-md",
                            id: "closeDocDetail",
                            onClick: () => triggerAction(0),
                            style: {color: "#fc3f2a", background: "none", border: "none"}
                        }]}
                />
            </Row>
            <FormGroup>
                <Col xs={7}>
                    {fieldsMetadata.map((field) => (
                        <Col xs={12} key={field.key}>
                            <Col xs={3} style={{marginTop: marginTop}}>
                                <ControlLabel>
                                    <Message msgId={field.libelle}/>{field.required ? "*" : ""} :
                                </ControlLabel>
                            </Col>
                            <Col xs={9}>
                                {field.type === "text" && (<FormControl
                                    type="text"
                                    required={field?.required || false}
                                    readOnly={field?.readOnly || false}
                                    value={get(metadata, field?.key)}
                                    placeholder={translate.i18n(translate.messages, field.libelle)}
                                    onChange={(t) => changeMeta(field.key, t.target.value, metadata)}
                                />)}
                                {field.type === "search" && (
                                    <Tabou2Select
                                        textField="libelle"
                                        valueField="id"
                                        load={handleDocumentSearch}
                                        value={metadata?.[field.key]}
                                        disabled={field?.readOnly || false}
                                        onSelect={(selectedItem) => {
                                            changeMeta(field.key, selectedItem, metadata);
                                        }}
                                        placeholder={translate.i18n(translate.messages, "tabou2.docsModal.docsForm.selectType")}
                                        allowClear={!field.required}
                                        minLength={0}
                                    />
                                )}
                                {field.type === "date" &&
                                                <Tabou2Date
                                                    type="date"
                                                    className="identifyDate"
                                                    placeholder={translate.i18n(translate.messages, "tabou2.docsModal.docsForm.dateDoc")}
                                                    readOnly={field?.readOnly || false}
                                                    calendar
                                                    culture="fr"
                                                    time={false}
                                                    value={get(metadata, field?.key) ? new Date(get(metadata, field?.key)) : null}
                                                    format="DD/MM/YYYY"
                                                    onSelect={(v) => {
                                                        const val = v ? new Date(v).toISOString() : new Date().toISOString();
                                                        changeMeta(field.key, val, metadata);
                                                    }}
                                                    refreshValue={metadata}
                                                    refresh={(o, n) => isEqual(o, n)}
                                                    onChange={(v) => {
                                                        const val = v ? new Date(v).toISOString() : new Date().toISOString();
                                                        changeMeta(field.key, val, metadata);
                                                    }}
                                                />
                                }
                            </Col>
                        </Col>
                    ))}
                </Col>
                {[3, 6].includes(action) && (<Col xs={4}>
                    <Dropzone
                        key="dropzone"
                        rejectClassName="alert-danger"
                        className="alert alert-info col-xs-12"
                        onDrop={(f) => {
                            if (!metadata.nom) {
                                changeMeta("nom", f[0].name, metadata);
                            }
                            setFile(f[0]);
                        }}
                        style={{
                            margin: "0px !important",
                            borderStyle: "dashed",
                            borderWidth: "3px",
                            transition: "all 0.3s ease-in-out"
                        }}
                        activeStyle={{
                            backgroundColor: "#eee",
                            borderWidth: "5px",
                            boxShadow: "0px 0px 25px 14px #d9edf7"
                        }}
                    >
                        <Col xs={12} className="text-center">
                            <div>
                                <Glyphicon glyph="upload" style={{paddingRight: "5px"}}/><br/>
                                <Message msgId="tabou2.docsModal.uploadFile"/>
                                <p style={{color: "grey", marginTop: "5px"}}>
                                    {file?.name || (metadata.nom && !file?.name ? metadata.nom : null)}
                                </p>
                            </div>
                        </Col>
                    </Dropzone>
                </Col>)}
            </FormGroup>
        </>
    );
}
