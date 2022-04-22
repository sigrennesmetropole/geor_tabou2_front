import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import { Button } from "react-bootstrap";
import "@js/extension/css/vocation.css";


export default function FooterButtons({
    save = () => {},
    close = () => {},
    reset = () => {}
}) {
    return (
        <span>
            <Button
                tooltip="Fermer"
                disabled={false}
                style={{ marginRight: "2px" }}
                onClick={close}>
                Retour à la fiche
            </Button>
            <Button
                tooltip="Valeurs par défaut"
                disabled={false}
                style={{ marginRight: "2px" }}
                onClick={reset}>
                Réinitialiser
            </Button>
            <Button
                tooltip="Sauvegarder les modifications"
                disabled={false}
                onClick={save}>
                Valider
            </Button>
        </span>
    );
}
