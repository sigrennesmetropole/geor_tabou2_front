import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import { Col, Tabs, Tab } from 'react-bootstrap';
import AutreProgrammation from './AutreProgrammation';
import ContributionPaddOap from './ContributionPaddOap';
import CompositionProgrammation from './CompositionProgrammation';

export default function Mobilite({...props}) {
    const tabs = [
        <Message msgId="tabou2.vocation.tabComposition" />,
        <Message msgId="tabou2.vocation.tabOtherProg" />,
        <Message msgId="tabou2.vocation.tabContrib" />
    ];

    const subFormProps = {
        ... props,
        owner: { isReferent: true }
    };
    return (
        <Col xs={12}>
            <Tabs defaultActiveKey={1} id="vocation-mobilite-tabs">
                {
                    tabs.map((tab, i) => (
                        <Tab
                            key={i} eventKey={i} title={tab}
                        >
                            {i === 0 && (<CompositionProgrammation {...subFormProps}/>)}
                            {i === 1 && (<AutreProgrammation {...subFormProps}/>)}
                            {i === 2 && (<ContributionPaddOap {...subFormProps}/>)}
                        </Tab>
                    ))
                }
            </Tabs>
        </Col>
    );
}
