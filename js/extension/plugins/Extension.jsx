import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { createSelector, createStructuredSelector } from 'reselect';
import { connect } from "react-redux";

import { toggleControl } from "@mapstore/actions/controls";

import Tabou2MainPanel from '../components/tabou2panel/Tabou2MainPanel';
import tabou2 from '../reducers/tabou2';
import { CONTROL_NAME } from '../constants';

import { mapLayoutValuesSelector } from "@mapstore/selectors/maplayout";

const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

class Tabou2Panel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        toggleControl: PropTypes.func,
        tabs: PropTypes.object,
        activeTab: PropTypes.string,
        size: PropTypes.number
    };

    static defaultProps = {
        id: "mapstore-tabou-panel",
        active: false,
        toggleControl: () => { },
        activeTab: 'search',
        tabs: [],

        dockStyle: {
            right: 600
        },
        size: 500
    };

    render() {
        return (
            <Tabou2MainPanel dockStyle={this.props.dockStyle} size={this.props.size} {...this.props} />
        )
    }
}

/**
 * 
 * TABOU 2 PLUGIN
 * FROM MAPSTORE2 ANNOTATION PLUGIN STRUCTURE
 * 
 */
const tabou2SelectorOK = createSelector(
    [
        state => (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false,
        state => mapLayoutValuesSelector(state, { right: true, bottom: true, left: true })
    ],
    (active, dockStyle) => ({
        active,
        dockStyle
    })
);

const tabou2Selector = createStructuredSelector({
    active: state => (state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false,
    dockStyle: state => mapLayoutValuesSelector(state, { right: true, bottom: true, left: true }) // TODO : Fix - to changed right style of tools toolbar
})

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
