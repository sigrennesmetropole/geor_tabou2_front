import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { PanelGroup, Panel } from 'react-bootstrap';

import { CSS } from './tabou2Identify-css';

import {
    currentFeatureSelector,
    responsesSelector
} from '@mapstore/selectors/mapInfo';

import { getTabouResponse } from '../../selectors/tabou2';

function Tabou2IdentifyContent({
    currentFeature,
    defaultActiveKey = [1],
    cssLoaded = false,
    response = [],
    gfiResponse = []
}) {
    const tabs = [1, 2, 3];
    const [status, setStatus] = useState({});
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

    const GetPanelGroup = ({ idTab = null, statusObj, features }) => {
        if (!idTab) return;
        const isOpen = defaultActiveKey.indexOf(idTab) > -1 ? true : false;
        setPanelStatus(idTab, isOpen ? 'minus' : 'plus');
        return (<PanelGroup
            key={idTab} defaultActiveKey={isOpen ? idTab : null} accordion>
            <Panel
                className='idContentHeader'
                header={(
                    <span onClick={() => setPanelStatus(idTab, statusObj[idTab] == 'plus' ? 'minus' : 'plus'), features}>
                        <label>
                            Grouppe d'attribut {idTab}
                        </label>
                    </span>
                )}
                eventKey={idTab}>
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
            </Panel>
        </PanelGroup>)
    }

    return (
        <>
            {
                tabs.map(tab => <GetPanelGroup key={'panelGroup-' + tab} statusObj={status} idTab={tab} features={currentFeature} />)
            }
        </>

    )
}
export default connect((state) => ({
    currentFeature: currentFeatureSelector(state),
    response: responsesSelector(state),
    gfiResponse: getTabouResponse(state)
}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2IdentifyContent);
