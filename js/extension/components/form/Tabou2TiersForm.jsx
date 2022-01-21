import React, {useState, useEffect} from "react";
import { Col, FormGroup, FormControl, ControlLabel, Row, Checkbox } from "react-bootstrap";
import { get, has, set, clone } from "lodash";
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import Message from "@mapstore/components/I18N/Message";
import "../../css/tabou.css";

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
        setThisTier({...props.tier});
    }, [props.opened]);

    // manage props change
    const changeProps = (field, val) => {
        let copyTiers = {
            ...thisTier, tiers: {...thisTier.tiers, [field]: val}
        };
        // avoid to change props.tiers directly and broke ref memory
        let tiersChanged = set(copyTiers, field, val);
        setThisTier(tiersChanged);
    };

    // forms will be construct from this array
    const TIERS_FORMS = [
        {
            apiField: "tiers.nom",
            label: "tabou2.tiersModal.name",
            type: "text",
            required: true,
            pattern: "^[0-9]*$"
        }, {
            apiField: "tiers.telephone",
            label: "tabou2.tiersModal.tel",
            type: "text",
            required: false,
            pattern: "^[0-9]*$"
        }, {
            apiField: "tiers.telecopie",
            label: "tabou2.tiersModal.fax",
            type: "text",
            required: false,
            pattern: "^[0-9]*$"
        }, {
            apiField: "tiers.adresseRue",
            label: "tabou2.tiersModal.address",
            type: "text",
            required: false,
            pattern: ""
        }, {
            apiField: "tiers.email",
            label: "tabou2.tiersModal.email",
            type: "email",
            required: false,
            pattern: ""
        }, {
            apiField: "tiers.adresseCp",
            label: "tabou2.tiersModal.cp",
            type: "text",
            required: false,
            pattern: "^[0-9]*$"
        }, {
            apiField: "tiers.siteWeb",
            label: "tabou2.tiersModal.website",
            type: "text",
            required: false,
            pattern: ""
        }, {
            apiField: "tiers.adresseVille",
            label: "tabou2.tiersModal.city",
            type: "text",
            required: true,
            pattern: ""
        }, {
            apiField: "tiers.estPrive",
            label: "tabou2.tiersModal.isPrivate",
            type: "checkbox",
            required: false,
            colLabel: 5,
            colForm: 4
        }];
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
                            disabled: props.valid(thisTier),
                            tooltip: props.i18n(props.messages, "tabou2.tiersModal.save"),
                            id: "saveTierForm",
                            visible: !thisTier?.tiers?.dateInactif,
                            onClick: () => props.save(thisTier)
                        }, {
                            glyph: "remove",
                            tooltip: props.i18n(props.messages, "tabou2.tiersModal.exit"),
                            id: "closeTierForm",
                            onClick: () => props.cancel(props.tier)
                        }]}
                />
            </Row>
            <FormGroup>
                <Col xs={12} className="text-right">
                    <label style={{fontStyle: "italic", fontSier: "12px"}}>* informations obligatoire</label>
                </Col>
                {
                    TIERS_FORMS.map(f => (
                        <Col xs={6}>
                            <Col xs={f.colLabel || 4} style={{marginTop: marginTop}}>
                                <ControlLabel><Message msgId={f.label}/>{f.required ? "*" : ""}</ControlLabel>
                            </Col>
                            <Col xs={f.colForm || 8} className={f.required && !get(thisTier, f.apiField) ? "has-error" : ""}>
                                {
                                    f.type !== "combo" && f.type !== "checkbox" ? (
                                        <FormControl
                                            type={f.type}
                                            required={f.required}
                                            readOnly={thisTier?.tiers?.dateInactif}
                                            value={get(thisTier, f.apiField)}
                                            placeholder={props.i18n(props.messages, f.label)}
                                            onChange={(t) => changeProps(f.apiField, t.target.value)}
                                        />
                                    ) : null
                                }
                                {
                                    f.type === "checkbox" ? (
                                        <Checkbox
                                            checked={has(thisTier.tiers, "estPrive") ? thisTier.tiers.estPrive : f?.defaultValue || false}
                                            disabled={thisTier?.tiers?.dateInactif ? true : false}
                                            style={{marginBottom: "10px"}}
                                            id={`${props.tier.id}-priv-${new Date().getTime()}}`}
                                            onChange={() => {
                                                changeProps(f.apiField, !thisTier.tiers.estPrive);
                                            }}
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
