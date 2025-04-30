import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, FormGroup, Checkbox, FormControl, Panel, Alert, Glyphicon } from 'react-bootstrap';
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import { get, has, isEmpty, keys, isEqual, isObject, find, omit } from 'lodash';
import { getRequestApi } from '@js/extension/api/requests';
import ControlledPopover from '@mapstore/components/widgets/widget/ControlledPopover';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { OA_SCHEMA, PA_SCHEMA, ADD_FIELDS, ADD_OA_FORM, ADD_PA_FORM } from '@js/extension/constants';
import { DropdownList} from 'react-widgets';
import Message from "@mapstore/components/I18N/Message";
import SearchCombo from '@js/extension/components/form/SearchCombo';
import "@js/extension/css/tabou.css";
export default function Tabou2AddOaPaForm({layer, feature, pluginCfg = {}, ...props}) {
    const emptyInfos = {
        code: "",
        nom: "",
        etape: "",
        idEmprise: "",
        nomEmprise: "",
        nature: "",
        secteur: false,
        parentoa: null,
        limitPa: false
    };

    const [infos, setInfos] = useState(emptyInfos);
    const [childs, setChilds] = useState([]);
    const [newFeature, setNewFeature] = useState(["layerOA", "layerSA"].includes(layer) ? OA_SCHEMA : PA_SCHEMA);
    const [invalides, setInvalides] = useState([]);
    const naturesInfos = useRef([]);
    const natureId = useRef(-1);
    const etapesInfos = useRef([]);
    const [type, setType] = useState("");

    // Return invalid or valid if some keys are empty - cant save if not valid
    const getInvalides = (obj) => {
        let keysToFilter = [];
        // only kee fields expected by API
        if ( type === "layerPA") {
            // to create PA object
            keysToFilter = keys(obj).filter(name => !["nomEmprise", "secteur", "nature", "limitPa"].includes(name));
        } else {
            // to create OA or SA object
            keysToFilter = keys(obj).filter(name => !["nomEmprise", "secteur", "limitPa", "parentoa"].includes(name));
        }
        // return empty fields
        return keysToFilter.filter(n => !get(obj, n));
    };

    // manage input modification to change added feature's state
    const changeState = (combo, selection = "") => {
        let formElement = {};
        let apiElement = {};
        let value = !selection ? selection : selection[combo?.apiLabel] || selection[combo?.apiField] || selection;
        if (combo.type === "checkbox") {
            formElement[combo.name] = !infos[combo.name];
        } else if (combo.name !== "nomEmprise") {
            formElement[combo.name] = value;
        }

        if (["etape", "nature"].includes(combo.name)) {
            apiElement[combo.name] = {
                id: selection?.id
            };
        } else if (combo.name !== "nomEmprise") {
            apiElement[combo.name] = selection?.id || selection;
        }

        let newInfos = {...infos, ...formElement};
        let newFeatureObj = {...newFeature, ...apiElement};

        if (combo.name === "nomEmprise") {
            newFeatureObj = {...newFeatureObj, nom: value, idEmprise: selection?.id, nomEmprise: value};
            newInfos = {...newInfos, nom: value, idEmprise: selection?.id, nomEmprise: value};
        }
        if (combo.name === "parentoa") {
            newFeatureObj = {...newFeatureObj, operationId: selection?.id };
            newInfos = {...newInfos, operationId: selection?.id };
        }
        if (combo.name === "nature") {
            natureId.current = selection.id;
            newInfos.natureId = selection.id;
            newFeatureObj.natureId = selection.id;
        }

        setInvalides(getInvalides(newInfos));
        setInfos(newInfos);
        setNewFeature(newFeatureObj);
    };

    // return true if parent is activ
    const getActivate = (v) => {
        return v.parent(infos) === true;
    };

    // TODO : not work
    const isInvalidStyle = (name) => {
        return invalides.includes(name) ? "red !important" : "";
    };

    // return param to complete API request according to selected parent's value
    const getParams = (combo, text) => {
        // get programme/emprises need only nature param
        let params = infos.nature && natureId.current && type ? {natureId: natureId.current, nature: infos.nature}  : {};
        if (has(combo, "autocomplete")) {
            params[combo.autocomplete] = `*${text}*`;
        }
        if (["layerOA", "layerSA"].includes(type)) {
            // need nature and secteur to request API get operation/emprises
            params =  has(infos, "secteur") && infos.nature ? {...params, estSecteur: infos.secteur} : {};
        } else if (type === "layerPA" && combo.parent) {
            params = combo.parent(infos);
        }
        return params;
    };

    // Send request to save new OA, PA, SA
    const handleSubmit = () => {
        let dataSchema = type === "layerPA" ? PA_SCHEMA : OA_SCHEMA;
        let params = {
            ...dataSchema,
            ...newFeature,
            code: infos.code
        };
        if (type === "layerPA") {
            params = {
                ...params,
                numAds: "",
                etape: isObject(newFeature.etape) ? newFeature.etape : find(etapesInfos.current, ['libelle', newFeature.etape])
            };
        } else {
            // newFeature = {...OA_SCHEMA, ...newFeature, secteur: infos.secteur};
            let natureIdValue = isObject(newFeature.nature) ? newFeature.nature : {id: find(naturesInfos.current, ['libelle', newFeature.nature])?.id};
            params = {
                ...params,
                nature: natureIdValue
            };
        }
        params = omit(params, keys(params).filter(k => !keys(dataSchema).includes(k)));
        props.createFeature(params, find(props.options, {value: type}));
    };

    // Default info from selected feature
    const setInitialInfos = (defaultData = {}) => {
        setType(layer);
        let fProp = feature?.properties;
        // var newInfos will be used to display UI
        let newInfos = {
            idEmprise: get(fProp, ADD_FIELDS.idEmprise[layer]) || infos.idEmprise,
            nomEmprise: get(fProp, ADD_FIELDS.nomEmprise[layer]) || infos.nomEmprise,
            nature: get(fProp, ADD_FIELDS.nature[layer]) || infos.nature,
            secteur: layer === "layerSA",
            nom: get(fProp, ADD_FIELDS.nom[layer]) || infos.nom,
            code: get(fProp, ADD_FIELDS.code[layer]) || infos.code,
            etape: get(fProp, ADD_FIELDS.etape[layer]) || get(fProp, "avancement") || infos.code,
            natureId: 1
        };
        // var newObject contains obj to send to API
        let newObject = {...newInfos};
        if (!isEqual(newInfos, infos)) {
            setInfos({...infos, ...newInfos, ...defaultData});
            setNewFeature({...newFeature, ...newObject, ...defaultData});
        }
    };

    // restore default form state
    const reset = () => {
        isEmpty(feature) ? setInfos(emptyInfos) : setInitialInfos({
            code: "", etape: "", nom: "", parentoa: null, limitPa: false
        });
    };

    // Refresh to change form items according to selected layer or feature
    useEffect(() => {
        if (layer !== type) {
            if (isEmpty(feature)) {
                setInitialInfos(emptyInfos);
            } else {
                setInitialInfos();
            }
            switch (layer) {
            case "layerPA":
                setChilds(ADD_PA_FORM);
                break;
            case "layerSA":
                setChilds(ADD_OA_FORM);
                break;
            case "layerOA":
                setChilds(ADD_OA_FORM);
                break;
            default :
                setChilds([]);
            }
        }
    }, [feature, layer]);

    /**
     * Construct form
     * @param {Array} items to construct form according to a limited list items
     * @returns html to render
     */
    const constructForm = (items) => {
        return (
            <Col xs={12} >
                {/* left combo box */}
                <FormGroup className="tabou-form-group">
                    {
                        items.map(item => {
                            let el;
                            if (item.name === "nomEmprise") {
                                item.type =  !isEmpty(feature) ? "text" : "combo";
                            }
                            switch (item.type) {
                            case "checkbox":
                                el = (
                                    <Checkbox
                                        checked={layer === "layerSA" ? true :  infos[item.name] || false}
                                        disabled={!isEmpty(feature)}
                                        onChange={() => changeState(item)}
                                        inline
                                        id={item.name + new Date().getTime()}>
                                        <Message msgId={ item.label }/>
                                    </Checkbox>
                                );
                                break;
                            case "alert":
                                el = !item.parent || (item.parent && item.parent(infos)) ? (
                                    <Alert variant={item.variant}>
                                        { item.icon ? (<Glyphicon glyph={item.icon} />) : null}
                                        <Message msgId={item.label}/>
                                    </Alert>
                                ) : null;
                                break;
                            case "text":
                                let isReadOnly = false;
                                let displayValue = get(infos, item.name);
                                if (item.name === "code") {
                                    isReadOnly = item.parent ? getActivate(item) : false;
                                }
                                if (item.name === "nomEmprise") {
                                    // need to be compare to fix case with null initial emprise name
                                    let initialVal = get(feature, `properties.nom`) || "";
                                    isReadOnly = !isEmpty(feature) && initialVal === infos.nomEmprise ?
                                        true : item.parent ? getActivate(item) : false;
                                    displayValue = isReadOnly ? initialVal : displayValue;
                                }
                                el = (
                                    <FormControl
                                        style={{ borderColor: isInvalidStyle(item.name) }}
                                        className="tabou-search-combo"
                                        readOnly={isReadOnly}
                                        type={item.type}
                                        value={displayValue}
                                        required={item?.required}
                                        placeholder={props.i18n(props.messages, item?.placeholder || item?.label)}
                                        onChange={(t) => changeState(item, t.target.value)}
                                    />
                                );
                                break;
                            case "combo":
                                let isSearchCombo = item?.autocomplete;
                                if (infos.limitPa && item.name === "nomEmprise") {
                                    isSearchCombo = false;
                                }
                                el = isSearchCombo ? (
                                    <SearchCombo
                                        minLength={has(item, "min") ? item.min : 3}
                                        textField={item.apiLabel}
                                        valueField={item.apiField}
                                        forceSelection
                                        value={get(infos, item.name)}
                                        disabled={item.parent ? isEmpty(item.parent(infos)) : item?.disabled || false}
                                        search={
                                            text => getRequestApi(get(item, "api"), pluginCfg.apiCfg, getParams(item, text))
                                                .then(results =>
                                                    results.elements.map(v => v)
                                                )
                                        }
                                        onSelect={t => changeState(item, t)}
                                        onChange={t => changeState(item, t)}
                                        className="tabou-search-combo"
                                        name={item.name}
                                        placeholder={props.i18n(props.messages, item?.placeholder || item?.label)}
                                    />) : (
                                    <Tabou2Combo
                                        style={{ borderColor: isInvalidStyle(item.name) }}
                                        className="tabou-search-combo"
                                        load={() => {
                                            return getRequestApi(get(item, "api"), pluginCfg.apiCfg, getParams(item));
                                        }}
                                        disabled={item.parent ? isEmpty(item.parent(infos)) : item?.disabled || false}
                                        placeholder={props.i18n(props.messages, item?.placeholder || item?.label)}
                                        parentValue={item.parent ? new URLSearchParams(item.parent(infos))?.toString() : ""}
                                        filter="contains"
                                        textField={item.apiLabel}
                                        valueField={item.apiField}
                                        distinct={has(item, "distinct") ? item.distinct : false}
                                        onLoad={(r) => {
                                            let dataItem = r?.elements || r;
                                            // used to keep info and send  nature id to the api instead of name return by layer
                                            // (need id not return by default)
                                            if (item.name === "nature" && infos.nature) {
                                                naturesInfos.current = dataItem;
                                                natureId.current = find(dataItem, ["libelle", infos.nature])?.id;
                                            }
                                            if (item.name === "etape") etapesInfos.current = dataItem;
                                            return dataItem;
                                        }}
                                        name={item.label}
                                        value={get(infos, item.name)}
                                        onSelect={(t) => changeState(item, t)}
                                        onChange={(t) => !t ? changeState(item, t) : null}
                                        messages={{
                                            emptyList: props.i18n(props.messages, "tabou2.emptyList"),
                                            emptyFilter: props.i18n(props.messages, "tabou2.nodata")
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
        );
    };

    // render component
    return (
        <span key={`${type}`} className="tabou-add-panel">
            { type ?
                (<Row className="text-center tabou-tbar-panel">
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
                            tooltip: props.i18n(props.messages, getInvalides(infos).length ? "tabou2.add.missingFields" : "tabou2.add.save"),
                            id: "saveNewEmprise",
                            disabled: getInvalides(infos).length > 0,
                            onClick: () => handleSubmit()
                        }, {
                            glyph: "remove",
                            tooltip: props.i18n(props.messages, "tabou2.add.cancelAll"),
                            id: "cancelAddForm",
                            onClick: () => reset()
                        }]}
                    />
                </Row>) : null
            }
            <Panel
                header={(
                    <>
                        <label><Message msgId="tabou2.add.addFirst"/></label>
                        <ControlledPopover text={<Message msgId="tabou2.add.needAllFields"/>} />
                    </>
                )}
                className="tabou-panel"
            >
                <Col xs={12}>
                    <FormGroup className="tabou-form-group">
                        <DropdownList
                            data = {props.options}
                            valueField={"value"}
                            disabled={!isEmpty(feature)}
                            textField = {"label"}
                            value = {type === "layerSA" ? "layerOA" : type}
                            placeholder= {props.i18n(props.messages, "tabou2.add.selectLayer")}
                            onSelect={props.select}
                            onChange={props.change}
                        />
                    </FormGroup>
                </Col>
            </Panel>
            {
                type ? (
                    <>
                        <Panel
                            header={(
                                <>
                                    <label><Message msgId="tabou2.add.addSecond"/></label>
                                    {
                                        layer !== "layerPA" ? (
                                            <ControlledPopover text={props.i18n(props.messages, "tabou2.add.checkSector")} />
                                        ) : null
                                    }

                                </>
                            )}
                            className="tabou-panel"
                        >
                            { constructForm(childs.filter(f => f.group === 1)) }
                        </Panel>
                        <Panel
                            header={(
                                <>
                                    <label><Message msgId="tabou2.add.addThird"/></label>
                                    <ControlledPopover text={props.i18n(props.messages, "tabou2.add.needAllFields")} />
                                </>
                            )}
                            className="tabou-panel"
                        >
                            { constructForm(childs.filter(f => !f.group)) }
                        </Panel>
                    </>
                ) : null
            }
        </span>
    );
}
