import React, { useState, useEffect } from 'react';
import { keys, isEqual, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { Row, Grid } from 'react-bootstrap';
import { DropdownList } from 'react-widgets';

import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';
import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { getTabouIndexSelectors, getTabouResponse, currentActiveTabSelector, getTabouResponseLayers } from '@ext/selectors/tabou2';
import { setSelectorIndex } from '@ext/actions/tabou2';
import { ID_SELECTOR } from '@ext/constants';

import { createOptions } from '@ext/utils/identify';

function Tabou2IdentifyPanel({
    currentTab,
    setIndex = () => { },
    responseGFI,
    getAllIndex,
    responseLayers,
    ...props
}) {
    if (currentTab !== 'identify') return null;
    const defaultIndex = 0;

    // use state to rerender if change.
    const [gfiInfos, setGfinfos] = useState({});
    const [gfiLayers, setGfiLayers] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState('');
    const [configLayer, setConfigLayer] = useState('');

    useEffect(() => {
        if (!isEqual(gfiLayers, responseLayers)) {
            setGfiLayers(responseLayers);
            setGfinfos(responseGFI);
            setSelectedLayer(responseLayers[0]);
            setConfigLayer(keys(props.layersCfg).filter(k => responseLayers[0] === props.layersCfg[k].nom)[0]);
        }
    }, [responseLayers]);

    const changeIndex = (clicked, allIndex) => {
        allIndex[ID_SELECTOR] = clicked?.name;
        setIndex(allIndex);
        setConfigLayer(keys(props.layersCfg).filter(k => clicked?.name === props.layersCfg[k].nom)[0]);
        setSelectedLayer(clicked?.name);
    };

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
                            data={createOptions(keys(gfiInfos).map(e => gfiInfos[e]))}
                            valueField={'value'}
                            textField={'label'}
                            onChange={(i) => changeIndex(i, getAllIndex)}
                            placeholder={'Aucune données...'} />
                    </div>
                </div>
            </Row>
            <Row className="tabou-idToolbar-row text-center" style={{ display: "flex", margin: "auto", justifyContent: "center" }}>
                <Tabou2IdentifyToolbar />
            </Row>
            {
                !isEmpty(gfiInfos) ? (<Grid style={{ width: '100%' }}>
                    <Tabou2IdentifyContent response={gfiInfos[selectedLayer]} tabouLayer={configLayer} />
                </Grid>) : null
            }
        </>
    );
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state),
    getAllIndex: getTabouIndexSelectors(state),
    responseGFI: getTabouResponse(state),
    responseLayers: getTabouResponseLayers(state)
}), {
    setIndex: setSelectorIndex
})(Tabou2IdentifyPanel);
