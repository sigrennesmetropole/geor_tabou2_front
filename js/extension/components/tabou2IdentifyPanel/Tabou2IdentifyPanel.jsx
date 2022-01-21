import React, { useState, useEffect } from 'react';
import { keys, isEmpty, get, find, pickBy } from 'lodash';

import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { LAYER_FIELD_OPTION } from '@js/extension/constants';
import { createOptions, getFeaturesOptions } from '@js/extension/utils/identify';
import IdentifyDropDown from "./IdentifyDropDown";
import { Glyphicon } from 'react-bootstrap';
import Tabou2Information from "@js/extension/components/common/Tabou2Information";
import ButtonRB from '@mapstore/components/misc/Button';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
const Button = tooltip(ButtonRB);


/**
 * Parent identify panel
 * @param {any} param
 * @returns component
 */
export default function Tabou2IdentifyPanel({
    onSelect,
    reqId,
    ...props
}) {
    // use state to rerender if change.
    const [selectedLayer, setSelectedLayer] = useState("");
    const [configLayer, setConfigLayer] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [feature, setFeature] = useState("");
    const [gfiId, setGfiId] = useState([]);
    const lyrsOptions = () => createOptions(keys(props.queryData).map(e => props.queryData[e]), props.pluginCfg?.layersOrder);
    let layerIdx = lyrsOptions()[props.identifyInfos?.layerIdx] ? props.identifyInfos?.layerIdx || 0 : 0;

    // Event to trigger when user click on dropdown option
    const changeLayer = (option = {}, idx = 0, title = "") => {
        let selectionVal = option;
        if (isEmpty(selectionVal)) {
            // display correct value if given index is base on query data index and not from list value order
            selectionVal = find(lyrsOptions(), {label: title || props.queryData[keys(props.queryData)[idx]]?.layer?.title});
        }
        let actualLayer = title || selectionVal?.name;
        let isSelectedLayer = actualLayer === props.identifyInfos?.tocLayer;
        let actualFeatures = get(props.clickedFeatures, actualLayer);
        actualFeatures = actualFeatures?.length ? actualFeatures : [];
        let selectedFeature = isSelectedLayer ? actualFeatures[props.identifyInfos?.featureIdx || 0] : actualFeatures[0];
        let configName = keys(props.layersCfg).filter(k => actualLayer === props.layersCfg[k].nom)[0];
        setConfigLayer(configName);
        setSelectedLayer(actualLayer);
        setSelectedFeatures(actualFeatures);
        setFeature(selectedFeature);
        onSelect(selectedFeature, get(selectedFeature, find(LAYER_FIELD_OPTION, ["name", configName])?.id), actualLayer, selectionVal?.value || 0, props.identifyInfos?.featureIdx || 0);
    };

    // hooks to refresh only if query data changed
    useEffect(() => {
        let needUpdate = gfiId !== reqId || layerIdx !== props.identifyInfos?.layerIdx || props.identifyInfos?.feature?.id !== feature?.id;
        if (needUpdate) {
            changeLayer(null, layerIdx);
            setGfiId(reqId);
        }
    }, [reqId, props.identifyInfos?.featureIdx, props.identifyInfos?.layerIdx, props.identifyInfos?.feature?.id]);
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
                isEmpty(props.featuresId) ? null :
                    keys(props.queryData).map(l => {
                        let layerFeatures = get(props.clickedFeatures, l);
                        if (isEmpty(layerFeatures)) {
                            return null;
                        }
                        const options = getFeaturesOptions(get(props.clickedFeatures, l), keys(pickBy(props.layersCfg, (a) => a.nom === l))[0]);
                        const defaultFeature = get(options, props.identifyInfos?.featureIdx || 0);
                        return (
                            <IdentifyDropDown
                                i18n={props.i18n}
                                messages={props.messages}
                                disabled={false}
                                visible={get(props.clickedFeatures, l).length > 1 && selectedLayer === l}
                                data={options}
                                value = {defaultFeature}
                                textField={"label"}
                                valueField={"idx"}
                                icon="glyphicon-list"
                                onChange={(i) => {
                                    let featureSelected = selectedFeatures[i.idx];
                                    setFeature(featureSelected);
                                    onSelect(featureSelected, get(featureSelected, find(LAYER_FIELD_OPTION, ["name", configLayer]).id), selectedLayer, layerIdx, i.idx);
                                }}
                            />
                        );
                    })
            }
            {
                !isEmpty(props.featuresId) && feature && feature.properties.id_tabou ?
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
                        { props.authentInfos.isReferent ? (
                            <Button
                                tooltip={props.i18n(props.messages, "tabou2.identify.fromSelection")}
                                onClick={() => props.setTab("add") }
                                bsStyle="primary"
                                bsSize="lg"
                                style={{marginTop: "10%"}}>
                                <Glyphicon glyph="pencil-add"/>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    tooltip={props.i18n(props.messages, "tabou2.identify.sendMail")}
                                    onClick={() => {
                                        let contact = props.pluginCfg?.help && props.pluginCfg.help?.contact;
                                        if (contact) return;
                                        let a = document.createElement('a');
                                        a.href = `mailto:${contact}`;
                                        a.click();
                                        a.remove();
                                    }}
                                    bsStyle="primary"
                                    bsSize="lg"
                                    style={{marginTop: "10%", marginBottom: "10px"}}>
                                    <Glyphicon glyph="envelope"/>
                                </Button><br></br>
                                <a
                                    title={props.i18n(props.messages, "tabou2.identify.copyMailTitle")}
                                    style={{cursor: "pointer"}}
                                    onClick={() => {
                                        let contact = props.pluginCfg?.help && props.pluginCfg.help?.contact;
                                        if (contact) {
                                            navigator.clipboard.writeText(contact);
                                        }
                                        props.displayMsg("warning", "tabou2.copy", "tabou2.copyAddress");
                                    }}>
                                    {props.i18n(props.messages, "tabou2.identify.copyMail")}
                                </a>
                            </>
                        )}
                    </div>
                }
                message={
                    <div>
                        {
                            props.i18n(props.messages, props.authentInfos.isReferent ?
                                "tabou2.identify.msgCreateEmprise" : "tabou2.identify.msgNeedCreateEmprise")
                        }
                    </div>
                }
                title={props.i18n(props.messages, "tabou2.identify.titleCreateEmprise")}/>
        </>
    );
}
