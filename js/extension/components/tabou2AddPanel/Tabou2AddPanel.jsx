import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, FormGroup } from 'react-bootstrap';
import { DropdownList} from 'react-widgets';
import { keys, find, isEqual } from 'lodash';
import Tabou2AddOaPaForm from '@ext/components/form/add/Tabou2AddOaPaForm';
import { ADD_OA_FORM, ADD_PA_FORM } from '@ext/constants';

export default function Tabou2AddPanel({feature, featureId, layer, ...props}) {
    
    const [type, setType] = useState("layerOA");
    const [selectedFeature, setSelectedFeature] = useState({});

    useEffect(() => {
        if (!isEqual(selectedFeature, feature)) {
            setSelectedFeature(feature);
        }
    }, [feature]);

    useEffect(() => {
        if (layer !== type) {
            setType(layer || "layerOA");
        }
    }, [layer]);

    const ddOptions = keys(props.pluginCfg.layersCfg).filter(n => n !== "layerSA").map(x => {
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
                            value = {type === "layerSA" ? "layerOA" : type}
                            onSelect={(value) => {
                                setType(value.value);
                            }}
                            onChange={(value) => setType(value.value)}
                        />
                    </FormGroup>
                </Col>
            </Row>

            {
                ["layerOA", "layerSA"].includes(type) || !type ? (
                    <Tabou2AddOaPaForm layer={type} feature={feature} {...props} childs={ADD_OA_FORM} pluginCfg={props.pluginCfg} />
                ) : (
                    <Tabou2AddOaPaForm layer={type} feature={feature} {...props} childs={ADD_PA_FORM} pluginCfg={props.pluginCfg} />
                )
            }

        </Grid >
    );
}
