import React, {useState, useEffect} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import {Table, FormControl} from 'react-bootstrap';
import "@js/extension/css/identify.css";

/**
 * Modal affichant le détail des logements spécifiques pour un type d'accession donné.
 * Les champs valeurPrevue et valeurRealisee sont éditables si allowChange est true.
 * @param {object} props
 * @param {boolean} props.show - Afficher ou masquer la modal
 * @param {function} props.onClose - Callback de fermeture
 * @param {object} props.logementsSpecifiques - Groupe LogementsSpecifiques (avec typeAccessionLogement et logements[])
 * @param {boolean} props.allowChange - Autorise la modification
 * @param {function} props.onChange - Callback (groupId, updatedLogements) appelé à chaque modification
 * @param {function} props.i18n
 * @param {object} props.messages
 */
function Tabou2LogementsSpecifiquesModal({
    show = false,
    onClose = () => {},
    logementsSpecifiques = {},
    allowChange = false,
    onChange = () => {},
    i18n = () => {},
    messages
}) {
    const title = logementsSpecifiques?.typeAccessionLogement?.libelle || i18n(messages, "tabou2.logementsSpecifiques.title");
    const logements = logementsSpecifiques?.logements || [];

    // State local pour les valeurs éditées
    const [editedLogements, setEditedLogements] = useState([]);

    useEffect(() => {
        setEditedLogements([...logements].sort((a, b) => (a.typeLogement?.ordre ?? 0) - (b.typeLogement?.ordre ?? 0)));
    }, [logementsSpecifiques]);

    const handleChange = (index, field, value) => {
        const updated = editedLogements.map((l, i) =>
            i === index ? {...l, [field]: value === "" ? null : Number(value)} : l
        );
        setEditedLogements(updated);
        if (logementsSpecifiques?.id) {
            onChange(logementsSpecifiques.id, updated);
        }
    };

    return (
        <ResizableModal
            title={`${i18n(messages, "tabou2.logementsSpecifiques.title")} - ${title}`}
            bodyClassName="ms-flex"
            show={show}
            showClose
            onClose={onClose}
            size="lg"
        >
            <div style={{padding: "15px"}}>
                {editedLogements.length === 0 ? (
                    <p><Message msgId="tabou2.logementsSpecifiques.noData"/></p>
                ) : (
                    <Table striped bordered condensed hover>
                        <thead>
                            <tr>
                                <th><Message msgId="tabou2.logementsSpecifiques.typeLogement"/></th>
                                <th style={{textAlign: "center"}}><Message msgId="tabou2.logementsSpecifiques.prevu"/></th>
                                <th style={{textAlign: "center"}}><Message msgId="tabou2.logementsSpecifiques.realise"/></th>
                            </tr>
                        </thead>
                        <tbody>
                            {editedLogements.map((logement, idx) => (
                                <tr key={logement.id || logement.typeLogement?.code}>
                                    <td>{logement.typeLogement?.libelle || ""}</td>
                                    <td style={{textAlign: "center"}}>
                                        <FormControl
                                            type="number"
                                            min={0}
                                            value={logement.valeurPrevue ?? ""}
                                            readOnly={!allowChange}
                                            disabled={!allowChange}
                                            onChange={(e) => handleChange(idx, "valeurPrevue", e.target.value)}
                                            style={{textAlign: "center"}}
                                        />
                                    </td>
                                    <td style={{textAlign: "center"}}>
                                        <FormControl
                                            type="number"
                                            min={0}
                                            value={logement.valeurRealisee ?? ""}
                                            readOnly={!allowChange}
                                            disabled={!allowChange}
                                            onChange={(e) => handleChange(idx, "valeurRealisee", e.target.value)}
                                            style={{textAlign: "center"}}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </ResizableModal>
    );
}

export default Tabou2LogementsSpecifiquesModal;
