import React, { useState, useEffect } from 'react';
import { keys, get } from 'lodash';
import { connect } from 'react-redux';
import axios from '@mapstore/libs/ajax';

import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid } from 'react-bootstrap';
import { DateTimePicker, Combobox } from 'react-widgets';
import { currentActiveTabSelector, currentTabouFilters, getLayerFilterObj } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import Tabou2Combo from '../common/Tabou2Combo';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import { getRequestApi } from '../../api/search';

import { setTabouFilterObj, setTabouFilters, resetSearchFilters, resetCqlFilters } from '../../actions/tabou2';

import { getNewFilter, getNewCqlFilter, getGeoServerUrl, getCQL, getTabouLayersInfos } from '../../utils/search';



const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ getFiltersObj, currentTab, changeFiltersObj, changeFilters, currentFilters, ...props }) {
    if (currentTab != 'search') return;
    const marginTop = '10px';
    const comboMarginTop = '5px';
    const layersInfos = getTabouLayersInfos(props?.pluginCfg?.layersCfg || {});
    const config = props.pluginCfg.searchCfg;

    /**
     * Get info from request and set / replace MapStore filters for each tabou2 layers
     * TODO : 
     *  1 - clear combobox
     *  2 - Externalize this function outside by action, epic or util
     * @param {*} layer 
     * @param {*} value 
     */
    const changeCqlFilter = (type, filter, value, filterConf) => {
        const layers = keys(layersInfos);
        let filtersObj = getFiltersObj;
        const geoserverURL = getGeoServerUrl(props);
        layers.forEach(lyr => {
            const cql = getCQL(type, filterConf.geom, filterConf.layer, filterConf.geom,  filterConf.filterField, value);
            const idField = layersInfos[lyr].id;
            const idType = layersInfos[lyr].type;
            if(!currentFilters[lyr]) {
                currentFilters[lyr] = {};
            }
            delete currentFilters[lyr][filter];
            if(value) {
                currentFilters[lyr][filter] = `${cql}`;
            }
            changeFilters(currentFilters);
            

            // get WFS features from CQL
            let allFilters = currentFilters[lyr];
            let CQLStr = keys(allFilters).map(k => allFilters[k]);
            if(!CQLStr.length) {
                // Manage case when user select "All" value for each combo
                let newFilter = getNewFilter(lyr, null, [], null);
                filtersObj[lyr] = newFilter;
                // stock MapStore layer filter object
                return changeFiltersObj(filtersObj);
            }
            // create WFS request
            const requestParams = {
                CQL_FILTER: CQLStr.join(' AND '),
                SERVICE:'WFS',
                REQUEST:'GetFeature',
                TYPENAME: lyr, // tabou2:iris
                OUTPUTFORMAT:'application/json',
                VERSION: '1.0.0'
            };

            let paramsToStr = keys(requestParams).map(k => `${k}=${requestParams[k]}`);
            axios.post(`${geoserverURL}/ows`, paramsToStr.join('&'), {
                    timeout: 60000,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(response => {
                // read features id to filter toc layer
                let ids = [];
                let idsCql = '';
                if(response.data && response.data.totalFeatures) {
                    ids = response.data.features.map(feature => feature?.properties[idField] || '');
                    ids = ids.filter(id => id);
                    idsCql = idType === 'string' ? ids.map(i => `'${i}'`) : (ids.length ? ids : [0]);
                    idsCql = idsCql.join(',');
                }
                let geomFilter = getNewCqlFilter({
                    mapLayerGeom: layersInfos[lyr].geom,
                    crossGeom: layersInfos[lyr].geom,
                    crossName: lyr,
                    cqlFilter:`${idField} IN (${idsCql})`
                })
                // replace current layer filter
                let newFilter = getNewFilter(lyr, null, [], null);
                newFilter.crossLayerFilter = geomFilter;
                // update filter obj before change layer
                filtersObj[lyr] = newFilter;
                changeFiltersObj(filtersObj);
            })
            .catch(error => console.log(error));
        })
    }

    const [values, setValues] = useState({});
    const changeState = (type, name, value) => {
        changeCqlFilter(type, name, value, config[name]);
        values[name] = value;
        setValues(values);
    }

    /**
     * Reset all filters value
     */
    const reset = () => {
        props.resetFiltersObj();
        props.resetFiltersCql();
        keys(values).forEach(k => {
            // null value allow to force value to element find with null valueField value
            values[k] = null;
        })
        setValues(values);
    }

    return (
        <>
            <div id="tabou2-tbar-container" style={{ display: "flex", margin: "auto", justifyContent: "center" }} className="text-center">
                <Tabou2SearchToolbar reset={reset}/>
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
                                firstItem={{nom:'Toutes les communes', code_insee: null}}
                                key='search-commune-boxTest'
                                load={() => getRequestApi('communes')}
                                value={values?.communes || null}
                                filter="contains"
                                textField= {get(config, 'communes.apiLabel') || 'nom'}
                                suggest={true}
                                valueField={'code_insee'}
                                onLoad={(r) => r?.elements}
                                onChange={(t) => {
                                    changeState(null, 'communes', t?.all ? null : t[get(config, 'communes.filterField')], values);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-quartier-boxTest'
                                firstItem={{nom:'Tous les quartiers', nuquart: null}}
                                filter="contains"
                                value={values?.quartiers || null}
                                valueField={'nuquart'}
                                load={() => getRequestApi('quartiers')}
                                suggest={true}
                                textField={get(config, 'quartiers.apiLabel') || 'nom'}
                                onLoad={(r) => r?.elements}
                                onChange={(t) => {
                                    changeState(null, 'quartiers', t?.all ? null : t[get(config, 'quartiers.filterField')], values)
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                filter="contains"
                                key='search-iris-boxTest'
                                firstItem={{nmiris:'Tous les iris', code_iris: null}}
                                load={() => getRequestApi('iris')}
                                textField={get(config, 'iris.apiLabel') || 'nmiris'}
                                suggest={true}
                                value={values?.iris || null}
                                valueField={'code_iris'}
                                onLoad={(r) => r?.elements}
                                onChange={(t) => {
                                    changeState(null, 'iris', t?.all ? null : t[get(config, 'iris.filterField')], values)
                                }}
                            />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-amemagoa-box"
                                data={[256, 512]}
                                filter="contains"
                                disabled={true}
                                placeholder={'Aménageur OA'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-promoteuroa-box"
                                filter="contains"
                                data={[256, 512]}
                                disabled={true}
                                placeholder={'Aménageur PA'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-typefin-box"
                                data={[256, 512]}
                                disabled={true}
                                filter="contains"
                                placeholder={'Type financement'} />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                value={values?.plui || null}
                                valueField={'all'}
                                key='search-plui-combo'
                                suggest={true}
                                disabled={true}
                                firstItem={{libelle:'Tous les PLUI', all: null}}
                                load={() => getRequestApi('plui')}
                                filter="contains"
                                textField='libelle'
                                onLoad={(r) => r?.elements}
                                onChange={(t) => {
                                    //changeCqlFilter('plui', t?.all ? null : t[get(config, 'plui.apiField')].plui);
                                }}
                            />
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup >
                        <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                value={values?.natures || null}
                                valueField={'all'}
                                key='search-natures-combo'
                                disabled={true}
                                filter="contains"
                                firstItem={{libelle: 'Toutes les natures', all: null }}
                                load={() => getRequestApi('natures')}
                                suggest={true}
                                textField={get(config, 'natures.apiLabel') || 'libelle'}
                                onLoad={(r) => r?.elements}
                                onChange={(t) => {
                                    changeState('string', 'natures', t?.all ? null : t[get(config, 'natures.filterField')], values);
                                }}
                            />
                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                value={get(values,'secteurs-sam') || null}
                                valueField={'all'}
                                key='search-sam-box'
                                filter="contains"
                                suggest={true}
                                firstItem={{nom_secteur: 'Tous les Sec. SAM', all: null}}
                                load={() => getRequestApi('secteurs-sam')}
                                textField={get(config, 'secteurs-sam.apiLabel') || 'nom_secteur'}
                                onLoad={(r) => r?.elements}
                                onChange={(t) => {
                                    changeState('string', 'secteurs-sam', t?.all ? null : t[get(config, 'secteurs-sam.apiField')], values);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                value={get(values,'secteurs-speu') || null}
                                valueField={'all'}
                                key='search-speu-box'
                                filter="contains"
                                suggest={true}
                                firstItem={{nom_secteur: 'Tous les Sec. SPEU', all: null}}
                                load={() => getRequestApi('secteurs-speu')}
                                textField={get(config, 'secteurs-speu.apiLabel') || 'nom_secteur'}
                                onLoad={(r) => r?.elements}
                                onChange={(t) => { 
                                    changeState('string', 'secteurs-speu', t?.all ? null : t[get(config, 'secteurs-speu.apiField')], values);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                value={get(values,'secteurs-sds') || null}
                                valueField={'all'}
                                key='search-sds-box'
                                filter="contains"
                                suggest={true}
                                firstItem={{secteur: 'Tous les Sec. SDS', all: null}}
                                load={() => getRequestApi('secteurs-sds')}
                                textField={get(config, 'secteurs-sds.apiLabel') || 'secteur'}
                                onLoad={(r) => r?.elements}
                                onChange={(t) => { 
                                    changeState('string', 'secteurs-sds', t?.all ? null : t[get(config, 'secteurs-sds.apiField')], values);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-foncier-box'
                                filter="contains"
                                value={get(values,'secteurs-foncier') || null}
                                valueField={'all'}
                                suggest={true}
                                firstItem={{nom_secteur: 'Tous les Sec. Foncier', all: null}}
                                load={() => getRequestApi('secteurs-foncier')}
                                textField={get(config, 'secteurs-foncier.apiLabel') || 'nom_secteur'}
                                onLoad={(r) => r?.elements}
                                onChange={(t) => {
                                    changeState('string', 'secteurs-foncier', t?.all ? null : t[get(config, 'secteurs-foncier.apiField')], values, );
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-etapeoa-box'
                                defaultValue={true}
                                valueField={'all'}
                                firstItem={{all: true, libelle: 'Toutes les Etapes OA'}}
                                load={() => getRequestApi('etapes-oa-mock')}
                                filter="contains"
                                disabled={true}
                                textField='libelle'
                                suggest={true}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { 
                                    //changeCqlFilter('quartier', t['nuquart'])
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-etapepa-box'
                                firstItem={{id_etape_operation:0, all: null, libelle: 'Toutes les Etapes PA'}}
                                load={() => getRequestApi('etapes-pa-mock')}
                                disabled={true}
                                filter="contains"
                                suggest={true}
                                textField='libelle'
                                defaultValue={null}
                                valueField={'all'}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { 
                                    //changeCqlFilter('quartier', t['nuquart'])
                                }}
                            />
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
    getFiltersObj: getLayerFilterObj(state)
}), {
    /*PASS EVT AND METHODS HERE*/
    changeFilters: setTabouFilters,
    changeFiltersObj: setTabouFilterObj,
    resetFiltersObj: resetSearchFilters,
    resetFiltersCql: resetCqlFilters
})(Tabou2SearchPanel);