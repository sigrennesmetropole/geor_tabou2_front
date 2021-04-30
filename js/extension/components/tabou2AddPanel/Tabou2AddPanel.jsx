import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, Panel } from 'react-bootstrap';
import { DropdownList} from 'react-widgets';
import { keys, isEqual } from 'lodash';
import Tabou2AddOaPaForm from '@ext/components/form/add/Tabou2AddOaPaForm';
import ControlledPopover from '@mapstore/components/widgets/widget/ControlledPopover';
import { ADD_OA_FORM, ADD_PA_FORM } from '@ext/constants';

export default function Tabou2AddPanel({feature, featureId, layer, ...props}) {
    
    const [type, setType] = useState("");
    const [selectedFeature, setSelectedFeature] = useState({});

    useEffect(() => {
        if (!isEqual(selectedFeature, feature)) {
            setSelectedFeature(feature);
        }
    }, [feature]);

    useEffect(() => {
        if (layer !== type) {
            setType(layer || "");
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
            <Panel
                header={(
                    <>
                        <label style={{marginRight: "2px"}}>1 - Commencez par choisir un type :</label>
                        <ControlledPopover text="Pour saisir un secteur, cocher la case 'secteur' d'une opération" />
                    </>
                )}
            >
                <Row>
                    <Col xs={12}>
                        <FormGroup >
                            <DropdownList
                                style={{ marginTop: "10px" }}
                                data = {ddOptions}
                                valueField={"value"}
                                textField = {"label"}
                                value = {type === "layerSA" ? "layerOA" : type}
                                placeholder= "Choisir un type opération ou programme..."
                                onSelect={(value) => {
                                    setType(value.value);
                                }}
                                onChange={(value) => setType(value.value)}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </Panel>
            {
                type === "layerPA" ? <Tabou2AddOaPaForm layer={type} feature={feature} {...props} childs={ADD_PA_FORM} pluginCfg={props.pluginCfg} /> : null
            }
            {
                type === "layerOA" ? <Tabou2AddOaPaForm layer={type} feature={feature} {...props} childs={ADD_OA_FORM} pluginCfg={props.pluginCfg} /> : null
            }
                        {
                type === "layerSA" ? <Tabou2AddOaPaForm layer={type} feature={feature} {...props} childs={ADD_OA_FORM} pluginCfg={props.pluginCfg} /> : null
            }
        </Grid >
    );
}
