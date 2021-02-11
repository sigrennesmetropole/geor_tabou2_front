import React from 'react';
import { keys } from 'lodash';
import { connect } from 'react-redux';
import { Row, Grid } from 'react-bootstrap';
import { DropdownList } from 'react-widgets';

import { currentActiveTabSelector } from '../../selectors/tabou2';
import { getValidator } from '@mapstore/utils/MapInfoUtils';
import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';
import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { getTabouIndexSelectors, getTabouResponse, getPluginCfg } from '../../selectors/tabou2';
import { setSelectorIndex } from '../../actions/tabou2';
import { ID_SELECTOR } from '../../constants';

import { createOptions } from '../../utils/identify';

function Tabou2IdentifyPanel({
    currentTab,
    validator = getValidator,
    format,
    setIndex = () => { },
    getAllIndex,
    selectedLayer,
    ...props
}) {
    if (currentTab != 'identify') return;
    const defaultIndex = 0;

    const changeIndex = (clicked, allIndex) => {
        allIndex[ID_SELECTOR] = clicked?.name;
        setIndex(allIndex);
    }

    return (
        <>
            <Row className="layer-tabouselect-row" style={{ margin: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0', zIndex: '10' }}>
                    <span className="identify-icon glyphicon glyphicon-1-layer" />
                    <div id="ddSelectorIdent" style={{ flex: "1 1 0%", padding: "0px 4px" }}>
                        <DropdownList
                            defaultValue={defaultIndex}
                            disabled={false}
                            key={'ddown-layer-selector'}
                            data={createOptions(keys(props.response).map(e => props.response[e]))}
                            valueField={'value'}
                            textField={'label'}
                            onChange={(i) => changeIndex(i, getAllIndex)}
                            placeholder={'Aucune données...'} />
                    </div>
                </div>
            </Row>
            <Row className="tabou-idToolbar-row" style={{ display: "flex", margin: "auto", justifyContent: "center" }} className="text-center">
                <Tabou2IdentifyToolbar />
            </Row>
            <Grid style={{ width: '100%' }}>
                <Tabou2IdentifyContent response={keys(props.response).map(e => props.response[e])} layer={getAllIndex[ID_SELECTOR] || selectedLayer} loadIndex={defaultIndex} {...props} />
            </Grid>
        </>
    )
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state),
    getAllIndex: getTabouIndexSelectors(state),
    response: getTabouResponse(state)
}), {
    setIndex: setSelectorIndex
})(Tabou2IdentifyPanel);