import React from 'react';
import { connect } from 'react-redux';

import {
    currentActiveTabSelector,
} from '../../selectors/tabou2';

import Tabou2SearchPanel from '../tabou2SearchPanel/Tabou2SearchPanel';
import Tabou2AddPanel from '../tabou2AddPanel/Tabou2AddPanel';
import Tabou2IdentifyPanel from '../tabou2IdentifyPanel/Tabou2IdentifyPanel';



function toolContainer({ currentTab }) {
    let toolsContainerList = {
        identify: (<Tabou2IdentifyPanel key={'ms-tab-tabou-identify'} />),
        add: (<Tabou2AddPanel key={'ms-tab-tabou-add'} />),
        search: (<Tabou2SearchPanel key={'ms-tab-tabou-search'} />),
    }
    return toolsContainerList[currentTab];
}

export default connect(
    (state) => ({
        currentTab: currentActiveTabSelector(state)
    }),
    {

    }
)(toolContainer);