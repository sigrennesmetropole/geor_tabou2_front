import React, {useState, useEffect, useRef} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, FormGroup, Checkbox, Col, Button, Table, Glyphicon, Row, ControlLabel } from 'react-bootstrap';
import { get, isEqual, find, keys } from 'lodash';
import { getRequestApi, putRequestApi, postRequestApi } from "@ext/api/search";
import Tabou2TiersForm from '@ext/components/form/Tabou2TiersForm';
import { TIERS_SCHEMA } from '@ext/constants';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Tabou2TextForm from '@ext/components/form/Tabou2TextForm';
import { URL_ADD } from '@js/extension/constants';

export default function Tabou2TiersModal({
    visible,
    layer,
    onClick = () => { },
    featureId,
    ...props
}) {

    const [tiers, setTiers] = useState([]);
    const [collapse, setCollapse] = useState(-1);
    const [inChangeTier, setInChangeTier] = useState([]);
    const [editable, setEditable] = useState(props?.authent?.isReferent || props?.authent?.isContrib ? true : false);
    const occupied = useRef(false);

    const layerConfigName = keys(props?.pluginCfg?.layersCfg).filter(k => props?.selectionLayer === props?.layersCfg[k]?.nom)[0];
    const layerUrl = get(URL_ADD, layerConfigName);

    const refreshTiers = () => {
        /**
         * /!\ - API Unavailable !
         * Uncomment to get real api according to layer
        */
        /* getRequestApi(`${get(URL_ADD, layerUrl)}/${fId}/tiers`).then(r => {
            setTiers(r);
        });*/
        getRequestApi(`${get(URL_ADD, "tabou2")}tiers`, props.apiCfg).then(r => {
            setTiers(r?.elements.filter(t => t.name !== "create1715") || {});
            setCollapse(-1);
        }).then(() => setCollapse(-1));
    };

    useEffect(() => {
        if (collapse && collapse > -1) {
            occupied.current = true;
        }
    }, [collapse])

    const changeEditableView = (activate) => {
        let hasLEvel = props?.authent?.isReferent || props?.authent?.isContrib ? true : false;
        if (!hasLEvel) {
            return setEditable(false);
        }
        occupied.current = activate;
    }

    useEffect(() => {
        refreshTiers();
    }, [featureId, layer, editable]);

    const inactivateTier = (id) => {
        // TODO : change by real api service not all tiers
        putRequestApi(`/tiers/${id}/inactivate`, props.apiCfg).then(() => refreshTiers());
    };

    const cancel = (tier) => {
        setInChangeTier([...inChangeTier.filter(f => f.id !== tier.id)]);
        setCollapse(-1);
        changeEditableView(false);
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
        refreshTiers();
        changeEditableView(false);
    };

    const saveTier = (id) => {
        let tierToSave = inChangeTier.filter(t => t.id === id)[0];
        let needChange = !tiers.filter(t => isEqual(t, tierToSave)).length;
        let isNew = !tiers.filter(t => t.id === id).length;
        if (tierToSave && needChange && !isNew) {
            // TODO : change by real api service not all tiers
            putRequestApi(`${get(URL_ADD, "tabou2")}tiers`, props.apiCfg, tierToSave).then(() => refreshTiers());
        } else if (isNew) {
            // TODO : change by real api service not all tiers
            postRequestApi(`${get(URL_ADD, "tabou2")}tiers`, props.apiCfg, tierToSave).then(() => {
                setInChangeTier([...inChangeTier.filter(f => f.id !== id)]);
                refreshTiers();
            });
        }
        changeEditableView(false);
    };

    const invalidTier = (tier) => {
        let empty = keys(tier).filter(k => !tier[k]);
        return empty.length > 0;
    }

    const createTier = (tier) => {
        let id = Date.now();
        let tierToSend = {};
        if (tier && !find(tiers, ["id", tier.id])) {
            // will be used when tiers will be retrieve from : /operations/{operationId}/tiers or /programmes/{programmeId}/tiers
            tierToSend = tier;
        } else if (!tier) {
            tierToSend = {...TIERS_SCHEMA, id: id, created: true};
        }
        setCollapse(id);
        setInChangeTier([...inChangeTier, tierToSend]);
        changeEditableView(true);
    };

    const associateTier = () => {
        setInChangeTier([...inChangeTier, {...TIERS_SCHEMA, id: Date.now(), isNew: true}]);
        refreshTiers();
        changeEditableView(true);
    };

    const buttons = [{
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "1-user-add",
        style: {
            marginRight: "10px"
        },
        disabled: occupied.current,
        tooltip: "Associer un tier",
        onClick: () => associateTier()
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "pencil-add",
        tooltip: "Créer un tier",
        disabled: occupied.current,
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
                <Grid fluid style={{overflow: "auto"}}>
                    <Row>
                        <Col xs={12}>
                            <Table>
                                <thead>
                                    <tr>
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
                                                    <td>
                                                        <Checkbox
                                                            checked={!tier.dateInactif}
                                                            disabled
                                                            inline
                                                            className="col-xs-3"
                                                        />
                                                    </td>
                                                    <td>
                                                        <Checkbox
                                                            checked={
                                                                find(inChangeTier, ['id', tier.id])?.estPrive !== tier.estPrive ?
                                                                    find(inChangeTier, ['id', tier.id])?.estPrive : tier.estPrive
                                                            }
                                                            disabled={!editable || collapse !== tier.id || tier.dateInactif}
                                                            onChange={() => changeProps(tier.id, "estPrive")}
                                                            inline
                                                            id={`${i}-estPrive-tiers`}
                                                            className="col-xs-3"
                                                        />
                                                    </td>
                                                    <td>
                                                        {

                                                            !tier.isNew && collapse !== tier.id ||
                                                            !tier.isNew && collapse === tier.id && tier.dateInactif ||
                                                            tier.isNew && collapse !== tier.id ?
                                                                find(inChangeTier, ['id', tier.id]) ?
                                                                    get(find(inChangeTier, ['id', tier.id]), "nom") : tier.nom
                                                                : null
                                                        }
                                                        {
                                                            !tier.created && !tier.isNew && collapse === tier.id && !tier.dateInactif ?
                                                                (
                                                                    <Tabou2TextForm
                                                                        type="text"
                                                                        readOnly={!editable || collapse !== tier.id}
                                                                        style={{borderRadius: "4px"}}
                                                                        value={
                                                                            // get last changed value or original name value
                                                                            find(inChangeTier, ['id', tier.id]) ?
                                                                                get(find(inChangeTier, ['id', tier.id]), "nom") : tier.nom
                                                                        }
                                                                        onChange={(e) => {
                                                                            tier?.created ? null : changeProps(tier.id, "nom", e.target.value);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            tier?.created ? changeProps(tier.id, "nom", e.target.value) : null;
                                                                        }}
                                                                        placeholder="Saisir un nom..." />
                                                                ) : null
                                                        }
                                                        {
                                                            tier.created ?                                                                 (
                                                                <Tabou2TextForm
                                                                    type="text"
                                                                    readOnly={!editable || collapse !== tier.id}
                                                                    style={{borderRadius: "4px"}}
                                                                    onBlur={(e) => changeProps(tier.id, "nom", e.target.value)}
                                                                    placeholder="Saisir un nom..." />
                                                            ) : null
                                                        }
                                                        {
                                                            tier.isNew ?
                                                                (
                                                                    <Tabou2Combo
                                                                        load={() => getRequestApi("tiers", props.pluginCfg.apiCfg, {})}
                                                                        valueField={"id"}
                                                                        placeholder={"Sélectionner un tier..."}
                                                                        filter="contains"
                                                                        textField={"nom"}
                                                                        onLoad={(r) => (r?.elements || r).filter(t => !t.dateInactif)}
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

                                                                ) : null
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
                                                                                tier.dateInactif || tier.created || tier.isNew ? null : (
                                                                                    <Button
                                                                                        style={{ borderColor: "rgba(0,0,0,0)"}}
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
                                                                            <Button 
                                                                                style={{ borderColor: "rgba(0,0,0,0)", display: (!tier.dateInactif && tier.nom) || tier.created ? "bloc" : "none" }}
                                                                                disabled={
                                                                                    !tier.isNew ? invalidTier(tier) : false
                                                                                }
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
