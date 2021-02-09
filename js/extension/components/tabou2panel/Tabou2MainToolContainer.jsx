import React from 'react';
import { connect } from 'react-redux';

import { keys } from 'lodash';

import {
    currentActiveTabSelector, getTabouResponse, getTabouIndexSelectors
} from '../../selectors/tabou2';

import Tabou2SearchPanel from '../tabou2SearchPanel/Tabou2SearchPanel';
import Tabou2AddPanel from '../tabou2AddPanel/Tabou2AddPanel';
import Tabou2IdentifyPanel from '../tabou2IdentifyPanel/Tabou2IdentifyPanel';




function GetToolContainer({ ...props }) {
    let toolsContainerList = {
        identify: (<Tabou2IdentifyPanel key={'ms-tab-tabou-identify'} {...props} />),
        add: (<Tabou2AddPanel key={'ms-tab-tabou-add'} {...props} />),
        search: (<Tabou2SearchPanel key={'ms-tab-tabou-search'} {...props} />),
    }
    return toolsContainerList[props.currentTab];
}

function toolContainer({ currentTab, data = {}, allIndex = {}, ...props }) {
    return (
        <GetToolContainer currentTab={currentTab} data={keys(data).map(e => data[e])} {...props} />
    )
}

export default connect(
    (state) => ({
        currentTab: currentActiveTabSelector(state),
        data: getTabouResponse(state),
        allIndex: getTabouIndexSelectors(state)
    }), {}
)(toolContainer);