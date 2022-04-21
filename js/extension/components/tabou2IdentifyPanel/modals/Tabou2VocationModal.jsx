import React, { useState } from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import { DropdownList } from 'react-widgets';
import { Col, Tabs, Tab } from 'react-bootstrap';
import "@js/extension/css/vocation.css";
export default function Tabou2VocationModal({
    opened,
    setOpened
}) {
    const vocations = [
        "Mixte",
        "Activités",
        "Habitat"
    ];
    const [vocation, setVocation] = useState(vocations[0]);
    return (
        <ResizableModal
            title={<Message msgId="tabou2.vocation.title" />}
            bodyClassName="ms-flex"
            show={opened}
            showClose
            buttons={[]}
            onClose={() => setOpened(false)}
            size="lg">
            <Col xs={12}>
                <div className="voc-selector">
                    <label>Vocations</label>
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
                        {vocation}
                    </Tab>
                </Tabs>
            </Col>
        </ResizableModal>
    );
}
