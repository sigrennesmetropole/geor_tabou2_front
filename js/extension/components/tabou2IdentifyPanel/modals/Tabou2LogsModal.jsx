import React, {useState, useEffect, useRef} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, Col, Table, Glyphicon, Row } from 'react-bootstrap';
import { isEqual, orderBy, find, isEmpty, maxBy, omit } from 'lodash';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Tabou2TextForm from '@ext/components/form/Tabou2TextForm';
import { LOG_SCHEMA } from '@ext/constants';
import { getTypesEvents } from "@ext/api/search";
import ButtonRB from '@mapstore/components/misc/Button';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import Message from "@mapstore/components/I18N/Message";

const Button = tooltip(ButtonRB);

export default function Tabou2LogsModal({
    visible,
    featureId,
    onClick = () => {},
    ...props
}) {
    const [logs, setLogs] = useState([]);
    const [sortField, setSortField] = useState([["eventDate", "id"], ["asc", "asc"]]);
    const disabledAdd = useRef(false);
    const editionActivate = useRef(false);
    // hooks to manage feature logs if refreshed
    useEffect(() => {
        if (!isEqual(logs, props.events)) {
            setLogs([...props.events, ...logs.filter(lo => !find(props.events, ["id", lo.id]))]);
        }
    }, [props.events]);
    // force to refresh
    useEffect(() => {
        return;
    }, [logs, sortField]);

    // manage change
    const changeLog = (log) => {
        if (log.edit) {
            editionActivate.current = true;
            disabledAdd.current = true;
        }
        setLogs([...logs.filter(lo => lo.id !== log.id), log]);
    };

    // save log
    const saveEvent = (log) => {
        // call action to add log
        let logToSend = omit(log, ["new", "id"]);
        if (!props.events.map(e => e.id).includes(log.id)) {
            // new
            props.addEvent(logToSend);
        } else {
            props.changeEvent(logToSend);
        }
        disabledAdd.current = false;
        editionActivate.current = false;
        if (log.new) {
            // delete log to get log from API with correct ID
            setLogs([...logs.filter(lo => lo.id !== log.id)]);
        }
    };

    // create a new log - allow to pass some default params
    const insertNewLog = (params) => {
        setLogs([...logs, {...LOG_SCHEMA, ...params}]);
        disabledAdd.current = true;
        editionActivate.current = true;

    };

    // cancel log modifications
    const cancelChange = (log) => {
        setLogs([...logs.filter(lo => lo.id !== log.id), props.events.filter(lo => lo.id === log.id)[0]]);
        disabledAdd.current = false;
        editionActivate.current = false;
    };

    // delete a log
    const deleteLog = (log) => {
        setLogs([...logs.filter(lo => lo.id !== log.id)]);
        editionActivate.current = false;
        disabledAdd.current = false;
        props.deleteEvent(log);
    };

    // Manage sort behavior
    const changeSort = (name) => {
        let order = "asc";
        let idx = sortField[0].indexOf(name);
        if (idx > -1) {
            order = sortField[1][idx] === "asc" ? "desc" : "asc";
        }
        setSortField([[name, "id"], [order, "asc"]]);
    };

    // Manage sort icon
    const getSortIcon = (name) => {
        let icon = "sort-by-attributes";
        let idx = sortField[0].indexOf(name);
        if (idx > -1) {
            icon = sortField[1][idx] === "asc" ? "sort-by-attributes" : "sort-by-attributes-alt";
        }
        return (<Glyphicon onClick={() => changeSort(name) } glyph={icon} style={{marginLeft: "5px"}}/>);
    };

    // TODO : fix this
    const getStyle = (name) => {
        return find(sortField, [0, name]) ? {color: "darkcyan"} : {color: "rgb(51, 51, 51)"};
    };

    // toolbar button
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
        tooltip: props.i18n(props.messages, "tabou2.logsModal.createEvent"),
        onClick: () => insertNewLog({id: maxBy(logs, "id").id + 1, eventDate: new Date().toISOString()})
    }];

    const readOnly = props?.authent?.isReferent || props?.authent?.isContrib ? false : true;
    return (
        <ResizableModal
            title={<Message msgId="tabou2.logsModal.title"/>}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            buttons={readOnly ? [] : buttons}
            onClose={onClick}
            size="lg">
            <Grid fluid style={{overflow: "auto", height: "100%"}}>
                <Row>
                    <Col xs={12}>
                        <Table>
                            <thead>
                                <tr>
                                    <th className="col-xs-2" style={getStyle("eventDate")}><Message msgId="tabou2.logsModal.date"/>
                                        {
                                            getSortIcon("eventDate")
                                        }
                                    </th>
                                    <th className="col-xs-2" style={getStyle("modifUser")}><Message msgId="tabou2.logsModal.owner"/>
                                        {
                                            getSortIcon("modifUser")
                                        }
                                    </th>
                                    <th className="col-xs-2" style={getStyle("idType")}><Message msgId="tabou2.logsModal.type"/>
                                    </th>
                                    <th><Message msgId="tabou2.logsModal.editor"/></th>
                                    <th><Message msgId="tabou2.logsModal.note"/></th>
                                    {
                                        readOnly ? null : (<th><Message msgId="tabou2.logsModal.actions"/></th>)
                                    }
                                </tr>
                            </thead>
                            <tbody style={{overflow: "auto"}}>
                                {
                                    orderBy(logs, sortField[0], sortField[1]).map((log, i) => (
                                        <>
                                            <tr>
                                                <td>
                                                    {
                                                        new Date(log.eventDate).toLocaleDateString()
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        !log.new ? log.createUser : props?.authent?.user || ""
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        log.new || log.edit ? (
                                                            <Tabou2Combo
                                                                load={() => getTypesEvents()}
                                                                valueField={"id"}
                                                                defaultValue={log.edit ? log.typeEvenement.id : null}
                                                                placeholder={props.i18n(props.messages, "tabou2.logsModal.typePlaceholder")}
                                                                filter="contains"
                                                                dropUp={i < 6 ? false : true}
                                                                textField={"libelle"}
                                                                onLoad={(r) => r?.elements || r}
                                                                onSelect={(t) => {
                                                                    changeLog({...log, typeEvenement: t});
                                                                }}
                                                                onChange={(t) => !t ? changeLog({...log, typeEvenement: null}) : null}
                                                                messages={{
                                                                    emptyList: props.i18n(props.messages, "tabou2.emptyList"),
                                                                    openCombobox: props.i18n(props.messages, "tabou2.displaylist")
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
                                                                value={log.description}
                                                                style={{borderRadius: "4px"}}
                                                                onChange={(e) => {
                                                                    changeLog({...log, description: e.target.value});
                                                                }}
                                                                placeholder={log.description || props.i18n(props.messages, "tabou2.logsModal.notePlaceholder")} />

                                                        ) : log.description
                                                    }
                                                </td>
                                                {
                                                    readOnly ? null :
                                                        (<td>
                                                            {log.new || log.edit ? (
                                                                <Button
                                                                    tooltip={props.i18n(props.messages, "tabou2.save")}
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
                                                                        tooltip={props.i18n(props.messages, "tabou2.cancel")}
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
                                                                        tooltip={props.i18n(props.messages, "tabou2.change")}
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
                                                                        tooltip={props.i18n(props.messages, "tabou2.delete")}
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
