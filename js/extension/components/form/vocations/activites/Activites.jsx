import React from 'react';
import Message from "@mapstore/components/I18N/Message";
import { Col, Tabs, Tab, Row } from 'react-bootstrap';
import AutreProgrammation from './AutreProgrammation';
import ContributionPaddOap from './ContributionPaddOap';
import CompositionProgrammation from './CompositionProgrammation';
import ProgrammationLogements from './ProgrammationLogements';

export default function Activites({ operation, update = () => { }, close = () => { } }) {
    /**
     * TODO:
     * - Dans l'epic de recup des données :
     *      1. appel GET pour récupérer tous les id infoProgrammation
     *      2. appel GET pour récupérer tous les id contributions
     */
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
    const subFormProps = {
        operation: operation,
        owner: { isReferent: true },
        update: update,
        close: close
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
