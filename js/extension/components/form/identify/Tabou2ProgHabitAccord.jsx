import React, {useEffect, useState, memo} from "react";
import {isEmpty, isEqual, has, get, capitalize} from "lodash";
import {Col, Row, Table, FormControl, Grid, ControlLabel, Alert, Glyphicon, Button} from "react-bootstrap";
import Tabou2Date from '@js/extension/components/common/Tabou2Date';
import "@js/extension/css/identify.css";
import "@js/extension/css/tabou.css";
import Message from "@mapstore/components/I18N/Message";

import ControlledPopover from '@mapstore/components/widgets/widget/ControlledPopover';
import Tabou2SuiviPLHModal from "@js/extension/components/tabou2IdentifyPanel/modals/Tabou2SuiviPLHModal";
import Tabou2LogementsSpecifiquesModal from "@js/extension/components/tabou2IdentifyPanel/modals/Tabou2LogementsSpecifiquesModal";

const avoidReRender = (prevProps, nextProps) => {
    return isEqual(prevProps.initialItem, nextProps.initialItem);
};

/**
 * Récupère la valeur d'un champ depuis programmationHabitat (nouveau modèle)
                layers: ["layerPA", "layerOA"],
 */
const getHabitatValue = (programme, values, fieldName, fallbackField) => {
    // Priorité au state local (saisie en cours)
    if (has(values, fieldName)) return values[fieldName];
    // Nouveau modèle : programmationHabitat
    const progHabitat = programme?.programmationHabitat;
    if (progHabitat && has(progHabitat, fieldName)) return progHabitat[fieldName];
    // Fallback ancien modèle
    if (fallbackField && has(programme, fallbackField)) return programme[fallbackField];
    return null;
};

const Tabou2ProgHabitatAccord = ({
    initialItem,
    programme,
    operation,
    layer,
    authent,
    change = () => {
    },
    i18n = () => {
    },
    messages,
    help,
    agapeo
}) => {
    const [values, setValues] = useState({});
    const [suiviPlhOpened, setSuiviPlhOpened] = useState(false);
    const [openedLogementsSpecGroupId, setOpenedLogementsSpecGroupId] = useState(null);
    // State local pour les logements spécifiques modifiés (keyed by group id)
    const [localLogementsSpec, setLocalLogementsSpec] = useState({});

    // Récupère les groupes de logements spécifiques, en appliquant les modifications locales
    const getLogementsSpecifiques = () => {
        const groups = programme?.programmationHabitat?.logementsSpecifiques || [];
        return [...groups]
            .map(g => localLogementsSpec[g.id] ? {...g, ...localLogementsSpec[g.id]} : g)
            .sort((a, b) =>
                (a.typeAccessionLogement?.ordre ?? 0) - (b.typeAccessionLogement?.ordre ?? 0)
            );
    };

    // create fields from const func
    const getFields = () => {
        const baseFields = [
            {
                name: "nbLogements",
                label: "tabou2.identify.accordions.totalLog",
                field: "nbLogements",
                fallbackField: "logementsTotal",
                layers: ["layerPA"],
                type: "number",
                min: 0,
                readOnly: false
            }, {
                name: "surfaceSHAB",
                field: "surfaceSHAB",
                fallbackField: "surfaceSHAB",
                label: "tabou2.identify.accordions.SHABSpace",
                type: "number",
                step: 0.1,
                layers: ["layerPA"],
                readOnly: false
            }, {
                name: "logtsLibresPrixM2Shab",
                label: "tabou2.identify.accordions.logtsLibresPrixM2Shab",
                layers: ["layerPA"],
                type: "pairedNumber",
                min: 0,
                step: 0.01,
                prevuField: "prixLogtsLibresM2ShabPrevu",
                realiseField: "prixLogtsLibresM2ShabRealise",
                source: has(values, "prixLogtsLibresM2ShabPrevu") || has(values, "prixLogtsLibresM2ShabRealise") ? values : programme,
                readOnly: false
            }, {
                name: "terrainABatirPrixM2Terrain",
                label: "tabou2.identify.accordions.terrainABatirPrixM2Terrain",
                layers: ["layerPA"],
                type: "pairedNumber",
                min: 0,
                step: 0.01,
                prevuField: "prixTerrainBatirM2Prevu",
                realiseField: "prixTerrainBatirM2Realise",
                source: has(values, "prixTerrainBatirM2Prevu") || has(values, "prixTerrainBatirM2Realise") ? values : programme,
                readOnly: false
            }
        ];

        // Lignes dynamiques pour chaque type d'accession (depuis programmationHabitat.logementsSpecifiques)
        const logementsSpecGroups = getLogementsSpecifiques();
        const accessionFields = logementsSpecGroups.map((group) => {
            return {
                name: `logementsSpec_${group.id}`,
                label: group.typeAccessionLogement?.libelle || "",
                labelDynamic: true,
                field: `logementsSpec_${group.id}`,
                layers: ["layerPA"],
                type: "logementsSpecifiques",
                logementsSpecifiques: group,
                min: 0,
                readOnly: false
            };
        });

        const endFields = [
            {
                name: "nbLogementsHFV",
                label: "tabou2.identify.accordions.nbLogementsHFV",
                field: "nbLogementsHFV",
                fallbackField: "nbLogementsHFV",
                layers: ["layerPA"],
                type: "number",
                min: 0,
                labelStyle: {fontStyle: "italic"},
                readOnly: false
            }, {
                name: "hebergementResidSenior",
                label: "tabou2.identify.accordions.hebergementResidSenior",
                labelStyle: {fontStyle: "italic"},
                type: "pairedNumber",
                layers: ["layerPA"],
                min: 0,
                prevuField: "hebergementResidSeniorPrevu",
                realiseField: "hebergementResidSeniorRealise",
                source: has(values, "hebergementResidSeniorPrevu") || has(values, "hebergementResidSeniorRealise") ? values : programme,
                readOnly: false
            }, {
                name: "suiviPLH",
                label: "tabou2.identify.accordions.suiviPLH",
                field: "suiviPLH",
                layers: ["layerPA", "layerOA"],
                type: "suiviPLH",
                readOnly: false
            },
            {
                name: "agapeo",
                label: "tabou2.identify.accordions.agapeoData",
                msg: ["tabou2.getHelp", help?.agapeo || help?.url || ""],
                type: "table",
                fields: ["anneeProg", "numDossier", "logementsLocatAide", "logementsLocatRegulHlm", "logementsLocatRegulPrive", "logementsAccessAide"],
                labels: [
                    "tabou2.identify.accordions.progYear",
                    "tabou2.identify.accordions.numFolder",
                    "tabou2.identify.accordions.locHelpTitle",
                    "tabou2.identify.accordions.locRegHlm",
                    "tabou2.identify.accordions.locRegPriv",
                    "tabou2.identify.accordions.accessHelpTitle"
                ],
                layers: ["layerPA"],
                source: agapeo || [],
                readOnly: true
            }
        ];

        return [...baseFields, ...accessionFields, ...endFields]
            .filter(el => el?.layers?.includes(layer) || !el?.layers);
    };

    // hooks
    useEffect(() => {
        if (!isEqual(initialItem, values)) {
            setValues(initialItem);
        }
    }, [initialItem]);

    // Reset les logements spécifiques locaux uniquement quand on change de programme
    useEffect(() => {
        setLocalLogementsSpec({});
    }, [programme?.id]);

    // get value for a specific item
    const getValue = (item) => {
        if (isEmpty(values) && isEmpty(programme)) return null;
        // Pour les champs habitat (nbLogements, surfaceSHAB, nbLogementsHFV)
        if (item.fallbackField !== undefined) {
            return getHabitatValue(programme, values, item.field, item.fallbackField);
        }
        // Autres champs (ancienne logique)
        let itemSrc = getFields().filter(f => f.name === item.name)[0]?.source;
        return get(itemSrc, item?.field);
    };

    // get value - usefull for date component
    const getValueByField = (field, val) => {
        let fieldVal;
        switch (field) {
        case "dateLiv":
            fieldVal = val ? new Date(val).toLocaleDateString() : val;
            break;
        case "dateCancelStep":
            fieldVal = val ? new Date(val).toLocaleDateString() : val;
            break;
        default:
            fieldVal = val;
            break;
        }
        return fieldVal;
    };

    /**
     * Construit le programme mis à jour avec programmationHabitat,
     * en préservant les valeurs locales des champs pairedNumber.
     */
    const buildUpdatedProgramme = (updatedHabitat) => {
        const updatedProgramme = {
            ...programme,
            programmationHabitat: updatedHabitat,
            logementsTotal: updatedHabitat.nbLogements,
            surfaceSHAB: updatedHabitat.surfaceSHAB,
            nbLogementsHFV: updatedHabitat.nbLogementsHFV
        };
        // Préserver les valeurs locales des champs pairedNumber
        const pairedFields = [
            "prixLogtsLibresM2ShabPrevu", "prixLogtsLibresM2ShabRealise",
            "prixTerrainBatirM2Prevu", "prixTerrainBatirM2Realise",
            "hebergementResidSeniorPrevu", "hebergementResidSeniorRealise"
        ];
        pairedFields.forEach(f => {
            if (has(values, f)) {
                updatedProgramme[f] = values[f] === "" ? null : Number(values[f]);
            }
        });
        return updatedProgramme;
    };

    // manage change info - met à jour programmationHabitat dans le programme
    const changeInfos = (item) => {
        let newValues = {...values, ...item};
        setValues(newValues);

        // Construire l'objet programmationHabitat mis à jour
        const habitatFields = ["nbLogements", "surfaceSHAB", "nbLogementsHFV"];
        const currentHabitat = programme?.programmationHabitat || {};
        const updatedHabitat = {...currentHabitat};

        habitatFields.forEach(f => {
            if (has(newValues, f)) {
                const val = newValues[f];
                const numericVal = isNaN(Number(val)) ? val : Number(val);
                updatedHabitat[f] = (val === "" || val === null) ? null : numericVal;
            }
        });

        // Envoyer le programme complet avec programmationHabitat mis à jour
        // On garde aussi les anciens champs plats pour la rétrocompatibilité
        const updatedProgramme = {
            ...programme,
            programmationHabitat: updatedHabitat,
            // Rétrocompatibilité : mapper les nouveaux champs vers les anciens
            logementsTotal: updatedHabitat.nbLogements,
            surfaceSHAB: updatedHabitat.surfaceSHAB,
            nbLogementsHFV: updatedHabitat.nbLogementsHFV
        };

        // Champs pairedNumber (prix, hébergement senior) - stockés en plat sur le programme
        const pairedFields = [
            "prixLogtsLibresM2ShabPrevu", "prixLogtsLibresM2ShabRealise",
            "prixTerrainBatirM2Prevu", "prixTerrainBatirM2Realise",
            "hebergementResidSeniorPrevu", "hebergementResidSeniorRealise"
        ];
        pairedFields.forEach(f => {
            if (has(newValues, f)) {
                updatedProgramme[f] = newValues[f] === "" ? null : Number(newValues[f]);
            }
        });

        change(updatedProgramme, {});
    };

    /**
     * Met à jour la valeur d'un groupe de logements spécifiques dans programmationHabitat.
     */
    const updateGroupValeur = (groupId, newValeur) => {
        const existing = localLogementsSpec[groupId] || {};
        const newLocalSpec = {...localLogementsSpec, [groupId]: {...existing, valeur: newValeur}};
        setLocalLogementsSpec(newLocalSpec);

        const currentHabitat = programme?.programmationHabitat || {};
        const currentGroups = currentHabitat.logementsSpecifiques || [];
        const updatedGroups = currentGroups.map(g =>
            newLocalSpec[g.id] ? {...g, ...newLocalSpec[g.id]} : g
        );
        const updatedHabitat = {...currentHabitat, logementsSpecifiques: updatedGroups};
        const updatedProgramme = buildUpdatedProgramme(updatedHabitat);
        change(updatedProgramme, {});
    };

    /**
     * Met à jour les logements d'un groupe de logements spécifiques dans programmationHabitat.
     * @param {number} groupId - id du groupe LogementsSpecifiques
     * @param {array} updatedLogements - tableau de LogementSpecifique mis à jour
     */
    const updateLogementsSpecifiques = (groupId, updatedLogements) => {
        const existing = localLogementsSpec[groupId] || {};
        const newLocalSpec = {...localLogementsSpec, [groupId]: {...existing, logements: updatedLogements}};
        setLocalLogementsSpec(newLocalSpec);

        const currentHabitat = programme?.programmationHabitat || {};
        const currentGroups = currentHabitat.logementsSpecifiques || [];
        const updatedGroups = currentGroups.map(g =>
            newLocalSpec[g.id] ? {...g, ...newLocalSpec[g.id]} : g
        );
        const updatedHabitat = {...currentHabitat, logementsSpecifiques: updatedGroups};
        const updatedProgramme = buildUpdatedProgramme(updatedHabitat);
        change(updatedProgramme, {});
    };

    const changeDate = (field, str) => {
        changeInfos({[field.name]: str ? new Date(str).toISOString() : ""});
    };

    const allowChange = authent.isContrib || authent.isReferent;
    // Calculer les champs à chaque rendu pour refléter les modifications locales des logements spécifiques
    const currentFields = getFields().filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1);
    return (
        <Grid style={{width: "100%"}} className={""}>
            {
                currentFields.map(item => (
                    <Row key={item.name} className={item.type === "table" ? "tableDisplay" : ""}>
                        {
                            has(item, "valid") && getValue(item) && !item.valid(getValue(item)) ? (
                                <Alert className="alert-danger">
                                    <Glyphicon glyph="warning-sign"/>
                                    <Message msgId={i18n(messages, item?.errorMsg || "")}/>
                                </Alert>) : null
                        }
                        <Col xs={item.type === "table" ? 12 : 5}>
                            <ControlLabel style={item.labelStyle || {}}>
                                {item.labelDynamic
                                    ? <span>{item.label}</span>
                                    : <Message msgId={item.label}/>
                                }
                                {
                                    item.msg && (
                                        <a href={item.msg[1]} className="link-deactivate" target="_blank">
                                            <ControlledPopover text={<Message msgId={item.msg[0]}/>}/>
                                        </a>
                                    )
                                } :
                            </ControlLabel>
                        </Col>
                        <Col xs={7}>
                            {
                                item.type === "pairedNumber" && (
                                    <Row>
                                        <Col xs={6}>
                                            <ControlLabel>
                                                <Message msgId="tabou2.identify.accordions.prevu"/>
                                            </ControlLabel>
                                            <FormControl
                                                type="number"
                                                min={item?.min}
                                                max={item?.max}
                                                step={item?.step}
                                                placeholder={i18n(messages, "tabou2.identify.accordions.prevu")}
                                                value={get(values, item.prevuField) || ""}
                                                readOnly={!allowChange || item.readOnly}
                                                onChange={(v) => changeInfos({[item.prevuField]: v.target.value})}
                                                onKeyDown={(v) => {
                                                    if (!/^[\d.,]$/.test(v.key) && v.key.length < 2) {
                                                        v.returnValue = false;
                                                        if (v.preventDefault) v.preventDefault();
                                                    }
                                                }}
                                            />
                                        </Col>
                                        <Col xs={6}>
                                            <ControlLabel>
                                                <Message msgId="tabou2.identify.accordions.realise"/>
                                            </ControlLabel>
                                            <FormControl
                                                type="number"
                                                min={item?.min}
                                                max={item?.max}
                                                step={item?.step}
                                                placeholder={i18n(messages, "tabou2.identify.accordions.realise")}
                                                value={get(values, item.realiseField) || ""}
                                                readOnly={!allowChange || item.readOnly}
                                                onChange={(v) => changeInfos({[item.realiseField]: v.target.value})}
                                                onKeyDown={(v) => {
                                                    if (!/^[\d.,]$/.test(v.key) && v.key.length < 2) {
                                                        v.returnValue = false;
                                                        if (v.preventDefault) v.preventDefault();
                                                    }
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                )
                            }
                            {
                                item.type === "date" && (
                                    <Tabou2Date
                                        type="date"
                                        refreshValue={initialItem}
                                        refresh={(o, n) => {
                                            return isEqual(o, n);
                                        }}
                                        className="identifyDate"
                                        inline
                                        readOnly={!allowChange || item.readOnly}
                                        dropUp
                                        placeholder={i18n(messages, item?.label || "")}
                                        calendar
                                        time={false}
                                        culture="fr"
                                        value={get(values, item.name) ? new Date(get(values, item.name)) : null}
                                        format="DD/MM/YYYY"
                                        onSelect={(v) => changeDate(item, v)}
                                        onChange={(v) => changeDate(item, v)}
                                    />
                                )
                            }
                            {
                                (item.type === "text" || item.type === "number") &&
                                            (<FormControl
                                                type={item.type}
                                                min={item?.min}
                                                max={item?.max}
                                                step={item?.step}
                                                placeholder={i18n(messages, item?.label || "")}
                                                value={getValue(item) ?? ""}
                                                readOnly={!allowChange || item.readOnly}
                                                onChange={(v) => changeInfos({[item.name]: v.target.value})}
                                                onKeyDown={(v) => {
                                                    if (item.type !== "number") return;
                                                    // only keep numeric and special key control as "Delete" or "Backspace"
                                                    if (!/^[\d.,]$/.test(v.key) && v.key.length < 2) {
                                                        v.returnValue = false;
                                                        if (v.preventDefault) v.preventDefault();
                                                    }
                                                }}
                                            />)
                            }
                            {
                                item.type === "logementsSpecifiques" && (() => {
                                    const group = item.logementsSpecifiques;
                                    return (
                                        <div>
                                            <FormControl
                                                type="number"
                                                min={0}
                                                placeholder={item.label}
                                                value={group.valeur ?? ""}
                                                readOnly={!allowChange}
                                                onChange={(v) => {
                                                    const newVal = v.target.value;
                                                    updateGroupValeur(group.id, newVal === "" ? null : Number(newVal));
                                                }}
                                                onKeyDown={(v) => {
                                                    if (!/^\d+$/.test(v.key) && v.key.length < 2 && v.key !== ",") {
                                                        v.returnValue = false;
                                                        if (v.preventDefault) v.preventDefault();
                                                    }
                                                }}
                                            />
                                            <Button
                                                bsStyle="primary"
                                                style={{marginTop: "4px"}}
                                                onClick={() => setOpenedLogementsSpecGroupId(group.id)}
                                            >
                                                {i18n(messages, "tabou2.logementsSpecifiques.btnLabel")}
                                            </Button>
                                        </div>
                                    );
                                })()
                            }
                            {
                                item.type === "suiviPLH" && (
                                    <>
                                        <Button
                                            tooltip="Suivi PLH"
                                            bsStyle="primary"
                                            onClick={() => setSuiviPlhOpened(true)}>
                                            {i18n(messages, "tabou2.suiviPLH.btnLabel")}
                                        </Button>
                                        <Tabou2SuiviPLHModal
                                            i18n={i18n}
                                            messages={messages}
                                            programme={programme}
                                            opened={suiviPlhOpened}
                                            allowChange={allowChange}
                                            close={() => setSuiviPlhOpened(false)}
                                        />
                                    </>
                                )
                            }
                        </Col>
                        {
                            item.type === "table" && (
                                <Col xs={12} className="table-accord">
                                    <Table striped bordered condensed hover>
                                        <thead>
                                            <tr>
                                                {item.fields.map((fieldName, i) =>
                                                    (
                                                        <th key={fieldName}>{capitalize(i18n(messages, item.labels[i]))}</th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                item.source.map((programmeItem) => {
                                                    const rowKey = item.fields.map(field => get(programmeItem, field)).join("|");
                                                    return (
                                                        <tr key={rowKey}>
                                                            {item.fields.map(field => (
                                                                <td key={field}>{getValueByField(field, get(programmeItem, field))}</td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                </Col>
                            )
                        }
                    </Row>
                ))
            }
            {/* Modal logements spécifiques */}
            <Tabou2LogementsSpecifiquesModal
                show={openedLogementsSpecGroupId !== null}
                onClose={() => setOpenedLogementsSpecGroupId(null)}
                logementsSpecifiques={getLogementsSpecifiques().find(g => g.id === openedLogementsSpecGroupId) || null}
                allowChange={allowChange}
                onChange={(groupId, updatedLogements) => updateLogementsSpecifiques(groupId, updatedLogements)}
                i18n={i18n}
                messages={messages}
            />
        </Grid>
    );
};

export default memo(Tabou2ProgHabitatAccord, avoidReRender);
