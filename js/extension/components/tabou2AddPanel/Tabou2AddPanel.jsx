import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, FormGroup } from 'react-bootstrap';
import { DropdownList} from 'react-widgets';
import { keys, find, isEqual } from 'lodash';
import Tabou2AddOaPaForm from '@ext/components/form/add/Tabou2AddOaPaForm';
import { ADD_OA_FORM, ADD_PA_FORM, URL_ADD } from '@ext/constants';

export default function Tabou2AddPanel({queryData, ...props}) {

    const [type, setType] = useState("layerOA");

    const ddOptions = keys(props.pluginCfg.layersCfg).filter(f => f !== "layerSA").map(x => {
        let layerName = props.pluginCfg.layersCfg[x].nom;
        return {
            value: x,
            name: layerName,
            label: props.tocLayers.filter(p => p.name === layerName)[0]?.title
        };
    });

    return (
        <Grid className={"col-xs-12"}>
            <Row>
                <Col xs={12}>
                    <FormGroup >
                        <DropdownList
                            style={{ marginTop: "10px" }}
                            data = {ddOptions}
                            valueField={"value"}
                            textField = {"label"}
                            defaultValue = {"layerOA"}
                            onSelect={(value) => {
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
