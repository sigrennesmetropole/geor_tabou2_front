import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Nav, NavItem } from 'react-bootstrap';
import Message from "@mapstore/components/I18N/Message";
import tooltip from '@mapstore/components/misc/enhancers/tooltip';

import { setMainActiveTab } from '../../actions/tabou2';
import { currentActiveTabSelector } from '../../selectors/tabou2';
import { TABS } from '../../constants';

/**
 * Main Tabou tabs
 * @param {any} param
 * @returns component
 */ 
const NavItemT = tooltip(NavItem);
function SelectionTab({ currentTab, onClick = () => { } }) {
    return (
        <Nav justified
            bsStyle="tabs"
            activeKey={currentTab}
            onSelect={(selectedId) => onClick(selectedId) }>
            {
                TABS.map(tab =>
                    <NavItemT
                        key={'ms-tab-settings-' + tab.id}
                        tooltip={<Message msgId={tab.tooltip} />}
                        eventKey={tab.id}
                        onClick={() => onClick(tab.id) }>
                        <Glyphicon glyph={tab.glyph} />
                    </NavItemT>
                )
            }
        </Nav>
    );
}

// connect to store / redux
export default connect((state) => ({
    currentTab: currentActiveTabSelector(state)
}), {
    onClick: setMainActiveTab
})(SelectionTab);
