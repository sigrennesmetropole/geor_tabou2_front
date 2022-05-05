import React, { useState } from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import { DropdownList } from 'react-widgets';
import { Col, Tabs, Tab } from 'react-bootstrap';
import "@js/extension/css/vocation.css";
import Activites from "../../form/vocations/activites/Activites";
import Habitat from "../../form/vocations/habitat/Habitat";
import Mixte from "../../form/vocations/mixte/Mixte";
import { isEqual } from "lodash";
export default function Tabou2VocationModal({
    operation,
    opened,
    close,
    update,
    typesContribution,
    typesProgrammation,
    typesVocation,
    allowChange
}) {
    const showCodeVocations = ["ACTIVITE", "HABITAT", "MIXTE"];

    const [vocation, setVocation] = useState(operation.vocation);
    const [newOperation, setNewOperation] = useState(operation);
    const propsTab = {
        operation: operation,
        update: setNewOperation,
        typesContribution: typesContribution,
        values: newOperation,
        setValues: setNewOperation,
        typesProgrammation: typesProgrammation,
        allowChange: allowChange
    };

    const changeVocation = (v) => {
        setVocation(v);
        setNewOperation({ ...newOperation, vocation: v });
    }

    return (
        <ResizableModal
            title={<Message msgId="tabou2.vocation.title" />}
            bodyClassName="ms-flex"
            show={opened}
            showClose
            buttons={[
                {
                    text: "Retour à la fiche",
                    style: {marginRight: "5px"},
                    onClick: () => {
                        if (!isEqual(newOperation, operation)) {
                            update(newOperation);
                        }
                        close();
                    }
                },
                {
                    text: "Réinitialiser",
                    visible: allowChange,
                    onClick: () => setNewOperation(operation)
                }
            ]}
            onClose={() => close()}
            size="lg">
            <Col xs={12}>
                <div className="voc-selector">
                    <label>Choisir une vocation : </label>
                    <DropdownList
                        style={{width: "30%"}}
                        data={typesVocation.filter(v => showCodeVocations.includes(v.code))}
                        dataKey="code"
                        textField="libelle"
                        defaultValue={newOperation.vocation.libelle}
                        onSelect={val => changeVocation(val)}
                    />
                </div>
            </Col>
            <Col xs={12}>
                <Tabs defaultActiveKey={1} id="vocation-tabs" className="voc-tabs">
                    <Tab
                        className="voc-tab-select"
                        key={1} eventKey={1} title={vocation.libelle}
                    >
                        {vocation.code === "ACTIVITE" && (<Activites {...propsTab} />)}
                        {vocation.code === "HABITAT" && (<Habitat {...propsTab} />)}
                        {vocation.code === "MIXTE" && (<Mixte {...propsTab}/>)}
                    </Tab>
                </Tabs>
            </Col>
        </ResizableModal>
    );
}
