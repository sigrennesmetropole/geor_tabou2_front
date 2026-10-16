import React, { useEffect, useState, memo } from "react";
import { isEqual, get } from "lodash";
import { Col, Row, FormControl, Grid, ControlLabel, Glyphicon } from "react-bootstrap";
import Tabou2Select from '@js/extension/components/form/Tabou2Select';
import { getRequestApi } from "@js/extension/api/requests";
import { TYPES_TIERS } from "@js/extension/constants";
import { getTiersNomsByType, openTiersModal } from "@js/extension/utils/identify";
import {
    VOCATIONS_PLAE_API,
    RENOUVELLEMENTS_ECONOMIQUES_PLAE_API
} from "@js/extension/components/form/vocations/utils";
import "@js/extension/css/identify.css";
import Message from "@mapstore/components/I18N/Message";
import ButtonRB from '@mapstore/components/misc/Button';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';

const Button = tooltip(ButtonRB);

const avoidReRender = (prevProps, nextProps) => {
    return isEqual(prevProps.initialItem, nextProps.initialItem) && isEqual(prevProps.tiers, nextProps.tiers);
};

/**
 * Onglet "Programmation activité" d'un programme : indicateurs de suivi des zones d'activité économique
 * @param {any} param
 * @returns component
 */
const Tabou2ProgActiviteAccord = ({
    initialItem,
    programme,
    tiers = [],
    setTiersFilter,
    authent,
    apiCfg,
    change = () => { },
    i18n = () => { },
    messages
}) => {
    const [values, setValues] = useState({});

    useEffect(() => {
        setValues(initialItem);
    }, [initialItem]);

    const changeValue = (name, value) => {
        setValues({...values, [name]: value});
        change({[name]: value}, {});
    };

    const parseInteger = (raw) => {
        if (raw === "" || raw === null || raw === undefined) return null;
        const val = parseInt(raw, 10);
        return isNaN(val) || val < 0 ? null : val;
    };

    const statutsPropriete = [
        {code: "CESSION", libelle: i18n(messages, "tabou2.identify.accordions.activite.cession")},
        {code: "BAC", libelle: i18n(messages, "tabou2.identify.accordions.activite.bac")}
    ];

    const fields = [{
        name: "vocationZaSuivi",
        label: "tabou2.identify.accordions.activite.vocationZa",
        type: "select",
        api: VOCATIONS_PLAE_API
    }, {
        name: "renouvellementEconomiqueZaSuivi",
        label: "tabou2.identify.accordions.activite.renouvellementEconomiqueZa",
        type: "select",
        api: RENOUVELLEMENTS_ECONOMIQUES_PLAE_API
    }, {
        name: "occupants",
        label: "tabou2.identify.accordions.activite.occupants",
        type: "tiers",
        tiersCode: TYPES_TIERS.OCCUPANT
    }, {
        name: "entreprisesDeveco",
        label: "tabou2.identify.accordions.activite.entreprisesDeveco",
        type: "text",
        readOnly: true
    }, {
        name: "operateursInvestisseurs",
        label: "tabou2.identify.accordions.activite.operateursInvestisseurs",
        type: "tiers",
        tiersCode: TYPES_TIERS.OPERATEUR_INVESTISSEUR
    }, {
        name: "statutPropriete",
        label: "tabou2.identify.accordions.activite.statutPropriete",
        type: "statut"
    }, {
        name: "prixVente",
        label: "tabou2.identify.accordions.activite.prixVente",
        type: "number"
    }, {
        name: "prixRedevanceAnnuelle",
        label: "tabou2.identify.accordions.activite.prixRedevanceAnnuelle",
        type: "number"
    }];

    const allowChange = authent.isContrib || authent.isReferent;

    const renderInput = (item) => {
        switch (item.type) {
        case "select":
            return (
                <Tabou2Select
                    textField="libelle"
                    valueField="id"
                    value={get(values, item.name) || null}
                    search={() => getRequestApi(item.api, apiCfg, {})
                        .then(results => Array.isArray(results) ? results : (results?.elements || []))}
                    onSelect={(v) => changeValue(item.name, v || null)}
                    placeholder={i18n(messages, "tabou2.identify.accordions.emptySelect")}
                    disabled={!allowChange}
                />
            );
        case "statut":
            return (
                <Tabou2Select
                    textField="libelle"
                    valueField="code"
                    value={get(values, item.name) || null}
                    search={() => Promise.resolve(statutsPropriete)}
                    onSelect={(v) => changeValue(item.name, v?.code || null)}
                    placeholder={i18n(messages, "tabou2.identify.accordions.emptySelect")}
                    disabled={!allowChange}
                />
            );
        case "tiers":
            return (
                <FormControl
                    placeholder={i18n(messages, item.label)}
                    value={getTiersNomsByType(tiers, item.tiersCode)}
                    readOnly
                />
            );
        case "number":
            return (
                <FormControl
                    type="number"
                    min={0}
                    step={1}
                    placeholder={i18n(messages, item.label)}
                    value={get(values, item.name) ?? ""}
                    readOnly={!allowChange}
                    onChange={(v) => changeValue(item.name, parseInteger(v.target.value))}
                    onKeyDown={(v) => {
                        if (!/^\d$/.test(v.key) && v.key.length < 2) {
                            v.returnValue = false;
                            if (v.preventDefault) v.preventDefault();
                        }
                    }}
                />
            );
        default:
            return (
                <FormControl
                    componentClass="textarea"
                    style={{height: "60px"}}
                    value={get(values, item.name) || ""}
                    readOnly
                />
            );
        }
    };

    return (
        <Grid style={{ width: "100%" }}>
            {
                fields.map(item => (
                    <Row className="attributeInfos" key={item.name}>
                        <Col xs={4}>
                            <ControlLabel><Message msgId={item.label}/></ControlLabel>
                        </Col>
                        <Col xs={item.type === "tiers" ? 7 : 8}>
                            {renderInput(item)}
                        </Col>
                        {
                            item.type === "tiers" && (
                                <Col xs={1} className="no-padding">
                                    <Button
                                        tooltip={i18n(messages, "tabou2.identify.accordions.tiersDetail")}
                                        onClick={() => openTiersModal(setTiersFilter, programme?.id, item.tiersCode)}
                                        bsStyle="primary"
                                        bsSize="small">
                                        <Glyphicon glyph="user"/>
                                    </Button>
                                </Col>
                            )
                        }
                    </Row>
                ))
            }
        </Grid>
    );
};

export default memo(Tabou2ProgActiviteAccord, avoidReRender);

