import React, { useEffect, useState, useRef } from 'react';
import { PanelGroup, Panel, Row, Grid } from 'react-bootstrap';
import { some, isEmpty, isEqual } from 'lodash';
import { CSS } from './tabou2Identify-css';
import Tabou2IdentAccord from '@ext/components/form/identify/Tabou2IdentAccord';
import Tabou2DescribeAccord from '@ext/components/form/identify/Tabou2DescribeAccord';
import Tabou2GouvernanceAccord from '@ext/components/form/identify/Tabou2GouvernanceAccord';
import Tabou2ProgActiviteAccord from '@ext/components/form/identify/Tabou2ProgActiviteAccord';
import Tabou2ProgHabitAccord from '@ext/components/form/identify/Tabou2ProgHabitAccord';
import Tabou2SuiviOpAccord from '@ext/components/form/identify/Tabou2SuiviOpAccord';
import Tabou2DdsAccord from '@ext/components/form/identify/Tabou2DdsAccord';
import Tabou2SecProgLiesAccord from '@ext/components/form/identify/Tabou2SecProgLiesAccord';
import { ACCORDIONS } from '@ext/constants';
import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';
import Loader from '@mapstore/components/misc/Loader';
import Tabou2Information from '@ext/components/common/Tabou2Information';
import Message from "@mapstore/components/I18N/Message";
/**
 * Content of identify panel component - separate to be more readable
 * @param {any} param
 * @returns component
 */
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
    const [operation, setOperation] = useState({});
    const [mapFeature, setMapFeature] = useState({});
    const [infos, setInfos] = useState({});
    const mandatory = useRef({});

    // Manage accordion state as open - close
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

    // hooks to refresh if necessary if user change selected layer or if response change
    useEffect(() => {
        setAccordions(ACCORDIONS.filter(acc => !acc.layers || acc?.layers.indexOf(tabouLayer) > -1));
        if (!isEmpty(props?.tabouInfos)) {
            let selected = props?.tabouInfos?.programme || props?.tabouInfos?.operation;
            if (!isEqual(props?.tabouInfos?.operation, operation) || !isEqual(infos, selected)) {
                setInfos(selected);
                setOperation(props?.tabouInfos?.operation);
                setMapFeature(props?.tabouInfos?.mapFeature);
            }
        }
    }, [tabouLayer, props.tabouInfos]);

    const onChange = (values, required) => {
        mandatory.current = {...mandatory.current, ...required};
        setInfos({...infos, ...values});
    };

    const save = () => {
        props.changeFeature({
            feature: infos,
            layer: props.selection.layer
        });
    };

    const restore = () => {
        setInfos(props?.tabouInfos?.programme || props?.tabouInfos?.operation);
    };
    if (props.identifyLoading) {
        let size = 100;
        return (
            <>
                <Tabou2Information
                    isVisible
                    glyph=""
                    message={<Message msgId="tabou2.identify.getInfos"/>}
                    title={<Message msgId="tabou2.load"/>}/>
                <Loader size={size} style={{ padding: size / 10, margin: "auto", display: "flex" }} />
            </>
        );
    }
    return (
        <>
            <Row className="tabou-idToolbar-row text-center" style={{ display: "flex", margin: "auto", justifyContent: "center" }}>
                <Tabou2IdentifyToolbar
                    response={response}
                    isValid={!some(mandatory.current, isEmpty)}
                    save={save}
                    restore={restore}
                    {...props}
                />
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
                                            <Message msgId={item.title}/>
                                        </label>
                                    </span>
                                )}
                                eventKey={index.toString()}>
                                {item.id === "ident" ? <Tabou2IdentAccord operation={operation} mapFeature={mapFeature} initialItem={infos} change={onChange} {...props}/> : null}
                                {item.id === "describe" ? <Tabou2DescribeAccord operation={operation} mapFeature={mapFeature} initialItem={infos} change={onChange} {...props}/> : null}
                                {item.id === "gouvernance" ? <Tabou2GouvernanceAccord operation={operation} mapFeature={mapFeature} initialItem={infos} change={onChange} {...props}/> : null}
                                {item.id === "suivi" ? <Tabou2SuiviOpAccord operation={operation} mapFeature={mapFeature} initialItem={infos} change={onChange} {...props}/> : null}
                                {item.id === "dds" ? <Tabou2DdsAccord operation={operation} mapFeature={mapFeature} initialItem={infos} change={onChange} {...props}/> : null}
                                {item.id === "habitat" ? <Tabou2ProgHabitAccord operation={operation} mapFeature={mapFeature} initialItem={infos} change={onChange} {...props}/> : null}
                                {item.id === "activite" ? <Tabou2ProgActiviteAccord operation={operation} mapFeature={mapFeature} initialItem={infos} change={onChange} {...props}/> : null}
                                {item.id === "secteursprog" ? <Tabou2SecProgLiesAccord operation={operation} mapFeature={mapFeature} initialItem={infos} change={onChange} {...props}/> : null}
                            </Panel>
                        </PanelGroup>
                    ))
                }
            </Grid>
        </>
    );
}
