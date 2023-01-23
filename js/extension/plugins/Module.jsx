import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from "react-redux";

import { toggleControl } from "@mapstore/actions/controls";
import { changeLayerProperties, changeLayerParams } from "@mapstore/actions/layers";
import { search } from "@mapstore/actions/queryform";
import { syncLayers, selectLayers } from "@mapstore/selectors/layerinfo";
import { layersSelector } from '@mapstore/selectors/layers';
import { selectedLayerIdSelector } from '@mapstore/selectors/featuregrid';


import { isTabou2Activate } from "../selectors/tabou2";
import { mapLayoutValuesSelector } from "@mapstore/selectors/maplayout";

import { setUp, closeTabou, updateVectorTabouStyle } from "../actions/tabou2";
import Tabou2MainPanel from "../components/tabou2Panel/Tabou2MainPanel";
import reducers from "../reducers/tabou2";
import init from "../utils/init";

import * as epics from '../epics/common';

import "@js/extension/css/tabou.css";

import { CONTROL_NAME } from '../constants';

const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

const Tabou2Plugin = compose(
    connect((state) => ({
        active: () => (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false,
        enabled: isTabou2Activate(state),
        tocLayers: layersSelector(state),
        selectedLayerId: selectedLayerIdSelector(state),
        messages: state?.locale.messages || {},
        dockStyle: mapLayoutValuesSelector(state, { height: true, right: true }, true),
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
)(Tabou2MainPanel);

export default {
    name: "tabou2",
    component: Tabou2Plugin,
    reducers: { tabou2: reducers },
    epics,
    containers: {
        SidebarMenu: {
            name: "tabou2",
            position: 1000,
            icon: <Glyphicon glyph="th" />,
            doNotHide: true,
            alwaysVisible: true,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            priority: 1,
            tooltip: "tabou2.btnTooltip"
        },
        Toolbar: {
            name: "tabou2",
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
