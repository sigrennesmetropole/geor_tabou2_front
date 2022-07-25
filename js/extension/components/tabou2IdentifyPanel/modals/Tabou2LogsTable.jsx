import React, { useState, useEffect } from 'react';
import { Table, Glyphicon, Grid, Row, Col, Checkbox, FormControl } from 'react-bootstrap';
import { orderBy, isEmpty, find, set, get } from 'lodash';
import ButtonRB from '@mapstore/components/misc/Button';
import Tabou2Combo from '@js/extension/components/form/Tabou2Combo';
import { getTypesEvents } from "@js/extension/api/requests";
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import Message from "@mapstore/components/I18N/Message";
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);
import { DateTimePicker } from 'react-widgets';

const Button = tooltip(ButtonRB);

export default function Tabou2LogsTable({
    editionActivate,
    disabledAdd,
    deleteLog = () => {},
    logs,
    readOnly,
    sortField,
    changeSort = () => {},
    cancelChange = () => {},
    ...props
}) {
    // Manage sort icon
    const getSortIcon = (name) => {
        let icon = "sort-by-attributes";
        let idx = sortField[0].indexOf(name);
        if (idx > -1) {
            icon = sortField[1][idx] === "asc" ? "sort-by-attributes" : "sort-by-attributes-alt";
        }
        return (<Glyphicon onClick={() => changeSort(name) } glyph={icon} style={{marginLeft: "5px"}}/>);
    };

    const [logInChange, setLogInChange] = useState({});
    const [allLogs, setAllLogs] = useState(logs);

    useEffect(() => {
        const readLogs = logs.filter(log => log.id !== logInChange?.id || log.new);
        if (logInChange?.id || editionActivate.current) {
            setAllLogs([...readLogs, { ...logInChange, edit: true }]);
        } else {
            setAllLogs(readLogs);
        }
        return;
    }, [logInChange?.id, editionActivate.current]);

    useEffect(() => {
        setAllLogs(logs);
        return;
    }, [logs.length]);

    const cancel = () => {
        cancelChange(logInChange);
        setLogInChange(null);
    };

    const modifyLog = (field, value) => {
        let copyLog = {
            ...logInChange, [field]: value
        };
        // avoid to change props.tiers directly and broke ref memory
        let logChanged = set(copyLog, field, value);
        setLogInChange(logChanged);
    };

    const saveEvent = () => {
        props.saveEvent(logInChange);
        setLogInChange(null);
    };

    // manage sort style
    const getStyle = (name) => {
        return find(sortField, [0, name]) ? {color: "darkcyan"} : {color: "rgb(51, 51, 51)"};
    };
    return (
        <Grid fluid style={{overflow: "auto", height: "100%"}}>
            <Row>
                <Col xs={12}>
                    <Table>
                        <thead>
                            <tr>
                                <th className="col-xs-1">
                                    <Message msgId="tabou2.logsModal.isSystem"/>
                                </th>
                                <th className="col-xs-2" style={getStyle("eventDate")}><Message msgId="tabou2.logsModal.date"/>
                                    {
                                        getSortIcon("eventDate")
                                    }
                                </th>
                                <th className="col-xs-2" style={getStyle("idType")}><Message msgId="tabou2.logsModal.type"/>
                                </th>
                                <th><Message msgId="tabou2.logsModal.note"/></th>
                                <th style={getStyle("modifUser")}><Message msgId="tabou2.logsModal.owner"/>
                                    {
                                        getSortIcon("modifUser")
                                    }
                                </th>
                                {
                                    readOnly ? null : (<th><Message msgId="tabou2.logsModal.actions"/></th>)
                                }
                            </tr>
                        </thead>
                        <tbody style={{overflow: "auto"}}>
                            {
                                orderBy(allLogs, sortField[0], sortField[1]).filter(log => !isEmpty(log)).map((log, i) => (
                                    <>
                                        <tr>
                                            <td>
                                                <Checkbox
                                                    style={{marginTop: "0px", textAlign: "center"}}
                                                    checked={log.systeme}
                                                />
                                            </td>
                                            <td>
                                                {
                                                    log.new || log.edit ? (<DateTimePicker
                                                        type="date"
                                                        dropDown
                                                        calendar
                                                        time={false}
                                                        culture="fr"
                                                        value={!isEmpty(logInChange) &&  logInChange?.eventDate ? new Date(logInChange?.eventDate) : new Date()}
                                                        format="DD/MM/YYYY"
                                                        onSelect={(e) => modifyLog("eventDate", new Date(e).toISOString(e))}
                                                        onChange={(t) => !t ? modifyLog("eventDate", null) : null}
                                                    />)
                                                        : new Date(log.eventDate).toLocaleDateString()
                                                }
                                            </td>
                                            <td>
                                                {
                                                    log.new || log.edit ? (
                                                        <Tabou2Combo
                                                            load={() => getTypesEvents()}
                                                            valueField={"id"}
                                                            defaultValue={get(logInChange, "typeEvenement.id")}
                                                            placeholder={props.i18n(props.messages, "tabou2.logsModal.typePlaceholder")}
                                                            filter="contains"
                                                            dropUp={i < 6 ? false : true}
                                                            textField={"libelle"}
                                                            onLoad={(r) => r?.elements || r}
                                                            onSelect={(t) => {
                                                                modifyLog("typeEvenement", t);
                                                            }}
                                                            onChange={(t) => !t ? modifyLog("typeEvenement", null) : null}
                                                            messages={{
                                                                emptyList: props.i18n(props.messages, "tabou2.emptyList"),
                                                                openCombobox: props.i18n(props.messages, "tabou2.displaylist")
                                                            }}
                                                        />
                                                    ) : log.typeEvenement?.libelle
                                                }
                                            </td>
                                            <td style={{
                                                wordBreak: "break-word",
                                                overflow: "auto",
                                                maxWidth: "200px"
                                            }}>
                                                {
                                                    log.new || log.edit ? (
                                                        <FormControl
                                                            type="text"
                                                            required="false"
                                                            value={logInChange?.description}
                                                            placeholder={props.i18n(props.messages, "tabou2.logsModal.notePlaceholder")}
                                                            onChange={(e) => {
                                                                modifyLog("description", e.target.value);
                                                            }}
                                                        />

                                                    ) : log.description
                                                }
                                            </td>
                                            <td>
                                                {
                                                    !log.new && `${log.modifUser} le ${moment(log.modifDate).format("DD/MM/YYYY")}`
                                                }
                                            </td>
                                            {
                                                readOnly ? null :
                                                    (<td>
                                                        {
                                                            (log.new || log.edit) ? (
                                                                <Button
                                                                    tooltip={props.i18n(props.messages, "tabou2.save")}
                                                                    disabled={!logInChange?.typeEvenement || isEmpty(logInChange?.typeEvenement) || !logInChange?.description}
                                                                    style={{ borderColor: "rgba(0,0,0,0)"}}
                                                                    onClick={() => saveEvent()}>
                                                                    <span style={{ color: "rgb(40, 167, 69)" }}>
                                                                        <Glyphicon glyph="ok"/>
                                                                    </span>
                                                                </Button>
                                                            ) : null
                                                        }
                                                        {
                                                            (log.edit && !log.new) ? (
                                                                <Button
                                                                    tooltip={props.i18n(props.messages, "tabou2.cancel")}
                                                                    style={{ borderColor: "rgba(0,0,0,0)"}}
                                                                    onClick={() => cancel(logInChange) }>
                                                                    <span style={{color: "rgb(229,0,0)"}}>
                                                                        <Glyphicon glyph="remove"/>
                                                                    </span>
                                                                </Button>
                                                            ) : null
                                                        }
                                                        {
                                                            (!log.systeme && !log.new && isEmpty(logInChange)) ? (
                                                                <Button
                                                                    tooltip={props.i18n(props.messages, "tabou2.change")}
                                                                    style={{ borderColor: "rgba(0,0,0,0)"}}
                                                                    onClick={() => setLogInChange(log) }>
                                                                    <span style={{color: "rgb(137,178,211)"}}>
                                                                        <Glyphicon glyph="pencil"/>
                                                                    </span>
                                                                </Button>
                                                            ) : null
                                                        }
                                                        {
                                                            ((log.new || isEmpty(logInChange)) && !log.systeme) ? (
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
    );

}
