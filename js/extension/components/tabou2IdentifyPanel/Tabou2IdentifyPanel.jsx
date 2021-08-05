import React, { useState, useEffect, useRef } from 'react';
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
    onSelect,
    ...props
}) {
    // use state to rerender if change.
    const [selectedLayer, setSelectedLayer] = useState("");
    const [configLayer, setConfigLayer] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [feature, setFeature] = useState("");
    const response = useRef({});
    const lyrsOptions = () => createOptions(keys(props.queryData).map(e => props.queryData[e]));
    let layerIdx = lyrsOptions()[props.identifyInfos?.layerIdx] ? props.identifyInfos?.layerIdx || 0 : 0;

    // Event to trigger when user click on dropdown option
    const changeLayer = (option = {}, idx = 0, title = "") => {
        let selectionVal = option;
        if (isEmpty(selectionVal)) {
            // display correct value if given index is base on query data index and not from list value order
            selectionVal = find(lyrsOptions(), {label: title || props.queryData[keys(props.queryData)[idx]].layer.title});
        }
        let actualLayer = title || selectionVal?.name;
        let actualFeatures = props.queryData[actualLayer]?.data?.features || [];
        let selectedFeature = actualFeatures[props.identifyInfos?.featureIdx || 0];
        let configName = keys(props.layersCfg).filter(k => actualLayer === props.layersCfg[k].nom)[0];
        setConfigLayer(configName);
        setSelectedLayer(actualLayer);
        setSelectedFeatures(actualFeatures);
        setFeature(selectedFeature);
        onSelect(selectedFeature, get(selectedFeature, find(LAYER_FIELD_OPTION, ["name", configName])?.id), actualLayer, selectionVal.value, props.identifyInfos?.featureIdx || 0);
    };

    // hooks to refresh only if query data changed
    useEffect(() => {
        let needUpdate = !isEqual(props.responseLyr, response.current) || layerIdx !== props.identifyInfos?.layerIdx;
        if (needUpdate) {
            changeLayer(null, layerIdx);
            response.current = props.responseLyr;
        }
    }, [props.responseLyr, props.identifyInfos?.featureIdx, props.identifyInfos?.layerIdx]);
    return (
        <>
            <IdentifyDropDown
                i18n={props.i18n}
                messages={props.messages}
                disabled={false}
                value={find(lyrsOptions(), {name: selectedLayer})}
                visible
                data={lyrsOptions()}
                valueField={'value'}
                textField={'label'}
                icon="glyphicon-1-layer"
                onChange={(i) => changeLayer(i)}
            />
            {
                isEmpty(props.queryData) ? null :
                    keys(props.queryData).map(l => (
                        <IdentifyDropDown
                            i18n={props.i18n}
                            messages={props.messages}
                            disabled={false}
                            visible={props.queryData[l].data.features.length > 1 && selectedLayer === l}
                            data={getFeaturesOptions(props.queryData[l].data.features, keys(props.layersCfg).filter(k => l === props.layersCfg[k].nom)[0])}
                            value = {getFeaturesOptions(props.queryData[l].data.features, keys(props.layersCfg).filter(k => l === props.layersCfg[k].nom)[0])[props.identifyInfos?.featureIdx || 0]}
                            textField={"label"}
                            valueField={"idx"}
                            icon="glyphicon-list"
                            onChange={(i) => {
                                let featureSelected = selectedFeatures[i.idx];
                                onSelect(featureSelected, get(featureSelected, find(LAYER_FIELD_OPTION, ["name", configLayer]).id), selectedLayer, layerIdx, i.idx);
                            }}
                        />
                    ))
            }
            {
                !isEmpty(props.queryData) && feature && feature.properties.id_tabou ?
                    (
                        <>
                            <Tabou2IdentifyContent
                                feature={feature}
                                featureId={get(feature, find(LAYER_FIELD_OPTION, ["name", configLayer])?.id)}
                                response={props.queryData[selectedLayer]}
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
