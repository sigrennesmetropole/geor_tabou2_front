import React from 'react';

import PropTypes from 'prop-types';
import { toggleControl } from "@mapstore/actions/controls";


import { Glyphicon } from 'react-bootstrap';
import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import { connect } from "react-redux";

import Tabou2MainPanel from '../components/tabou2panel/Tabou2MainPanel';

import tabou2 from '../reducers/tabou2';

import { CONTROL_NAME } from '../constants';

const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

class Tabou2Panel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        toggleControl: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonStyle: PropTypes.object,
        style: PropTypes.object,
        dockProps: PropTypes.object,
        // side panel properties
        width: PropTypes.number,
        tabs: PropTypes.object,
        activeTab: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-tabou-panel",
        active: false,
        wrap: false,
        modal: true,
        wrapWithPanel: false,
        panelStyle: {
            zIndex: 100,
            overflow: "hidden",
            height: "100%"
        },
        panelClassName: "tabou-panel",
        toggleControl: () => { },
        closeGlyph: "1-close",
        activeTab: 'search',

        // side panel properties
        width: 330,
        dockProps: {
            dimMode: "none",
            size: 0.30,
            fluid: true,
            position: "right",
            zIndex: 1030
        },
        dockStyle: {},
        tabs: []
    };

    render() {
        return (
            <div>
                <Tabou2MainPanel />
            </div>
        )
    }
}

/**
 * 
 * TABOU 2 PLUGIN
 * FROM MAPSTORE2 ANNOTATION PLUGIN STRUCTURE
 * 
 */
const tabou2Selector = createSelector(
    [
        state => (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false,
    ],
    (active, dockStyle, list) => ({
        active,
        dockStyle,
        width: !isEmpty(list?.selected) ? 660 : 330
    })
);

const Tabou2Plugin = compose(
    connect(
        tabou2Selector,
        {
            toggleControl: toggleControl.bind(null, CONTROL_NAME, null)
        }
    )
)(Tabou2Panel);

export default {
    name: "Tabou2",
    component: Tabou2Plugin,
    reducers: { tabou2: tabou2 },
    epics: {},
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
