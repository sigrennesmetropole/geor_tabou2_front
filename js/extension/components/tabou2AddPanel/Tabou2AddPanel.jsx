import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, FormGroup } from 'react-bootstrap';
import { DropdownList} from 'react-widgets';
import { keys, find, pickBy } from 'lodash';
import Tabou2AddOaPaForm from '@ext/components/form/add/Tabou2AddOaPaForm';
import { ADD_OA_FORM, ADD_PA_FORM, URL_ADD } from '@ext/constants';
import { postRequestApi } from '@ext/api/search';

export default function Tabou2AddPanel({queryData, responseLayers, ...props}) {


    const [type, setType] = useState("layerOA");
    const [types, setTypes] = useState([]);

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
                    <Tabou2AddOaPaForm layer={type} childs={ADD_OA_FORM} pluginCfg={props.pluginCfg} />
                ) : (
                    <Tabou2AddOaPaForm layer={type} childs={ADD_PA_FORM} pluginCfg={props.pluginCfg} />
                )
            }

        </Grid >
    );
}
