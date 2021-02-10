import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { PanelGroup, Panel } from 'react-bootstrap';
import { keys, isEmpty, get } from 'lodash';
import { CSS } from './tabou2Identify-css';

import Tabou2IdentContent from './Tabou2IdentContent';

import { ACCORDIONS, ACC_ATTRIBUTE_IDENT, ACC_ATTRIBUTE_DESCRIBE } from '../../constants';

import {
    currentFeatureSelector,
} from '@mapstore/selectors/mapInfo';


function Tabou2IdentifyContent({
    defaultActiveKey = [0],
    cssLoaded = false,
    response,
    loadIndex = 0,
    layer,
    ...props
}) {
    let selectedLayers = null;
    let layerName = '';
    layerName = layer || keys(response)[loadIndex];
    selectedLayers = response[layerName];

    const [status, setStatus] = useState({});
    const setPanelStatus = (panelId, val) => {
        status[panelId] = val;
        setStatus(status);
    };

    /**
     * load CSS
     */
    useEffect(() => {
        if (!cssLoaded) {
            let script = document.createElement('style');
            script.innerHTML = CSS.join("\n");
            var head = document.getElementsByTagName('head')[0];
            head.appendChild(script);
            cssLoaded = true;
        }
    }, []);

    const GetAttributesPanel = ({ index = 0, statusObj = [], item = {} }) => {
        const isOpen = defaultActiveKey.indexOf(index) > -1 ? true : false;
        setPanelStatus(index, isOpen ? 'minus' : 'plus');

        return (
            <PanelGroup
                key={'panelgp-'+index} defaultActiveKey={isOpen ? index : null} accordion>
                <Panel
                    className='idContentHeader'
                    header={(
                        <span onClick={() => setPanelStatus(index, statusObj[index] == 'plus' ? 'minus' : 'plus')}>
                            <label>
                                {item.title}
                            </label>
                        </span>
                    )}
                    eventKey={index}>
                    <Tabou2IdentContent key={'form-ident-'+index}/>
                </Panel>
            </PanelGroup>
        )
    }

    return (
        <>
            {
                isEmpty(response) ? null :
                    keys(props.layersCfg).filter(k => layerName === props.layersCfg[k].nom).map((tabouLayer, idx) => {
                        return ACCORDIONS.filter(acc => !acc.layers || acc?.layers.indexOf(tabouLayer) > -1).map((acc, idx) => (
                            <GetAttributesPanel
                                index={'attr-panel-'+idx}
                                statusObj={status}
                                item={acc}
                            />
                        ))
                    })
            }
        </>
    )
}
export default connect((state) => ({
    currentFeature: currentFeatureSelector(state)
}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2IdentifyContent);
