import React, {useState, useEffect} from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import { Grid, FormGroup, Checkbox, Col, Button, Table, Glyphicon, Row, ControlLabel } from 'react-bootstrap';
import { isEqual } from 'lodash';

export default function Tabou2LogsModal({
    visible,
    featureId,
    onClick = () => {},
    ...props
}) {

    const [logs, setLogs] = useState([]);
    
    useEffect(() => {
        if (!isEqual(logs, props.events)) {
            setLogs(props.events);
        }
    }, [props.events])
    
    const refreshLogs = () => {
        // call API
        setLogs(props.events);
    }

    const addLog = (newLog) => {
        //setLogs([...logs, newLog]);
        console.log(props);
        // call action to add log
    }

    const deleteLog = (id) => {
        //setLogs({...logs.filter(log => log.id !== id)});
        console.log(id);
        // call action to delete log
    }

    const buttons = [{
        text: "",
        bsSize: "lg",
        bsStyle: 'light',
        style: {
            marginRight: "10px"
        },
        tooltip: "Raffraîchir la liste",
        glyph: "repeat",
        onClick: () => refreshLogs()
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "plus",
        style: {
            color: "white", backgroundColor: "rgb(40,167,69)",
            borderColor: "rgb(40,167,69)"
        },
        tooltip: "Créer un événement",
        onClick: () => addLog()
    }];
    const editable = true;
    return (
        <ResizableModal
            title={"Journal des événements"}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            buttons={editable ? buttons : []}
            onClose={onClick}
            size="lg">
                <div>
                    <Grid fluid Style={{overflow: "auto"}}>
                        <Row>
                            <Col xs={12}>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th class="col-xs-2">Système</th>
                                            <th class="col-xs-2">Date</th>
                                            <th class="col-xs-2">Type</th>
                                            <th class="col-xs-2">Auteur</th>
                                            <th>Note</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{overflow: "auto"}}>
                                        {
                                            logs.map( log => (
                                                <>
                                                <tr>
                                                    <td>
                                                        <Checkbox
                                                            checked={log.systeme}
                                                            disabled
                                                            style={{marginTop:"0px"}}
                                                        />
                                                    </td>
                                                    <td>
                                                        {
                                                            new Date(log.eventDate).toLocaleDateString()
                                                        }
                                                    </td>    
                                                    <td>
                                                        {log.idType}
                                                    </td>
                                                    <td>
                                                        {log.modifUser}
                                                    </td>
                                                    <td>
                                                        {log.description}
                                                    </td>
                                                </tr>
                                                </>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </Grid>
            </div>
        </ResizableModal>
    );
}
