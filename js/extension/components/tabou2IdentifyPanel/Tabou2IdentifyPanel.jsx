import React, { useState, useEffect } from 'react';
import { keys, isEqual, isEmpty, get, find } from 'lodash';

import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { LAYER_FIELD_OPTION } from '@ext/constants';
import { createOptions, getFeaturesOptions } from '@ext/utils/identify';
import IdentifyDropDown from "./IdentifyDropDown";
import { Button, Glyphicon, Row, Alert } from 'react-bootstrap';
import Tabou2Information from "@ext/components/common/Tabou2Information";
import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';

export default function Tabou2IdentifyPanel({
    queryData,
    onSelect,
    ...props
}) {
    const defaultIndex = 0;
    // use state to rerender if change.
    const [selectedLayer, setSelectedLayer] = useState("");
    const [configLayer, setConfigLayer] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [feature, setFeature] = useState("");
    const [response, setResponse] = useState({});

    /**
     * Event to trigger when user click on dropdown option
     * @param {Object} clicked 
     */
     const changeLayer = (option) => {
        let selectedLayer = option.name;
        let selectedFeatures = queryData[selectedLayer]?.data?.features || [];
        let selectedFeature = selectedFeatures[0];
        let configName = keys(props.layersCfg).filter(k => selectedLayer === props.layersCfg[k].nom)[0];
        
        setConfigLayer(configName);
        setSelectedLayer(selectedLayer);
        setSelectedFeatures(selectedFeatures);
        setFeature(selectedFeature);
        onSelect(selectedFeature, get(selectedFeature, find(LAYER_FIELD_OPTION, ["name", configName]).id), selectedLayer);

    };

    useEffect(() => {
        if (!isEqual(queryData, response)) {
            setResponse(queryData);
            changeLayer({
                name: keys(queryData)[0],
            })
        }
    }, [queryData]);

    return (
        <>
            <IdentifyDropDown
                defaultValue={defaultIndex}
                disabled={false}
                visible
                data={createOptions(keys(response).map(e => response[e]))}
                valueField={'value'}
                textField={'label'}
                icon="glyphicon-1-layer"
                onChange={(i) => changeLayer(i)}
            />
            {
                isEmpty(response) ? null :
                    keys(response).map(l => (
                        <IdentifyDropDown
                            disabled={false}
                            visible={response[l].data.features.length > 1 && selectedLayer === l}
                            data={getFeaturesOptions(response[l].data.features, keys(props.layersCfg).filter(k => l === props.layersCfg[k].nom)[0])}
                            defaultValue={defaultIndex}
                            textField={"label"}
                            valueField={"idx"}
                            icon="glyphicon-list"
                            onChange={(i) => {
                                let featureSelected = selectedFeatures[i.idx];
                                setFeature(featureSelected);
                                onSelect(featureSelected, get(featureSelected, find(LAYER_FIELD_OPTION, ["name", configLayer]).id), selectedLayer);
                            }}
                        />
                    ))
            }
            { 
                !isEmpty(response) && feature ? 
                    (<Row className="tabou-idToolbar-row text-center" style={{ display: "flex", margin: "auto", justifyContent: "center" }}>
                        <Tabou2IdentifyToolbar 
                            response={response[selectedLayer]}
                            {...props}
                        />
                    </Row>)
                    : null
            }
            {
                !isEmpty(response) && feature && feature.properties.id_tabou ?
                    (
                        <>
                            <Tabou2IdentifyContent
                                feature={feature}
                                featureId={get(feature, find(LAYER_FIELD_OPTION, ["name", configLayer]).id)}
                                response={response[selectedLayer]}
                                tabouLayer={configLayer}
                                {...props}
                            />
                        </>
                    )
                    : null
            }
            <Tabou2Information 
                isVisible={feature && !feature.properties.id_tabou} 
                glyph="eye-close" 
                content={
                    <div>
                        <Button onClick={() => props.setTab("add") } bsStyle="primary" bsSize="lg" style={{marginTop:"10%"}}>
                            <Glyphicon glyph="pencil-add"/>
                        </Button>
                    </div>
                }
                message="Pour saisir les informations de cette emprise, cliquez sur l'onglet Ajouter ou cliquez directement sur ce bouton"
                title="Emprise non saisie"/>
        </>
    );
};
