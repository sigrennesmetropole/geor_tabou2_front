import React, { useEffect, useState } from 'react';
import { PanelGroup, Panel } from 'react-bootstrap';
import { CSS } from './tabou2Identify-css';

import Tabou2IdentContent from '@ext/components/form/Tabou2IdentAccord';

import { ACCORDIONS } from '@ext/constants';

export default function Tabou2IdentifyContent({
    tabouLayer
}) {
    const [cssLoaded, setCss] = useState(false);
    const [accordions, setAccordions] = useState([]);
    const [openedAccordions, setOpened] = useState({});
    const toggleAccordion = (idx) => {
        openedAccordions[idx] = openedAccordions[idx] ? false : true;
        setOpened(openedAccordions);
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

    useEffect(() => {
        if (tabouLayer) {
            // get accordions according to layer
            setAccordions(ACCORDIONS.filter(acc => !acc.layers || acc?.layers.indexOf(tabouLayer) > -1));
        }
    }, [tabouLayer]);

    return (
        <>
            {
                accordions.map((item, index) => (
                    <PanelGroup
                        defaultActiveKey={openedAccordions[index] ? index.toString() : null}
                        onSelect={() => toggleAccordion(index)}
                        key={'panelgp-' + index} accordion>
                        <Panel
                            className="idContentHeader"
                            header={(
                                <span onClick={() => toggleAccordion(index)}>
                                    <label>
                                        {item.title}
                                    </label>
                                </span>
                            )}
                            eventKey={index.toString()}>
                            <Tabou2IdentContent key={'form-ident-' + index} />
                        </Panel>
                    </PanelGroup>
                ))
            }
        </>
    );
}
