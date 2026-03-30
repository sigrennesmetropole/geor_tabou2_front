import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import {Col, Tabs, Tab} from 'react-bootstrap';
import AutreProgrammation from '../AutreProgrammation';
import ContributionPaddOap from '../ContributionPaddOap';
import CompositionProgrammation from '../CompositionProgrammation';
import ProgrammationLogements from './ProgrammationLogements';

export default function Habitat({...props}) {
    const subFormProps = {
        ...props,
        owner: {isReferent: true}
    };
    const tabs = [
        {key: "composition", title: <Message msgId="tabou2.vocation.tabComposition"/>, component: <CompositionProgrammation {...subFormProps}/>},
        {key: "housing", title: <Message msgId="tabou2.vocation.tabHousing"/>, component: <ProgrammationLogements {...subFormProps}/>},
        {key: "otherProg", title: <Message msgId="tabou2.vocation.tabOtherProg"/>, component: <AutreProgrammation {...subFormProps}/>},
        {key: "contrib", title: <Message msgId="tabou2.vocation.tabContrib"/>, component: <ContributionPaddOap {...subFormProps}/>}
    ];

    return (
        <Col xs={12}>
            <Tabs defaultActiveKey={1} id="vocation-activite-tabs">
                {
                    tabs.map(({key, title, component}, i) => (
                        <Tab
                            key={key} eventKey={i} title={title}
                        >
                            {component}
                        </Tab>
                    ))
                }
            </Tabs>
        </Col>
    );
}
