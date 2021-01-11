import React from 'react';
import ContainerDimensions from 'react-container-dimensions';
import Dock from 'react-dock';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import { on, toggleControl } from "@mapstore/actions/controls";
import { Glyphicon } from 'react-bootstrap';
import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import { connect } from "react-redux";
import { closeTabou2 } from '../actions/tabou2.js';

import Tabou2MainPanel from '../components/tabou2panel/Tabou2MainPanel'

const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

const getWidth = (props, width) => {
    return props.width / width > 1 ? 1 : props.width / width
}

const CONTROL_NAME = "tabou2";

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
        width: PropTypes.number
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

        // side panel properties
        width: 330,
        dockProps: {
            dimMode: "none",
            size: 0.30,
            fluid: true,
            position: "right",
            zIndex: 1030
        },
        dockStyle: {}
    };

    renderHeader() {
        return (
            <div style={this.props.styling || { width: '100%' }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div>
                        <Button className="square-button no-events">
                            <Glyphicon glyph="comment" />
                        </Button>
                    </div>
                    <div style={{ flex: "1 1 0%", padding: 8, textAlign: "center" }}>
                        <h4><Message msgId="annotations.title" /></h4>
                    </div>
                    <div>
                        <Button className="square-button no-border" onClick={this.props.toggleControl} >
                            <Glyphicon glyph="1-close" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.props.active ? (
            <ContainerDimensions>
                { ({ width }) =>
                    <span className="ms-tabou-panel react-dock-no-resize ms-absolute-dock ms-side-panel">
                        <Dock
                            fluid
                            dockStyle={this.props.dockStyle} {...this.props.dockProps}
                            isVisible={this.props.active}
                            size={getWidth(this.props.width, width)} >
                            <div>
                                <Tabou2MainPanel {...this.props} width={this.props.width} />
                            </div>
                        </Dock>
                    </span>
                }
            </ContainerDimensions>
        ) : null;
    }
}

const conditionalToggle = on.bind(null, toggleControl(CONTROL_NAME, null), (state) =>
    !(state.controls && state.controls[CONTROL_NAME] && state.controls[CONTROL_NAME].enabled && state[CONTROL_NAME] && state[CONTROL_NAME].editing)
    , closeTabou2);

/**
 * 
 * TABOU 2 PLUGIN
 * FROM MAPSTORE2 ANNOTATION PLUGIN STRUCTURE
 * 
 */
const tabou2Selector = createSelector(
    [
        state => (state.controls && state.controls.tabou2 && state.controls[CONTROL_NAME].enabled) || (state[CONTROL_NAME] && state[CONTROL_NAME].closing) || false,
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
    reducers: {},
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
