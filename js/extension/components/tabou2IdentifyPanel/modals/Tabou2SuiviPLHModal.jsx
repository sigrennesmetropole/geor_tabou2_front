import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import { DropdownList } from 'react-widgets';
import { Col, Row, Button } from 'react-bootstrap';
import "@js/extension/css/suiviPLH.css";
import Tabou2Information from "@js/extension/components/common/Tabou2Information";
import Loader from "@mapstore/components/misc/Loader";
import {
    getTypesPLHAvailable,
    getPLHsProgramme,
    deletePLHProgramme,
    updatePLHProgramme,
    addPLHProgramme,
    getPLHProgramme,
    setPLHProgramme
} from "@js/extension/actions/tabou2";
import {
    selectPLHIsLoading,
    selectPLHProgramme,
    selectPLHsProgramme,
    selectTypesPLH
} from "@js/extension/selectors/tabou2";

function Tabou2SuiviPLHModal({
    programme,
    opened,
    close,
    allowChange,
    i18n = () => { },
    messages,
    ...props
}) {
    const [selectedTypePLHToAdd, setSelectedTypePLHToAdd] = useState({});
    const [addMode, setAddMode] = useState(false);
    const [isTreeEditable, setIsTreeEditable] = useState(false);
    const [valuesPLH, setValuesPLH] = useState({});

    const extractValues = (node, values = []) => {
        if (node.typeAttributPLH === "VALUE") {
            values.push({ id: node.id, value: node.value || "" });
        }
        if (node.fils && node.fils.length > 0) {
            node.fils.forEach(child => extractValues(child, values));
        }
        return values;
    };

    useEffect(() => {
        props.getTypesPLHAvailable();
    }, []);

    useEffect(() => {
        props.getPLHsProgramme();
    }, []);

    useEffect(() => {
        setValuesPLH(extractValues(props.plhProgramme));
    }, [props.plhProgramme]);

    const handleChangeSelectedTypePLH = (typePLH) => {
        props.getPLHProgramme(typePLH.id);
    };

    const updateTreeValues = (node, valuesMap) => {
        // Vérifier si l'objet est défini
        if (!node) return null;

        // Vérifier si l'id du nœud est dans valuesMap, et mettre à jour sa valeur si c'est le cas
        return {
            ...node,
            value: valuesMap[node.id] !== undefined ? valuesMap[node.id] : node.value,
            fils: node.fils?.map(child => updateTreeValues(child, valuesMap)) || []
        };
    };


    const handleUpdateTypePLH = () => {
        const upatedPLH = updateTreeValues({...props.plhProgramme}, Object.fromEntries(valuesPLH.map(v => [v.id, v.value])));
        props.updatePLHProgramme(upatedPLH);
    };

    const handleInputChange = (id, newValue) => {
        if (valuesPLH.length === 0) {
            setValuesPLH(extractValues(props.plhProgramme));
        }
        setValuesPLH(prevValues =>
            prevValues.map(item =>
                item.id === id ? {...item, value: newValue} : item
            )
        );
    };

    const handleAddPLHProgramme = (idTypePLH) => {
        props.addPLHProgramme(idTypePLH);
    };

    const closing = () => {
        if (!isTreeEditable) {
            props.setPLHProgramme({});
            setValuesPLH([]);
            setAddMode(false);
            close();
        }
    };
    return (
        <>
            <ResizableModal
                title={<Message msgId="tabou2.suiviPLH.title" />}
                bodyClassName="ms-flex"
                show={opened}
                showClose={!isTreeEditable}
                onClose={() => closing()}
                size="lg">
                {!addMode ?
                    <div>
                        {allowChange === true && <Row>
                            <Col xs={9}></Col>
                            <Col xs={3} style={{marginTop: "20px"}}>
                                <Button
                                    tooltip="Ajouter PLH"
                                    className="suivi-plh-add-btn"
                                    bsStyle="primary"
                                    onClick={() => setAddMode(true)
                                    }
                                >
                                    {i18n(messages, "tabou2.suiviPLH.add-btn")}
                                </Button>
                            </Col>
                        </Row>}
                        <Row>
                            <Col xs={9}>
                                <div className="suivi-plh-selector">
                                    <label><Message msgId="tabou2.suiviPLH.selectPLH" /></label>
                                    <DropdownList
                                        style={{ width: "45%" }}
                                        data={props.plhsProgramme}
                                        dataKey="id"
                                        textField="libelle"
                                        onSelect={type => handleChangeSelectedTypePLH(type)}
                                        placeholder="Choisir un typePLH..."
                                        disabled={isTreeEditable === true}
                                        itemComponent={(elements) => {
                                            const { item, ...rest } = elements;

                                            return (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} {...rest}>
                                                    <span>{item.libelle}</span>
                                                    {item.id !== props.plhProgramme.id && allowChange === true && <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Empêche la propagation de l'événement pour éviter de sélectionner l'élément en même temps
                                                            props.deletePLHProgramme(item.id);
                                                        }}
                                                        style={{background: "none", border: "none", cursor: "pointer"}}
                                                    >
                                                        🗑️
                                                    </button>}
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col xs={3} style={{marginTop: "25px"}}>
                                <>
                                    {isTreeEditable === false && !!props.plhProgramme?.libelle && allowChange === true && <Button
                                        tooltip="Editer PLH"
                                        className="suivi-plh-edit-btn"
                                        bsStyle="primary"
                                        onClick={() => {
                                            setIsTreeEditable(true);
                                        }
                                        }
                                    >
                                        {i18n(messages, "tabou2.suiviPLH.edit-btn")}
                                    </Button>}
                                </>

                            </Col>
                        </Row>
                        {props.isLoading === false ? <Row>{props.plhProgramme?.libelle && <TreeNode
                            node={props.plhProgramme} values={valuesPLH} isEditable={isTreeEditable} onChange={handleInputChange}/>}</Row>
                            :
                            <>
                                <Tabou2Information
                                    isVisible={props.isLoading}
                                    style={{ margin: "5% auto" }}
                                    glyph=""
                                    message="Affichage du type PLH du programme"
                                    title="Chargement..."
                                />
                                <Loader size={20} style={{ padding: 2, margin: "auto", display: "flex" }} />
                            </>
                        }
                        {isTreeEditable === true &&
                            <Row style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Col xs={5} style={{display: "flex", justifyContent: "space-around"}}>
                                    <Button
                                        tooltip="Modifier PLH"
                                        className="suivi-plh-add-btn"
                                        onClick={handleUpdateTypePLH}
                                    >
                                        {i18n(messages, "tabou2.suiviPLH.validate-btn")}
                                    </Button>
                                    <Button
                                        tooltip="Annuler"
                                        className="suivi-plh-cancel-btn"
                                        onClick={() => {
                                            setIsTreeEditable(false);
                                            setValuesPLH(extractValues(props.plhProgramme));
                                        }
                                        }
                                    >
                                        Annuler
                                    </Button>
                                </Col>
                            </Row>}
                    </div> :
                    <>
                        { props.isLoading === false ?
                            <div>
                                <Row>
                                    <Col xs={12}>
                                        <div className="suivi-plh-selector">
                                            <label><Message msgId="tabou2.suiviPLH.selectPLH" /></label>
                                            <DropdownList
                                                style={{ width: "45%" }}
                                                data={props.typesPLH}
                                                dataKey="id"
                                                textField="libelle"
                                                onSelect={type => setSelectedTypePLHToAdd(type)}
                                                placeholder="Choisir un typePLH..."
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{display: "flex", justifyContent: "center"}}>
                                    <Col xs={6} style={{display: "flex", justifyContent: "space-around"}}>
                                        {selectedTypePLHToAdd?.libelle && <Button onClick={() => handleAddPLHProgramme(selectedTypePLHToAdd.id)}>Ajouter</Button>}
                                        <Button onClick={() => {
                                            setAddMode(false)
                                            setSelectedTypePLHToAdd({})
                                        }}>{i18n(messages, "tabou2.suiviPLH.cancel-btn")}</Button>
                                    </Col>
                                </Row>
                            </div>
                            :
                            <>
                                <Tabou2Information
                                    isVisible={props.isLoading}
                                    style={{ margin: "5% auto" }}
                                    glyph=""
                                    message="Ajout de type PLH au programme"
                                    title="Chargement..."
                                />
                                <Loader size={20} style={{ padding: 2, margin: "auto", display: "flex" }} />
                            </>
                        }
                    </>
                }
            </ResizableModal>
        </>
    );
}

// Pour afficher l'arbre de champs imbriqués
const TreeNode = ({ node, values, isEditable, onChange }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div style={{ marginLeft: "50px", borderLeft: "2px solid #ddd", paddingLeft: "10px" }}>
            {/* Affichage des catégories avec icône pour plier/déplier */}
            {node.typeAttributPLH === "CATEGORY" ? (
                <div style={{ cursor: "pointer", fontWeight: "bold", marginBottom: "5px" }} onClick={handleToggle}>
                    {isOpen ? "🔽" : "▶"} {node.libelle}
                </div>
            ) : (
                /* Affichage des valeurs avec un input modifiable */
                <label>
                    {node.libelle}:
                    <input
                        type="text"
                        value={values.find(item => item.id === node.id).value}
                        onChange={(e) => onChange(node.id, e.target.value)}
                        style={{ marginLeft: "5px" }}
                        disabled={!isEditable}
                    />
                    <span>{isEditable}</span>
                </label>
            )}

            {/* Affichage récursif des enfants si la catégorie est ouverte */}
            {isOpen && node.fils && node.fils.length > 0 && (
                <div>
                    {node.fils.map((child) => (
                        <TreeNode key={child.id} node={child} values={values} isEditable={isEditable} onChange={onChange} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default connect(state => ({
    // selectors
    typesPLH: selectTypesPLH(state),
    plhsProgramme: selectPLHsProgramme(state),
    plhProgramme: selectPLHProgramme(state),
    isLoading: selectPLHIsLoading(state)
}), {
    // actions
    getTypesPLHAvailable: getTypesPLHAvailable,
    getPLHsProgramme: getPLHsProgramme,
    deletePLHProgramme: deletePLHProgramme,
    updatePLHProgramme: updatePLHProgramme,
    addPLHProgramme: addPLHProgramme,
    getPLHProgramme: getPLHProgramme,
    setPLHProgramme: setPLHProgramme
})(Tabou2SuiviPLHModal);
