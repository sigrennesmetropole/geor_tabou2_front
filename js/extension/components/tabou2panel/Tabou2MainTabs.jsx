import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Nav, NavItem } from 'react-bootstrap';

import tooltip from '@mapstore/components/misc/enhancers/tooltip';

import { setMainActiveTab } from '../../actions/tabou2';
import { currentActiveTabSelector } from '../../selectors/tabou2';
import { TABS } from '../../constants';

const NavItemT = tooltip(NavItem);

function SelectionTab({ currentTab, onClick = () => { } }) {
    return (
        <Nav justified
            bsStyle="tabs"
            activeKey={currentTab}
            onSelect={(selectedId) => { onClick(selectedId) }}>
            {
                TABS.map(tab =>
                    <NavItemT
                        key={'ms-tab-settings-' + tab.id}
                        tooltip={tab.tooltip}
                        eventKey={tab.id}
                        onClick={() => { onClick(tab.id) }}>
                        <Glyphicon glyph={tab.glyph} />
                    </NavItemT>
                )
            }
        </Nav>
    )
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state)
}), {
    onClick: setMainActiveTab
})(SelectionTab);