import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Nav, NavItem } from 'react-bootstrap';
import { currentActiveTabSelector } from '../../selectors/tabou2';

function Tabou2IdentifyPanel({ currentTab }) {
    if (currentTab != 'identify') return;
    return (
        <h5>Identify tools</h5>
    )
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state)
}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2IdentifyPanel);