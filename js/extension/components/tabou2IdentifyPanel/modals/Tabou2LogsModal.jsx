import React, {useState, useEffect, useRef} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { isEqual, find, maxBy, omit, isEmpty } from 'lodash';
import { LOG_SCHEMA } from '@js/extension/constants';
import Message from "@mapstore/components/I18N/Message";
import Tabou2LogsTable from './Tabou2LogsTable';

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
            setLogs(props.events);
        }
    }, [props.events]);
    useEffect(() => {
        setLogs(props.events);
    }, [props.eventsId]);
    // force to refresh
    useEffect(() => {
        return;
    }, [logs, sortField]);

    // save log
    const saveEvent = (log) => {
        // call action to add log
        if (!props.events.map(e => e.id).includes(log.id)) {
            // new
            props.addEvent(omit(log, ["new", "edit", "id"]));
        } else {
            props.changeEvent(omit(log, ["new", "edit"]));
        }
        disabledAdd.current = false;
        editionActivate.current = false;
        setLogs([...logs.filter(lo => lo.id !== log.id && !log.new)]);
    };

    // create a new log - allow to pass some default params
    const insertNewLog = (params) => {
        setLogs([...logs, {...LOG_SCHEMA, ...params}]);
        disabledAdd.current = true;
        editionActivate.current = true;

    };

    // cancel log modifications
    const cancelChange = (log) => {
        if (isEmpty(log)) return;
        setLogs([...logs.filter(lo => lo.id !== log.id), props.events.filter(lo => lo.id === log.id)[0]]);
        disabledAdd.current = false;
        editionActivate.current = false;
    };

    // delete a log
    const deleteLog = (log) => {
        setLogs([...logs.filter(lo => lo.id !== log.id)]);
        editionActivate.current = false;
        disabledAdd.current = false;
        if (!log.new) props.deleteEvent(log);
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
        onClick: () => insertNewLog({id: isEmpty(logs) ? 1 : maxBy(logs, "id")?.id + 1, eventDate: new Date().toISOString()})
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
            <Tabou2LogsTable
                editionActivate={editionActivate}
                disabledAdd={disabledAdd}
                deleteLog={deleteLog}
                logs={logs}
                readOnly={readOnly}
                sortField={sortField}
                changeSort={changeSort}
                saveEvent={saveEvent}
                cancelChange={cancelChange}
                {...props}
            />
        </ResizableModal>
    );
}
