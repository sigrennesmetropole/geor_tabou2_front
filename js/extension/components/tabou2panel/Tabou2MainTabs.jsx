import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Nav, NavItem } from 'react-bootstrap';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import { get } from "lodash";
import { setMainActiveTab } from '../../actions/tabou2';
import { currentActiveTabSelector, getAuthInfos } from '../../selectors/tabou2';
import { TABS } from '../../constants';

/**
 * Main Tabou tabs
 * @param {any} param
 * @returns component
 */
const NavItemT = tooltip(NavItem);
function SelectionTab({ currentTab, onClick, authentInfos, ...props}) {
    const isAuthorized = (t) => {
        let roles = t?.roles || [];
        roles = roles.map(r => get(authentInfos, r));
        return roles.includes(true);
    };
    const tabsAutorized = TABS.filter(tab => tab?.roles ? isAuthorized(tab) : true);
    return (
        <Nav justified
            bsStyle="tabs"
            activeKey={currentTab}
            onSelect={(selectedId) => onClick(selectedId) }>
            {
                tabsAutorized.map(tab =>
                    <NavItemT
                        key={'ms-tab-settings-' + tab.id}
                        tooltip={props.i18n(props.messages, tab.tooltip)}
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
    currentTab: currentActiveTabSelector(state),
    authentInfos: getAuthInfos(state)
}), {
    onClick: setMainActiveTab
})(SelectionTab);
