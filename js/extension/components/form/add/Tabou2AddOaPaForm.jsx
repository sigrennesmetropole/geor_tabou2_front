import React, { useState } from 'react';
import { Row, Col, FormGroup, Checkbox, FormControl, Panel, Alert, Glyphicon } from 'react-bootstrap';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { get, has, isEmpty, keys } from 'lodash';
import { getRequestApi } from '@ext/api/search';
import ControlledPopover from '@mapstore/components/widgets/widget/ControlledPopover';

export default function Tabou2AddOaPaForm({layer, childs = [], pluginCfg = {}, onChange = () => {}}) {
    const [infos, setInfos] = useState({
        code: "",
        nom: "",
        etape: "",
        emprise: "",
        nature: "",
        secteur: false
    });
    const [invalides, setInvalides] = useState([]);

    const comboMarginTop = "10px";
    const marginTop = "15px";

    const changeState = (combo, value) => {
        let formElement = {};
        if (combo.type === "checkbox") {
            formElement[combo.name] = !infos[combo.name];
        } else {
            // temporary fix for https://github.com/sigrennesmetropole/geor_tabou2_front/issues/82
            formElement[combo.name] = value === "En diffus" ? "EN_DIFFUS" : value;
        }
        let newInfos = {...infos, ...formElement};
        setInfos(newInfos);
        onChange(newInfos);
        setInvalides(keys(infos).filter(name => name !== "secteur").filter(name => !infos[name]));

    };

    const getActivate = (v) => {
        return v.parent(infos) === true;
    };

    const isInvalid = (name) => {
        return invalides.includes(name) ? "red !important" : "";
    };

    const getParams = () => {
        // get programme/emprises need only nature param
        let params = infos.nature && layer ? {nature: encodeURI(infos.nature)} : {};
        if (layer === "layerOA") {
            // need nature and secteur to request API get operation/emprises
            params =  has(infos, "secteur") && infos.nature ? {...params, estSecteur: infos.secteur} : {};
        }
        return params;
    };

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
                                            checked={infos[item.name] || false}
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
                                            style={{ marginTop: comboMarginTop, borderColor: isInvalid(item.name) }}
                                            readOnly={item.parent ? getActivate(item) : false}
                                            type={item.type}
                                            required={item?.required}
                                            placeholder={item?.placeholder}
                                            onChange={(t) => changeState(item, t.target.value)}
                                        />
                                    );
                                    break;
                                case "combo":
                                    el = (
                                        <Tabou2Combo
                                            style={{ marginTop: comboMarginTop, borderColor: isInvalid(item.name) }}
                                            load={() => getRequestApi(get(item, "api"), pluginCfg.apiCfg, getParams())}
                                            disabled={item.parent ? isEmpty(item.parent(infos)) : item?.disabled || false}
                                            placeholder={item.placeholder}
                                            parentValue={item.parent ? new URLSearchParams(item.parent(infos))?.toString() : ""}
                                            filter="contains"
                                            textField={item.apiLabel}
                                            valueField={item.apiField}
                                            onLoad={(r) => r?.elements || r}
                                            name={item.label}
                                            value={get(infos, item.name)}
                                            onSelect={(t) => changeState(item, t[item?.apiLabel] || t[item?.apiField])}
                                            onChange={(t) => !t ? changeState(item, t[item?.apiLabel] || t[item?.apiField]) : null}
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
                    <>
                        <label style={{marginRight: "2px"}}>1 - Choisir l'emprise géographique </label>
                        <ControlledPopover text="Tous les champs sont obligatoires" />
                    </>
                )}
            >
                { constructForm(childs.filter(f => f.group === 1)) }
            </Panel>
            <Panel
                header={(
                    <>
                        <label style={{marginRight: "2px"}}>2 - Saisir les informations</label>
                        <ControlledPopover text="Tous les champs sont obligatoires" />
                    </>
                )}
            >
                { constructForm(childs.filter(f => !f.group)) }
            </Panel>
        </>
    );
}
