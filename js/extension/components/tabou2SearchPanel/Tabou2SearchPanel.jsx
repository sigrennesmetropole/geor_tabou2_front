import React from 'react';
import { isEqual, find, keys } from 'lodash';
import { connect } from 'react-redux';
import axios from '@mapstore/libs/ajax';

import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid, FormControl } from 'react-bootstrap';
import { DropdownList, DateTimePicker, Combobox } from 'react-widgets';
import { currentActiveTabSelector, currentTabouFilters, getLayerFilterObj } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import Tabou2Combo from '../common/Tabou2Combo';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import { getCommunes, getQuartiers, getIris, getPAFromCQL } from '../../api/search';
import { COMMUNE_LAYER_ID } from '../../constants';

import { setTabouFilters, setTabouFilterObj, applyFilterObj } from '../../actions/tabou2';

import { getNewFilter, getNewCqlFilter, getCqlExpression, onChangeCommune, onChangeQuartier, onChangeIris } from '../../utils/search';



const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ apply, getFiltersObj, setFiltersObj, currentTab, applyFilter = () => { }, currentFilters, ...props }) {
    if (currentTab != 'search') return;
    const marginTop = '10px';
    const comboMarginTop = '5px';

    const fieldsId = {
        'tabou2:v_oa_programme': {
            id:'objectid',
            type: 'number'
        },
        'tabou2:oa_secteur': {
            id: 'objectid',
            type: 'number'
        },
        'tabou2:za_sae': {
            id: 'idza',
            type: 'string'
        },
        'tabou2:zac': {
            id: 'id_zac',
            type: 'number'
        }
    };

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
        //const layers = ['tabou2:v_oa_programme','tabou2:oa_secteur', 'tabou2:za_sae'];
        const layers = keys(currentFilters);
        const cql = getCqlExpression(value, layer);
        let filtersObj = getFiltersObj;
        layers.forEach(lyr => {
            const idField = fieldsId[lyr].id;
            const idType = fieldsId[lyr].type;
            if(!currentFilters[lyr]) {
                currentFilters[lyr] = {};
            }
            delete currentFilters[lyr][layer];
            if(value) {
                currentFilters[lyr][layer] = cql;
            }

            // get WFS features from CQL
            let allFilters = currentFilters[lyr];
            let CQLStr = keys(allFilters).map(k => allFilters[k]);
            // create WFS request
            const requestParams = {
                CQL_FILTER: CQLStr.join(' OR '),
                SERVICE:'WFS',
                REQUEST:'GetFeature',
                TYPENAME: lyr, // tabou2:iris
                OUTPUTFORMAT:'application/json',
                VERSION: '1.0.0'
            };
            let paramsToStr = keys(requestParams).map(k => `${k}=${requestParams[k]}`);
            axios.post('https://georchestra.example.org/geoserver/ows', paramsToStr.join('&'), {
                    timeout: 60000,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(response => {
                // read features id to filter toc layer
                let ids = [];
                let idsCql = '';
                if(response.data && response.data.totalFeatures) {
                    ids = response.data.features.map(feature => feature?.properties[idField] || '');
                    ids = ids.filter(id => id);
                    idsCql = idType === 'string' ? ids.map(i => `'${i}'`) : ids;
                    idsCql = idsCql.join(',');
                }
                let geomFilter = getNewCqlFilter({
                    mapLayerGeom: 'the_geom',
                    crossGeom: 'the_geom',
                    crossName: lyr,
                    cqlFilter:`${idField} IN (${idsCql})`
                })
                // replace current layer filter
                let newFilter = getNewFilter(lyr, null, [], null);
                newFilter.crossLayerFilter = geomFilter;
                // update filter obj before change layer
                
                filtersObj[lyr] = newFilter;
                console.log(filtersObj)
                setTabouFilterObj(filtersObj);
                apply(lyr);
            })
            .catch(error => console.log(error));
        })
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
                                     changeCqlFilter('commune_emprise', t['code_insee']);
                                     //changeFilter('tabou2:v_oa_programme', t['code_insee'], onChangeCommune, null)
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
    getFiltersObj: getLayerFilterObj(state),
    getState: () => state
}), {
    /*PASS EVT AND METHODS HERE*/
    applyFilter: setTabouFilters,
    setFiltersObj: setTabouFilterObj,
    apply: applyFilterObj 
})(Tabou2SearchPanel);