import React, { useState, useEffect } from 'react';
import { Row, Col, FormGroup, Checkbox, FormControl, Panel, Alert, Glyphicon } from 'react-bootstrap';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import { get, has, isEmpty, keys, isEqual } from 'lodash';
import { getRequestApi } from '@ext/api/search';
import ControlledPopover from '@mapstore/components/widgets/widget/ControlledPopover';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { OA_SCHEMA, PA_SCHEMA, URL_ADD, ADD_FIELDS } from '@ext/constants';
import { postRequestApi } from '@ext/api/search';

export default function Tabou2AddOaPaForm({layer, childs = [], feature, pluginCfg = {}}) {
    const [infos, setInfos] = useState({
        code: "",
        nom: "",
        etape: "",
        idEmprise: "",
        nature: "",
        secteur: false
    });

    const [newFeature, setNewFeature] = useState(["layerOA", "layerSA"].includes(layer) ? OA_SCHEMA : PA_SCHEMA);
    const [invalides, setInvalides] = useState([]);

    const comboMarginTop = "10px";
    const marginTop = "15px";

    const changeState = (combo, selection) => {
        let formElement = {};
        let apiElement = {};
        let value;
        if (combo.type === "checkbox") {
            formElement[combo.name] = !infos[combo.name];
        } else {
            // temporary fix for https://github.com/sigrennesmetropole/geor_tabou2_front/issues/82
            
            value = !selection ? selection : selection[combo?.apiLabel] || selection[combo?.apiField] || selection;
            formElement[combo.name] = value === "En diffus" ? "EN_DIFFUS" : value;
            apiElement[combo.name] = ["etape", "nature"].includes(combo.name) ? {
                id: selection?.id
            } : selection?.id || selection;            
        }
        let newInfos = {...infos, ...formElement};
        let newFeatureObj = {...newFeature, ...apiElement};
        if(combo.name === "idEmprise") {
            newFeatureObj = {...newFeatureObj, nom: value};
            newInfos = {...newInfos, nom: value}
        }
        setInfos(newInfos);
        setInvalides(keys(infos).filter(name => name !== "secteur").filter(name => !infos[name]));
        setNewFeature(newFeatureObj);
    };

    const getActivate = (v) => {
        return v.parent(infos) === true;
    };

    const isInvalidStyle = (name) => {
        return invalides.includes(name) ? "red !important" : "";
    };

    const getParams = () => {
        // get programme/emprises need only nature param
        let params = infos.nature && layer ? {nature: encodeURI(infos.nature)} : {};
        if (["layerOA", "layerSA"].includes(layer)) {
            // need nature and secteur to request API get operation/emprises
            params =  has(infos, "secteur") && infos.nature ? {...params, estSecteur: infos.secteur} : {};
        }
        return params;
    };
    
    const isInvalid = () => {
        return keys(infos).filter(name => name !== "secteur").filter(name => !infos[name]).length > 0;
    };

    const handleSubmit = () => {
        let params = {};
        if (layer === "layerPA") {
            params = {...PA_SCHEMA, ...newFeature, code: infos.code};
        } else {
            //newFeature = {...OA_SCHEMA, ...newFeature, secteur: infos.secteur};
            params = {...OA_SCHEMA, ...newFeature, code: infos.code}
        }
        postRequestApi(`${get(URL_ADD, layer)}`, pluginCfg.apiCfg, params);
    };

    useEffect(() => {
        let fProp = feature?.properties;
        let newInfos = {
            etape : get(fProp, ADD_FIELDS.etape[layer]) || infos.etape,
            idEmprise : get(fProp, ADD_FIELDS.nom[layer]) || infos.idEmprise,
            nature : get(fProp, ADD_FIELDS.nature[layer]) || infos.nature,
            secteur : get(fProp, ADD_FIELDS.secteur[layer]) || infos.secteur,
            nom : get(fProp, ADD_FIELDS.nom[layer]) || infos.nom
        };
        let newObject = {...newInfos, idEmprise : get(fProp, ADD_FIELDS.idEmprise[layer])}
        if (!isEqual(newInfos,infos)) {
            setInfos({...infos, ...newInfos});
            setNewFeature({...newFeature, ...newObject});
        }

    }, [feature])

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
                                            checked={layer === "layerSA" ? true :  infos[item.name] || false}
                                            disabled={feature && ["layerOA", "layerSA"].includes(layer) ? true : item.parent ? item.parent(infos) : false}
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
                                            style={{ marginTop: comboMarginTop, borderColor: isInvalidStyle(item.name) }}
                                            readOnly={item.parent ? getActivate(item) : false}
                                            type={item.type}
                                            value={get(infos, item.name)}
                                            required={item?.required}
                                            placeholder={item?.placeholder}
                                            onChange={(t) => changeState(item, t.target.value.toLowerCase())}
                                        />
                                    );
                                    break;
                                case "combo":
                                    el = (
                                        <Tabou2Combo
                                            style={{ marginTop: comboMarginTop, borderColor: isInvalidStyle(item.name) }}
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
                                            onSelect={(t) => changeState(item, t)}
                                            onChange={(t) => !t ? changeState(item, t) : null}
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
            <Row className="tabou-idToolbar-row text-center" style={{ display: "flex", margin: "auto", justifyContent: "center" }}>
                <Toolbar
                    btnDefaultProps={{
                        className: "square-button-md",
                        bsStyle: "primary"
                    }}
                    btnGroupProps={{
                        style: {
                            margin: 10
                        }
                    }}
                    buttons={[{
                        glyph: "ok",
                        tooltip: isInvalid() ? "Veuillez compléter tous les champs !" :  "Sauvegarder",
                        id: "saveNewEmprise",
                        disabled: isInvalid() > 0,
                        onClick: () => handleSubmit()
                    }]}
                />
            </Row>
        </>
    );
}
