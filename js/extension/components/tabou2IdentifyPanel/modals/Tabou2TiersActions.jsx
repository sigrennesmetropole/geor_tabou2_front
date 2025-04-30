import React from 'react';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
/**
 * Tier Action's as toolbar beside each tier.
 * @param {any} param
 * @returns component
 */
export default function Tabou2TiersActions({ ...props }) {
    if (props.readOnly || !props.visible) {
        return null;
    }

    const style = {
        backgroundColor: "transparent",
        borderColor: "rgba(0,0,0,0)"
    };

    const simpleMode = !props.editionActivate && !props.tierVisible;
    const simpleModeActivate = !props.tier.tiers.dateInactif && simpleMode;
    const notValid = props.valid(props.tier) && props.editionActivate;
    const tiersActions = [
        {
            glyph: "eye-open",
            tooltip: props.i18n(props.messages, "tabou2.tiersModal.read"),
            style: { ...style, color: "rgb(137,178,211)"},
            showCondition: () => props.tier.tiers.dateInactif && !props.tier.tiers.editionActivate,
            id: "readTier",
            onClick: () => props.open()
        },
        {
            glyph: "pencil",
            style: {...style, color: "rgb(137,178,211)"},
            showCondition: () => simpleModeActivate,
            tooltip: props.i18n(props.messages, "tabou2.change"),
            id: "editTier",
            onClick: () => props.open()
        },
        {
            glyph: "off",
            style: {...style, color: "#797979"},
            tooltip: props.i18n(props.messages, "tabou2.tiersModal.inactiv"),
            showCondition: () => simpleModeActivate,
            id: "inactivate",
            onClick: () => props.inactivate()
        },
        {
            glyph: "ban-circle",
            tooltip: props.i18n(props.messages, "tabou2.tiersModal.dissociate"),
            style: {...style, color: "rgb(229,0,0)"},
            showCondition: () => simpleMode,
            id: "dissociateTier",
            onClick: () => props.dissociate()
        },
        {
            glyph: "ok",
            style: {...style, color: "rgb(40, 167, 69)"},
            tooltip: notValid ? props.i18n(props.messages, "tabou2.tiersModal.notValid") : props.i18n(props.messages, "tabou2.save"),
            readOnly: notValid,
            disabled: notValid,
            showCondition: () => (props.tier.edit || props.tier.new) && !props.tier.dateInactif,
            id: "saveTier",
            onClick: () => props.save()
        },
        {
            glyph: "remove",
            style: {...style, color: "rgb(229,0,0)"},
            showCondition: () => props.tier.edit || props.tier.new || props.collapse === props.tier.id,
            tooltip: props.i18n(props.messages, "tabou2.cancel"),
            id: "cancelEdit",
            showWith: [""],
            onClick: () => props.cancel()
        }
    ];

    return (
        <>
            <Toolbar
                btnDefaultProps={{
                    className: "square-button-md",
                    bsStyle: "primary"
                }}
                buttons={tiersActions.filter(action => action.showCondition())}
            />
        </>
    );

}
