import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, FormGroup, Button } from 'react-bootstrap';
import { DropdownList} from 'react-widgets';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { keys, find, pickBy } from 'lodash';
import Tabou2AddOaPaForm from '@ext/components/form/add/Tabou2AddOaPaForm';
import { ADD_OA_FORM, ADD_PA_FORM, URL_ADD } from '@ext/constants';
import { postRequestApi } from '@ext/api/search';

export default function Tabou2AddPanel({queryData, responseLayers, ...props}) {


    const [type, setType] = useState("layerOA");
    const [types, setTypes] = useState([]);
    const [infos, setInfos] = useState({
        code: "",
        nom: "",
        etape: "",
        emprise: "",
        nature: "",
        secteur: false
    });

    /**
     * TODO : event on combobox layerOA / layerPA change to display correct form panel
     */
    useEffect(() => {
        return;
    }, [type]);

    useEffect(() => {
        let ddOptions = keys(props.pluginCfg.layersCfg).filter(f => f !== "layerSA").map(x => {
            let layerName = props.pluginCfg.layersCfg[x].nom;
            return {
                value: x,
                name: layerName,
                label: props.tocLayers.filter(p => p.name === layerName)[0]?.title
            };
        });
        setTypes(ddOptions);
        setType(find(ddOptions, ["name", responseLayers[0]])?.value || "");
    }, [responseLayers]);

    const comboMarginTop = "10px";

    const handleSubmit = () => {
        let attributes = type === "layerOA" ? ADD_OA_FORM.map(n => n.name) : ADD_PA_FORM.map(n => n.name);
        /* postRequestApi(`${get(URL_ADD, type)}`, props.apiCfg, pickBy(infos, (value, key) => attributes.includes(key)));*/
    };

    const updateInfos = (i) => {
        // get empty infos

        // save infos to send when button will be clickable
        setInfos(i);
    };

    const isInvalid = () => {
        return keys(infos).filter(name => name !== "secteur").filter(name => !infos[name]).length > 0;
    };

    return (
        <Grid className={"col-xs-12"}>
            <Row>
                <Col xs={12}>
                    <FormGroup >
                        <DropdownList
                            style={{ marginTop: comboMarginTop }}
                            data = {types}
                            valueField={"value"}
                            textField = {"label"}
                            defaultValue = {type}
                            onChange={(value) => {
                                setType(value.value);
                            }}
                        />
                    </FormGroup>
                </Col>
            </Row>

            {
                type === "layerOA" || !type ? (
                    <Tabou2AddOaPaForm layer={type} onChange={(i) => updateInfos(i)} childs={ADD_OA_FORM} pluginCfg={props.pluginCfg} />
                ) : (
                    <Tabou2AddOaPaForm layer={type} onChange={(i) => updateInfos(i)} childs={ADD_PA_FORM} pluginCfg={props.pluginCfg} />
                )
            }
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
                        disabled: isInvalid(),
                        onClick: () => handleSubmit()
                    }]}
                />
            </Row>
        </Grid >
    );
}
