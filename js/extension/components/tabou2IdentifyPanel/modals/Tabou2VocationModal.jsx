import React, { useState, useEffect } from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import { DropdownList } from 'react-widgets';
import { Col, Tabs, Tab } from 'react-bootstrap';
import "@js/extension/css/vocation.css";
import Activites from "../../form/vocations/activites/Activites";
import { isEqual } from "lodash";
export default function Tabou2VocationModal({
    operation,
    opened,
    close,
    update,
    typesContribution,
    typesProgrammation
}) {
    const vocations = [
        "Mixte",
        "Activités",
        "Habitat"
    ];

    const [vocation, setVocation] = useState(vocations[0]);
    const [newOperation, setNewOperation] = useState(operation);
    const propsTab = {
        operation: operation,
        update: setNewOperation,
        typesContribution: typesContribution,
        values: newOperation,
        setValues: setNewOperation,
        typesProgrammation: typesProgrammation,

    };
    return (
        <ResizableModal
            title={<Message msgId="tabou2.vocation.title" />}
            bodyClassName="ms-flex"
            show={opened}
            showClose
            buttons={[
                {
                    text: "Retour à la fiche",
                    onClick: () => {
                        if (!isEqual(newOperation, operation)) {
                            update(newOperation);
                        }
                        close();
                    }
                },
                {
                    text: "Réinitialiser",
                    onClick: () => setNewOperation(operation)
                }
            ]}
            onClose={() => close()}
            size="lg">
            <Col xs={12}>
                <div className="voc-selector">
                    <label>Voir les attributs de la vocation : </label>
                    <DropdownList
                        style={{width: "30%"}}
                        data={vocations}
                        value = {vocation}
                        onSelect={val => setVocation(val)}
                    />
                </div>
            </Col>
            <Col xs={12}>
                <Tabs defaultActiveKey={1} id="vocation-tabs" className="voc-tabs">
                    <Tab
                        className="voc-tab-select"
                        key={1} eventKey={1} title={vocation}
                    >
                        {vocation === "Activités" && (<Activites {...propsTab}/>)}
                    </Tab>
                </Tabs>
            </Col>
        </ResizableModal>
    );
}
