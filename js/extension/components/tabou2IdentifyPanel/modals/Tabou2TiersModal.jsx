import React, {useState, useEffect, useRef} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, Checkbox, Col, Table, Row } from 'react-bootstrap';
import { isEqual, orderBy, omit, isEmpty, some, includes } from 'lodash';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Tabou2TextForm from '@ext/components/form/Tabou2TextForm';
import Tabou2TiersActions from "@js/extension/components/tabou2IdentifyPanel/modals/Tabou2TiersActions";
import Tabou2TiersForm from '@ext/components/form/Tabou2TiersForm';
import { TIERS_SCHEMA, REQUIRED_TIER } from '@ext/constants';
import { getRequestApi } from "@ext/api/search";
import "@ext/css/identify.css";
/**
 * Tier modal
 * TODO : NEED API FIX TO BE TESTED AND FINISH !!
 * @param {any} param
 * @returns component
 */
export default function Tabou2TiersModal({
    visible,
    onClick = () => {},
    ...props
}) {
    const [tiers, setTiers] = useState([]);
    const [sortField, setSortField] = useState([["id"], ["asc"]]);
    const editionActivate = useRef(false);
    const [associateTier, setAssociateTier] = useState({});
    const [opened, setOpened] = useState(-1);
    const readOnly = props?.authent?.isReferent || props?.authent?.isContrib ? false : true;
    const [filterText, setFilterText] = useState("");
    
    // hook to manage tiers refresh from API and refresh component only if needed
    useEffect(() => {
        if (!isEqual(tiers, props.tiers)) {
            setTiers([...props.tiers, ...tiers.filter(tier => !_.find(props.tiers,["id",tier.id]))]);
        }
    }, [props.tiers]);
    // hook to refresh on visible value
    useEffect(() => {
        editionActivate.current = false;
    }, [visible])
    // hook to for refresh on tiers change, sort action of search text
    useEffect(() => {
        return;
    }, [tiers, sortField, filterText]);

    // return boolean - true if some info missing
    const getEmpty = (tier) => {
        //return REQUIRED_TIER.map(r => get(tier,r)).filter(a => !a)
        let isInvalid = some(REQUIRED_TIER.map(r => tier[r]), isEmpty);
        if (tier.associate && (!isEmpty(associateTier.type) && !isEmpty(associateTier.tier))) {
            if (tier.libelle) isInvalid = false;
        }
        return isInvalid;
    }

    // send put request to save tier added, associated, modified
    const saveTier = (tier) => {
        // call action to add log
        let isNew = !props.tiers.map(e => e.id).includes(tier.id);
        if (isNew && !tier.associate) {
            // new tier
            props.createTier(tier);
        } else if (isNew && tier.associate) {
            // new association
            props.associateTier(associateTier);
            setAssociateTier({});
        } else {
            // simple edition to save
            tier.edit = true;
            props.changeTier(tier);
        }
        editionActivate.current = false;
        setOpened(-1);
        setAssociateTier({});
        setTiers([...tiers.filter(ti => ti.id !== tier.id)]);
    };

    // cancel edition, association, creation
    const cancelChange = (tier) => {
        editionActivate.current = false;
        if (tier.associate || tier.new) {
            setTiers([...tiers.filter(t => t.id !== tier.id)]);
            setOpened(-1);
        } else {
            openCloseForm({...props.tiers.filter(el => el.id === tier.id)[0]});
        }
    };

    // associate new tiers from combobox
    const changeTier = (newTier, oldTier) => {
        if (newTier.associate) {
            setTiers([...tiers.filter(t => t.id !== newTier.id), newTier]);
        } else {
            setTiers([...tiers.filter(el => ![oldTier?.id, newTier.id].includes(el.id)), {...newTier, associate:false, edit:true}]);
        }
    };

    // create a new tier from scratch
    const insertNewTier = (params) => {
        setTiers([...tiers, {...TIERS_SCHEMA, ...params}]);
        editionActivate.current = true;
        if (params.new) setOpened(params.id);
    };

    // dissociate tier
    const dissociateTier = (tier) => {
        setTiers([...tiers.filter(el => el.id !== tier.id)]);
        props.dissociateTier(tier);
    };

    // manage if form panel component is visible or hidden
    const openCloseForm = (tier) => {
        let id = tier.id;
        editionActivate.current = false;

        if (id === opened) {
            setOpened(-1);
            setTiers([...tiers.filter(t => t.id !== tier.id), {...tier, edit:false, new: false}]);
        } else {
            editionActivate.current = true;
            setOpened(id);
            setTiers([...tiers.filter(t => t.id !== tier.id), {...tier, edit:true}]);
        }
    };

    // innactiv tier
    const inactivateTier = (tier) => {
        return props.inactivateTier(tier);
    }

    // bottom modal's buttons
    const buttons = editionActivate.current ? [] : [{
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "1-user-add",
        disabled: editionActivate.current,
        tooltip: "Associer un tier",
        onClick: () => insertNewTier({id: 0, associate: true, edit: true})
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "pencil-add",
        tooltip: "Créer un tier",
        disabled: editionActivate.current,
        style: {
            color: "white",
            backgroundColor: "rgb(40,167,69)",
            borderColor: "rgb(40,167,69)"
        },
        onClick: () => insertNewTier({id: 0, edit: true, new: true})
    }];

    const displayForm = editionActivate.current && !tiers.filter(t => t.associate).length;
    // return modal title
    const getTitle = () => {
        if (displayForm && tiers.filter(t => t.new).length) {
            return "Annuaire des tiers - Création d'un nouveau tier";
        } else if (displayForm){
            return "Annuaire des tiers - Modification d'un tier"
        }
        return "Annuaire des tiers";
    }
    return (
        <ResizableModal
            title={getTitle()}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            buttons={readOnly ? [] : buttons}
            onClose={onClick}
            size="lg">
                <Grid fluid style={{overflow: "auto", height:"100%"}}>
                    {
                        !editionActivate.current ? (
                            <Row>
                                <Col xs={3} className="col-md-offset-9 searchTier">
                                    <Tabou2TextForm
                                        type="text"
                                        onChange={(e) => {
                                            setFilterText(e.target.value);
                                        }}
                                        placeholder="Recherche un nom..." />
                                </Col>
                            </Row>
                        ) : null
                    }
                    <Row key={`${filterText}-${new Date().getTime()}`}>
                        <Col xs={12}>
                            {
                                 !displayForm ?
                                 (
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th className="col-xs-1">Actif</th>
                                                <th className="col-xs-1">Privé</th>
                                                <th className="col-xs-3">Type</th>
                                                <th className="col-xs-3">Nom</th>
                                                {!readOnly ? (<th>Actions</th>) : null}
                                            </tr>
                                        </thead>
                                        <tbody style={{overflow: "auto"}}>
                                            {
                                                orderBy(filterText ? tiers.filter(t => includes(t.nom.toLowerCase(), filterText)) : tiers, sortField[0], sortField[1]).map((tier,i) => (
                                                    <>
                                                        <tr>
                                                            <td>
                                                                <Checkbox
                                                                    checked={!tier.dateInactif}
                                                                    disabled
                                                                    inline
                                                                    id={`${tier.id}-${new Date().getTime()}}`}
                                                                    className="col-xs-3"
                                                                />
                                                            </td>
                                                            <td>
                                                                <Checkbox
                                                                    checked={tier.estPrive}
                                                                    disabled={tier.dateInactif || opened !== tier.id ? true : false}
                                                                    inline
                                                                    id={`${tier.id}-${new Date().getTime()}}`}
                                                                    onChange={() => {
                                                                        changeTier({...tier, estPrive: !tier.estPrive});
                                                                    }}
                                                                    className="col-xs-2"
                                                                    change
                                                                />
                                                            </td>
                                                            <td>
                                                                {tier.associate ? (
                                                                    <Tabou2Combo
                                                                        load={() => getRequestApi("types-tiers?asc=true", props.pluginCfg.apiCfg, {})}
                                                                        defaultValue={tier.libelle}
                                                                        placeholder={"Sélectionner un type..."}
                                                                        textField={"libelle"}
                                                                        value={associateTier?.type?.libelle}
                                                                        onLoad={(r) => r?.elements || r}
                                                                        disabled={false}
                                                                        onSelect={(t) =>  {
                                                                            changeTier({...tier, libelle: t.libelle});
                                                                            setAssociateTier({...associateTier, type: t});
                                                                        }}
                                                                        onChange={(t) => {
                                                                            if (!t) {
                                                                                changeTier({...tier, libelle: ""});
                                                                                setAssociateTier({...associateTier, type: t})};
                                                                            }
                                                                        }
                                                                        messages={{
                                                                            emptyList: 'Aucun type disponible',
                                                                            openCombobox: 'Afficher les types'
                                                                        }}
                                                                    />
                                                                ): tier.libelle}
                                                            </td>
                                                            <td>
                                                                {tier.nom}
                                                                {
                                                                    tier.associate ?
                                                                        (
                                                                            <Tabou2Combo
                                                                                load={() => getRequestApi("tiers", props.pluginCfg.apiCfg, {})}
                                                                                valueField={"id"}
                                                                                placeholder={"Sélectionner un tier..."}
                                                                                textField={"nom"}
                                                                                value={associateTier?.tier?.nom}
                                                                                onLoad={(r) => (r?.elements || r).filter(t => !t.dateInactif && !props.tiers.map(t => t.id).includes(t.id))}
                                                                                disabled={false}
                                                                                onSelect={(t) =>  setAssociateTier({...associateTier, tier: t})}
                                                                                onChange={(t) => !t ? setAssociateTier(omit(associateTier,["tier"])) : null}
                                                                                messages={{
                                                                                    emptyList: 'Aucun tier à ajouter.',
                                                                                    openCombobox: 'Ouvrir la liste'
                                                                                }}
                                                                            />
        
                                                                        ) : null
                                                                }
                                                            </td>
                                                            <td>
                                                                <Tabou2TiersActions 
                                                                    tier={tier}
                                                                    tiers={tiers}
                                                                    visible={opened > -1 ? opened === tier.id : true}
                                                                    opened={opened}
                                                                    readOnly={readOnly}
                                                                    editionActivate={editionActivate.current}
                                                                    open={() => openCloseForm(tier)}
                                                                    cancel={() => cancelChange(tier)}
                                                                    save={() => saveTier(tier)}
                                                                    isAssociation={tier.associate && !isEmpty(associateTier)}
                                                                    valid={getEmpty}
                                                                    dissociate={() => dissociateTier(tier)}
                                                                    inactivate={() => inactivateTier(tier)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    </>
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                 ) : null
                            }
                            <div>
                            {
                                displayForm ? (
                                    <Tabou2TiersForm
                                        pluginCfg={props.pluginCfg.apiCfg}
                                        tier={tiers.filter(t => t.id === opened)[0] || {}}
                                        opened={tiers.filter(t => t.id === opened)[0]?.id}
                                        valid={getEmpty}
                                        save={saveTier}
                                        cancel={(t) => cancelChange(t)}
                                    />
                                ) : null
                            }
                            </div>
                        </Col>
                    </Row>
                </Grid>
        </ResizableModal>
    );
}
