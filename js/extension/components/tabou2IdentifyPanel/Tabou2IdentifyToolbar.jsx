import React, {useState} from 'react';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { has } from 'lodash';
import Tabou2TiersModal from './modals/Tabou2TiersModal';
import Tabou2DocsModal from './modals/Tabou2DocsModal';
import Tabou2LogsModal from './modals/Tabou2LogsModal';
/**
 * Toolbar fo identify panel (tab identify)
 * @param {any} param
 * @returns component
 */
export default function Tabou2IdentifyToolbar({ response, isValid, ...props }) {
    const [isOpenTiers, setIsOpenTiers] = useState(false);
    const [isOpenDocs, setIsOpenDocs] = useState(false);
    const [isOpenLogs, setIsOpenLogs] = useState(false);
    const [wasClicked, setClicked] = useState(false);

    // manage behavior on tiers modal close
    const closeTiersModal = () => {
        setIsOpenTiers(false);
        props.setTiersFilter(null, null);
    };

    // toolbar buttons
    let modalBtns = [
        {
            glyph: "map-filter",
            style: {
                marginRight: "15px"
            },
            tooltip: props.i18n(props.messages, "tabou2.identify.toolbar.displaySaPa"),
            id: "filterSaPaByOa",
            onClick: () => {
                props.displayPASAByOA();
                setClicked(true);
            },
            visible: !wasClicked && props.selectedCfgLayer === "layerOA"
        },
        {
            glyph: "clear-filter",
            style: {
                marginRight: "15px"
            },
            tooltip: props.i18n(props.messages, "tabou2.search.restore"),
            id: "clearOAFilters",
            onClick: () => {
                setClicked(false);
                props.resetSearchFilters(props.getLayersName);
            },
            visible: wasClicked && props.selectedCfgLayer === "layerOA"
        },
        {
            glyph: "user",
            tooltip: props.i18n(props.messages, "tabou2.identify.toolbar.tiers"),
            id: "tiers",
            onClick: () => setIsOpenTiers(true)
        },
        {
            glyph: "file",
            tooltip: props.i18n(props.messages, "tabou2.identify.toolbar.docs"),
            id: "docs",
            onClick: () => setIsOpenDocs(true)
        },
        {
            glyph: "list-alt",
            tooltip: props.i18n(props.messages, "tabou2.identify.toolbar.logs"),
            id: "logs",
            onClick: () => setIsOpenLogs(true)
        }
    ];

    // display print button only for programme feature
    if (["layerPA", "layerOA"].includes(props.selectedCfgLayer)) {
        let idTabou = props?.selection?.feature?.properties.id_tabou;
        modalBtns.push({
            glyph: "print",
            style: {
                marginLeft: "15px"
            },
            tooltip: props.i18n(props.messages, "tabou2.identify.toolbar.print"),
            id: "print",
            onClick: () => props.printPDFInfos(idTabou, props.selectedCfgLayer)
        });
    }
    // manage buttons according to role
    if (props.authent.isContrib ||  props.authent.isReferent) {
        modalBtns = [...modalBtns, {
            glyph: "ok",
            tooltip: isValid ? props.i18n(props.messages, "tabou2.identify.toolbar.save") : props.i18n(props.messages, "tabou2.identify.toolbar.notValid"),
            id: "valid",
            disabled: !isValid,
            style: {
                marginLeft: "15px"
            },
            onClick: () => props.save()
        }, {
            glyph: "remove",
            tooltip: props.i18n(props.messages, "tabou2.identify.toolbar.cancel"),
            id: "cancel",
            onClick: () => props.restore()
        }];
    }
    return (
        <>
            <Toolbar
                btnDefaultProps={{
                    className: "square-button-md",
                    bsStyle: "primary"
                }}
                btnGroupProps={{
                    style: {
                        margin: 10
                    }
                }}
                buttons={modalBtns.filter(btn => btn.visible || !has(btn, "visible"))}
            />
            <Tabou2TiersModal visible={isOpenTiers} onClick={() => closeTiersModal()} {...props}/>
            <Tabou2DocsModal visible={isOpenDocs} onClick={() => setIsOpenDocs(false)} {...props} />
            <Tabou2LogsModal visible={isOpenLogs} onClick={() => setIsOpenLogs(false)} {...props} eventsId={props.events.map(e => e.id)}/>
        </>
    );

}
