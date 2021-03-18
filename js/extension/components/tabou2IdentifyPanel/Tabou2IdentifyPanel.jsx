import React, { useState, useEffect } from 'react';
import { keys, isEqual, isEmpty } from 'lodash';
import { connect } from 'react-redux';

import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { getTabouIndexSelectors, getTabouResponse, currentActiveTabSelector, getTabouResponseLayers } from '@ext/selectors/tabou2';
import { setSelectorIndex } from '@ext/actions/tabou2';
import { ID_SELECTOR } from '@ext/constants';
import { createOptions, getFeaturesOptions } from '@ext/utils/identify';
import IdentifyDropDown from "./IdentifyDropDown";

function Tabou2IdentifyPanel({
    currentTab,
    setIndex = () => { },
    responseGFI,
    getAllIndex,
    responseLayers,
    ...props
}) {
    if (currentTab !== 'identify') return null;
    const defaultIndex = 0;

    // use state to rerender if change.
    const [gfiInfos, setGfinfos] = useState({});
    const [gfiLayers, setGfiLayers] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState("");
    const [configLayer, setConfigLayer] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [feature, setFeature] = useState({});
    const [featureIdx, setFeatureIdx] = useState(0);

    useEffect(() => {
        if (!isEqual(gfiLayers, responseLayers)) {
            setGfiLayers(responseLayers);
            setGfinfos(responseGFI);
            setSelectedLayer(responseLayers.length ? responseLayers[0] : {});
            setSelectedFeatures(responseLayers.length ? responseGFI[responseLayers[0]]?.data?.features : []);
            setConfigLayer(keys(props.layersCfg).filter(k => responseLayers[0] === props.layersCfg[k].nom)[0]);
            setFeature({});
        }
    }, [responseLayers]);

    const changeIndex = (clicked, allIndex) => {
        allIndex[ID_SELECTOR] = clicked?.name;
        setIndex(allIndex);
        setConfigLayer(keys(props.layersCfg).filter(k => clicked?.name === props.layersCfg[k].nom)[0]);
        setSelectedLayer(clicked?.name);
        setSelectedFeatures(gfiInfos[clicked?.name]?.data?.features || []);
        setFeature({});
    };

    useEffect(() => {
        if (selectedFeatures[featureIdx] !== isEqual(feature)) {
            setFeature(selectedFeatures[featureIdx]);
        }
    }, [featureIdx]);

    return (
        <>
            <IdentifyDropDown
                defaultValue={defaultIndex}
                disabled={false}
                data={createOptions(keys(gfiInfos).map(e => gfiInfos[e]))}
                valueField={'value'}
                textField={'label'}
                icon="glyphicon-1-layer"
                onChange={(i) => changeIndex(i, getAllIndex)}
            />
            <IdentifyDropDown
                disabled={false}
                data={getFeaturesOptions(selectedFeatures, selectedLayer)}
                defaultValue={featureIdx}
                textField={"label"}
                valueField={"idx"}
                icon="glyphicon-list"
                onChange={(i) => {
                    setFeatureIdx(i.idx);
                }}
            />
            {
                !isEmpty(gfiInfos) ?
                    (<Tabou2IdentifyContent
                        selection={feature}
                        response={gfiInfos[selectedLayer]}
                        tabouLayer={configLayer} />)
                    : null
            }
        </>
    );
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state),
    getAllIndex: getTabouIndexSelectors(state),
    responseGFI: getTabouResponse(state),
    responseLayers: getTabouResponseLayers(state)
}), {
    setIndex: setSelectorIndex
})(Tabou2IdentifyPanel);
