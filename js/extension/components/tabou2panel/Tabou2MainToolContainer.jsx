import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { keys, isEmpty } from 'lodash';
import Message from "@mapstore/components/I18N/Message";
import {
    currentActiveTabSelector,
    getTabouResponse,
    getTabouIndexSelectors,
    getEvents,
    getTiers,
    getSelection,
    getLayer,
    getAuthInfos,
    getSelectedCfgLayer,
    getFicheInfos,
    identifyLoading
} from '@ext/selectors/tabou2';

import Tabou2SearchPanel from '../tabou2SearchPanel/Tabou2SearchPanel';
import Tabou2AddPanel from '../tabou2AddPanel/Tabou2AddPanel';
import Tabou2IdentifyPanel from '../tabou2IdentifyPanel/Tabou2IdentifyPanel';
import Tabou2Information from '@ext/components/common/Tabou2Information';
import { 
    setMainActiveTab,
    setSelectedFeature,
    setSelectedLayer,
    addFeatureEvent,
    deleteFeatureEvent,
    changeFeatureEvent,
    addFeatureTier,
    deleteFeatureTier,
    changeFeatureTier,
    associateTier,
    inactivateTier,
    applyFilterObj,
    printProgInfos,
    searchIds,
    createFeature,
    changeFeature
} from "@ext/actions/tabou2";

function toolContainer({data, ...props }) {
    const [selectionInfos, setSelection] = useState({feature: {}, id: null, layer:""});
    const isTaboufeature = useRef(false);
    const searchValues = useRef({});

    const handleSelect = (feature, id, selectedLayer) => {
        let selection = {
            feature: feature,
            id: id,
            layer: keys(props.pluginCfg.layersCfg).filter(k => props.pluginCfg.layersCfg[k].nom === selectedLayer)[0] || "",
            tocLayer: selectedLayer
        };
        setSelection(selection);
        props.setFeature(selection);
        props.setLayer(selectedLayer);        
        isTaboufeature.current = feature?.properties?.id_tabou ? true : false;
    }

    let showAddPanel = props.authentInfos.isReferent || props.authentInfos.isContrib;

    if (isEmpty(data)) isTaboufeature.current = false;

    const changeSearch = (vals) => {
        searchValues.current = vals;
    }

    return (
        <>
            {
                props.currentTab === "search" ? 
                    (<Tabou2SearchPanel 
                        change={changeSearch}
                        searchState={searchValues.current}
                        currentTab={props.currentTab}
                        allIndex={props.allIndex}
                        queryData={data}
                        {...props} />)
                    : null
            }
            {
                // display add panel
                props.currentTab === "add" && showAddPanel && !isTaboufeature.current ? (
                    <Tabou2AddPanel 
                        feature={isEmpty(data) ? {} : selectionInfos.feature}
                        featureId={ isEmpty(data) ? null : selectionInfos?.id}
                        layer={isEmpty(data) ? "": selectionInfos.layer}
                        queryData={data}
                        {...props} />) 
                : null
            }
            {
                props.currentTab === "add" && !showAddPanel ? (
                    <Tabou2Information 
                        isVisible={true} 
                        glyph="alert" 
                        message={<Message msgId="tabou2.add.addNoSecureMsg"/>}
                        title={<Message msgId="tabou2.add.addNoSecureTitle"/>}
                    />
                ) : null
            }
            {
                props.currentTab === "add" && isTaboufeature.current && showAddPanel && !isEmpty(data) ? (
                    <Tabou2AddPanel 
                        feature={{}}
                        featureId={null}
                        layer={""}
                        {...props} />
                ) : null
            }
            {
                // Identify panel
                props.currentTab === "identify" && !isEmpty(data) && keys(data).length ? 
                (<Tabou2IdentifyPanel authent={props.authentInfos} queryData={data} {...props} onSelect={handleSelect}/>) : null
            }
            {
                // Identify info message if no results or no clicked realized
                props.currentTab === "identify" && isEmpty(data) ? 
                    (<Tabou2Information 
                        isVisible={isEmpty(data)} 
                        glyph="info-sign" 
                        message={<Message msgId="tabou2.identify.selectFeatureMsg"/>}
                        title={<Message msgId="tabou2.identify.selectFeatureTitle"/>}/>
                    )
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
        tiers: getTiers(state),
        selection: getSelection(state),
        selectionLayer: getLayer(state),
        selectedCfgLayer: getSelectedCfgLayer(state),
        tabouInfos: getFicheInfos(state),
        identifyLoading: identifyLoading(state),
        authentInfos: getAuthInfos(state)
    }), {
        setTab: setMainActiveTab,
        setFeature: setSelectedFeature,
        setLayer: setSelectedLayer,
        applyFilterObj: applyFilterObj,
        addEvent: addFeatureEvent,
        deleteEvent: deleteFeatureEvent,
        changeEvent: changeFeatureEvent,
        createTier: addFeatureTier,
        dissociateTier: deleteFeatureTier,
        inactivateTier: inactivateTier,
        changeTier: changeFeatureTier,
        associateTier: associateTier,
        printProgInfos: printProgInfos,
        searchIds: searchIds,
        createFeature: createFeature,
        changeFeature: changeFeature
    }
)(toolContainer);
