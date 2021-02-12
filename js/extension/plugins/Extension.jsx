import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { connect } from "react-redux";

import { toggleControl } from "@mapstore/actions/controls";
import { changeLayerProperties, changeLayerParams } from "@mapstore/actions/layers";
import { search } from "@mapstore/actions/queryform";

import { mapLayoutValuesSelector } from "@mapstore/selectors/maplayout";
import { syncLayers, selectLayers } from "@mapstore/selectors/layerinfo";
import { layersSelector } from '@mapstore/selectors/layers';
import { selectedLayerIdSelector } from '@mapstore/selectors/featuregrid';

import Tabou2MainPanel from '@ext/components/tabou2panel/Tabou2MainPanel';

import tabou2 from '@ext/reducers/tabou2'

import { setUp } from '@ext/actions/tabou2';

import { tabouApplyFilter, tabouResetFilter } from '@ext/epics/search';
import { tabouGetInfoOnClick, tabouLoadIdentifyContent, tabouSetGFIFormat, purgeTabou } from '@ext/epics/identify';

import { CONTROL_NAME } from '@ext/constants';

class Tabou2Panel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        filterObj: PropTypes.object,
        toggleControl: PropTypes.func,
        tabs: PropTypes.object,
        activeTab: PropTypes.string,
        size: PropTypes.number
    };

    static defaultProps = {
        id: "mapstore-tabou-panel",
        active: false,
        filterObj: {},
        toggleControl: () => { },
        activeTab: 'search',
        tabs: [],
        dockStyle: {
            right: 600
        },
        size: 500
    };

    render() {
        // TODO : user compose as cadastrapp
        //this.props.setCfg(this.props.pluginCfg);
        return (
            <Tabou2MainPanel dockStyle={this.props.dockStyle} size={this.props.size} {...this.props} />
        )
    }
}

/**
 * 
 * TABOU 2 PLUGIN
 * 
 */
const Tabou2Plugin = connect((state) => ({
    active: state => (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false,
    dockStyle: state => mapLayoutValuesSelector(state, { right: true, bottom: true, left: true }), // TODO : Fix - to changed right style of tools toolbar
    tocLayers: layersSelector(state),
    selectedLayerId: selectedLayerIdSelector(state)
}), {
    onClose: toggleControl.bind(null, CONTROL_NAME, null),
    changeLayerParams: changeLayerParams,
    changeLayerProperties: changeLayerProperties,
    onSyncLayers: syncLayers,
    onSelectLayers: selectLayers,
    onQuery: search,
    setCfg: setUp,
    getState: state => state
})(Tabou2Panel);

export default {
    name: "Tabou2",
    component: Tabou2Plugin,
    reducers: { tabou2: tabou2 },
    epics: {
        tabouApplyFilter: tabouApplyFilter,
        tabouGetInfoOnClick: tabouGetInfoOnClick,
        tabouLoadIdentifyContent: tabouLoadIdentifyContent,
        tabouSetGFIFormat: tabouSetGFIFormat,
        purgeTabou: purgeTabou,
        tabouResetFilter: tabouResetFilter
    },
    containers: {
        Toolbar: {
            name: "Tabou2",
            position: 1,
            icon: <Glyphicon glyph="th" />,
            doNotHide: true,
            alwaysVisible: true,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            priority: 1
        }
    }
}
