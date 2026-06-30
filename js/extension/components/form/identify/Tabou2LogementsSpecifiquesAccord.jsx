import React, {useState, memo} from "react";
import {isEmpty, isEqual} from "lodash";
import {Col, Row, Grid, ControlLabel, Button, FormControl} from "react-bootstrap";
import "@js/extension/css/identify.css";
import "@js/extension/css/tabou.css";
import Message from "@mapstore/components/I18N/Message";
import Tabou2LogementsSpecifiquesModal from "@js/extension/components/tabou2IdentifyPanel/modals/Tabou2LogementsSpecifiquesModal";

const avoidReRender = (prevProps, nextProps) => {
    return isEqual(prevProps.operation, nextProps.operation);
};

/**
 * Accordion pour afficher les logements spécifiques d'une Opération ou d'un Secteur.
 * Les opérations portent directement un tableau logementsSpecifiques (sans ProgrammationHabitat).
 */
const Tabou2LogementsSpecifiquesAccord = ({
    operation,
    layer,
    authent,
    change = () => {},
    i18n = () => {},
    messages
}) => {
    const [openedGroupId, setOpenedGroupId] = useState(null);
    // State local pour persister les modifications de logements spécifiques
    const [localLogementsSpec, setLocalLogementsSpec] = useState({});

    // Récupérer les groupes de logements spécifiques, avec les modifications locales appliquées
    const getGroups = () => {
        const groups = operation?.logementsSpecifiques || [];
        return [...groups]
            .map(g => localLogementsSpec[g.id] ? {...g, ...localLogementsSpec[g.id]} : g)
            .sort((a, b) =>
                (a.typeAccessionLogement?.ordre ?? 0) - (b.typeAccessionLogement?.ordre ?? 0)
            );
    };

    const allowChange = authent?.isContrib || authent?.isReferent;

    /**
     * Met à jour la valeur d'un groupe de logements spécifiques.
     */
    const updateGroupValeur = (groupId, newValeur) => {
        const existing = localLogementsSpec[groupId] || {};
        const newLocalSpec = {...localLogementsSpec, [groupId]: {...existing, valeur: newValeur}};
        setLocalLogementsSpec(newLocalSpec);

        const currentGroups = operation?.logementsSpecifiques || [];
        const updatedGroups = currentGroups.map(g =>
            newLocalSpec[g.id] ? {...g, ...newLocalSpec[g.id]} : g
        );
        change({...operation, logementsSpecifiques: updatedGroups}, {});
    };

    /**
     * Met à jour les logements d'un groupe dans l'opération.
     */
    const updateLogementsSpecifiques = (groupId, updatedLogements) => {
        const existing = localLogementsSpec[groupId] || {};
        const newLocalSpec = {...localLogementsSpec, [groupId]: {...existing, logements: updatedLogements}};
        setLocalLogementsSpec(newLocalSpec);

        const currentGroups = operation?.logementsSpecifiques || [];
        const updatedGroups = currentGroups.map(g =>
            newLocalSpec[g.id] ? {...g, ...newLocalSpec[g.id]} : g
        );
        change({...operation, logementsSpecifiques: updatedGroups}, {});
    };

    const sortedGroups = getGroups();

    if (isEmpty(operation?.logementsSpecifiques)) {
        return (
            <Grid style={{width: "100%"}}>
                <Row>
                    <Col xs={12}>
                        <Message msgId="tabou2.logementsSpecifiques.noData"/>
                    </Col>
                </Row>
            </Grid>
        );
    }

    return (
        <Grid style={{width: "100%"}}>
            {/* Lignes par type d'accession */}
            {sortedGroups.map((group) => {
                return (
                    <Row key={group.id} style={{marginBottom: "8px"}}>
                        <Col xs={5}>
                            <ControlLabel>
                                {group.typeAccessionLogement?.libelle || ""}
                            </ControlLabel>
                        </Col>
                        <Col xs={7}>
                            <FormControl
                                type="number"
                                min={0}
                                value={group.valeur ?? ""}
                                readOnly={!allowChange}
                                onChange={(v) => {
                                    const newVal = v.target.value;
                                    updateGroupValeur(group.id, newVal === "" ? null : Number(newVal));
                                }}
                            />
                            <Button
                                bsStyle="primary"
                                style={{marginTop: "4px"}}
                                onClick={() => setOpenedGroupId(group.id)}
                            >
                                {i18n(messages, "tabou2.logementsSpecifiques.btnLabel")}
                            </Button>
                        </Col>
                    </Row>
                );
            })}
            {/* Modal logements spécifiques */}
            <Tabou2LogementsSpecifiquesModal
                show={openedGroupId !== null}
                onClose={() => setOpenedGroupId(null)}
                logementsSpecifiques={getGroups().find(g => g.id === openedGroupId) || null}
                allowChange={allowChange}
                onChange={(groupId, updatedLogements) => updateLogementsSpecifiques(groupId, updatedLogements)}
                i18n={i18n}
                messages={messages}
            />
        </Grid>
    );
};

export default memo(Tabou2LogementsSpecifiquesAccord, avoidReRender);
