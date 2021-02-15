import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { PanelGroup, Panel } from 'react-bootstrap';
import { keys, isEmpty } from 'lodash';
import { CSS } from './tabou2Identify-css';

import Tabou2IdentContent from './Tabou2IdentContent';

import { ACCORDIONS } from '../../constants';

import {
    currentFeatureSelector
} from '@mapstore/selectors/mapInfo';


function Tabou2IdentifyContent({
    defaultActiveKey = [0],
    response,
    loadIndex = 0,
    layer,
    ...props
}) {
    let layerName = '';
    layerName = layer || keys(response)[loadIndex];

    const [status, setStatus] = useState({});
    const [cssLoaded, setCss] = useState(false);
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
            let head = document.getElementsByTagName('head')[0];
            script.innerHTML = CSS.join("\n");
            head.appendChild(script);
            setCss(true);
        }
    }, []);

    const GetAttributesPanel = ({ index = 0, statusObj = [], item = {} }) => {
        const isOpen = defaultActiveKey.indexOf(index) > -1 ? true : false;
        setPanelStatus(index, isOpen ? 'minus' : 'plus');

        return (
            <PanelGroup
                key={'panelgp-' + index} defaultActiveKey={isOpen ? index : null} accordion>
                <Panel
                    className="idContentHeader"
                    header={(
                        <span onClick={() => setPanelStatus(index, statusObj[index] === 'plus' ? 'minus' : 'plus')}>
                            <label>
                                {item.title}
                            </label>
                        </span>
                    )}
                    eventKey={index}>
                    <Tabou2IdentContent key={'form-ident-' + index}/>
                </Panel>
            </PanelGroup>
        );
    };

    return (
        <>
            {
                isEmpty(response) ? null :
                    keys(props.layersCfg).filter(k => layerName === props.layersCfg[k].nom).map((tabouLayer) => {
                        return ACCORDIONS.filter(acc => !acc.layers || acc?.layers.indexOf(tabouLayer) > -1).map((acc, n) => (
                            <GetAttributesPanel
                                index={'attr-panel-' + n}
                                statusObj={status}
                                item={acc}
                            />
                        ));
                    })
            }
        </>
    );
}
export default connect((state) => ({
    currentFeature: currentFeatureSelector(state)
}), {})(Tabou2IdentifyContent);
