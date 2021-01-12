import React from 'react';
import { connect } from 'react-redux';

import {
    currentActiveTabSelector,
} from '../../selectors/tabou2';

import { TABS } from '../../constants';

function toolContainer({ currentTab }) {
    return (
        <>{
            // return selected tab component
            TABS.filter(tab => tab.id && tab.id === currentTab).filter(tab => tab.component).map(tab => (
                <tab.component
                    key={'ms-tab-tabou-body-' + tab.id}
                    containerWidth={300}
                    onChange={console.log('change')}
                />
            ))
        }</>
    )
}

export default connect(
    (state) => ({
        currentTab: currentActiveTabSelector(state)
    }),
    {

    }
)(toolContainer);