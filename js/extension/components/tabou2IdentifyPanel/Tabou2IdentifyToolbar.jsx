import React, {useState} from 'react';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
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

    // toolbar buttons
    let modalBtns = [
        {
            glyph: "user",
            tooltip: "Tiers",
            id: "tiers",
            onClick: () => setIsOpenTiers(true)
        },
        {
            glyph: "file",
            tooltip: "Documents",
            id: "docs",
            onClick: () => setIsOpenDocs(true)
        },
        {
            glyph: "list-alt",
            tooltip: "Journal de bord",
            id: "logs",
            onClick: () => setIsOpenLogs(true)
        },
    ];

    // display print button only for programme feature
    // TODO : need API fix to finish and work
    if (props.selectedCfgLayer === "layerPA") {
        let idTabou = props?.selection?.feature?.properties.id_tabou;
        modalBtns.push({
            glyph: "print",
            style: {
                marginLeft: "15px"
            },
            tooltip: "Impression du suivi",
            id: "print",
            onClick: () => props.printProgInfos(idTabou)
        });
    }
    // manage buttons according to role
    if (props.authent.isContrib ||  props.authent.isReferent) {
        modalBtns = [...modalBtns, {
            glyph: "ok",
            tooltip: isValid ? "Enregistrer" : "Saisie incomplète !",
            id: "valid",
            disabled: !isValid,
            style: {
                marginLeft: "15px"
            },
            onClick: () => props.save()
        }, {
            glyph: "remove",
            tooltip: "Annuler",
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
                buttons={modalBtns}
            />
            <Tabou2TiersModal visible={isOpenTiers} onClick={() => setIsOpenTiers(false)} {...props}/>
            <Tabou2DocsModal visible={isOpenDocs} onClick={() => setIsOpenDocs(false)} {...props} />
            <Tabou2LogsModal visible={isOpenLogs} onClick={() => setIsOpenLogs(false)} {...props}/>
        </>
    );

}
