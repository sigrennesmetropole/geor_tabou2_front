import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { createSelector } from 'reselect';
import { connect } from "react-redux";

import { toggleControl } from "@mapstore/actions/controls";

import Tabou2MainPanel from '../components/tabou2panel/Tabou2MainPanel';
import tabou2 from '../reducers/tabou2';
import { CONTROL_NAME } from '../constants';

const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

class Tabou2Panel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        toggleControl: PropTypes.func,
        tabs: PropTypes.object,
        activeTab: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-tabou-panel",
        active: false,
        toggleControl: () => { },
        activeTab: 'search',
        tabs: []
    };

    render() {
        return (
            <Tabou2MainPanel {...this.props} />
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
    (active) => ({
        active
    })
);

const Tabou2Plugin = compose(
    connect(
        tabou2Selector,
        {
            onClose: toggleControl.bind(null, CONTROL_NAME, null)
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
