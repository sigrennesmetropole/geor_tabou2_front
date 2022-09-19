import React, {useState, useEffect, useRef} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, Checkbox, Col, Table, Row } from 'react-bootstrap';
import { isEqual, orderBy, find, omit, isEmpty, some, includes } from 'lodash';
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import Tabou2TextForm from '@js/extension/components/form/Tabou2TextForm';
import Tabou2TiersActions from "../../tabou2IdentifyPanel/modals/Tabou2TiersActions";
import Tabou2TiersForm from '../../form/Tabou2TiersForm';
import { TIERS_SCHEMA, REQUIRED_TIERS } from '@js/extension/constants';
import { getRequestApi, searchTiers } from "@js/extension/api/requests";
import Message from "@mapstore/components/I18N/Message";
import {getMessageById} from "@mapstore/utils/LocaleUtils";
import SearchCombo from '@js/extension/components/form/SearchCombo';
import "@js/extension/css/identify.css";
import "@js/extension/css/tabou.css";
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
            setTiers([...props.tiers, ...tiers.filter(tier => !find(props.tiers, ["id", tier.id]))]);
        }
    }, [props.tiers]);
    // hook to refresh on visible value
    useEffect(() => {
        editionActivate.current = false;
    }, [visible]);
    // hook to for refresh on tiers change, sort action of search text
    useEffect(() => {
        return;
    }, [tiers, sortField, filterText]);

    // manage if form panel component is visible or hidden
    const openCloseForm = (tier) => {
        let id = tier.id;
        editionActivate.current = false;

        if (id === opened) {
            setOpened(-1);
            setTiers([...tiers.filter(t => t.id !== tier.id), {...tier, edit: false, "new": false}]);
        } else {
            editionActivate.current = true;
            setOpened(id);
            setTiers([...tiers.filter(t => t.id !== tier.id), {...tier, edit: true, "new": false}]);
        }
    };

    // return boolean - true if some info missing
    const getEmpty = (tier) => {
        if (isEmpty(tier)) return true;
        let isInvalid = some(REQUIRED_TIERS.map(r => tier.tiers[r]), isEmpty);
        if (tier.associate && (!isEmpty(associateTier.typeTiers) && !isEmpty(associateTier.tiers))) {
            if (tier.typeTiers.libelle) isInvalid = false;
        }
        return isInvalid;
    };

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
        if (!tier) return;
        if (tier.associate || tier.new) {
            setTiers([...tiers.filter(t => t.id !== tier.id)]);
            setOpened(-1);
            setAssociateTier({});
        } else {
            openCloseForm({...props.tiers.filter(el => el.id === tier.id)[0]});
        }
    };

    // associate new tiers from combobox
    const changeTier = (newTier, oldTier) => {
        if (newTier.associate) {
            setTiers([...tiers.filter(t => t.id !== newTier.id), newTier]);
        } else {
            setTiers([...tiers.filter(el => ![oldTier?.id, newTier.id].includes(el.id)), {...newTier, associate: false, edit: true}]);
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

    // innactiv tier
    const inactivateTier = (tier) => {
        return props.inactivateTier(tier);
    };

    // bottom modal's buttons
    const buttons = editionActivate.current ? [] : [{
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "1-user-add",
        disabled: editionActivate.current,
        tooltip: getMessageById(props.messages, "tabou2.tiersModal.associateTier"),
        onClick: () => insertNewTier({id: 0, associate: true, edit: true})
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "pencil-add",
        tooltip: getMessageById(props.messages, "tabou2.tiersModal.createTier"),
        disabled: editionActivate.current,
        style: {
            color: "white",
            backgroundColor: "rgb(40,167,69)",
            borderColor: "rgb(40,167,69)"
        },
        onClick: () => insertNewTier({id: 0, edit: true, "new": true})
    }];

    const displayForm = editionActivate.current && !tiers.filter(t => t.associate).length;

    // return modal title
    const getTitle = () => {
        if (displayForm && tiers.filter(t => t.new).length) {
            return (<Message msgId="tabou2.tiersModal.titleCreate"/>);
        } else if (displayForm) {
            return (<Message msgId="tabou2.tiersModal.titleChange"/>);
        }
        return (<Message msgId="tabou2.tiersModal.title"/>);
    };

    const isTypeDisplay = (tierItem) => {
        if (props.tiersFilter && props.tiersFilter.filter) {
            return props.tiersFilter.filter === tierItem.typeTiers.id;
        }
        return true;
    };

    return (
        <ResizableModal
            title={getTitle()}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            buttons={readOnly ? [] : buttons}
            onClose={() => {
                cancelChange(find(tiers, ["edit", true]));
                return onClick();
            }}
            size="lg">
            <Grid fluid style={{overflow: "auto", height: "100%"}}>
                {
                    !editionActivate.current ? (
                        <Row>
                            <Col xs={3} className="col-md-offset-9 searchTier">
                                <Tabou2TextForm
                                    type="text"
                                    value={filterText}
                                    onChange={(e) => {
                                        setFilterText(e.target.value);
                                    }}
                                    placeholder={getMessageById(props.messages, "tabou2.tiersModal.searchName")} />
                            </Col>
                        </Row>
                    ) : null
                }
                <Row key={`${filterText}}`}>
                    <Col xs={12}>
                        {
                            !displayForm ?
                                (
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th className="col-xs-1"><Message msgId="tabou2.tiersModal.actif"/></th>
                                                <th className="col-xs-1"><Message msgId="tabou2.tiersModal.private"/></th>
                                                <th className="col-xs-3"><Message msgId="tabou2.tiersModal.type"/></th>
                                                <th className="col-xs-3"><Message msgId="tabou2.tiersModal.name"/></th>
                                                {!readOnly ? (<th><Message msgId="tabou2.tiersModal.actions"/></th>) : null}
                                            </tr>
                                        </thead>
                                        <tbody style={{overflow: "auto"}}>
                                            {
                                                orderBy(
                                                    filterText ?
                                                        tiers
                                                            .filter(t => includes(t.tiers.nom.toLowerCase(), filterText.toLowerCase()))
                                                        : tiers
                                                    , sortField[0], sortField[1])
                                                    .filter(t => t.associate || isTypeDisplay(t))
                                                    .map((tier) => (
                                                        <>
                                                            <tr>
                                                                <td>
                                                                    <Checkbox
                                                                        checked={!tier.tiers.dateInactif}
                                                                        disabled
                                                                        inline
                                                                        id={`${tier.id}-${new Date().getTime()}}`}
                                                                        className="col-xs-3"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Checkbox
                                                                        checked={tier.tiers.estPrive}
                                                                        disabled={tier.dateInactif || opened !== tier.id ? true : false}
                                                                        inline
                                                                        id={`${tier.id}-${new Date().getTime()}}`}
                                                                        onChange={() => {
                                                                            changeTier({...tier, estPrive: !tier.tiers.estPrive});
                                                                        }}
                                                                        className="col-xs-2"
                                                                        change
                                                                    />
                                                                </td>
                                                                <td>
                                                                    {tier.associate ? (
                                                                        <Tabou2Combo
                                                                            load={() => getRequestApi("types-tiers?asc=true", props.pluginCfg.apiCfg, {})}
                                                                            defaultValue={tier.typeTiers.libelle}
                                                                            placeholder={getMessageById(props.messages, "tabou2.tiersModal.typePlaceholder")}
                                                                            textField={"libelle"}
                                                                            filter={false}
                                                                            value={associateTier?.typeTiers?.libelle}
                                                                            onLoad={(r) => r?.elements || r}
                                                                            disabled={false}
                                                                            onSelect={(t) =>  {
                                                                                changeTier({...tier, typeTiers: {...tier.typeTiers, ...t}});
                                                                                setAssociateTier({...associateTier, typeTiers: t});
                                                                            }}
                                                                            onChange={(t) => {
                                                                                if (!t) {
                                                                                    changeTier({...tier, typeTiers: {...tier.typeTiers, libelle: ""}});
                                                                                    setAssociateTier({...associateTier, type: t});
                                                                                }
                                                                            }
                                                                            }
                                                                            messages={{
                                                                                emptyList: getMessageById(props.messages, "tabou2.emptyList"),
                                                                                openCombobox: getMessageById(props.messages, "tabou2.displaylist")
                                                                            }}
                                                                        />
                                                                    ) : tier.typeTiers.libelle}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        tier.associate ?
                                                                            (
                                                                                <SearchCombo
                                                                                    minLength={1}
                                                                                    textField={"nom"}
                                                                                    valueField={"id"}
                                                                                    value={associateTier?.tiers?.nom}
                                                                                    forceSelection
                                                                                    search={
                                                                                        text => searchTiers(text)
                                                                                            .then(results =>
                                                                                                results.elements.map(v => v)
                                                                                            )
                                                                                    }
                                                                                    onSelect={(t) =>  setAssociateTier({...associateTier, tiers: t})}
                                                                                    onChange={(t) => !t ? setAssociateTier(omit(associateTier, ["tiers"])) : null}
                                                                                    placeholder={getMessageById(props.messages, "tabou2.tiersModal.tierPlaceholder")}
                                                                                />
                                                                            ) : tier.tiers.nom
                                                                    }
                                                                </td>
                                                                <td>
                                                                    <Tabou2TiersActions
                                                                        messages={props.messages}
                                                                        i18n={props.i18n}
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
                                        i18n={props.i18n}
                                        messages={props.messages}
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
