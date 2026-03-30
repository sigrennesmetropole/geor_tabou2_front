import React, {useEffect, useState, memo} from "react";
import {isEmpty, isEqual, pick, has} from "lodash";
import {Col, Row, FormControl, Grid, ControlLabel} from "react-bootstrap";
import "@js/extension/css/identify.css";
import "@js/extension/css/tabou.css";
import Message from "@mapstore/components/I18N/Message";

const avoidReRender = (prevProps, nextProps) => isEqual(prevProps.initialItem, nextProps.initialItem);

const Tabou2AutreProgAccord = ({
    initialItem,
    programme,
    layer,
    authent,
    change = () => {
    },
    i18n = () => {
    },
    messages
}) => {
    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const [required, setRequired] = useState({});

    // Définition des 5 champs prévisionnels et 5 champs NextAds
    const getFields = () => [
        // Champs prévisionnels (éditables)
        {
            name: "surfaceBureaux",
            label: "tabou2.identify.accordions.autreProgFields.bureaux",
            field: "surfaceBureaux",
            layers: ["layerPA"],
            type: "number",
            source: has(values, "surfaceBureaux") ? values : programme.programmation,
            readOnly: false
        },
        {
            name: "surfaceBureauxNextAds",
            label: "tabou2.identify.accordions.autreProgFields.bureauxNextAds",
            field: "surfaceBureaux",
            layers: ["layerPA"],
            type: "number",
            source: programme.programmationNextAds,
            readOnly: true
        },
        {
            name: "surfaceCommerces",
            label: "tabou2.identify.accordions.autreProgFields.commerces",
            field: "surfaceCommerces",
            layers: ["layerPA"],
            type: "number",
            source: has(values, "surfaceCommerces") ? values : programme.programmation,
            readOnly: false
        },
        {
            name: "surfaceCommercesNextAds",
            label: "tabou2.identify.accordions.autreProgFields.commercesNextAds",
            field: "surfaceCommerces",
            layers: ["layerPA"],
            type: "number",
            source: programme.programmationNextAds,
            readOnly: true
        },
        {
            name: "surfaceIndustrie",
            label: "tabou2.identify.accordions.autreProgFields.industrielArtisanat",
            field: "surfaceIndustrie",
            layers: ["layerPA"],
            type: "number",
            source: has(values, "surfaceIndustrie") ? values : programme.programmation,
            readOnly: false
        },
        {
            name: "surfaceIndustrieNextAds",
            label: "tabou2.identify.accordions.autreProgFields.industrielArtisanatNextAds",
            field: "surfaceIndustrie",
            layers: ["layerPA"],
            type: "number",
            source: programme.programmationNextAds,
            readOnly: true
        },
        {
            name: "surfaceEquipements",
            label: "tabou2.identify.accordions.autreProgFields.equipements",
            field: "surfaceEquipements",
            layers: ["layerPA"],
            type: "number",
            source: has(values, "surfaceEquipements") ? values : programme.programmation,
            readOnly: false
        },
        {
            name: "surfaceEquipementsNextAds",
            label: "tabou2.identify.accordions.autreProgFields.equipementsNextAds",
            field: "surfaceEquipements",
            layers: ["layerPA"],
            type: "number",
            source: programme.programmationNextAds,
            readOnly: true
        },
        {
            name: "surfaceAutres",
            label: "tabou2.identify.accordions.autreProgFields.autresActivites",
            field: "surfaceAutres",
            layers: ["layerPA"],
            type: "number",
            source: has(values, "surfaceAutres") ? values : programme.programmation,
            readOnly: false
        },
        {
            name: "surfaceAutresNextAds",
            label: "tabou2.identify.accordions.autreProgFields.autresActivitesNextAds",
            field: "surfaceAutres",
            layers: ["layerPA"],
            type: "number",
            source: programme.programmationNextAds,
            readOnly: true
        }
    ]
    .filter(el => el?.layers?.includes(layer) || !el?.layers)
    .map((el, index) => ({...el, key: `${el.name}-${index}`}));

    // hooks
    useEffect(() => {
        const calculFields = getFields();
        const mandatoryFields = calculFields.filter(f => f.require).map(f => f.name);
        setFields(calculFields);
        setRequired(mandatoryFields);
        // Synchronise le state local uniquement si l'ID du programme change
        if ((initialItem?.id ?? programme?.id) !== values?.id) {
            setValues(initialItem ?? programme.programmation ?? {});
        }
    }, [initialItem?.id, programme?.id]);

    // get value for a specific item
    const getValue = (item) => {
        // Pour les champs éditables, on affiche la saisie en cours ou la valeur API
        if (!item.readOnly) {
            const val = values[item.name] ?? programme.programmation?.[item.name];
            return val === null || typeof val === 'undefined' ? "" : val;
        }
        // Pour les champs NextAds, on lit dans programmationNextAds
        if (item.readOnly && programme.programmationNextAds) {
            const val = programme.programmationNextAds[item.field];
            return val === null || typeof val === 'undefined' ? "" : val;
        }
        return "";
    };

    // Liste des champs attendus dans programmation
    const programmationFields = [
        "surfaceBureaux",
        "surfaceCommerces",
        "surfaceIndustrie",
        "surfaceEquipements",
        "surfaceAutres"
    ];

    const changeInfos = (item) => {
        // On garde la chaîne vide dans l'état local pour permettre la suppression en temps réel
        const newValues = {...values, ...item};
        setValues(newValues);

        const mergedValues = {
            ...programme.programmation,
            ...newValues
        };

        // Conversion pour l'API : null si vide, number si possible
        let newProgrammation = pick(mergedValues, programmationFields);
        newProgrammation = Object.fromEntries(
            Object.entries(newProgrammation).map(([k, v]) => {
                if (v === "" || v === null || typeof v === 'undefined') return [k, null];
                if (!isNaN(Number(v)) && v !== true && v !== false) return [k, Number(v)];
                return [k, v];
            })
        );
        change({...programme, programmation: newProgrammation}, pick(newProgrammation, required));
    };

    const allowChange = authent.isContrib || authent.isReferent;

    // Grouper les champs par paires (éditable + lecture seule)
    const getFieldPairs = () => {
        const allFields = fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1);
        const pairs = [];
        for (let i = 0; i < allFields.length; i += 2) {
            pairs.push({
                editable: allFields[i],
                readOnly: allFields[i + 1]
            });
        }
        return pairs;
    };

    return (
        <Grid style={{width: "100%"}} className={""}>
            {/* Ligne d'en-tête colonnes Prévisionnel et NextAds */}
            <Row className="autre-prog-header">
                <Col xs={4}/>
                <Col xs={4} style={{textAlign: "center"}}>
                        (Prévisionnel, terrain)
                </Col>
                <Col xs={4} style={{textAlign: "center"}}>
                        ADS (logiciel métier)
                </Col>
            </Row>
            {
                getFieldPairs().map((pair, index) => (
                    <Row key={pair.key} className="autre-prog-row">
                        {/* Label de la ligne - 1/3 de la largeur */}
                        <Col xs={4}>
                            <ControlLabel style={pair.labelStyle || {}}>
                                <Message msgId={pair.editable.label}/>
                            </ControlLabel>
                        </Col>

                        {/* Champ éditable - 1/3 de la largeur */}
                        <Col xs={4}>
                            <FormControl
                                type={pair.editable.type}
                                step="any"
                                placeholder={i18n(messages, "tabou2.identify.accordions.autreProgFields.placeholder")}
                                value={getValue(pair.editable)}
                                readOnly={!allowChange || pair.editable.readOnly}
                                onChange={(v) => changeInfos({[pair.editable.name]: v.target.value})}
                                className="number-input-no-spinner"
                            />
                        </Col>

                        {/* Champ lecture seule NextADS - 1/3 de la largeur */}
                        <Col xs={4}>
                            <FormControl
                                type={pair.readOnly.type}
                                step="any"
                                placeholder={i18n(messages, "tabou2.identify.accordions.autreProgFields.placeholder")}
                                value={getValue(pair.readOnly) ?? ""}
                                readOnly
                                disabled
                                className="readonly-field number-input-no-spinner"
                            />
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
};

export default memo(Tabou2AutreProgAccord, avoidReRender);
