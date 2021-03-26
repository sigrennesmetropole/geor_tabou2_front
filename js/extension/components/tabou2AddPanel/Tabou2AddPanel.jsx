import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, FormGroup, Checkbox, FormControl, ControlLabel } from 'react-bootstrap';
import { DropdownList} from 'react-widgets';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { get, keys } from 'lodash';
import { getRequestApi } from '@ext/api/search';

export default function Tabou2AddPanel({layer, ...props}) {
    let types = [{
        value: "layerOA",
        label: "Opération"
    }, {
        value: "layerPA",
        label: "Programme"
    }];
    const [type, setType] = useState("");
    const [operation, setOperation] = useState({});
    const [nature, setNature] = useState("");
    const [emprise, setEmprise] = useState({});
    const [infos, setInfos] = useState({
        code: "",
        nom: "",
        secteur: false,
        etape: ""
    });

    useEffect(() => { // refresh component on layer change or type change
        if (type !== layer) {
            setType(layer);
        }
    }, [layer, type, nature]);

    const comboMarginTop = "10px";
    const marginTop = "15px";

    const comboOA = [{
        label: "Nature",
        api: "natures",
        apiField: "libelle",
        parent: null,
        placeholder: "Selectionner une nature",
        type: "combo"
    }, {
        label: "Emprise",
        api: "operations/emprises",
        apiField: "",
        placeholder: "Selectionner une emprise",
        parent: () => nature,
        type: "combo"
    }, {
        label: "Nom",
        apiField: "",
        name: "nom",
        placeholder: "Saisir un nom",
        parent: () => emprise,
        required: true,
        type: "text"
    }, {
        label: "Code",
        apiField: "",
        name: "code",
        placeholder: "Chosir un code",
        parent: () => emprise,
        required: true,
        type: "text"
    }, {
        label: "Etape",
        apiField: "",
        name: "etape",
        placeholder: "Chosir une étape",
        parent: () => emprise,
        required: true,
        type: "text"
    }, {
        label: "Est Secteur",
        name: "secteur",
        apiField: "",
        parent: () => emprise,
        required: true,
        type: "checkbox"
    }];

    const valid = () => {
        return false;
    };

    const changeState = (combo, value) => {
        infos[combo.name] = value;
        setInfos(infos);
    };

    const isDeactivate = (v) => {
        if (!keys(v).length || !v) {
            return true;
        }
        return false;
    };

    return (
        <Grid className={"col-xs-12"}>
            <Row>
                <Col xs={12}>
                    <FormGroup >
                        <DropdownList
                            style={{ marginTop: comboMarginTop }}
                            data = {types}
                            valueField = {"value"}
                            textField = {"label"}
                            defaultValue = {layer || "layerOA"}
                            onChange={(value) => {
                                setType(value);
                            }}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row style={{ marginTop: marginTop }} >
                <Col xs={12} >
                    {/* left combo box */}
                    <FormGroup >
                        {
                            comboOA.map(item => {
                                let el;
                                switch (item.type) {
                                case "checkbox":
                                    el = (
                                        <Checkbox
                                            style={{ marginTop: comboMarginTop }}
                                            checked={infos.secteur}
                                            disabled={item.parent ? isDeactivate(item.parent()) : false}
                                            onChange={() => changeState(item.name, "secteur")}
                                            inline
                                            id={`new-secteur-oa`}
                                            className="col-xs-3"
                                        >
                                            {item.label}
                                        </Checkbox>
                                    );
                                    break;
                                case "text":
                                    el = (
                                        <FormControl
                                            style={{ marginTop: comboMarginTop }}
                                            readOnly={item.parent ? isDeactivate(item.parent()) : false}
                                            type={item.type}
                                            required={item.required}
                                            placeholder={item?.placeholder}
                                            onChange={(t) => changeState(item, t)}
                                        />
                                    );
                                    break;
                                case "combo":
                                    el = (
                                        <Tabou2Combo
                                            style={{ marginTop: comboMarginTop }}
                                            load={() => getRequestApi(get(item, "api"), props.pluginCfg.apiCfg, {})}
                                            valueField={item.apiField}
                                            placeholder={item.placeholder}
                                            filter="contains"
                                            textField={item.apiField}
                                            onLoad={(r) => r?.elements || r}
                                            disabled={item.parent ? isDeactivate(item.parent()) : false}
                                            reloadValue={item.parent ? item.parent() : ""}
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
                        glyph: "user",
                        tooltip: "Enregistrer",
                        id: "saveNewEmprise",
                        onClick: () => valid()
                    }]}
                />
            </Row>
        </Grid >
    );
}
