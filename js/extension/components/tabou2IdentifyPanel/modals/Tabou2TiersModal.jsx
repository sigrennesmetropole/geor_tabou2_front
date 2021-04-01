import React, {useState, useEffect} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, FormGroup, Checkbox, Col, Button, Table, Glyphicon, FormControl, Row, ControlLabel } from 'react-bootstrap';
import { get, isEqual } from 'lodash';
import { DropdownList } from 'react-widgets';
import { makeId } from '@js/extension/utils/common';
import { getRequestApi, putRequestApi, postRequestApi } from "@ext/api/search";
import Tabou2TiersForm from '@ext/components/form/Tabou2TiersForm';
import { URL_TIERS, TIERS_SCHEMA } from '@ext/constants';
import { refresh } from '@mapstore/epics/layers';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';

export default function Tabou2TiersModal({
    visible,
    layer,
    onClick = () => { },
    featureId,
    ...props
}) {

    const [tiers, setTiers] = useState([]);
    const [editable, setEditable] = useState(false);
    const [toDelete, setToDelete] = useState([]);
    const [collapse, setCollapse] = useState(-1);
    const [inChangeTier, setInChangeTier] = useState([]);

    const refreshTiers = () => {
        /**
         * /!\ - API Unavailable !
         * Uncomment to get real api according to layer
        */
        /* getRequestApi(`${get(URL_TIERS, lyr)}/${fId}/tiers`).then(r => {
            setTiers(r);
        });*/

        getRequestApi(`${get(URL_TIERS, "tabou2")}/tiers`, props.apiCfg).then(r => {
            // setTiers(r?.elements || {});
            setTiers(r?.elements.filter(t => t.name !== "create1715") || {});
        });
    };

    useEffect(() => {
        refreshTiers();
        setCollapse(-1);
    }, [featureId, layer, editable]);

    const changeCounter = (id) => {
        let distinct = toDelete;
        if (distinct.includes(id)) {
            distinct = distinct.filter(t => t !== id);
        } else {
            distinct.push(id);
        }
        setToDelete(distinct);
    };
    const inactivateTier = (id) => {
        putRequestApi(`/tiers/${id}/inactivate`, props.apiCfg);
        refreshTiers();
    };

    const cancel = (tier) => {
        setInChangeTier([...inChangeTier.filter(f => f.id !== tier.id)]);
        setCollapse(-1);
    };

    const changeProps = (id, field, val) => {
        let newVal = {};
        newVal[field] = val;
        let tierToChange = tiers.filter(t => t.id === id)[0] || inChangeTier.filter(t => t.id === id)[0];
        setInChangeTier([...inChangeTier.filter(f => f.id !== id), {...tierToChange, ...newVal}]);
    };

    const setAssociation = (id, tier) => {
        /**
         * TODO : manage doublon or manage state when user select / unselect combo association's tier value
         * API need to work to do.
         */
        setInChangeTier([...inChangeTier.filter(f => f.id !== id), {...tier, id: id}]);
    };

    const saveTier = (id) => {
        let tierToSave = inChangeTier.filter(t => t.id === id)[0];
        let needChange = !tiers.filter(t => isEqual(t, tierToSave)).length;
        let isNew = !tiers.filter(t => t.id === id).length;
        if (tierToSave && needChange && !isNew) {
            putRequestApi(`${get(URL_TIERS, "tabou2")}/tiers`, props.apiCfg, tierToSave);
        } else if (isNew) {
            postRequestApi(`${get(URL_TIERS, "tabou2")}/tiers`, props.apiCfg, tierToSave);
        }
        setInChangeTier([...inChangeTier.filter(f => f.id !== id)]);
        setCollapse(-1);
        refreshTiers();
    };

    const createTier = (tier) => {
        let tierToSend = {};
        if (tier && !tiers.filter(t => t.id === tier.id).length) {
            // will be used when tiers will be retrieve from : /operations/{operationId}/tiers or /programmes/{programmeId}/tiers
            tierToSend = tier;
        } else if (!tier) {
            tierToSend = {...TIERS_SCHEMA, id: Date.now(), created: true};
        }
        setInChangeTier([...inChangeTier, tierToSend]);
    };

    const associateTier = () => {
        setInChangeTier([...inChangeTier, {...TIERS_SCHEMA, id: Date.now(), isNew: true}]);
    };

    const buttons = [{
        text: ` (${toDelete.length})`,
        bsStyle: "warning",
        bsSize: "lg",
        glyph: "ban-circle",
        style: {
            color: "white", backgroundColor: "rgb(255,193,7)", marginRight: "10px",
            borderColor: "rgb(255,193,7)"
        },
        tooltip: "Dissocier la sélection",
        onClick: () => null
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "tag",
        style: {
            marginRight: "10px"
        },
        tooltip: "Associer un tier",
        onClick: () => associateTier()
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
        onClick: () => createTier()
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
                            <Button style={{ borderColor: "rgba(0,0,0,0)" }} onClick={() => refreshTiers()}>
                                <span style={{ color: "rgb(26,114,178)" }}><Glyphicon glyph="repeat" /> Recharger</span>
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <Table>
                                <thead>
                                    <tr>
                                        {editable ? (<th className="col-xs-1"> {toDelete.length ? `Sélection (${toDelete.length})` : 'Sélection'}</th>) : null}
                                        <th className="col-xs-1">Actif</th>
                                        <th className="col-xs-1">Privé</th>
                                        <th className="col-xs-4">Nom</th>
                                        {editable ? (<th>Actions</th>) : null}
                                    </tr>
                                </thead>
                                <tbody style={{overflow: "auto"}}>
                                    {
                                        [...inChangeTier.filter(t => !tiers.map(x => x.id).includes(t.id)), ...tiers].map((tier, i) => (
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
                                                    <td>
                                                        {
                                                            !tier.isNew ? (
                                                                <FormControl
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
                                                            ) : (
                                                                <Tabou2Combo
                                                                    load={() => getRequestApi("tiers", props.pluginCfg.apiCfg, {})}
                                                                    valueField={"id"}
                                                                    placeholder={"Sélectionner un tier..."}
                                                                    filter="contains"
                                                                    textField={"nom"}
                                                                    onLoad={(r) => r?.elements || r}
                                                                    disabled={false}
                                                                    onSelect={(t) => {
                                                                        setAssociation(tier.id, t);
                                                                    }}
                                                                    onChange={(t) => !t ? setAssociation(tier.id, tier) : null}
                                                                    messages={{
                                                                        emptyList: 'La liste est vide.',
                                                                        openCombobox: 'Ouvrir la liste'
                                                                    }}
                                                                />

                                                            )
                                                        }
                                                    </td>
                                                    {editable ? (
                                                        <td>
                                                            <FormGroup>
                                                                {
                                                                    collapse !== tier.id ? (
                                                                        <>
                                                                            {
                                                                                tier.created || tier.isNew ? null : (
                                                                                    <Button style={{ borderColor: "rgba(0,0,0,0)", display: collapse !== tier.id ? "bloc" : "none" }}
                                                                                        onClick={() => null }>
                                                                                        <span style={{color: "rgb(229,0,0)"}}><Glyphicon glyph="ban-circle"/> Dissocier</span>
                                                                                    </Button>
                                                                                )
                                                                            }
                                                                            {
                                                                                tier.isNew ? null : (
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
                                                                                )
                                                                            }
                                                                            {
                                                                                tier.dateInactif || !tier.created || !tier.isNew ? null : (
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
                                                                    collapse === tier.id || tier.isNew ? (
                                                                        <>
                                                                            <Button style={{ borderColor: "rgba(0,0,0,0)", display: !tier.dateInactif && tier.nom ? "bloc" : "none" }}
                                                                                onClick={() => saveTier(tier.id)}>
                                                                                <span style={{ color: "rgb(40, 167, 69)" }}>
                                                                                    <Glyphicon glyph="ok"/> {tier.isNew ? " Associer" : " Enregistrer"}
                                                                                </span>
                                                                            </Button>
                                                                            <Button style={{ borderColor: "rgba(0,0,0,0)" }}
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
                                                    <th colSpan={5} style={{border: "none", padding: "0"}}>
                                                        <div className={collapse === tier.id ? "collapse in" : "collapse"}>
                                                            <Row style={{ marginBottom: "15px" }} >
                                                                <Col xs={12} >
                                                                    <Tabou2TiersForm
                                                                        tier={tier}
                                                                        visible={collapse === tier.id}
                                                                        readOnly={tier.dateInactif ? true : false}
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
