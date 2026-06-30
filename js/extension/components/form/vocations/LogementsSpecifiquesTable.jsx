import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import {Table, FormControl} from "react-bootstrap";

/**
 * Tableau inline des logements spécifiques affiché dans la popup Vocation
 * (onglets Habitat et Mixte), en dessous de l'indicateur Logts HFV.
 * Affiche les colonnes : Type de logement, Prévu, Réalisé.
 */
export default function LogementsSpecifiquesTable({
    values = {},
    setValues = () => {},
    allowChange = false
}) {
    const logementsSpecifiques = values?.logementsSpecifiques || [];

    // Récupérer tous les logements de tous les groupes, triés par ordre
    const allLogements = logementsSpecifiques.reduce((acc, group) => {
        const logements = (group?.logements || []).map(l => ({
            ...l,
            _groupId: group.id
        }));
        return acc.concat(logements);
    }, []).sort((a, b) => (a.typeLogement?.ordre ?? 0) - (b.typeLogement?.ordre ?? 0));

    if (allLogements.length === 0) {
        return null;
    }

    const handleChange = (groupId, logementIndex, field, value) => {
        const updatedGroups = logementsSpecifiques.map(group => {
            if (group.id !== groupId) return group;
            const updatedLogements = group.logements.map((l, idx) => {
                if (idx !== logementIndex) return l;
                return {...l, [field]: value === "" ? null : Number(value)};
            });
            return {...group, logements: updatedLogements};
        });
        setValues({logementsSpecifiques: updatedGroups});
    };

    // Pour retrouver l'index original dans le groupe
    const getLogementIndex = (groupId, logement) => {
        const group = logementsSpecifiques.find(g => g.id === groupId);
        if (!group) return -1;
        return group.logements.findIndex(l =>
            l.typeLogement?.code === logement.typeLogement?.code
        );
    };

    return (
        <div style={{marginTop: "15px"}}>
            <h5 style={{fontStyle: "italic"}}>
                <Message msgId="tabou2.logementsSpecifiques.title"/>
            </h5>
            <Table striped bordered condensed hover>
                <thead>
                    <tr>
                        <th><Message msgId="tabou2.logementsSpecifiques.typeLogement"/></th>
                        <th style={{textAlign: "center"}}><Message msgId="tabou2.logementsSpecifiques.prevu"/></th>
                        <th style={{textAlign: "center"}}><Message msgId="tabou2.logementsSpecifiques.realise"/></th>
                    </tr>
                </thead>
                <tbody>
                    {allLogements.map((logement) => {
                        const idx = getLogementIndex(logement._groupId, logement);
                        return (
                            <tr key={logement.typeLogement?.code || idx}>
                                <td>{logement.typeLogement?.libelle || ""}</td>
                                <td style={{textAlign: "center"}}>
                                    <FormControl
                                        type="number"
                                        min={0}
                                        value={logement.valeurPrevue ?? ""}
                                        readOnly={!allowChange}
                                        disabled={!allowChange}
                                        onChange={(e) => handleChange(logement._groupId, idx, "valeurPrevue", e.target.value)}
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
                                        onChange={(e) => handleChange(logement._groupId, idx, "valeurRealisee", e.target.value)}
                                        style={{textAlign: "center"}}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
}
