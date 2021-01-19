import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';

import DockablePanel from '@mapstore/components/misc/panels/DockablePanel';
import { toggleControl } from "@mapstore/actions/controls";

import Tabou2MainTabs from './Tabou2MainTabs';
import Tabou2MainToolContainer from './Tabou2MainToolContainer';
import { CONTROL_NAME } from '../../constants';


function Tabou2MainPanel({
    enabled,
    dockStyle = {},
    size = 500,
    onClose = () => { },
    ...props
}) {
    if (!enabled) return null;
    return (
        <span className="ms-tabou2-panel">
            <DockablePanel
                open={true}
                glyph="th"
                bsStyle="primary"
                title="Tabou2"
                className={''}
                draggable={false}
                onClose={onClose}
                size={size}
                dock={true}
                style={dockStyle}
                fade={true}
                clickOutEnabled={false}
                position={'right'}
                header={
                    <Row key="ms-tabou-navbar" className="ms-row-tab">
                        <Col xs={12}>
                            {<Tabou2MainTabs />}
                        </Col>
                    </Row>
                }>
                <Tabou2MainToolContainer {...props} />
            </DockablePanel>
        </span>
    )
}

export default connect(state => ({
    enabled: state?.controls && state?.controls[CONTROL_NAME] && state?.controls[CONTROL_NAME].enabled || false
}), {
    onClose: toggleControl.bind(null, CONTROL_NAME, null)
})(Tabou2MainPanel);