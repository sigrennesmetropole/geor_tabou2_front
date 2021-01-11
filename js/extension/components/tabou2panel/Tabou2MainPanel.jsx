import React from 'react';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
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

    renderHeader() {
        return (
            <div style={this.props.styling || { width: '100%' }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div>
                        <Button className="square-button no-events">
                            <Glyphicon glyph="comment" />
                        </Button>
                    </div>
                    <div style={{ flex: "1 1 0%", padding: 8, textAlign: "center" }}>
                        <h4>Tabou2</h4>
                    </div>
                    <div>
                        <Button className="square-button no-border" onClick={this.props.toggleControl} >
                            <Glyphicon glyph="1-close" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        return (
            <BorderLayout id={this.props.id} header={this.renderHeader()}>
                <h2>Plugin tabou2</h2>
            </BorderLayout>
        )
    };
}
export default Tabou2MainPanel;