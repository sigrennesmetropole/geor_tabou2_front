import React, {useState, useEffect} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, FormGroup, Checkbox, Col, Button, Table, Glyphicon, FormControl, Row, ControlLabel } from 'react-bootstrap';
import { get } from 'lodash';
import { makeId } from '@js/extension/utils/common';
import { getRequestApi, putRequestApi, postRequestApi } from "@ext/api/search";
import Tabou2TiersForm from '@ext/components/form/Tabou2TiersForm';
import { URL_TIERS } from '@ext/constants';
export default function Tabou2TiersModal({
    visible,
    layer,
    onClick = () => { },
    featureId,
    ...props
}) {
    const [countTiers, setCountTiers] = useState(0);

    const [tiers, setTiers] = useState([]);
    // will be replace by header CAS control
    const [editable, setEditable] = useState(false);
    // get selected count
    const [countValue, setCountValue] = useState(0);
    const [toDelete, setToDelete] = useState([]);
    const [deleteTiers, setDeleteTiers] = useState([]);

    // collapsed edit forms
    const [collapse, setCollapse] = useState(0);

    const [changedTiers, setChangedTiers] = useState([]);

    const changeCounter = (id) => {
        let distinct = toDelete;
        if (distinct.includes(id)) {
            distinct = distinct.filter(t => t !== id);
        } else {
            distinct.push(id);
        }
        setToDelete(distinct);
        setCountValue(distinct.length);
    };

    const close = () => {
        setChangedTiers([]);
    };

    const saveTier = (id) => {
        let getChangedTier = changedTiers.filter(f => f.id === id);
        getChangedTier = getChangedTier.length ? getChangedTier[0] : null;
        if (getChangedTier && !getChangedTier.created) {
            putRequestApi(`${get(URL_TIERS, "tabou2")}/tiers`, props.apiCfg, getChangedTier);
        } else if (getChangedTier) {
            postRequestApi(`${get(URL_TIERS, "tabou2")}/tiers`, props.apiCfg, getChangedTier);
        }

    };

    const refreshTiers = (fId, lyr) => {
        /**
         * /!\ - API Unavailable !
         * Uncomment to get real api according to layer
        */
        /* getRequestApi(`${get(URL_TIERS, lyr)}/${fId}/tiers`).then(r => {
            setTiers(r);
        });*/

        getRequestApi(`${get(URL_TIERS, "tabou2")}/tiers`, props.apiCfg).then(r => {
            let displayTiers = r?.elements.filter(t => !deleteTiers.includes(t.id));
            setTiers(displayTiers);
        });
    };

    useEffect(() => {
        refreshTiers(featureId, layer);
    }, [featureId, layer]);

    useEffect(() => {
        return;
    }, [countTiers, collapse]);

    const TIER_SCHEMA = {
        "id": 0,
        "nom": "",
        "adresseNum": "",
        "adresseRue": "",
        "adresseCp": "",
        "adresseVille": "",
        "telephone": "",
        "telecopie": "",
        "email": "",
        "siteWeb": "",
        "contact": "",
        "estPrive": false,
        "dateInactif": null,
        "created": true
    };

    const addTiers = () => {
        let createNewTier = {...TIER_SCHEMA, id: Date.now()};
        setCountTiers(tiers.length + 1);
        setTiers([...tiers, createNewTier]);
    };

    /**
     * Delete tiers
     * @param {array} id
     */
    const removeTiers = (ids) => {
        let displayTiers = tiers.filter(t => !ids.includes(t));
        setTiers(displayTiers);
        setCountTiers(displayTiers.length);
        let deleted = deleteTiers;
        ids.forEach(id => {
            // deleteRequestApi(`${get(URL_TIERS, layer)}/${featureId}/tiers/${id}`, props.apiCfg);
            deleted.push(id);
        });
        setDeleteTiers([...new Set(deleted)]);
        refreshTiers();
    };

    const inactivateTier = (id) => {
        putRequestApi(`/tiers/${id}/inactivate`, props.apiCfg);
        refreshTiers();
    };

    const cancel = (tier) => {
        // get data by default
        putRequestApi(`${get(URL_TIERS, "tabou2")}/tiers/${tier.id}`, props.apiCfg).then( defaultTier => {
            let othersChanged = changedTiers.filter(n => n.id !== tier.id);
            let othersTiers = tiers.filter(n => n.id !== tier.id);
            setChangedTiers([...othersChanged, defaultTier]);
            setTiers([...othersTiers, defaultTier]);
            setCollapse(collapse === tier.id ? -1 : tier.id);
        });
    };

    const changeProps = (id, field, val) => {
        let upTiers = tiers.map(m => {
            // checkbox pass no value
            m[field] = m.id === id ? val || !m[field] : m[field];
            return m;
        });
        setChangedTiers(upTiers);
    };

    const buttons = [{
        text: ` (${countValue})`,
        bsStyle: "warning",
        bsSize: "lg",
        glyph: "ban-circle",
        style: {
            color: "white", backgroundColor: "rgb(255,193,7)", marginRight: "10px",
            borderColor: "rgb(255,193,7)"
        },
        tooltip: "Dissocier la sélection",
        onClick: () => removeTiers(toDelete)
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "tag",
        style: {
            marginRight: "10px"
        },
        tooltip: "Associer un tier",
        onClick: () => addTiers()
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "plus",
        tooltip: "Créer un tier",
        style: {
            color: "white", backgroundColor: "rgb(40,167,69)",
            borderColor: "rgb(40,167,69)"
        },
        onClick: () => addTiers()
    }];

    return (
        <ResizableModal
            title={"Tiers associés"}
            bodyClassName="ms-flex"
            show={visible}
            buttons={editable ? buttons : []}
            showClose
            onClose={onClick}
            size="lg">
            <div>
                <Grid fluid Style={{overflow: "auto"}}>
                    <Row>
                        <Col xs={12}>
                            <Checkbox
                                inline
                                id="check-tiers-edit"
                                checked={editable}
                                onChange={() => setEditable(!editable)}
                                className="col-xs-3">
                                <ControlLabel> Mode édition</ControlLabel>
                            </Checkbox>
                            <Button style={{ borderColor: "rgba(0,0,0,0)" }} onClick={() => refreshTiers(featureId, layer)}>
                                <span style={{ color: "rgb(26,114,178)" }}><Glyphicon glyph="repeat" /> Recharger</span>
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <Table>
                                <thead>
                                    <tr>
                                        {editable ? (<th> {countValue ? `Sélection (${countValue})` : 'Sélection'}</th>) : null}
                                        <th>Actif</th>
                                        <th>Privé</th>
                                        <th>Nom</th>
                                        {editable ? (<th>Actions</th>) : null}
                                    </tr>
                                </thead>
                                <tbody style={{overflow: "auto"}}>
                                    {
                                        tiers.map((tier, i) => (
                                            <>
                                                <tr>
                                                    { editable ?
                                                        (<td>
                                                            <Checkbox
                                                                checked={toDelete.includes(tier.id)}
                                                                onChange={() => changeCounter(tier.id)}
                                                                inline
                                                                id={`${i}-select-tiers`}
                                                                className="col-xs-3" />
                                                        </td>) : null
                                                    }
                                                    <td>
                                                        <Checkbox
                                                            checked={tier.dateInactif || false}
                                                            disabled
                                                            inline
                                                            className="col-xs-3"
                                                        />
                                                    </td>
                                                    <td>
                                                        <Checkbox
                                                            checked={tier.estPrive}
                                                            disabled={!editable}
                                                            onChange={() => changeProps(tier.id, "estPrive")}
                                                            inline
                                                            id={`${i}-estPrive-tiers`}
                                                            className="col-xs-3"
                                                        />
                                                    </td>
                                                    <td><FormControl
                                                        type="text"
                                                        readOnly={!editable}
                                                        style={{borderRadius: "4px"}}
                                                        required
                                                        key={`tier-nom-field-${i}-${tier.nom}`}
                                                        defaultValue={tier.nom}
                                                        onChange={(evt) => {
                                                        // don't change tiers object to do not refresh state and keep input focus
                                                            tier.nom = evt.target.value;
                                                        }}
                                                        onBlur={(evt) => {
                                                            changeProps(tier.id, 'nom', evt.target.value);
                                                        }}
                                                        placeholder="Saisir un nom..." />
                                                    </td>
                                                    {editable ? (
                                                        <td>
                                                            <FormGroup>
                                                                {
                                                                    editable && collapse !== tier.id ? (
                                                                        <>
                                                                            <Button
                                                                                style={{ borderColor: "rgba(0,0,0,0)", display: collapse !== tier.id ? "bloc" : "none" }}
                                                                                onClick={() => removeTiers([tier.id])}>
                                                                                <span style={{color: "rgb(229,0,0)"}}><Glyphicon glyph="ban-circle"/> Dissocier</span>
                                                                            </Button>
                                                                            <Button style={{ borderColor: "rgba(0,0,0,0)", display: collapse !== tier.id ? "bloc" : "none" }}
                                                                                onClick={() => {
                                                                                    setCollapse(collapse === tier.id ? -1 : tier.id);
                                                                                }}
                                                                            >
                                                                                <span style={{ color: "rgb(137,178,211)" }}>
                                                                                    <Glyphicon glyph={tier.dateInactif ? "eye-open" : "pencil"} />
                                                                                    {tier.dateInactif ? " Consulter" : " Modifier"}
                                                                                </span>
                                                                            </Button>
                                                                            {
                                                                                tier.dateInactif ? null : (
                                                                                    <Button
                                                                                        style={{ borderColor: "rgba(0,0,0,0)", display: collapse !== tier.id ? "bloc" : "none" }}
                                                                                        onClick={() => inactivateTier([tier.id])}>
                                                                                        <span style={{color: "#797979"}}><Glyphicon glyph="off"/> Inactif</span>
                                                                                    </Button>)
                                                                            }
                                                                        </>
                                                                    ) : null
                                                                }
                                                                {
                                                                    editable && collapse === tier.id ? (
                                                                        <>
                                                                            <Button style={{ borderColor: "rgba(0,0,0,0)", display: collapse === tier.id ? "bloc" : "none" }}
                                                                                onClick={() => saveTier(tier.id)}>
                                                                                <span style={{ color: "rgb(40, 167, 69)" }}>
                                                                                    <Glyphicon glyph="ok"/> Enregistrer
                                                                                </span>
                                                                            </Button>
                                                                            <Button style={{ borderColor: "rgba(0,0,0,0)", display: collapse === tier.id ? "bloc" : "none" }}
                                                                                onClick={() => {
                                                                                    cancel(tier);
                                                                                }}>
                                                                                <span style={{ color: "rgb(246,2,2)" }}>
                                                                                    <Glyphicon glyph="remove"/> Annuler
                                                                                </span>
                                                                            </Button>
                                                                        </>
                                                                    ) : null
                                                                }
                                                            </FormGroup>
                                                        </td>
                                                    ) : null
                                                    }
                                                </tr>
                                                <tr>
                                                    <th colSpan={4} style={{border: "none", padding: "0"}}>
                                                        <div className={collapse === tier.id ? "collapse in" : "collapse"}>
                                                            <Row style={{ marginBottom: "15px" }} >
                                                                <Col xs={12} >
                                                                    <Tabou2TiersForm
                                                                        tier={tier}
                                                                        collapse={collapse}
                                                                        change={(id, field, val) => {
                                                                            changeProps(id, field, val);
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Grid>
            </div>
        </ResizableModal>
    );
}
