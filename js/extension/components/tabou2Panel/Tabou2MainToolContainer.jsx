import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { keys, isEmpty, get } from 'lodash';
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
    identifyLoading,
    getIdentifyInfos,
    getLayersName,
    getTiersFilter,
    getClickedFeatures,
    getVocationsActivitesInfos,
    getTypesFicheInfos
} from '../../selectors/tabou2';

import Tabou2SearchPanel from '../tabou2SearchPanel/Tabou2SearchPanel';
import Tabou2AddPanel from '../tabou2AddPanel/Tabou2AddPanel';
import Tabou2IdentifyPanel from '../tabou2IdentifyPanel/Tabou2IdentifyPanel';
import Tabou2Information from '@js/extension/components/common/Tabou2Information';
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
    printPDFInfos,
    searchIds,
    createFeature,
    changeFeature,
    setIdentifyInfos,
    displayMsg,
    displayPASAByOA,
    resetSearchFilters,
    setTiersFilter,
    updateOperation
} from "@js/extension/actions/tabou2";

function toolContainer({...props }) {
    let isTabouFeature = false;
    const searchValues = useRef({});

    const handleSelect = (feature, id, selectedLayer, layerIdx, featureIdx) => {
        let identifyInfos = {
            feature: feature,
            id: id,
            layer: keys(props.pluginCfg.layersCfg).filter(k => props.pluginCfg.layersCfg[k].nom === selectedLayer)[0] || "",
            tocLayer: selectedLayer,
            layerIdx, featureIdx
        };
        props.setIdentifyInfos(identifyInfos);
        props.setFeature(identifyInfos);
        props.setLayer(selectedLayer);
        props.updateVectorTabouStyle();
    };

    let showAddPanel = props.authentInfos.isReferent || props.authentInfos.isContrib;

    if (isEmpty(props.queryData)) isTabouFeature = false;

    const changeSearch = (vals) => {
        searchValues.current = vals;
    };

    isTabouFeature = isEmpty(props.queryData) || !props.identifyInfos.feature?.properties.id_tabou ? false : true;

    const featuresIds = Object.values(props.clickedFeatures).flat().map(i => i.id);

    return (
        <>
            {
                props.currentTab === "search" ?
                    (<Tabou2SearchPanel
                        change={changeSearch}
                        searchState={searchValues.current}
                        currentTab={props.currentTab}
                        allIndex={props.allIndex}
                        queryData={props.queryData}
                        {...props} />)
                    : null
            }
            {
                // display add panel
                props.currentTab === "add" && showAddPanel && !isTabouFeature ? (
                    <Tabou2AddPanel
                        feature={isEmpty(props.queryData) ? {} : props.identifyInfos.feature}
                        featureId={ isEmpty(props.queryData) ? null : props.identifyInfos?.id}
                        layer={isEmpty(props.queryData) ? "" : props.identifyInfos.layer}
                        queryData={props.queryData}
                        {...props} />)
                    : null
            }
            {
                props.currentTab === "add" && !showAddPanel ? (
                    <Tabou2Information
                        isVisible
                        glyph="alert"
                        message={<Message msgId="tabou2.add.addNoSecureMsg"/>}
                        title={<Message msgId="tabou2.add.addNoSecureTitle"/>}
                    />
                ) : null
            }
            {
                props.currentTab === "add" && isTabouFeature && showAddPanel && !isEmpty(props.queryData) ? (
                    <Tabou2AddPanel
                        feature={{}}
                        featureId={null}
                        layer={""}
                        {...props} />
                ) : null
            }
            {
                // Identify panel
                props.currentTab === "identify" && !isEmpty(props.queryData) && keys(props.queryData).length &&
                    (<Tabou2IdentifyPanel
                        reqId={get(props.queryData, keys(props.queryData)[0])?.reqId}
                        authent={props.authentInfos}
                        featuresId={featuresIds}
                        responseLyr={keys(props.queryData)}
                        {...props}
                        onSelect={handleSelect}/>)
            }
            {
                // Identify info message if no results or no clicked realized
                props.currentTab === "identify" && isEmpty(props.queryData) ?
                    (<Tabou2Information
                        isVisible={isEmpty(props.queryData)}
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
        queryData: getTabouResponse(state),
        clickedFeatures: getClickedFeatures(state),
        allIndex: getTabouIndexSelectors(state),
        events: getEvents(state),
        tiers: getTiers(state),
        selection: getSelection(state),
        selectionLayer: getLayer(state),
        selectedCfgLayer: getSelectedCfgLayer(state),
        tabouInfos: getFicheInfos(state),
        identifyLoading: identifyLoading(state),
        authentInfos: getAuthInfos(state),
        identifyInfos: getIdentifyInfos(state),
        getLayersName: getLayersName(state),
        tiersFilter: getTiersFilter(state),
        vocationsInfos: getVocationsActivitesInfos(state),
        typesFicheInfos: getTypesFicheInfos(state)
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
        printPDFInfos: printPDFInfos,
        searchIds: searchIds,
        createFeature: createFeature,
        changeFeature: changeFeature,
        setIdentifyInfos: setIdentifyInfos,
        displayMsg: displayMsg,
        displayPASAByOA: displayPASAByOA,
        resetSearchFilters: resetSearchFilters,
        setTiersFilter: setTiersFilter,
        updateOperation: updateOperation
    }
)(toolContainer);
