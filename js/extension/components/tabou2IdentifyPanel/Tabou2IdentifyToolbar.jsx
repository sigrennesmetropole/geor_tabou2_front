import React from 'react';
import { connect } from 'react-redux';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

import { getTabouResponse } from '../../selectors/tabou2';

function Tabou2IdentifyToolbar({ addDoc = () => { }, addTiers = () => { }, addEvent = () => { } }) {
    return (

        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md',
                bsStyle: 'primary'
            }}
            btnGroupProps={{
                style: {
                    margin: 10
                }
            }}
            buttons={[
                {
                    glyph: 'user',
                    tooltip: 'Tiers',
                    onClick: addDoc
                },
                {
                    glyph: 'file',
                    tooltip: 'Documents',
                    onClick: addTiers
                },
                {
                    glyph: 'list-alt',
                    tooltip: 'Journal de bord',
                    onClick: addEvent
                }
            ]}
        />
    )
}

export default connect((state) => ({
    // selectors
}), { //actions

})(Tabou2IdentifyToolbar);