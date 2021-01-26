import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { PanelGroup, Panel } from 'react-bootstrap';
import { flatMap, isEmpty } from 'lodash';
import { CSS } from './tabou2Identify-css';

import {
    currentFeatureSelector,
    responsesSelector
} from '@mapstore/selectors/mapInfo';

import { getTabouResponse, getTabouIndexSelectors } from '../../selectors/tabou2';
import { ID_SELECTOR } from '../../constants';



function Tabou2IdentifyContent({
    defaultActiveKey = [1],
    cssLoaded = false,
    response,
    loadIndex,
    layer
}) {
    const [status, setStatus] = useState({});
    const [features, setFeatures] = useState([]);

    console.log(loadIndex);

    useEffect(() => {
        if (layer && !isEmpty(response)) {
            let dataFilter = response.filter(d => d?.layer?.name === layer);
            console.log(dataFilter);
            setFeatures(dataFilter.length ? dataFilter[0].data?.features : []);
        }
    }, [layer, response]);

    useEffect(() => {
        if (loadIndex > -1 && !isEmpty(response) && !layer) {
            console.log('FIRST LOAD');
            setFeatures(response[loadIndex].data?.features || []);
        }
    }, [loadIndex, response, layer]);

    useEffect(() => {
        if (!cssLoaded) { // load CSS
            let script = document.createElement('style');
            script.innerHTML = CSS.join("\n");
            var head = document.getElementsByTagName('head')[0];
            head.appendChild(script);
            cssLoaded = true;
        }
    }, []);


    const setPanelStatus = (panelId, val) => {
        status[panelId] = val;
        setStatus(status);
    }

    // Thematiques : general / logement / habitat / droit des sols / activité
    const GetPanel = ({ feature = {}, i = 0, statusObj = [] }) => {
        const isOpen = defaultActiveKey.indexOf(i) > -1 ? true : false;
        setPanelStatus(i, isOpen ? 'minus' : 'plus');
        if (!feature || !feature.properties) return null;
        return (
            <PanelGroup
                key={i} defaultActiveKey={isOpen ? i : null} accordion>
                <Panel
                    className='idContentHeader'
                    header={(
                        <span onClick={() => setPanelStatus(i, statusObj[i] == 'plus' ? 'minus' : 'plus')}>
                            <label>
                                Objet - {feature.id}
                            </label>
                        </span>
                    )}
                    eventKey={i}>
                    {Object.keys(feature.properties).map(props => (<span>{props}:{feature.properties[props]} <br /> </span>))}
                </Panel>
            </PanelGroup>
        )
    }
    return (

        <>
            {   // create one acordion by item
                features.map((feature, id) => <GetPanel key={'panelGroup-' + id} statusObj={status} i={id} feature={feature} />)
            }
        </>

    )
}
export default connect((state) => ({
    currentFeature: currentFeatureSelector(state)
}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2IdentifyContent);
