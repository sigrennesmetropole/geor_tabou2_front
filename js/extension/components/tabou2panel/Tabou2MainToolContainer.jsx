import React, { useState } from 'react';
import { connect } from 'react-redux';

import { keys, isEmpty } from 'lodash';

import {
    currentActiveTabSelector,
    getTabouResponse,
    getTabouIndexSelectors,
    getEvents,
    getSelection,
    getLayer
} from '@ext/selectors/tabou2';

import Tabou2SearchPanel from '../tabou2SearchPanel/Tabou2SearchPanel';
import Tabou2AddPanel from '../tabou2AddPanel/Tabou2AddPanel';
import Tabou2IdentifyPanel from '../tabou2IdentifyPanel/Tabou2IdentifyPanel';
import Tabou2Information from '@ext/components/common/Tabou2Information';
import { setMainActiveTab, setSelectedFeature, setSelectedLayer, addFeatureEvent, deleteFeatureEvent, changeFeatureEvent, applyFilterObj } from "@ext/actions/tabou2";

function toolContainer({data, ...props }) {
    const [selection, setSelection] = useState({feature: {}, id: null, layer:""});

    const handleSelect = (feature, id, selectedLayer) => {
        props.setFeature(feature);
        props.setLayer(selectedLayer);

        setSelection({
            feature: feature,
            id: id,
            layer: keys(props.pluginCfg.layersCfg).filter(k => props.pluginCfg.layersCfg[k].nom === selectedLayer)[0] || ""
        });
    }

    return (
        <>
            {
                props.currentTab === "search" ? (<Tabou2SearchPanel currentTab={props.currentTab} allIndex={props.allIndex} queryData={data} {...props} />) : null
            }
            {
                // display add panel
                props.currentTab === "add" ? (
                    <Tabou2AddPanel 
                        feature={selection.feature}
                        featureId={selection.featureId}
                        layer={selection.layer}
                        queryData={data}
                        {...props} />) 
                : null
            }
            {
                // Identify panel
                props.currentTab === "identify" && !isEmpty(data) && keys(data).length ? 
                (<Tabou2IdentifyPanel queryData={data} {...props} onSelect={handleSelect}/>) : null
            }
            {
                // Identify info message if no results or no clicked realized
                props.currentTab === "identify" && isEmpty(data) ? 
                    (<Tabou2Information 
                        isVisible={isEmpty(data)} 
                        glyph="info-sign" 
                        message="Cliquer sur une emprise, programme, opération ou secteur visible sur la carte pour commencer" 
                        title="Identifier"/>)
                : null
            }
        </>
    );
}

export default connect(
    (state) => ({
        currentTab: currentActiveTabSelector(state),
        data: getTabouResponse(state),
        allIndex: getTabouIndexSelectors(state),
        events: getEvents(state),
        selection: getSelection(state),
        selectionLayer: getLayer(state)
    }), {
        setTab: setMainActiveTab,
        setFeature: setSelectedFeature,
        setLayer: setSelectedLayer,
        applyFilterObj: applyFilterObj,
        addEvent: addFeatureEvent,
        deleteEvent: deleteFeatureEvent,
        changeEvent: changeFeatureEvent 
    }
)(toolContainer);
