import React from 'react';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
//import Portal from '@mapstore/components/misc/Portal';
//import Dialog from '@mapstore/components/misc/Dialog';
//import DockablePanel from '@mapstore/components/panels/DockablePanel';
import { Button, Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';

class Tabou2MainPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        toggleControl: PropTypes.func,
        closing: PropTypes.bool,
        config: PropTypes.object
    }

    static defaultProps = {}

    state = {
        selected: 'search'
    }

    /*renderHeader() {
        let els = this.tabs.map(tab =>
            <Row key="ms-tabou-navbar" className="ms-row-tab">
                <Col xs={12}>
                    <Nav justified
                        bsStyle="tabs"
                        activeKey={this.activeTab}
                        onSelect={(e) => { this.activeTab = e }}>
                        {this.tabs.map(tab =>
                            <NavItemT
                                key={'ms-tab-settings-' + tab.id}
                                tooltip={tab.tooltip}
                                eventKey={tab.id}
                                onClick={() => {
                                    console.log(tab.id)
                                }}>
                                <Glyphicon glyph={tab.glyph} />
                            </NavItemT>
                        )}
                    </Nav>
                </Col>
            </Row>
        );
        return (
            {
                [...(this.tabs.length > 1 ? [<Row key="ms-tabou-navbar" className="ms-row-tab">
                    <Col xs={12}>
                        <Nav justified
                            bsStyle="tabs"
                            activeKey={this.activeTab}
                            onSelect={(e) => { this.activeTab = e }}>
                            {this.tabs.map(tab =>
                                <NavItemT
                                    key={'ms-tab-settings-' + tab.id}
                                    tooltip={tab.tooltip}
                                    eventKey={tab.id}
                                    onClick={() => {
                                        console.log(tab.id)
                                    }}>
                                    <Glyphicon glyph={tab.glyph} />
                                </NavItemT>
                            )}
                        </Nav>
                    </Col>
                </Row>] : [])
                    ]
            }
        );
    };*/

    render() {
        return (
            <div>
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
                    header={[
                        ...(this.tabs.length > 1 ? [<Row key="ms-tabou-navbar" className="ms-row-tab">
                            <Col xs={12}>
                                <Nav justified
                                    bsStyle="tabs"
                                    activeKey={this.activeTab}
                                    onSelect={(e) => { this.activeTab = e }}>
                                    {this.tabs.map(tab =>
                                        <NavItemT
                                            key={'ms-tab-settings-' + tab.id}
                                            tooltip={tab.tooltip}
                                            eventKey={tab.id}
                                            onClick={() => {
                                                console.log(tab.id)
                                            }}>
                                            <Glyphicon glyph={tab.glyph} />
                                        </NavItemT>
                                    )}
                                </Nav>
                            </Col>
                        </Row>] : [])
                    ]}>
                    {
                        // return selected tab component
                        this.tabs.filter(tab => tab.id && tab.id === this.activeTab).filter(tab => tab.component).map(tab => (
                            <tab.component
                                key={'ms-tab-tabou-body-' + tab.id}
                                containerWidth={300}
                                onChange={console.log('change')}
                            />
                        ))
                    }
                </DockablePanel>
            </div >
        )
    };
}
export default Tabou2MainPanel;