import React from 'react';

import DockablePanel from '@mapstore/components/misc/panels/DockablePanel';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Tabou2MainTabs from './Tabou2MainTabs';
import Tabou2MainToolContainer from './Tabou2MainToolContainer';

class Tabou2MainPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        toggleControl: PropTypes.func,
        closing: PropTypes.bool,
        config: PropTypes.object,
        tabs: PropTypes.array

    }

    static defaultProps = {
        tabs: []
    }

    state = {
        selected: 'search'
    }

    constructor(props) {
        super(props);
        this.activeTab = 'search';
    }

    render() {

        return (
            <DockablePanel
                open={true}
                glyph="th"
                title="Tabou2"
                className={''}
                onClose={this.props.toggleControl}
                size={500}
                draggable={true}
                dock={true}
                position={'right'}
                header={
                    <Row key="ms-tabou-navbar" className="ms-row-tab">
                        <Col xs={12}>
                            {<Tabou2MainTabs />}
                        </Col>
                    </Row>
                }>
                <Tabou2MainToolContainer />
            </DockablePanel>
        )
    }
}

export default Tabou2MainPanel;