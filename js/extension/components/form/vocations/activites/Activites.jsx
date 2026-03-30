import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import {Col, Tabs, Tab} from 'react-bootstrap';
import AutreProgrammation from '../AutreProgrammation';
import ContributionPaddOap from '../ContributionPaddOap';
import CompositionProgrammation from '../CompositionProgrammation';
import ProgrammationActivite from './ProgrammationActivite';

export default function Activites({...props}) {
    const tabs = [
        {key: "composition", title: <Message msgId="tabou2.vocation.tabComposition"/>, component: <CompositionProgrammation {...subFormProps}/>},
        {key: "activity", title: <Message msgId="tabou2.vocation.tabActivity"/>, component: <ProgrammationActivite {...subFormProps}/>},
        {key: "otherProg", title: <Message msgId="tabou2.vocation.tabOtherProg"/>, component: <AutreProgrammation {...subFormProps}/>},
        {key: "contrib", title: <Message msgId="tabou2.vocation.tabContrib"/>, component: <ContributionPaddOap {...subFormProps}/>}
    ];

    const subFormProps = {
        ...props,
        owner: {isReferent: true}
    };
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
