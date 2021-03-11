import React, {useState, useEffect} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, FormGroup, Checkbox, Col, Button, Table, Glyphicon, FormControl, Row, ControlLabel } from 'react-bootstrap';
import { has, keys, get } from 'lodash';
import { makeId } from '@js/extension/utils/common';
export default function Tabou2TiersModal({
    visible,
    onClick = () => {}
}) {
    const [countTiers, setCountTiers] = useState(0);
    const [tiers, setTiers] = useState([]);
    // will be replace by header CAS control
    const [editable, setEditable] = useState(false);
    // get selected count
    const [countValue, setCountValue] = useState(0);
    // stock checkbox state
    const [countItems, setCountItems] = useState({});

    const changeCounter = (name) => {
        countItems[name] = has(countItems, name) ? !countItems[name] : true;
        setCountItems(countItems);
        setCountValue(keys(countItems).filter(v => get(countItems, v)).length);
    };

    useEffect(() => {
        setTiers([{
            nom: "Astm",
            estPrive: true,
            id: makeId()
        }, {
            nom: "Rennes Métropole",
            estPrive: false,
            id: makeId()
        }]);
    }, []);

    useEffect(() => {
        return;
    }, [countTiers]);

    const addTiers = () => {
        tiers.push({
            nom: "",
            estPrive: "",
            id: makeId()
        });
        setTiers(tiers);
        setCountTiers(tiers.length);
    };

    const deleteTiers = (id) => {
        let newTiers = tiers.filter(t => t.id !== id);
        setTiers(newTiers);
        setCountTiers(newTiers.length);
    };

    const changeProps = (id, field, val) => {
        let upTiers = tiers.map(m => {
            m[field] = m.id === id ? val : m[field];
            return m;
        });
        setTiers(upTiers);
    };

    return (
        <ResizableModal
            title={"Tiers associés"}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            onClose={onClick}
            size="lg">
            <div>
                <Grid fluid className={"fluid-container adjust-display"}>
                    <Row>
                        <Col xs={12}>
                            <Checkbox
                                inline
                                id="check-tiers-edit"
                                checked={editable}
                                onChange={() => setEditable(!editable)}
                                key="search-chbox-isaide" className="col-xs-3">
                                <ControlLabel> Mode édition</ControlLabel>
                            </Checkbox>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <Table>
                                <thead>
                                    <tr>
                                        {editable ? (<th>Sélection</th>) : null}
                                        <th>Type</th>
                                        <th>Nom</th>
                                        {editable ? (<th>Actions</th>) : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        tiers.map((tier, i) => (
                                            <tr>
                                                { editable ?
                                                    (<td>
                                                        <Checkbox
                                                            checked={countItems[i] || false}
                                                            onChange={() => changeCounter(i.toString())}
                                                            inline
                                                            id={`${i}-cnt-tiers`}
                                                            key="search-chbox-isaide"
                                                            className="col-xs-3" />
                                                    </td>) : null
                                                }
                                                <td><FormControl
                                                    type="text"
                                                    required
                                                    readOnly={!editable}
                                                    style={{borderRadius: "4px"}}
                                                    key={`tier-type-field-${i}-${tier.estPrive}`}
                                                    value={tier.estPrive ? "Privé" : "public"}
                                                    placeholder="Saisir un type..." />
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
                                                            <Button style={{borderColor: "rgba(0,0,0,0)"}} onClick={() => deleteTiers(tier.id)}>
                                                                <span style={{color: "rgb(229,0,0)"}}><Glyphicon glyph="trash"/> Supprimer</span>
                                                            </Button>
                                                        </FormGroup>
                                                    </td>
                                                ) : null
                                                }
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    { editable ?
                        (<Row>
                            <Col xs={12}>
                                <FormGroup>
                                    <Button bsSize="md" style={{color: "white", backgroundColor: "rgb(255,193,7)", marginRight: "10px", borderRadius: "4px", borderColor: "rgb(255,193,7)"}}>
                                        <Glyphicon glyph="trash"/> Supprimer ( <strong>{countValue} </strong>)
                                    </Button>
                                    <Button
                                        bsSize="md"
                                        style={{color: "white", backgroundColor: "rgb(40,167,69)", marginRight: "10px",
                                            borderRadius: "4px", borderColor: "rgb(40,167,69)"}}
                                        onClick={() => addTiers()}
                                    >
                                        <Glyphicon glyph="plus"/> Ajouter
                                    </Button>
                                </FormGroup>
                            </Col>
                        </Row>) : null
                    }
                </Grid>
            </div>
        </ResizableModal>
    );
}
