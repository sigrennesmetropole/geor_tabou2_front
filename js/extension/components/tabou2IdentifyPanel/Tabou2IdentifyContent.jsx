import React, { useEffect, useState } from 'react';
import { PanelGroup, Panel, Row, Grid } from 'react-bootstrap';
import { CSS } from './tabou2Identify-css';
import Tabou2IdentAccord from '@ext/components/form/identify/Tabou2IdentAccord';
import Tabou2DescribeAccord from '@ext/components/form/identify/Tabou2DescribeAccord';
import Tabou2GouvernanceAccord from '@ext/components/form/identify/Tabou2GouvernanceAccord';
import Tabou2ProgActiviteAccord from '@ext/components/form/identify/Tabou2ProgActiviteAccord';
import Tabou2ProgHabitAccord from '@ext/components/form/identify/Tabou2ProgHabitAccord';
import Tabou2SuiviOpAccord from '@ext/components/form/identify/Tabou2SuiviOpAccord';
import Tabou2DdsAccord from '@ext/components/form/identify/Tabou2DdsAccord';
import Tabou2SecProgLiesAccord from '@ext/components/form/identify/Tabou2SecProgLiesAccord';
import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';
import { ACCORDIONS } from '@ext/constants';

export default function Tabou2IdentifyContent({
    response,
    tabouLayer,
    feature,
    featureId,
    ...props
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
        console.log(featureId);
        console.log(feature);
        if (tabouLayer) {
            // get accordions according to layer
            setAccordions(ACCORDIONS.filter(acc => !acc.layers || acc?.layers.indexOf(tabouLayer) > -1));
        }
    }, [tabouLayer, featureId]);


    const FormFields = ({ accordion, layer, feature }) => {
        let fields;
        const accordProps = {
            layer: layer,
            feature: feature
        };
        switch (accordion.id) {
        case 'ident':
            fields = (<Tabou2IdentAccord {...accordProps}/>);
            break;
        case 'describe':
            fields = (<Tabou2DescribeAccord {...accordProps} />);
            break;
        case 'gouvernance':
            fields = (<Tabou2GouvernanceAccord {...accordProps} />);
            break;
        case 'suivi':
            fields = (<Tabou2SuiviOpAccord {...accordProps} />);
            break;
        case 'habitat':
            fields = (<Tabou2ProgHabitAccord {...accordProps} />);
            break;
        case 'activite':
            fields = (<Tabou2ProgActiviteAccord {...accordProps} />);
            break;
        case 'dds':
            fields = (<Tabou2DdsAccord {...accordProps} />);
            break;
        case 'secteursprog':
            fields = (<Tabou2SecProgLiesAccord {...accordProps}/>);
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
                <Tabou2IdentifyToolbar response={response} featureId={featureId} {...props} />
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

                                <FormFields accordion={item} layer={tabouLayer} featureId={featureId} />

                            </Panel>
                        </PanelGroup>
                    ))
                }
            </Grid>
        </>
    );
}
