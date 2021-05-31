import React, {useState, useEffect} from "react";
import { Col, FormGroup, FormControl, ControlLabel, Row, Checkbox } from "react-bootstrap";
import { get, has } from "lodash";
import { getRequestApi } from "@ext/api/search";
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import Message from "@mapstore/components/I18N/Message";

/**
 * Form to display when a tier is edit or created.
 * @param {any} param
 * @returns component
 */
export default function Tabou2TiersForm({...props}) {
    const marginTop = "10px";
    const [thisTier, setThisTier] = useState({});

    // hooks
    useEffect(() => {
        setThisTier(props.tier);
    }, [props.opened]);

    // manage props change
    const changeProps = (field, val) => {
        setThisTier({...thisTier, [field]: val});
    };

    // forms will be construct from this array
    const TIERS_FORMS = [
    {
        apiField: "libelle",
        textField: "libelle",
        targetField: "type",
        label: "tabou2.tiersModal.type",
        type: "combo",
        required: true
    }, {
        apiField: "nom",
        label: "tabou2.tiersModal.name",
        type: "text",
        required: true,
        pattern: "^[0-9]*$"
    }, {
        apiField: "adresseCp",
        label: "tabou2.tiersModal.cp",
        type: "text",
        required: true,
        pattern: "^[0-9]*$"
    }, {
        apiField: "adresseNum",
        label: "tabou2.tiersModal.numAd",
        type: "text",
        required: false,
        pattern: "^[0-9]*$"
    }, {
        apiField: "adresseRue",
        label: "tabou2.tiersModal.street",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "adresseVille",
        label: "tabou2.tiersModal.city",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "contact",
        label: "tabou2.tiersModal.contact",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "email",
        label: "tabou2.tiersModal.email",
        type: "email",
        required: true,
        pattern: ""
    }, {
        apiField: "siteWeb",
        label: "tabou2.tiersModal.website",
        type: "text",
        required: false,
        pattern: ""
    }, {
        apiField: "telecopie",
        label: "tabou2.tiersModal.fax",
        type: "text",
        required: false,
        pattern: "^[0-9]*$"
    }, {
        apiField: "telephone",
        label: "tabou2.tiersModal.tel",
        type: "text",
        required: true,
        pattern: "^[0-9]*$"
    }, {
        apiField: "estPrive",
        label: "tabou2.tiersModal.isPrivate",
        type: "checkbox",
        required: false        
    }];

    console.log("test");
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
                            tooltip: props.i18n(props.messages,"tabou2.tiersModal.save"),
                            id: "saveTierForm",
                            onClick: () => props.save(thisTier)
                        }, {
                        glyph: "remove",
                        tooltip: props.i18n(props.messages,"tabou2.tiersModal.exit"),
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
                                <ControlLabel><Message msgId={f.label}/>{f.required ? "*" : ""}</ControlLabel>
                            </Col>
                            <Col xs={8} className={f.required && !get(thisTier, f.apiField) ? "has-error" : ""}>
                                {
                                    f.type !== "combo" && f.type !== "checkbox" ? (
                                        <FormControl
                                            type={f.type}
                                            required={f.required}
                                            value={get(thisTier, f.apiField)}
                                            placeholder={props.i18n(props.messages,f.label)}
                                            onChange={(t) => changeProps(f.apiField, t.target.value)}
                                        />
                                    ) : null
                                }
                                {
                                    f.type === "combo" ? (
                                        <Tabou2Combo
                                            style={{ border: "1px solid red !important" }}
                                            load={() => getRequestApi("types-tiers?asc=true", props.pluginCfg.apiCfg, {})}
                                            defaultValue={props.tier.libelle}
                                            placeholder={props.i18n(props.messages,f.label)}
                                            textField={f.textField}
                                            onLoad={(r) => r?.elements || r}
                                            disabled={false}
                                            onSelect={(t) =>  changeProps(f.targetField, t)}
                                            onChange={(t) => !t ? changeProps(f.targetField, null) : null}
                                            messages={{
                                                emptyList: props.i18n(props.messages,"tabou2.emptyList"),
                                                openCombobox: props.i18n(props.messages,"tabou2.displayList")
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
                <Col xs={12}>
                <label style={{fontStyle:"italic", fontSier:"12px"}}>* informations obligatoire</label>
                </Col>
            </FormGroup>
        </>
    );
}
