import React, {useState, useEffect} from "react";
import { Col, FormGroup, FormControl, ControlLabel, Row, Checkbox } from "react-bootstrap";
import { get, keys, has } from "lodash";
import { getRequestApi } from "@ext/api/search";
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

export default function Tabou2TiersForm({...props}) {
    const marginTop = "10px";

    const [thisTier, setThisTier] = useState({});

    useEffect(() => {
        setThisTier(props.tier);
    }, [props.opened]);

    const changeProps = (field, val) => {
        setThisTier({...thisTier, [field]: val});
    };

    const TIERS_FORMS = [
    {
        apiField: "libelle",
        textField: "libelle",
        targetField: "type",
        label: "Type",
        placeholder: "Type...",
        type: "combo",
        required: true
    }, {
        apiField: "nom",
        label: "Nom",
        type: "text",
        required: true,
        pattern: "^[0-9]*$"
    }, {
        apiField: "adresseCp",
        label: "Code postal",
        type: "text",
        required: true,
        pattern: "^[0-9]*$"
    }, {
        apiField: "adresseNum",
        label: "Numéro",
        type: "text",
        required: false,
        pattern: "^[0-9]*$"
    }, {
        apiField: "adresseRue",
        label: "Rue",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "adresseVille",
        label: "Ville",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "contact",
        label: "Contact",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "email",
        label: "Email",
        type: "email",
        required: true,
        pattern: ""
    }, {
        apiField: "siteWeb",
        label: "Site web",
        type: "text",
        required: false,
        pattern: ""
    }, {
        apiField: "telecopie",
        label: "Fax",
        type: "text",
        required: false,
        pattern: "^[0-9]*$"
    }, {
        apiField: "telephone",
        label: "Téléphone",
        type: "text",
        required: true,
        pattern: "^[0-9]*$"
    }, {
        apiField: "estPrive",
        label: "Est privé",
        type: "checkbox",
        required: false        
    }];

    return (
        <>
            <Row className="tabou-idToolbar-row text-center" style={{ display: "flex", margin: "auto", marginBottom: "15px", justifyContent: "center" }}>
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
                            disabled: props.valid(thisTier),
                            tooltip: "Sauvegarder",
                            id: "saveTierForm",
                            onClick: () => props.save(thisTier)
                        }, {
                        glyph: "remove",
                        tooltip: "Fermer",
                        id: "closeTierForm",
                        onClick: () => props.cancel(props.tier)                        
                    }]}
                />
            </Row>
            <FormGroup>
                {
                    TIERS_FORMS.map(f => (
                        <Col xs={6}>
                            <Col xs={3} style={{marginTop: marginTop}}>
                                <ControlLabel>{f.label}</ControlLabel>
                            </Col>
                            <Col xs={8}>
                                {
                                    f.type !== "combo" && f.type !== "checkbox" ? (
                                        <FormControl
                                            type={f.type}
                                            required={f.required}
                                            value={get(thisTier, f.apiField)}
                                            placeholder={f.label}
                                            onChange={(t) => changeProps(f.apiField, t.target.value)}
                                        />
                                    ) : null
                                }
                                {
                                    f.type === "combo" ? (
                                        <Tabou2Combo
                                            load={() => getRequestApi("types-tiers?asc=true", props.pluginCfg.apiCfg, {})}
                                            defaultValue={props.tier.libelle}
                                            placeholder={f.placeholder}
                                            textField={f.textField}
                                            onLoad={(r) => r?.elements || r}
                                            disabled={false}
                                            onSelect={(t) =>  changeProps(f.targetField, t)}
                                            onChange={(t) => !t ? changeProps(f.targetField, null) : null}
                                            messages={{
                                                emptyList: 'Aucun type à ajouter.',
                                                openCombobox: 'Ouvrir la liste'
                                            }}
                                        />
                                    ) : null
                                }
                                {
                                    f.type === "checkbox" ? (
                                        <Checkbox
                                            checked={has(thisTier, "estPrive") ? thisTier.estPrive : false}
                                            disabled={props.tier.dateInactif ? true : false}
                                            style={{marginBottom: "10px"}}
                                            id={`${props.tier.id}-priv-${new Date().getTime()}}`}
                                            onChange={() => {
                                                changeProps("estPrive", !thisTier.estPrive);
                                            }}
                                            className="col-xs-2"
                                            change
                                        />
                                    ) : null
                                }

                            </Col>
                        </Col>
                    ))
                }
            </FormGroup>
        </>
    );
}
