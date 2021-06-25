import React, { useState, useEffect } from 'react';
import { keys, isEqual, isEmpty, get, find } from 'lodash';

import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { LAYER_FIELD_OPTION } from '@ext/constants';
import { createOptions, getFeaturesOptions } from '@ext/utils/identify';
import IdentifyDropDown from "./IdentifyDropDown";
import { Button, Glyphicon } from 'react-bootstrap';
import Tabou2Information from "@ext/components/common/Tabou2Information";
/**
 * Parent identify panel
 * @param {any} param
 * @returns component
 */
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

    // Event to trigger when user click on dropdown option
    const changeLayer = (option) => {
        let actualLayer = option.name;
        let actualFeatures = queryData[actualLayer]?.data?.features || [];
        let selectedFeature = actualFeatures[0];
        let configName = keys(props.layersCfg).filter(k => actualLayer === props.layersCfg[k].nom)[0];

        setConfigLayer(configName);
        setSelectedLayer(actualLayer);
        setSelectedFeatures(actualFeatures);
        setFeature(selectedFeature);
        onSelect(selectedFeature, get(selectedFeature, find(LAYER_FIELD_OPTION, ["name", configName])?.id), actualLayer);
    };

    // hooks to refresh only if query data changed
    useEffect(() => {
        if (!isEqual(queryData, response)) {
            setResponse(queryData);
            changeLayer({
                name: keys(queryData)[0]
            });
        }
    }, [queryData]);

    return (
        <>
            <IdentifyDropDown
                i18n={props.i18n}
                messages={props.messages}
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
                            i18n={props.i18n}
                            messages={props.messages}
                            disabled={false}
                            visible={response[l].data.features.length > 1 && selectedLayer === l}
                            data={getFeaturesOptions(response[l].data.features, keys(props.layersCfg).filter(k => l === props.layersCfg[k].nom)[0])}
                            defaultValue={defaultIndex}
                            textField={"label"}
                            valueField={"idx"}
                            icon="glyphicon-list"
                            onChange={(i) => {
                                let featureSelected = selectedFeatures[i.idx];
                                onSelect(featureSelected, get(featureSelected, find(LAYER_FIELD_OPTION, ["name", configLayer]).id), selectedLayer);
                            }}
                        />
                    ))
            }
            {
                !isEmpty(response) && feature && feature.properties.id_tabou ?
                    (
                        <>
                            <Tabou2IdentifyContent
                                feature={feature}
                                featureId={get(feature, find(LAYER_FIELD_OPTION, ["name", configLayer])?.id)}
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
                        <Button
                            tooltip={props.i18n(props.messages, "tabou2.identify.fromSelection")}
                            onClick={() => props.setTab("add") }
                            bsStyle="primary"
                            bsSize="lg"
                            style={{marginTop: "10%"}}>
                            <Glyphicon glyph="pencil-add"/>
                        </Button>
                    </div>
                }
                message={props.i18n(props.messages, "tabou2.identify.msgCreateEmprise")}
                title={props.i18n(props.messages, "tabou2.identify.titleCreateEmprise")}/>
        </>
    );
}
