import React, { useState, useEffect } from 'react';
import { keys, isEqual, isEmpty, get, find } from 'lodash';
import { connect } from 'react-redux';

import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { getTabouIndexSelectors, getTabouResponse, currentActiveTabSelector, getTabouResponseLayers } from '@ext/selectors/tabou2';
import { setSelectorIndex } from '@ext/actions/tabou2';
import { ID_SELECTOR, LAYER_FIELD_OPTION } from '@ext/constants';
import { createOptions, getFeaturesOptions } from '@ext/utils/identify';
import IdentifyDropDown from "./IdentifyDropDown";

export default function Tabou2IdentifyPanel({
    queryData,
    ...props
}) {
    const defaultIndex = 0;
    // use state to rerender if change.
    const [selectedLayer, setSelectedLayer] = useState("");
    const [configLayer, setConfigLayer] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [feature, setFeature] = useState("");
    const [response, setResponse] = useState({});

    useEffect(() => {
        if (queryData !== response) {
            
            let responseLayers = keys(queryData);
            let features = queryData[responseLayers[0]]?.data?.features || [];
            setSelectedLayer(responseLayers[0]);
            setResponse(queryData);        
            setSelectedFeatures(features);
            setConfigLayer(keys(props.layersCfg).filter(k => responseLayers[0] === props.layersCfg[k].nom)[0]);
            //setFeature(get(features[0], get(LAYER_FIELD_OPTION.filter(f => f.name === responseLayers[0])[0], "id")));
            setFeature(features[0]);
        }
    }, [queryData]);

    /**
     * Event to trigger when user click on dropdown option
     * @param {Object} clicked 
     */
    const changeLayer = (clicked) => {
        props.allIndex[ID_SELECTOR] = clicked?.name;
        setConfigLayer(keys(props.layersCfg).filter(k => clicked?.name === props.layersCfg[k].nom)[0]);
        setSelectedLayer(clicked?.name);
        setSelectedFeatures(queryData[clicked?.name]?.data?.features || []);
    };

    return (
        <>
            <IdentifyDropDown
                defaultValue={defaultIndex}
                disabled={false}
                data={createOptions(keys(response).map(e => response[e]))}
                valueField={'value'}
                textField={'label'}
                visible={true}
                icon="glyphicon-1-layer"
                onChange={(i) => changeLayer(i)}
            />
            {
                isEmpty(response) ? null :
                    keys(response).map(l => (
                        <IdentifyDropDown
                            disabled={false}
                            data={getFeaturesOptions(response[l].data.features, l)}
                            defaultValue={defaultIndex}
                            textField={"label"}
                            valueField={"idx"}
                            icon="glyphicon-list"
                            visible={l === selectedLayer}
                            onChange={(i) => {
                                setFeature(selectedFeatures[i.idx]);
                            }}
                        />
                    ))
            }

            {
                !isEmpty(response) ?
                    (<Tabou2IdentifyContent
                        feature={feature}
                        featureId={get(feature, find(LAYER_FIELD_OPTION, ["name", selectedLayer]).id)}
                        response={response[selectedLayer]}
                        tabouLayer={configLayer}
                        {...props}/>)
                    : null
            }
        </>
    );
};
