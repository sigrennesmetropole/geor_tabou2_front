import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { keys, isEqual, isEmpty } from 'lodash';

import {
    currentActiveTabSelector, getTabouResponse, getTabouIndexSelectors
} from '../../selectors/tabou2';

import Tabou2SearchPanel from '../tabou2SearchPanel/Tabou2SearchPanel';
import Tabou2AddPanel from '../tabou2AddPanel/Tabou2AddPanel';
import Tabou2IdentifyPanel from '../tabou2IdentifyPanel/Tabou2IdentifyPanel';

function toolContainer({data, ...props }) {
    return (
        <>
            {
                props.currentTab === "search" ? (<Tabou2SearchPanel currentTab={props.currentTab} allIndex={props.allIndex} queryData={data} {...props} />) : null
            }
            {
                props.currentTab === "add" ? (<Tabou2AddPanel currentTab={props.currentTab} allIndex={props.allIndex} queryData={data} {...props} />) : null
            }
            {
                props.currentTab === "identify" && !isEmpty(data) && keys(data).length ? (<Tabou2IdentifyPanel queryData={data} {...props} />) : null
            }
        </>
    );
}

export default connect(
    (state) => ({
        currentTab: currentActiveTabSelector(state),
        data: getTabouResponse(state),
        allIndex: getTabouIndexSelectors(state)
    }), {}
)(toolContainer);
