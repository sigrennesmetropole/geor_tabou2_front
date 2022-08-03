import React, { useState } from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import { DropdownList } from 'react-widgets';
import { Col } from 'react-bootstrap';
import "@js/extension/css/vocation.css";
import Activites from "../../form/vocations/activites/Activites";
import Habitat from "../../form/vocations/habitat/Habitat";
import Mixte from "../../form/vocations/mixte/Mixte";
export default function Tabou2VocationModal({
    operation,
    initialItems,
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
    const [vocation, setVocation] = useState(initialItems.vocation || {});
    const fieldsToFollow = [
        "contributions",
        "operation",
        "vocation",
        "plui",
        "nbLogementsPrevu",
        "informationsProgrammation",
        "vocationZa",
        "plh",
        "scot",
        "densiteScot",
        "contributions"
    ];
    const [newOperation, setNewOperation] = useState(Object.assign({}, ...fieldsToFollow.map(f => ({[f]: initialItems[f]}))));

    let propsTab = {
        operation: operation,
        update: update,
        typesContribution: typesContribution,
        values: newOperation,
        setValues: (t) => {
            const newOA = { ...newOperation, ...t };
            setNewOperation({...newOA});
        },
        typesProgrammation: typesProgrammation,
        allowChange: allowChange,
        i18n: i18n,
        messages: messages
    };

    const changeVocation = (v) => {
        setVocation(v);
        update({ vocation: v });
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
                        update(newOperation);
                        close();
                    }
                },
                {
                    text: <Message msgId="tabou2.vocation.reset" />,
                    visible: allowChange,
                    onClick: () => setNewOperation(initialItems)
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
                        defaultValue={{...initialItems, ...newOperation}?.vocation?.libelle || ""}
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
