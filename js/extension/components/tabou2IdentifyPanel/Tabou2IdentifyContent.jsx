import React, { useEffect, useState } from 'react';
import { PanelGroup, Panel, Row, Grid } from 'react-bootstrap';
import { CSS } from './tabou2Identify-css';
import Tabou2IdentAccord from '@ext/components/form/Tabou2IdentAccord';
import Tabou2DescribeAccord from '@ext/components/form/Tabou2DescribeAccord';
import Tabou2GouvernanceAccord from '@ext/components/form/Tabou2GouvernanceAccord';
import Tabou2ProgActiviteAccord from '@ext/components/form/Tabou2ProgActiviteAccord';
import Tabou2ProgHabitAccord from '@ext/components/form/Tabou2ProgHabitAccord';
import Tabou2SuiviOpAccord from '@ext/components/form/Tabou2SuiviOpAccord';
import Tabou2DdsAccord from '@ext/components/form/Tabou2DdsAccord';
import Tabou2SecProgLiesAccord from '@ext/components/form/Tabou2SecProgLiesAccord';
import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';
import { ACCORDIONS } from '@ext/constants';

export default function Tabou2IdentifyContent({
    response,
    tabouLayer,
    feature
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

    const FormFields = ({ accordion, layer }) => {
        let keyVal = `${accordion.id}-form-acc`;
        let fields;
        switch (accordion.id) {
        case 'ident':
            fields = (<Tabou2IdentAccord key={keyVal} layer={layer} />);
            break;
        case 'describe':
            fields = (<Tabou2DescribeAccord key={keyVal} layer={layer} />);
            break;
        case 'gouvernance':
            fields = (<Tabou2GouvernanceAccord key={keyVal} layer={layer} />);
            break;
        case 'suivi':
            fields = (<Tabou2SuiviOpAccord key={keyVal} layer={layer} />);
            break;
        case 'habitat':
            fields = (<Tabou2ProgHabitAccord key={keyVal} layer={layer} />);
            break;
        case 'activite':
            fields = (<Tabou2ProgActiviteAccord key={keyVal} layer={layer} />);
            break;
        case 'dds':
            fields = (<Tabou2DdsAccord key={keyVal} layer={layer} />);
            break;
        case 'secteursprog':
            fields = (<Tabou2SecProgLiesAccord key={keyVal} layer={layer}/>);
            break;
        default:
            fields = null;
            break;
        }
        return fields;
    };

    return (
        <>
            <Row className="tabou-idToolbar-row text-center" style={{ display: "flex", margin: "auto", justifyContent: "center" }}>
                <Tabou2IdentifyToolbar response={response}/>
            </Row>
            <Grid style={{ width: '100%' }}>
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

                                <FormFields accordion={item} layer={tabouLayer} />

                            </Panel>
                        </PanelGroup>
                    ))
                }
            </Grid>
        </>
    );
}
