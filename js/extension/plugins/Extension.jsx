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

import Tabou2MainPanel from '@ext/components/tabou2Panel/Tabou2MainPanel';

import tabou2 from '@ext/reducers/tabou2';

import { setUp } from '@ext/actions/tabou2';
import init from '@ext/utils/init';

import { tabouApplyFilter, tabouResetFilter } from '@ext/epics/search';
import { tabouLoadIdentifyContent, tabouSetGFIFormat, purgeTabou } from '@ext/epics/identify';
import { getTabou2Logs, updateTabou2Logs } from '@ext/epics/featureEvents';
import { setTbarPosition } from '@ext/epics/setup';

import { CONTROL_NAME } from '@ext/constants';

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
        size: 500
    };

    render() {
        return (
            <Tabou2MainPanel size={this.props.size} {...this.props} />
        );
    }
}

const Tabou2Plugin = compose(
    connect((state) => ({
        active: () => (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false,
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
    }),
    // setup and teardown due to open/close
    compose(
        connect( () => ({}), {
            setUp
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
        tabouSetGFIFormat: tabouSetGFIFormat,
        purgeTabou: purgeTabou,
        tabouResetFilter: tabouResetFilter,
        setTbarPosition: setTbarPosition,
        getTabou2Logs: getTabou2Logs,
        updateTabou2Logs: updateTabou2Logs
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
        }
    }
};
