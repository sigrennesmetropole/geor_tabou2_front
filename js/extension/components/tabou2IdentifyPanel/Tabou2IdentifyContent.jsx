import React, { useEffect, useState, useRef, memo } from 'react';
import { PanelGroup, Panel, Row, Grid } from 'react-bootstrap';
import { some, isEmpty, isEqual } from 'lodash';
import Tabou2IdentAccord from '@js/extension/components/form/identify/Tabou2IdentAccord';
import Tabou2DescribeAccord from '@js/extension/components/form/identify/Tabou2DescribeAccord';
import Tabou2GouvernanceAccord from '@js/extension/components/form/identify/Tabou2GouvernanceAccord';
import Tabou2DdsAccord from '@js/extension/components/form/identify/Tabou2DdsAccord';
import Tabou2SecProgLiesAccord from '@js/extension/components/form/identify/Tabou2SecProgLiesAccord';
import Tabou2SuiviOpAccord from '@js/extension/components/form/identify/Tabou2SuiviOpAccord';
import Tabou2CadreAccord from '../form/identify/Tabou2CadreAccord';
import Tabou2ProgHabitAccord from '@js/extension/components/form/identify/Tabou2ProgHabitAccord';
import { ACCORDIONS } from '@js/extension/constants';
import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';
import Loader from '@mapstore/components/misc/Loader';
import Tabou2Information from '@js/extension/components/common/Tabou2Information';
import Message from "@mapstore/components/I18N/Message";
import "@js/extension/css/tabou.css";
import Tabou2ProjetUrbainAccord from "@js/extension/components/form/identify/Tabou2ProjetUrbainAccord";

/**
 * Content of identify panel component - separate to be more readable
 * @param {any} param
 * @returns component
 */
const Tabou2IdentifyContent = ({
    response,
    tabouLayer,
    feature,
    featureId,
    typesFicheInfos,
    ...props
}) => {
    const [accordions, setAccordions] = useState([]);
    // first accordions will be open
    const [openedAccordions, setOpened] = useState({ 0: true });
    const [operation, setOperation] = useState({});
    const [operationParent, setOperationParent] = useState({});
    const [mapFeature, setMapFeature] = useState({});
    const [infos, setInfos] = useState({});
    const mandatory = useRef({});

    // Manage accordion state as open - close
    const toggleAccordion = (idx) => {
        openedAccordions[idx] = openedAccordions[idx] ? false : true;
        setOpened(openedAccordions);
    };
    // hooks to refresh if necessary if user change selected layer or if response change
    useEffect(() => {
        setAccordions(ACCORDIONS.filter(acc => !acc.layers || acc?.layers.indexOf(tabouLayer) > -1));
        if (!isEmpty(props?.tabouInfos)) {
            let selected = props?.tabouInfos?.programme || props?.tabouInfos?.operation;
            if (!isEqual(props?.tabouInfos?.operation, operation) || !isEqual(infos, selected)) {
                setInfos(selected);
                setOperation(props?.tabouInfos?.operation);
                setOperationParent(props?.tabouInfos?.operationParent);
                setMapFeature(props?.tabouInfos?.mapFeature);
            }
        }
    }, [tabouLayer, props.tabouInfos.uuid, JSON.stringify(typesFicheInfos)]);

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
                    message={<Message msgId="tabou2.identify.getInfos" />}
                    title={<Message msgId="tabou2.load" />} />
                <Loader size={size} style={{ padding: size / 10, margin: "auto", display: "flex" }} />
            </>
        );
    }
    const tabsProps = {
        programme: props.tabouInfos?.programme,
        operation: operation,
        operationParent: operationParent,
        mapFeature: mapFeature,
        initialItem: infos,
        change: (values, required) => {
            mandatory.current = { ...mandatory.current, ...required };
            let oldInfos = { ...infos };
            setInfos({ ...oldInfos, ...values });
        },
        changeProp: (newOA) => {
            let oldInfos = { ...infos };
            setInfos({ ...oldInfos, ...newOA });
        },
        tiers: props.tiers,
        types: typesFicheInfos,
        authent: props.authent,
        apiCfg: props.pluginCfg,
        layer: props.selection?.layer,
        setTiersFilter: props.setTiersFilter,
        permisElement: props.tabouInfos?.permis?.elements,
        programmesElement: props.tabouInfos?.programmes?.elements,
        help: props.help,
        agapeo: props.tabouInfos?.agapeo,
        vocationsInfos: props.vocationsInfos,
        messages: props.messages,
        i18n: props.i18n
    };

    return (
        <div className="tabou-identify-panel">
            <Row className="text-center tabou-tbar-panel">
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
                                className="tabou-accordeon tabou-panel"
                                header={(
                                    <span onClick={() => toggleAccordion(index)}>
                                        <label>
                                            <Message msgId={item.title} />
                                        </label>
                                    </span>
                                )}
                                eventKey={index.toString()}>
                                {item.id === "ident" ? <Tabou2IdentAccord {...tabsProps} /> : null}
                                {item.id === "describe" ? <Tabou2DescribeAccord {...tabsProps} /> : null}
                                {item.id === "gouvernance" ? <Tabou2GouvernanceAccord {...tabsProps} /> : null}
                                {item.id === "suivi" ? <Tabou2SuiviOpAccord {...tabsProps} /> : null}
                                {item.id === "dds" ? <Tabou2DdsAccord {...tabsProps} /> : null}
                                {item.id === "habitat" ? <Tabou2ProgHabitAccord {...tabsProps} /> : null}
                                {item.id === "secteursprog" ? <Tabou2SecProgLiesAccord {...tabsProps} /> : null}
                                {item.id === "cadre" ? <Tabou2CadreAccord {...tabsProps} /> : null}
                                {item.id === "projetUrbain" ? <Tabou2ProjetUrbainAccord {...tabsProps} /> : null}
                            </Panel>
                        </PanelGroup>
                    ))
                }
            </Grid>
        </div>
    );
};

export default memo(Tabou2IdentifyContent);
