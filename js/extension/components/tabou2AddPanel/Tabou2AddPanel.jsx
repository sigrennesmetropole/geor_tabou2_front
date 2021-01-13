import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Nav, NavItem } from 'react-bootstrap';
import { currentActiveTabSelector } from '../../selectors/tabou2';

function Tabou2AddPanel({ currentTab }) {
    if (currentTab != 'add') return;
    return (
        <h5>Add tools</h5>
    )
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state)
}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2AddPanel);