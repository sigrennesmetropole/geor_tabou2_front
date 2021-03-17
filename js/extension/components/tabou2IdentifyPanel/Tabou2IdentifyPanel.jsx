import React, { useState, useEffect } from 'react';
import { keys, isEqual, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { Row } from 'react-bootstrap';
import { DropdownList } from 'react-widgets';

import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { getTabouIndexSelectors, getTabouResponse, currentActiveTabSelector, getTabouResponseLayers } from '@ext/selectors/tabou2';
import { setSelectorIndex } from '@ext/actions/tabou2';
import { ID_SELECTOR } from '@ext/constants';
import Message from "@mapstore/components/I18N/Message";
import { createOptions, getFeaturesOptions } from '@ext/utils/identify';

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
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [selectedFeaturesIdx, setSelectedFeaturesIdx] = useState(0);

    useEffect(() => {
        if (!isEqual(gfiLayers, responseLayers)) {
            setGfiLayers(responseLayers);
            setGfinfos(responseGFI);
            setSelectedLayer(responseLayers.length ? responseLayers[0] : {});
            setSelectedFeatures(responseLayers.length ? responseGFI[responseLayers[0]]?.data?.features : []);
            setConfigLayer(keys(props.layersCfg).filter(k => responseLayers[0] === props.layersCfg[k].nom)[0]);
        }
    }, [responseLayers]);

    const changeIndex = (clicked, allIndex) => {
        allIndex[ID_SELECTOR] = clicked?.name;
        setIndex(allIndex);
        setConfigLayer(keys(props.layersCfg).filter(k => clicked?.name === props.layersCfg[k].nom)[0]);
        setSelectedLayer(clicked?.name);
    };

    // TODO : set on change index for features list.

    return (
        <>
            <Row className="layer-tabouselect-row" style={{ margin: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0', zIndex: '10' }}>
                    <span className="identify-icon glyphicon glyphicon-1-layer" />
                    <div id="ddSelectorIdent" style={{ flex: "1 1 0%", padding: "0px 4px" }}>
                        <DropdownList
                            defaultValue={defaultIndex}
                            disabled={false}
                            data={createOptions(keys(gfiInfos).map(e => gfiInfos[e]))}
                            valueField={'value'}
                            textField={'label'}
                            onChange={(i) => changeIndex(i, getAllIndex)}
                            placeholder={<Message msgId="tabou2.identify.noData"/>} />
                    </div>
                </div>
            </Row>
            <Row className="layer-featureSelect-row" style={{ margin: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0', zIndex: '10' }}>
                    <span className="identify-icon glyphicon glyphicon-list" />
                    <div id="ddSelectorIdent" style={{ flex: "1 1 0%", padding: "0px 4px" }}>
                        <DropdownList
                            defaultValue={defaultIndex}
                            disabled={false}
                            data={!isEmpty(gfiInfos) ? getFeaturesOptions(selectedFeatures, selectedLayer) : []}
                            valueField={'value'}
                            textField={'label'}
                            onChange={(i) => console.log(i)}
                            placeholder={<Message msgId="tabou2.identify.noData" />} />
                    </div>
                </div>
            </Row>
            {
                !isEmpty(gfiInfos) ?
                    (<Tabou2IdentifyContent response={gfiInfos[selectedLayer]} tabouLayer={configLayer} />)
                    : null
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
