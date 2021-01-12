import React from 'react';
export const TABS = [{
    id: 'search',
    tooltip: 'search',
    glyph: 'search',
    component: () => (
        <div>
            SEARCH
        </div>
    )
}, {
    id: 'add',
    tooltip: 'add',
    glyph: 'plus',
    component: () => (
        <div>
            ADD
        </div>
    )
}, {
    id: 'identify',
    tooltip: 'identify',
    glyph: 'map-marker',
    component: () => (
        <div>
            IDENTIFY
        </div>
    )
}];

export const CONTROL_NAME = "tabou2";