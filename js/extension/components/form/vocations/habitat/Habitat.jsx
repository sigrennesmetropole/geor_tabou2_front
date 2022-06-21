import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import { Col, Tabs, Tab, Row } from 'react-bootstrap';
import AutreProgrammation from './AutreProgrammation';
import ContributionPaddOap from './ContributionPaddOap';
import CompositionProgrammation from './CompositionProgrammation';
import ProgrammationLogements from './ProgrammationLogements';

export default function Habitat({...props}) {
    const tabs = [
        <Message msgId="tabou2.vocation.tabComposition" />,
        <Message msgId="tabou2.vocation.tabHousing" />,
        <Message msgId="tabou2.vocation.tabOtherProg" />,
        <Message msgId="tabou2.vocation.tabContrib" />
    ];

    const subFormProps = {
        ... props,
        owner: { isReferent: true }
    };
    return (
        <Col xs={12}>
            <Tabs defaultActiveKey={1} id="vocation-activite-tabs">
                {
                    tabs.map((tab, i) => (
                        <Tab
                            key={i} eventKey={i} title={tab}
                        >
                            {i === 0 && (<CompositionProgrammation {...subFormProps}/>)}
                            {i === 1 && (<ProgrammationLogements {...subFormProps}/>)}
                            {i === 2 && (<AutreProgrammation {...subFormProps}/>)}
                            {i === 3 && (<ContributionPaddOap {...subFormProps}/>)}
                        </Tab>
                    ))
                }
            </Tabs>
        </Col>
    );
}
