import React from 'react';
import { connect } from 'react-redux';
import { Row, Grid } from 'react-bootstrap';
import { currentActiveTabSelector } from '../../selectors/tabou2';
import Tabou2Selector from '../common/Tabou2Selector';
import { getValidator } from '@mapstore/utils/MapInfoUtils';
import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';
import Tabou2IdentifyContent from './Tabou2IdentifyContent';
import { getTabouIndexSelectors } from '../../selectors/tabou2';
import { setSelectorIndex } from '../../actions/tabou2';
import { ID_SELECTOR } from '../../constants';

import { generalInfoFormatSelector } from '@mapstore/selectors/mapInfo';

function Tabou2IdentifyPanel({
    currentTab,
    validator = getValidator,
    format,
    setIndex = () => { },
    getAllIndex,
    ...props
}) {
    if (currentTab != 'identify') return;

    const changeIndex = (clicked, allIndex) => {
        console.log('Index change');
        allIndex[ID_SELECTOR] = clicked?.name;
        setIndex(allIndex);
    }

    const createOptions = (data) => {
        return data.map((opt, idx) => {
            console.log(opt);
            if(!opt.data.features.length) {
                return {labe:'Aucun résultat', value: 0}
            };
            let label = opt?.layerMetadata?.title;
            return { label: label, value: idx, name: opt?.layer.name };
        })
    }

    const defaultIndex = 0;
    return (
        <>
            <Row className="layer-tabouselect-row" style={{ margin: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0', zIndex: '10' }}>
                    <span className="identify-icon glyphicon glyphicon-1-layer" />
                    {
                        <Tabou2Selector
                            key={'selector-' + ID_SELECTOR}
                            getTitle={(opt) => { return opt?.layerMetadata?.title }}
                            createOptions={(data) => createOptions(data)}
                            setIndex={(i) => changeIndex(i, getAllIndex)}
                            id={ID_SELECTOR}
                            defaultIndex={defaultIndex}
                            data={props.data}
                        />
                    }
                </div>
            </Row>
            <Row className="tabou-idToolbar-row" style={{ display: "flex", margin: "auto", justifyContent: "center" }} className="text-center">
                <Tabou2IdentifyToolbar />
            </Row>
            <Grid style={{ width: '100%' }}>
                <Tabou2IdentifyContent response={props.data} layer={getAllIndex[ID_SELECTOR]} loadIndex={defaultIndex} />
            </Grid>
        </>
    )
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state),
    getAllIndex: getTabouIndexSelectors(state),
    getInfoFormat: generalInfoFormatSelector(state)
}), {
    setIndex: setSelectorIndex
})(Tabou2IdentifyPanel);