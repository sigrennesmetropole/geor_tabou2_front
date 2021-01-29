import React from 'react';
import { isEqual, find } from 'lodash';
import { connect } from 'react-redux';
import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid, FormControl } from 'react-bootstrap';
import { DropdownList, DateTimePicker, Combobox } from 'react-widgets';
import { currentActiveTabSelector, currentTabouFilters } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import Tabou2Combo from '../common/Tabou2Combo';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import { getCommunes, getQuartiers, getIris, getPAFromCQL } from '../../api/search';
import { COMMUNE_LAYER_ID } from '../../constants';

import { setTabouFilters } from '../../actions/tabou2';

import { getNewFilter, getCqlExpression, onChangeCommune, onChangeQuartier, onChangeIris } from '../../utils/search';



const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ currentTab, applyFilter = () => { }, currentFilters, ...props }) {
    if (currentTab != 'search') return;
    const marginTop = '10px';
    const comboMarginTop = '5px';

    const changeFilter = (layer, val, doFn, layerFilter) => {
        if(!layerFilter) {
            layerFilter = getNewFilter(layer, null, [], null);
        }
        let newFilter = doFn(layer, val, layerFilter);
        applyFilter(newFilter);
    };

    const getData = () => {
        getPAFromCQL().then(r => console.log(r));
    }

    const changeCqlFilter = (layer, value) => {
        const layers = ['PA','OA','SA'];
        const cql = getCqlExpression(value, layer);

        layers.forEach(lyr => {
            if(!currentFilters[lyr]) {
                currentFilters[lyr] = {};
            }
            delete currentFilters[lyr][layer];
            if(value) {
                currentFilters[lyr][layer] = cql;
            }
        })
        setTabouFilters(currentFilters);
        console.log(currentFilters);
    }

    return (
        <>
            <div id="tabou2-tbar-container" style={{ display: "flex", margin: "auto", justifyContent: "center" }} className="text-center">
                <Tabou2SearchToolbar />
            </div>
            <Grid fluid className={"fluid-container adjust-display"}>
                <Row style={{ marginTop: marginTop }}>
                    <Col xs={12}>
                        <FormGroup>
                            <Checkbox inline key="search-chbox-isaide" className="col-xs-3">Est aidé</Checkbox>
                            <Checkbox inline key="search-pbil-isaide" className="col-xs-3">PBIL</Checkbox>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: marginTop }}>
                    <Col xs={6}>
                        {/* left combo box */}
                        <FormGroup>
                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                firstItem={{nom:'Tous', code_insee: null}}
                                key='search-commune-boxTest'
                                load={getCommunes}
                                placeholder='COMMUNES'
                                textField='nom'
                                suggest={true}
                                searchField='elements'
                                valueField='code_insee'
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => {
                                     changeCqlFilter('commune_emprise', t['code_insee'])
                                    }
                                }
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-quartier-boxTest'
                                firstItem={{nom:'Tous', nuquart: null}}
                                load={getQuartiers}
                                placeholder='QUARTIER'
                                textField='nom'
                                searchField='elements'
                                valueField='nuquart'
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { 
                                    //changeFilter('tabou2:quartier', t['nuquart'], onChangeQuartier);
                                    changeCqlFilter('quartier', t['nuquart'])
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-iris-boxTest'
                                firstItem={{nmiris:'Tous', nuquart: null}}
                                load={getIris}
                                placeholder='IRIS'
                                textField='nmiris'
                                searchField='elements'
                                valueField='code_iris'
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => {
                                    changeCqlFilter('iris', t['code_iris'])
                                }}
                            />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-amemagoa-box"
                                data={[256, 512]}
                                placeholder={'Aménageur OA'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-amemagpa-box"
                                data={[256, 512]}
                                placeholder={'Aménageur PA'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-typefin-box"
                                data={[256, 512]}
                                placeholder={'Type financement'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-plui-box"
                                data={[256, 512]}
                                placeholder={'PLUI'} />
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup >
                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-nature"
                                data={['ZAC', 'ZA']}
                                placeholder={'Nature'} />
                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-secsam"
                                data={[256, 512]}
                                placeholder={'Sec. Sam'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-secspeu-box"
                                data={[256, 512]}
                                placeholder={'Sec. Speu'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-secssds-box"
                                data={[256, 512]}
                                placeholder={'Sec. Sds'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-secfon-box"
                                data={[256, 512]}
                                placeholder={'Sec. Foncier'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-etapeoa-box"
                                data={[256, 512]}
                                placeholder={'Etape OA'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-etapepa-box"
                                data={[256, 512]}
                                placeholder={'Etape PA'} />
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline>Date DOC du 
                            <UTCDateTimePicker inline
                                    type='date'
                                    calendar={true}
                                    time={false}
                                    culture='fr'
                                    format='MM/DD/YYYY'
                                    onChange={(date) => {
                                        console.log(date);
                                    }} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline> à la date du :
                            <UTCDateTimePicker inline
                                    type='date'
                                    calendar={true}
                                    time={false}
                                    culture='fr'
                                    format='MM/DD/YYYY'
                                    onChange={(date) => {
                                        console.log(date);
                                    }} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline>Date DAT du :
                            <UTCDateTimePicker inline
                                    type='date'
                                    calendar={true}
                                    time={false}
                                    culture='fr'
                                    format='MM/DD/YYYY'
                                    onChange={(date) => {
                                        console.log(date);
                                    }} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline> à la date du :
                            <UTCDateTimePicker inline
                                    type='date'
                                    calendar={true}
                                    time={false}
                                    culture='fr'
                                    format='MM/DD/YYYY'
                                    onChange={(date) => {
                                        console.log(date);
                                    }} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline>Date de livraison du :
                            <UTCDateTimePicker inline
                                    type='date'
                                    calendar={true}
                                    time={false}
                                    culture='fr'
                                    format='MM/DD/YYYY'
                                    onChange={(date) => {
                                        console.log(date);
                                    }} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline> à la date du :
                            <UTCDateTimePicker inline
                                    type='date'
                                    calendar={true}
                                    time={false}
                                    culture='fr'
                                    format='MM/DD/YYYY'
                                    onChange={(date) => {
                                        console.log(date);
                                    }} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                </Row>
            </Grid >
        </>
    )
}

export default connect((state) => ({
    // searchFilter: getSearchFilters
    currentTab: currentActiveTabSelector(state),
    currentFilters: currentTabouFilters(state),
    getState: () => state
}), {
    /*PASS EVT AND METHODS HERE*/
    applyFilter: setTabouFilters
})(Tabou2SearchPanel);