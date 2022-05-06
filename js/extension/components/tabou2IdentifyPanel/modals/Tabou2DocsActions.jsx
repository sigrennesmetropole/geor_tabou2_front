import React from 'react';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
/**
 * Tier Action's as toolbar beside each tier.
 * @param {any} param
 * @returns component
 */
export default function Tabou2DocsActions({ document = {}, onClick = () => {}, readOnly = true}) {

    const style = {
        backgroundColor: "transparent",
        borderColor: "rgba(0,0,0,0)"
    };
    /**
     * Select action by number :
     * 0 - cancel
     * 1 - save
     * 2 - open and read only
     * 3 - open in edit mode
     * 4 - delete
     * 5 - download
     * 6 - save new doc
     * 7 - save update edition
     * @param {number} action
     * @returns trigger click method
     */
    const triggerAction = (action) => {
        return onClick({document: document, action: action});
    };

    const color = "rgb(7,138,163)";

    const docActions = [
        {
            glyph: "eye-open",
            style: { ...style, color: color},
            id: "readMetaData",
            onClick: () => triggerAction(2),
            visible: readOnly
        },
        {
            glyph: "pencil",
            style: {...style, color: color},
            id: "editMetaData",
            onClick: () => triggerAction(3),
            visible: !readOnly
        }, {
            glyph: "download-alt",
            style: {...style, color: "#a23f97"},
            id: "downloadDocument",
            onClick: () => triggerAction(5)
        },
        {
            glyph: "trash",
            style: {...style, color: "rgb(229,0,0)"},
            id: "deleteDocument",
            visible: !readOnly,
            onClick: () => triggerAction(4)
        }
    ];

    return (
        <>
            <Toolbar
                btnDefaultProps={{
                    className: "square-button-md",
                    bsStyle: "primary"
                }}
                buttons={docActions}
            />
        </>
    );

}
