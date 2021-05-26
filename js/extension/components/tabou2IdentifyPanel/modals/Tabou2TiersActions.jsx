import React from 'react';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
export default function Tabou2TiersActions({ ...props }) {
    if (props.readOnly || !props.visible) {
        return null;
    }

    const style = {
        backgroundColor: "transparent",
        borderColor: "rgba(0,0,0,0)"
    }

    const simpleMode = !props.editionActivate && !props.tierVisible;
    const simpleModeActivate = !props.tier.dateInactif && simpleMode;
    const tiersActions = [
        {
            glyph: "eye-open",
            tooltip: "Consulter",
            style: { ...style, color: "rgb(137,178,211)"},
            showCondition: () => props.tier.dateInactif && !props.editionActivate,
            id: "readTier",
            onClick: () => props.open()
        },
        {
            glyph: "pencil",
            style: {...style, color: "rgb(137,178,211)"},
            showCondition: () => simpleModeActivate,
            tooltip: "Modifier",
            id: "editTier",
            onClick: () => props.open()
        },
        {
            glyph: "off",
            style: {...style, color: "#797979"},
            tooltip: "Désactiver",
            showCondition: () => simpleModeActivate,
            id: "inactivate",
            onClick: () => props.inactivate()
        },
        {
            glyph: "ban-circle",
            tooltip: "Dissocier",
            style: {...style, color: "rgb(229,0,0)"},
            showCondition: () => simpleMode,
            id: "dissociateTier",
            onClick: () => props.dissociate()
        },
        {
            glyph: "ok",
            style: {...style, color: "rgb(40, 167, 69)"},
            tooltip: "Enregistrer",
            disabled: props.valid(props.tier).length > 0 && props.editionActivate && !props.isAssociation, // TODO : prendre les champs obligatoires pour débloquer le bouton
            showCondition: () => (props.tier.edit || props.tier.new) && !props.tier.dateInactif,
            id: "saveTier",
            onClick: () => props.save()
        },
        {
            glyph: "remove",
            style: {...style, color: "rgb(229,0,0)"},
            showCondition: () => props.tier.edit || props.tier.new || props.collapse === props.tier.id,
            tooltip: "Annuler",
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
