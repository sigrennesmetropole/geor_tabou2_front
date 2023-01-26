import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { connect } from "react-redux";

import { toggleControl } from "@mapstore/actions/controls";
import { changeLayerProperties, changeLayerParams } from "@mapstore/actions/layers";
import { search } from "@mapstore/actions/queryform";
import { syncLayers, selectLayers } from "@mapstore/selectors/layerinfo";
import { layersSelector } from '@mapstore/selectors/layers';
import { selectedLayerIdSelector } from '@mapstore/selectors/featuregrid';
import {getMessageById} from "@mapstore/utils/LocaleUtils";


import { isTabou2Activate, mapLayoutValuesSelector } from "../selectors/tabou2";
import { setUp, closeTabou, updateVectorTabouStyle } from "../actions/tabou2";
import Tabou2MainPanel from "../components/tabou2Panel/Tabou2MainPanel";
import tabou2 from "../reducers/tabou2";
import init from "../utils/init";

import { onTabouMapClick, onSelectionUpdate, showTabouClickMarker } from "../epics/layer";
import { tabouApplyFilter, tabouResetFilter, tabouGetSearchIds } from "../epics/search";
import { tabouLoadIdentifyContent, printProgramme, createChangeFeature,
    displayFeatureInfos, dipslayPASAByOperation, getFicheInfoValues } from '../epics/identify';
import { getSelectionInfos, createTabouFeature, onLayerReload } from '../epics/featureEvents';
import { updateTabou2Tier, addCreateTabou2Tier, getTiersElements, associateTabou2Tier } from '../epics/tiers';
import { updateTabou2Logs, getEventsElements } from "../epics/logs";
import { listTabouDocuments, downloadTabouDocuments, deleteTabouDocuments, addNewDocument, updateDocument } from "../epics/documents";
import { showNotification } from "../epics/common";
import { onUpdateOperation, onGetInfos } from "../epics/vocations";
import { setTbarPosition, initMap, closeTabouExt } from "../epics/setup";
import "@js/extension/css/tabou.css";

import { PANEL_SIZE, CONTROL_NAME } from '../constants';

const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

class Tabou2Panel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        filterObj: PropTypes.object,
        toggleControl: PropTypes.func,
        activeTab: PropTypes.string,
        size: PropTypes.number
    };

    static defaultProps = {
        id: "mapstore-tabou-panel",
        filterObj: {},
        toggleControl: () => { },
        tabs: [],
        size: 600
    };

    render() {
        return (
            <Tabou2MainPanel size={this.props.size} {...this.props} i18n={getMessageById} />
        );
    }
}

const Tabou2Plugin = compose(
    connect((state) => ({
        active: () => (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false,
        enabled: isTabou2Activate(state),
        tocLayers: layersSelector(state),
        selectedLayerId: selectedLayerIdSelector(state),
        messages: state?.locale.messages || {},
        dockStyle: mapLayoutValuesSelector(state, { right: true, height: true}, true),
        dockWidth: PANEL_SIZE
    }), {
        onClose: toggleControl.bind(null, CONTROL_NAME, null),
        changeLayerParams: changeLayerParams,
        changeLayerProperties: changeLayerProperties,
        onSyncLayers: syncLayers,
        onSelectLayers: selectLayers,
        onQuery: search,
        updateVectorTabouStyle: updateVectorTabouStyle
    }),
    // setup and teardown due to open/close
    compose(
        connect( () => ({}), {
            setUp,
            closeTabou
        }),
        init()
    )
)(Tabou2Panel);

export default {
    name: "Tabou2",
    component: Tabou2Plugin,
    reducers: { tabou2: tabou2 },
    epics: {
        tabouApplyFilter: tabouApplyFilter,
        tabouLoadIdentifyContent: tabouLoadIdentifyContent,
        tabouResetFilter: tabouResetFilter,
        setTbarPosition: setTbarPosition,
        getSelectionInfos: getSelectionInfos,
        updateTabou2Logs: updateTabou2Logs,
        updateTabou2Tier: updateTabou2Tier,
        addCreateTabou2Tier: addCreateTabou2Tier,
        printProgramme: printProgramme,
        tabouGetSearchIds: tabouGetSearchIds,
        createChangeFeature: createChangeFeature,
        getTiersElements: getTiersElements,
        associateTabou2Tier: associateTabou2Tier,
        createTabouFeature: createTabouFeature,
        onLayerReload: onLayerReload,
        displayFeatureInfos: displayFeatureInfos,
        getEventsElements: getEventsElements,
        showNotification: showNotification,
        dipslayPASAByOperation: dipslayPASAByOperation,
        initMap: initMap,
        onTabouMapClick: onTabouMapClick,
        onSelectionUpdate: onSelectionUpdate,
        closeTabouExt: closeTabouExt,
        showTabouClickMarker: showTabouClickMarker,
        listTabouDocuments: listTabouDocuments,
        downloadTabouDocuments: downloadTabouDocuments,
        deleteTabouDocuments: deleteTabouDocuments,
        addNewDocument: addNewDocument,
        updateDocument: updateDocument,
        onUpdateOperation: onUpdateOperation,
        onGetInfos: onGetInfos,
        getFicheInfoValues: getFicheInfoValues
    },
    containers: {
        Toolbar: {
            name: "Tabou2",
            position: 1,
            icon: <Glyphicon glyph="th" />,
            doNotHide: true,
            alwaysVisible: true,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            priority: 1,
            tooltip: "tabou2.btnTooltip"
        },
        SidebarMenu: {
            name: "Tabou2",
            position: 10,
            icon: <Glyphicon glyph="th" />,
            tooltip: "extension.tooltip",
            doNotHide: true,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            priority: 1
        }
    }
};
