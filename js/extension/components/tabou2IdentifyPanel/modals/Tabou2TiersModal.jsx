import React, {useState, useEffect} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Collapse, Grid, FormGroup, Checkbox, Col, Button, Table, Glyphicon, FormControl, Row, ControlLabel } from 'react-bootstrap';
import { get } from 'lodash';
import { makeId } from '@js/extension/utils/common';
import { getRequestApi, putRequestApi, deleteRequestApi } from "@ext/api/search";
import Tabou2TiersForm from '@ext/components/form/Tabou2TiersForm';
import { URL_TIERS, TIERS_FORMS } from '@ext/constants';
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

    const marginTop = '10px';
    const comboMarginTop = '5px';

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

    const refreshTiers = (fId, lyr) => {
        /**
         * /!\ - API Unavailable !
         * Uncomment to get real api according to layer
        */
        /* getRequestApi(`${get(URL_TIERS, lyr)}/${fId}/tiers`).then(r => {
            setTiers(r);
        });*/

        getRequestApi(`${get(URL_TIERS, "tabou2")}/tiers`, props.apiCfg).then(r => {
            let displayTiers = r?.elements.filter(t => !t.dateInactif).filter(t => !deleteTiers.includes(t.id));
            setTiers(displayTiers);
            displayTiers.forEach(t => { collapse[t.id] = true; });
        });
    };

    useEffect(() => {
        refreshTiers(featureId, layer);
    }, [featureId, layer]);

    useEffect(() => {
        return;
    }, [countTiers, collapse]);

    const addTiers = () => {
        tiers.push({
            nom: "",
            estPrive: "",
            id: makeId()
        });
        setTiers(tiers);
        setCountTiers(tiers.length);
    };

    /**
     * Delete tiers
     * @param {array} id
     */
    const removeTiers = (ids) => {
        let newTiers = tiers.filter(t => !ids.includes(t));
        setTiers(newTiers);
        setCountTiers(newTiers.length);
        let deleted = deleteTiers;
        ids.forEach(id => {
            // deleteRequestApi(`${get(URL_TIERS, layer)}/${featureId}/tiers/${id}`, props.apiCfg);
            deleted.push(id);
        });
        setDeleteTiers([...new Set(deleted)]);
        refreshTiers();
    };

    const changeProps = (id, field, val) => {
        let upTiers = tiers.map(m => {
            // checkbox pass no value
            m[field] = m.id === id ? val || !m[field] : m[field];
            return m;
        });
        setTiers(upTiers);
    };

    const buttons = [{
        text: `(${countValue})`,
        bsStyle: "warning",
        bsSize: "lg",
        glyph: "trash",
        style: {
            color: "white", backgroundColor: "rgb(255,193,7)", marginRight: "10px",
            borderColor: "rgb(255,193,7)"
        },
        tooltip: "Supprimer la sélection",
        onClick: () => removeTiers(toDelete)
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "plus",
        tooltip: "Associer un tier",
        style: {
            color: "white", backgroundColor: "rgb(40,167,69)", marginRight: "10px",
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
                                        {editable ? (<th>Sélection</th>) : null}
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
                                                                <Button style={{ borderColor: "rgba(0,0,0,0)" }} onClick={() => removeTiers([tier.id])}>
                                                                    <span style={{color: "rgb(229,0,0)"}}><Glyphicon glyph="trash"/> Supprimer</span>
                                                                </Button>
                                                                <Button style={{ borderColor: "rgba(0,0,0,0)" }}
                                                                    onClick={() => {
                                                                        setCollapse(collapse === tier.id ? -1 : tier.id);
                                                                    }}
                                                                    aria-expanded={collapse[tier.id] || false} aria-controls={`edit-${tier.id}`}
                                                                >
                                                                    <span style={{ color: "rgb(137,178,211)" }}>
                                                                        <Glyphicon glyph="pencil" /> Editer
                                                                    </span>
                                                                </Button>
                                                            </FormGroup>
                                                        </td>
                                                    ) : null
                                                    }
                                                </tr>
                                                <tr>
                                                    <th colSpan={4} style={{border: 'none'}}>
                                                        <div className={collapse === tier.id ? 'collapse in' : 'collapse'}>
                                                            <Row style={{ marginTop: marginTop }} >
                                                                <Col xs={12} >
                                                                    <Tabou2TiersForm idTier={tier.id} />
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
