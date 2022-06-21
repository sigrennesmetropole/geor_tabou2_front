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
    allowChange,
    i18n = () => { },
    messages
}) {
    const [vocation, setVocation] = useState(operation.vocation || {});
    const [newOperation, setNewOperation] = useState(operation);
    const propsTab = {
        operation: operation,
        update: setNewOperation,
        typesContribution: typesContribution,
        values: newOperation,
        setValues: setNewOperation,
        typesProgrammation: typesProgrammation,
        allowChange: allowChange,
        i18n: i18n,
        messages: messages
    };

    const changeVocation = (v) => {
        setVocation(v);
        setNewOperation({ ...newOperation, vocation: v });
    };

    return (
        <ResizableModal
            title={<Message msgId="tabou2.vocation.title" />}
            bodyClassName="ms-flex"
            show={opened}
            showClose
            buttons={[
                {
                    text: <Message msgId="tabou2.vocation.back" />,
                    style: {marginRight: "5px"},
                    onClick: () => {
                        if (!isEqual(newOperation, operation)) {
                            update(newOperation);
                        }
                        close();
                    }
                },
                {
                    text: <Message msgId="tabou2.vocation.reset" />,
                    visible: allowChange,
                    onClick: () => setNewOperation(operation)
                }
            ]}
            onClose={() => close()}
            size="lg">
            <Col xs={12}>
                <div className="voc-selector">
                    <label><Message msgId="tabou2.vocation.selectVoc" /></label>
                    <DropdownList
                        style={{width: "30%"}}
                        data={typesVocation}
                        dataKey="code"
                        textField="libelle"
                        defaultValue={newOperation?.vocation?.libelle || ""}
                        onSelect={val => changeVocation(val)}
                        placeholder="Choisir une vocation..."
                    />
                </div>
            </Col>
            <Col xs={12}>
                {vocation?.code === "ACTIVITE" && (<Activites {...propsTab} />)}
                {vocation?.code === "HABITAT" && (<Habitat {...propsTab} />)}
                {vocation?.code === "MIXTE" && (<Mixte {...propsTab}/>)}
            </Col>
        </ResizableModal>
    );
}
