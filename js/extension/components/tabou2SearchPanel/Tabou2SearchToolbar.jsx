import React from 'react';
import { connect } from 'react-redux';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

function Tabou2SearchToolbar({ }) {
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
                    glyph: 'ok',
                    tooltip: 'Appliquer',
                    onClick: (event) => {
                        event.stopPropagation();
                        console.log('Apply Tabou2 filters');
                    }
                },
                {
                    glyph: 'floppy-disk',
                    tooltip: 'Sauvegarder',
                    onClick: (event) => {
                        event.stopPropagation();
                        console.log('Save Tabou2 filters');
                    }
                },
                {
                    glyph: 'clear-filter',
                    tooltip: 'Supprimer les filtrer',
                    onClick: (event) => {
                        event.stopPropagation();
                        console.log('Clear all Tabou2 search filters');
                    }
                }
            ]}
        />
    )
}

export default connect((state) => ({

}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2SearchToolbar);