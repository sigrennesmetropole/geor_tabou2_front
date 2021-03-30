import React, { useState, useEffect } from 'react';
import { Row, Col, FormGroup, Checkbox, FormControl, Panel, Alert, Glyphicon } from 'react-bootstrap';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { get, keys } from 'lodash';
import { getRequestApi } from '@ext/api/search';

export default function Tabou2AddOaPaForm({layer, childs = [], pluginCfg = {}}) {
    const [selectedLayer, setSelectedLayer] = useState("");
    const [operation, setOperation] = useState({});
    const [nature, setNature] = useState("");
    const [emprise, setEmprise] = useState({});
    const [infos, setInfos] = useState({
        code: "",
        nom: "",
        etape: "",
        emprise: "",
        natures: ""
    });
    const [infoChange, setInfoChange] = useState("");

    const comboMarginTop = "10px";
    const marginTop = "15px";

    const changeState = (combo, value) => {
        let checkBox = {};
        if (!value) { // this is a checkbox
            checkBox[combo.name] = !infos[combo.name];
        } else {
            infos[combo.name] = value[combo.apiField];
        }
        setInfos({...infos, ...checkBox});
        setInfoChange(combo.name);
    };

    const getActivate = (v) => {
        return v.parent(infos) === true;
    };

    useEffect(() => {return}, [infoChange]);

    const constructForm = (items) => {
        return (
            <Row style={{ marginTop: marginTop }} >
                <Col xs={12} >
                    {/* left combo box */}
                    <FormGroup >
                        {
                            items.map(item => {
                                let el;
                                switch (item.type) {
                                case "checkbox":
                                    el = (
                                        <Checkbox
                                            checked={infos[item.name]}
                                            disabled={item.parent ? item.parent(infos) : false}
                                            onChange={() => changeState(item)}
                                            inline
                                            id={item.name + "-pa-id"}>
                                            {item.label}
                                        </Checkbox>
                                    );
                                    break;
                                case "alert":
                                    el = !item.parent || (item.parent && item.parent(infos)) ? (
                                        <Alert variant={item.variant} style={{marginTop: comboMarginTop}}>
                                            { item.icon ? (<Glyphicon glyph={item.icon} />) : null}
                                            { item.label }
                                        </Alert>
                                    ) : null;
                                    break;
                                case "text":
                                    el = (
                                        <FormControl
                                            style={{ marginTop: comboMarginTop }}
                                            readOnly={item.parent ? getActivate(item) : false}
                                            type={item.type}
                                            required={item.required}
                                            placeholder={item?.placeholder}
                                            onChange={(t) => changeState(item, t)}
                                        />
                                    );
                                    break;
                                case "combo":
                                    // TODO : get request param from parent selected
                                    el = (
                                        <Tabou2Combo
                                            style={{ marginTop: comboMarginTop }}
                                            load={() => getRequestApi(get(item, "api"), pluginCfg.apiCfg, {})}
                                            valueField={item.apiField}
                                            placeholder={item.placeholder}
                                            filter="contains"
                                            textField={item.apiField}
                                            onLoad={(r) => r?.elements || r}
                                            disabled={item.parent ? getActivate(item) : false}
                                            reloadValue={item.parent ? item.parent(infos) : ""}
                                            onSelect={(t) => changeState(item, t)}
                                            onChange={(t) => !t ? changeState(item, t) : null}
                                            name={item.label}
                                            messages={{
                                                emptyList: 'La liste est vide.',
                                                openCombobox: 'Ouvrir la liste'
                                            }}
                                        />

                                    );
                                    break;
                                default:
                                    el = null;
                                }
                                return el;
                            })
                        }
                    </FormGroup>
                </Col>
            </Row>
        );
    };

    return (
        <>
            <Panel
                header={(
                    <label>1 - Choisir l'emprise géographique</label>
                )}
            >
                { constructForm(childs.filter(f => f.group === 1)) }
            </Panel>
            <Panel
                header={(
                    <label>2 - Saisir les informations</label>
                )}
            >
                { constructForm(childs.filter(f => !f.group)) }
            </Panel>
        </>
    );
}
