import React from 'react';
import { connect } from 'react-redux';
import { Card, PanelGroup, Panel } from 'react-bootstrap';
import {
    currentFeatureSelector
} from '@mapstore/selectors/mapInfo';

function Tabou2IdentifyContent({
    currentFeature,
    defaultActiveKey = [1],
}) {
    const tabs = [1, 2, 3];

    return (
        <>
            {
                tabs.map(tab => 
                        <PanelGroup key={tab} defaultActiveKey={defaultActiveKey.indexOf(tab) > -1 ? tab : null} accordion>
                            <Panel
                                header={(
                                    <label>
                                        Grouppe d'attribut {tab}
                                    </label>
                                )}
                                eventKey={tab}>
                                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
                            </Panel>
                        </PanelGroup>
                )
            }
        </>

    )
}

export default connect((state) => ({
    currentFeature: currentFeatureSelector
}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2IdentifyContent);