import React, {useState} from 'react';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import Tabou2TiersModal from './modals/Tabou2TiersModal';
import Tabou2DocsModal from './modals/Tabou2DocsModal';
import Tabou2LogsModal from './modals/Tabou2LogsModal';
export default function Tabou2IdentifyToolbar({ response, ...props }) {
    const [isOpenTiers, setIsOpenTiers] = useState(false);
    const [isOpenDocs, setIsOpenDocs] = useState(false);
    const [isOpenLogs, setIsOpenLogs] = useState(false);

    const modalBtns = [
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
        }
    ];

    if (props.selectedCfgLayer === "layerPA") {
        let idTabou = props?.selection?.feature?.properties.id_tabou;
        modalBtns.push({
            glyph: "print",
            tooltip: "Impression du suivi",
            id: "print",
            onClick: () => props.printProgInfos(idTabou)
        });
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
