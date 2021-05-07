import React, {useState, useEffect, useRef} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, Checkbox, Col, Table, Glyphicon, Row } from 'react-bootstrap';
import { isEqual, orderBy, find, keys } from 'lodash';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Tabou2TextForm from '@ext/components/form/Tabou2TextForm';
import ButtonRB from '@mapstore/components/misc/Button';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import Tabou2TiersActions from "@js/extension/components/tabou2IdentifyPanel/modals/Tabou2TiersActions";
import Tabou2TiersForm from '@ext/components/form/Tabou2TiersForm';
import { TIERS_SCHEMA, REQUIRED_TIER } from '@ext/constants';
import { getRequestApi } from "@ext/api/search";

const Button = tooltip(ButtonRB);

export default function Tabou2TiersModal({
    visible,
    onClick = () => {},
    ...props
}) {
    // TODO : CHANGE, ADD, ASSOCIATE, DROP, validation

    const [tiers, setTiers] = useState([]);
    const [sortField, setSortField] = useState([["nom"], ["asc"]]);
    const editionActivate = useRef(false);
    const [collapse, setCollapse] = useState(-1);
    const readOnly = props?.authent?.isReferent || props?.authent?.isContrib ? false : true;
    
    useEffect(() => {
        if (!isEqual(tiers, props.tiers)) {
            setTiers([...props.tiers, ...tiers.filter(tier => !_.find(props.tiers,["id",tier.id]))]);
        }
    }, [props.tiers]);

    useEffect(() => {
        return;
    }, [tiers, sortField]);

    const getEmpty = (tier) => {
        return REQUIRED_TIER.map(r => tier[r]).filter(a => !a)
    }

    // send put request to save tier
    const saveTier = (tier) => {
        // call action to add log
        if (!props.tiers.map(e => e.id).includes(tier.id)) {
            // new association
            props.createTier(tier);
        } else {
            tier.edit = true;
            props.changeTier(tier);
        }
        editionActivate.current = false;
        setCollapse(-1);
        // delete tier to get tier from API with correct ID
        setTiers([...tiers.filter(ti => ti.id !== tier.id)]);
    };

    const cancelChange = (tier) => {
        if (tier.associate || tier.new) {
            setTiers([...tiers.filter(t => t.id !== tier.id)]);
            editionActivate.current = false;
            setCollapse(-1);
        } else {
            openCloseForm({...props.tiers.filter(el => el.id === tier.id)[0]});
        }
    };

    // associate new tiers from combobox
    // TODO : ASSOCIATION NEED API FIX TO BE TESTED AND FINISH !!
    const changeTier = (newTier, oldTier) => {
        if(newTier.edit) {
            editionActivate.current = true;
        }
        if (newTier) {
            editionActivate.current = true;
            setCollapse(newTier.id);
        }
        setTiers([...tiers.filter(el => ![oldTier?.id, newTier.id].includes(el.id)), {...newTier, associate:false, edit:true}]);
    };

    // create a new tier from scratch
    const insertNewTier = (params) => {
        let newTier = TIERS_SCHEMA;
        editionActivate.current = true;
        if (params.new) setCollapse(params.id);
        setTiers([...tiers, {...newTier, ...params}]);
    };

    const dissociateTier = (tier) => {
        setTiers([...tiers.filter(el => el.id !== tier.id)]);
        props.dissociateTier(tier);
    };

    const getSortIcon = (name) => {
        let icon = "sort-by-attributes";
        let idx = sortField[0].indexOf(name);
        if (idx > -1) {
            icon = sortField[1][idx] === "asc" ? "sort-by-attributes" : "sort-by-attributes-alt";
        }
        return (<Glyphicon onClick={() => changeSort(name) } glyph={icon} style={{marginLeft:"5px"}}/>);
    };

    const openCloseForm = (tier) => {
        let id = tier.id;
        if (id === collapse) {
            editionActivate.current = false;
            setCollapse(-1);
            setTiers([...tiers.filter(t => t.id !== tier.id), {...tier, edit:false, new: false}]);
        } else {
            editionActivate.current = true;
            setCollapse(id);
            setTiers([...tiers.filter(t => t.id !== tier.id), {...tier, edit:true}]);
        }
    };

    const inactivateTier = (tier) => {
        return props.inactivateTier(tier);
    }

    const changeSort = (name) => {
        let order = "asc";
        let idx = sortField[0].indexOf(name);
        if (idx > -1) {
            order = sortField[1][idx] === "asc" ? "desc" : "asc";
        }
        setSortField([[name, "id"], [order, "asc"]]);
    };

    const getStyle = (name) => {
        return find(sortField, [0, name]) ? {color:"darkcyan"} : {color: "rgb(51, 51, 51)"};
    };

    const buttons = [{
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
            color: "white", backgroundColor: "rgb(40,167,69)",
            borderColor: "rgb(40,167,69)"
        },
        onClick: () => insertNewTier({id: 0, edit: true, new: true})
    }];

    return (
        <ResizableModal
            title={"Journal des événements"}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            buttons={readOnly ? [] : buttons}
            onClose={onClick}
            size="lg">
                <Grid fluid style={{overflow: "auto", height:"100%"}}>
                    <Row>
                        <Col xs={12}>
                            <Table>
                                <thead>
                                    <tr>
                                        <th className="col-xs-1">Actif</th>
                                        <th className="col-xs-1">Privé</th>
                                        <th className="col-xs-1">Type</th>
                                        <th className="col-xs-3" style={getStyle("nom")}>Nom
                                            {
                                                getSortIcon("nom")
                                            }                        
                                        </th>
                                        {!readOnly ? (<th>Actions</th>) : null}
                                    </tr>
                                </thead>
                                <tbody style={{overflow: "auto"}}>
                                    {
                                        orderBy(tiers, sortField[0], sortField[1]).map((tier,i) => (
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
                                                            checked={tier.estPrive}
                                                            disabled={tier.dateInactif || collapse !== tier.id ? true : false}
                                                            inline
                                                            className="col-xs-3"
                                                        />
                                                    </td>
                                                    <td>
                                                        {tier.id}
                                                    </td>
                                                    <td>
                                                        {
                                                            tier.new ? 
                                                                (<Tabou2TextForm
                                                                type="text"
                                                                style={{borderRadius: "4px"}}
                                                                onChange={(e) => {
                                                                    null
                                                                }}
                                                                onBlur={(e) => {
                                                                    null
                                                                }}
                                                                placeholder="Saisir un nom..." /> )
                                                                : tier.nom
                                                        }
                                                        {
                                                            tier.associate ?
                                                                (
                                                                    <Tabou2Combo
                                                                        load={() => getRequestApi("tiers", props.pluginCfg.apiCfg, {})}
                                                                        valueField={"id"}
                                                                        placeholder={"Sélectionner un tier..."}
                                                                        filter="contains"
                                                                        textField={"nom"}
                                                                        onLoad={(r) => (r?.elements || r).filter(t => !t.dateInactif && !props.tiers.map(t => t.id).includes(t.id))}
                                                                        disabled={false}
                                                                        onSelect={(t) =>  changeTier({...t, associate:true}, tier)}
                                                                        onChange={(t) => !t ? changeTier({...t, associate:true}, tier) : null}
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
                                                            visible={collapse > -1 ? collapse === tier.id : true}
                                                            collapse={collapse}
                                                            readOnly={readOnly}
                                                            editionActivate={editionActivate.current}
                                                            open={() => openCloseForm(tier)}
                                                            cancel={() => cancelChange(tier)}
                                                            save={() => saveTier(tier)}
                                                            valid={getEmpty}
                                                            dissociate={() => dissociateTier(tier)}
                                                            inactivate={() => inactivateTier(tier)}
                                                        />
                                                    </td>
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
                                                                            let newProps = {};
                                                                            newProps[field] = val;
                                                                            changeTier({...tier, ...newProps});
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
        </ResizableModal>
    );
}
