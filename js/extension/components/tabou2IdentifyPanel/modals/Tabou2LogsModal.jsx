import React, {useState, useEffect, useRef} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, Col, Table, Glyphicon, Row } from 'react-bootstrap';
import { isEqual, orderBy, find, isEmpty } from 'lodash';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Tabou2TextForm from '@ext/components/form/Tabou2TextForm';
import { LOG_SCHEMA } from '@ext/constants';
import { getTypesEvents } from "@ext/api/search";

import ButtonRB from '@mapstore/components/misc/Button';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
const Button = tooltip(ButtonRB);

export default function Tabou2LogsModal({
    visible,
    featureId,
    onClick = () => {},
    ...props
}) {
    // TODO : edit UI and behaviors => don't forget to set edti = false for each feature on other clicked or exit

    const [logs, setLogs] = useState([]);
    const [sortField, setSortField] = useState([["eventDate", "id"], ["asc", "asc"]]);
    const disabledAdd = useRef(false);
    const editionActivate = useRef(false);
    
    useEffect(() => {
        if (!isEqual(logs, props.events)) {
            setLogs([...props.events, ...logs.filter(lo => !_.find(props.events,["id",lo.id]))]);
        }
    }, [props.events])

    useEffect(() => {
        return;
    }, [logs, sortField]);
    
    const refreshLogs = () => {
        // call API
        setLogs(props.events);
    }

    const saveEvent = (log) => {
        // call action to add log
        if (!props.events.map(e => e.id).includes(log.id)) {
            // new
            props.addEvent(log);
        } else {
            props.changeEvent(log);   
        }
        disabledAdd.current = false;
        editionActivate.current = false;
        changeLog({...log, edit: false});
        if (log.new) {
            // delete log to get log from API with correct ID
            setLogs([...logs.filter(lo => lo.id !== log.id)]);
        }
    }

    const insertNewLog = (params) => {
        setLogs([...logs, {...LOG_SCHEMA, ...params}]);
        disabledAdd.current = true;
        editionActivate.current = true;
        
    }

    const cancelChange = (log) => {
        setLogs([...logs.filter(lo => lo.id !== log.id), props.events.filter(lo => lo.id === log.id)[0]]);
        disabledAdd.current = false;
        editionActivate.current = false;
    }

    const changeLog = (log) => {
        if(log.edit) {
            editionActivate.current = true;
            disabledAdd.current = true;
        }
        setLogs([...logs.filter(lo => lo.id !== log.id), log]);
    }

    const deleteLog = (log) => {
        setLogs([...logs.filter(lo => lo.id !== log.id)]);
        editionActivate.current = false;
        disabledAdd.current = false;
        props.deleteEvent(log);
    }

    const getSortIcon = (name) => {
        let icon = "sort-by-attributes";
        let idx = sortField[0].indexOf(name);
        if (idx > -1) {
            icon = sortField[1][idx] === "asc" ? "sort-by-attributes" : "sort-by-attributes-alt";
        }
        return (<Glyphicon onClick={() => changeSort(name) } glyph={icon} style={{marginLeft:"5px"}}/>);
    }

    const changeSort = (name) => {
        let order = "asc";
        let idx = sortField[0].indexOf(name);
        if (idx > -1) {
            order = sortField[1][idx] === "asc" ? "desc" : "asc";
        }
        setSortField([[name, "id"], [order, "asc"]]);
    }

    const getStyle = (name) => {
        return find(sortField, [0, name]) ? {color:"darkcyan"} : {color: "rgb(51, 51, 51)"};
    }

    const buttons = [{
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "plus",
        style: {
            color: "white", backgroundColor: "rgb(40,167,69)",
            borderColor: "rgb(40,167,69)"
        },
        disabled: disabledAdd.current,
        tooltip: "Créer un événement",
        onClick: () => insertNewLog({id:0})
    }];

    const readOnly = props?.authent?.isReferent || props?.authent?.isContrib ? false : true;
    return (
        <ResizableModal
            title={"Journal des événements"}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            buttons={readOnly ? [] : buttons}
            onClose={onClick}
            size="lg">
                <Grid fluid style={{overflow: "auto", height:"100%"}}>
                    <Row>
                        <Col xs={12}>
                            <Table>
                                <thead>
                                    <tr>    
                                        <th className="col-xs-2" style={getStyle("eventDate")}>Date
                                            {
                                                getSortIcon("eventDate")
                                            }
                                        </th>
                                        <th className="col-xs-2" style={getStyle("modifUser")}>Auteur
                                            {
                                                getSortIcon("modifUser")
                                            }                        
                                        </th>
                                        <th className="col-xs-2" style={getStyle("idType")}>Type
                                            {
                                                getSortIcon("idType")
                                            }                        
                                        </th>
                                        <th>Modification</th>
                                        <th>Note</th>
                                        {
                                            readOnly ? null : (<th>Actions</th>)
                                        }
                                    </tr>
                                </thead>
                                <tbody style={{overflow: "auto"}}>
                                    {
                                        orderBy(logs, sortField[0], sortField[1]).map((log,i) => (
                                            <>
                                            <tr>
                                                <td>
                                                    {
                                                        !log.new ? new Date(log.eventDate).toLocaleDateString() : null
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        !log.new ? log.createUser : null
                                                    }
                                                </td>    
                                                <td>
                                                    {
                                                        log.new || log.edit ? (
                                                            <Tabou2Combo
                                                                load={() => getTypesEvents()}
                                                                valueField={"id"}
                                                                defaultValue={log.edit ? log.typeEvenement.id : null}
                                                                placeholder={"Type..."}
                                                                filter="contains"
                                                                dropUp={i < 6 ? false : true}
                                                                textField={"libelle"}
                                                                onLoad={(r) => r?.elements || r}
                                                                onSelect={(t) => {
                                                                    changeLog({...log, typeEvenement: t});
                                                                }}
                                                                onChange={(t) => !t ? changeLog({...log, typeEvenement: null}) : null}
                                                                messages={{
                                                                    emptyList: 'La liste est vide',
                                                                    openCombobox: 'Ouvrir la liste'
                                                                }}
                                                            />
                                                        ) : log.typeEvenement?.libelle
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        !log.new ? log.modifUser : null
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        log.new || log.edit ? (
                                                            <Tabou2TextForm
                                                                type="text"
                                                                defaultValue={log.description}
                                                                style={{borderRadius: "4px"}}
                                                                onBlur={(e) => changeLog({...log, description: e.target.value})}
                                                                placeholder={log.description || "Note..."} />
                                                            ) : log.description
                                                    }
                                                </td>
                                                {
                                                    readOnly ? null :
                                                    (<td>
                                                        {log.new || log.edit ? (
                                                            <Button
                                                                tooltip="Enregistrer"
                                                                disabled={!log.typeEvenement || isEmpty(log.typeEvenement) || !log.description}
                                                                style={{ borderColor: "rgba(0,0,0,0)"}}
                                                                onClick={() => saveEvent(log)}>
                                                                <span style={{ color: "rgb(40, 167, 69)" }}>
                                                                    <Glyphicon glyph="ok"/>
                                                                </span>
                                                            </Button>) : null
                                                        }
                                                        {
                                                            log.edit && !log.new ? (
                                                                <Button 
                                                                    tooltip="Annuler"
                                                                    style={{ borderColor: "rgba(0,0,0,0)"}}
                                                                    onClick={() => cancelChange(log) }>
                                                                    <span style={{color: "rgb(229,0,0)"}}>
                                                                        <Glyphicon glyph="remove"/>
                                                                    </span>
                                                                </Button>
                                                            ) : null
                                                        }
                                                        {
                                                            !log.new && !log.edit && !editionActivate.current ? (
                                                                <Button
                                                                tooltip="Modifier"
                                                                style={{ borderColor: "rgba(0,0,0,0)"}}
                                                                onClick={() => changeLog({...log, edit: true}) }>
                                                                <span style={{color: "rgb(137,178,211)"}}>
                                                                    <Glyphicon glyph="pencil"/>
                                                                </span>
                                                            </Button>
                                                            ) : null
                                                        }
                                                        {
                                                            log.new || !editionActivate.current && !log.systeme ? (
                                                                <Button
                                                                    tooltip="Supprimer"
                                                                    style={{ borderColor: "rgba(0,0,0,0)"}}
                                                                    onClick={() => deleteLog(log) }>
                                                                    <span style={{color: "rgb(229,0,0)"}}>
                                                                        <Glyphicon glyph="trash"/>
                                                                    </span>
                                                                </Button>
                                                            ) : null
                                                        }
                                                    </td>)
                                                }
                                            </tr>
                                            </>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Grid>
        </ResizableModal>
    );
}
