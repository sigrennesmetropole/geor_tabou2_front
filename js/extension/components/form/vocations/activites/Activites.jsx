import React, {useEffect} from 'react';
import Message from "@mapstore/components/I18N/Message";
import { Col, Tabs, Tab, Row } from 'react-bootstrap';
import AutreProgrammation from './AutreProgrammation';
import ContributionPaddOap from './ContributionPaddOap';
import CompositionProgrammation from './CompositionProgrammation';
import ProgrammationLogements from './ProgrammationLogements';

export default function Activites({...props}) {
    const tabs = [{
        key: 0,
        tab: "Composition"
    }, {
        key: 1,
        tab: "Logements"
    }, {
        key: 2,
        tab: "Autre programmation"
    }, {
        key: 3,
        tab: "Contribution PADD, OAP"
    }];
    // useEffect(() => {
    //     return;
    // }, [props.values]);

    const subFormProps = {
        ... props,
        owner: { isReferent: true }
    };
    return (
        <Row>
            <Col xs={12}>
                <Tabs defaultActiveKey={1} id="vocation-activite-tabs">
                    {
                        tabs.map((tab, i) => (
                            <Tab
                                key={i} eventKey={i} title={tab.tab}
                            >
                                {tab.key === 0 && (<CompositionProgrammation {...subFormProps}/>)}
                                {tab.key === 1 && (<ProgrammationLogements {...subFormProps}/>)}
                                {tab.key === 2 && (<AutreProgrammation {...subFormProps}/>)}
                                {tab.key === 3 && (<ContributionPaddOap {...subFormProps}/>)}
                            </Tab>
                        ))
                    }
                </Tabs>
            </Col>
        </Row>
    );
}
