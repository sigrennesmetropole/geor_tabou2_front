import React from 'react';
import { connect } from 'react-redux';
import { Row, Grid } from 'react-bootstrap';
import { currentActiveTabSelector } from '../../selectors/tabou2';
import LayerSelector from '@mapstore/components/data/identify/LayerSelector';
import { getDefaultInfoFormatValue, getValidator } from '@mapstore/utils/MapInfoUtils';
import Tabou2IdentifyToolbar from './Tabou2IdentifyToolbar';
import Tabou2IdentifyContent from './Tabou2IdentifyContent';

import {
    currentFeatureSelector,
    generalInfoFormatSelector,
    requestsSelector,
    responsesSelector
} from '@mapstore/selectors/mapInfo';

function Tabou2IdentifyPanel({
    currentTab,
    responses = [],
    requests = [],
    index = 0,
    loaded = false,
    setIndex = () => { },
    missingResponses = 0,
    emptyResponses = false,
    validator = () => { },
    format = getDefaultInfoFormatValue()
}) {
    if (currentTab != 'identify') return;
    missingResponses = requests.length - responses.length;
    emptyResponses = requests.length === validator(format)?.getNoValidResponses(responses)?.length || 0;
    return (
        <>
            <Row className="layer-tabouselect-row" style={{ margin: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0', zIndex: '10' }}>
                    <span className="identify-icon glyphicon glyphicon-1-layer" />
                    <LayerSelector
                        responses={responses}
                        index={index}
                        loaded={loaded}
                        setIndex={setIndex}
                        missingResponses={missingResponses}
                        emptyResponses={emptyResponses}
                        validator={validator}
                        format={format}
                    />
                </div>
            </Row>
            <Row className="tabou-idToolbar-row" style={{ display: "flex", margin: "auto", justifyContent: "center" }} className="text-center">
                <Tabou2IdentifyToolbar />
            </Row>
            <Grid style={{ width: '100%' }}>
                <Tabou2IdentifyContent />
            </Grid>
        </>
    )
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state),
    response: responsesSelector,
    request: requestsSelector,
    format: generalInfoFormatSelector,
    validator: getValidator,
    currentFeature: currentFeatureSelector
}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2IdentifyPanel);