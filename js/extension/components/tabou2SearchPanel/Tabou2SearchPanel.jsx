import React from 'react';
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

import { setTabouFilters, setTabouFilterObj, applyFilterObj, resetSearchFilters } from '../../actions/tabou2';

import { getNewFilter, getNewCqlFilter, getGeoServerUrl, getCQL, getTabouLayersInfos } from '../../utils/search';



const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ reset, apply, getFiltersObj, setFiltersObj, currentTab, applyFilter = () => { }, currentFilters, ...props }) {
    if (currentTab != 'search') return;
    const marginTop = '10px';
    const comboMarginTop = '5px';
    const layersInfos = getTabouLayersInfos(props?.pluginCfg?.layersCfg || {});
    const config = props.pluginCfg.searchCfg;

    /**
     * Get info from request and set MapStore filters
     * TODO : take no cql feature into account - call TOC layers to get filters already set
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

            // get WFS features from CQL
            let allFilters = currentFilters[lyr];
            let CQLStr = keys(allFilters).map(k => allFilters[k]);
            if(!CQLStr.length) {
                // Manage case when user select "All" value for each combo
                // TODO : take exist filter or remove layerFilter param from layer - to define with MOA
                let newFilter = getNewFilter(lyr, null, [], null);
                filtersObj[lyr] = newFilter;
                return setTabouFilterObj(filtersObj);
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
                setTabouFilterObj(filtersObj);
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
                                firstItem={{nom:'Tous', code_insee: null, all: true}}
                                key='search-commune-boxTest'
                                load={() => getRequestApi('communes')}
                                placeholder={get(config, 'communes.placeholder') || 'Communes'}
                                textField= {get(config, 'communes.apiLabel') || 'nom'}
                                suggest={true}
                                valueField={get(config, 'communes.filterField') || 'code_insee'}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => {
                                     changeCqlFilter(null, 'communes', t?.all ? null : t[get(config, 'communes.filterField')], config.communes);
                                    }
                                }
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-quartier-boxTest'
                                firstItem={{nom:'Tous', all: true}}
                                load={() => getRequestApi('quartiers')}
                                placeholder={get(config, 'quartiers.placeholder') || 'Quartiers'}
                                suggest={true}
                                textField={get(config, 'quartiers.apiLabel') || 'nom'}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { 
                                    changeCqlFilter(null, 'quartiers', t?.all ? null : t[get(config, 'quartiers.filterField')], config.quartiers);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-iris-boxTest'
                                firstItem={{nmiris:'Tous', all:true, nuquart: null}}
                                load={() => getRequestApi('iris')}
                                placeholder={get(config, 'iris.placeholder') || 'Iris'}
                                textField={get(config, 'iris.apiLabel') || 'nmiris'}
                                suggest={true}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => {
                                    changeCqlFilter(null, 'iris', t?.all ? null : t[get(config, 'iris.filterField')], config.iris);
                                }}
                            />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-amemagoa-box"
                                data={[256, 512]}
                                disabled={true}
                                placeholder={'Aménageur OA'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-promoteuroa-box"
                                data={[256, 512]}
                                disabled={true}
                                placeholder={'Aménageur PA'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-typefin-box"
                                data={[256, 512]}
                                disabled={true}
                                placeholder={'Type financement'} />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-plui-combo'
                                suggest={true}
                                disabled={true}
                                firstItem={{libelle:'Tous', all: true}}
                                load={() => getRequestApi('plui')}
                                placeholder='PLUI'
                                textField='libelle'
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => {
                                    //changeCqlFilter('natuires', t?.all ? null : t[get(config, 'iris.filterField')], config.iris);
                                }}
                            />
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup >
                        <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-natures-combo'
                                disabled={true}
                                firstItem={{code: '', id:0, libelle: 'Tous', all: true }}
                                load={() => getRequestApi('natures')}
                                placeholder={get(config, 'natures.placeholder') || 'Natures'}
                                suggest={true}
                                textField={get(config, 'natures.apiLabel') || 'libelle'}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => {
                                    changeCqlFilter('string', 'natures', t?.all ? null : t[get(config, 'natures.filterField')], config.natures);
                                }}
                            />
                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-sam-box'
                                suggest={true}
                                firstItem={{id: 0, nom_secteur: 'Tous', all: true}}
                                load={() => getRequestApi('secteurs-sam')}
                                placeholder={get(config, 'secteurs-sam.placeholder') || 'Sec. SAM'}
                                textField={get(config, 'secteurs-sam.apiLabel') || 'nom_secteur'}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { 
                                    changeCqlFilter('string', 'secteurs-sam', t?.all ? null : t[get(config, 'secteur-sam.apiField')], config['secteurs-sam']);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-speu-box'
                                suggest={true}
                                firstItem={{id: 0, nom_secteur: 'Tous', all: true}}
                                load={() => getRequestApi('secteurs-speu')}
                                placeholder={get(config, 'secteurs-speu.placeholder') || 'Sec. SPEU'}
                                textField={get(config, 'secteurs-speu.apiLabel') || 'nom_secteur'}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { 
                                    changeCqlFilter('string', 'secteurs-speu', t?.all ? null : t[get(config, 'secteurs-speu.apiField')], config['secteurs-speu']);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-sds-box'
                                suggest={true}
                                firstItem={{id: 0, secteur: 'Tous', all: true}}
                                load={() => getRequestApi('secteurs-sds')}
                                placeholder={get(config, 'secteurs-sds.placeholder') || 'Sec. SDS'}
                                textField={get(config, 'secteurs-sds.apiLabel') || 'secteur'}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { 
                                    changeCqlFilter('string', 'secteurs-sds', t?.all ? null : t[get(config, 'secteurs-sds.apiField')], config['secteurs-sds']);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-foncier-box'
                                suggest={true}
                                firstItem={{id: 0, nom_secteur: 'Tous', all: true}}
                                load={() => getRequestApi('secteurs-foncier')}
                                placeholder={get(config, 'secteurs-foncier.placeholder') || 'Sec. Foncier'}
                                textField={get(config, 'secteurs-foncier.apiLabel') || 'nom_secteur'}
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => {
                                    changeCqlFilter('string','secteurs-foncier', t?.all ? null : t[get(config, 'secteurs-foncier.apiField')], config['secteurs-foncier']);
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-etapeoa-box'
                                firstItem={{id_etape_operation:0, all: true, libelle: 'Tous'}}
                                load={() => getRequestApi('etapes-oa-mock')}
                                placeholder={'Etape OA'}
                                disabled={true}
                                textField='libelle'
                                suggest={true}
                                valueField='id_etape_operation'
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { 
                                    //changeCqlFilter('quartier', t['nuquart'])
                                }}
                            />

                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-etapepa-box'
                                firstItem={{id_etape_operation:0, all: null, libelle: 'Tous'}}
                                load={() => getRequestApi('etapes-pa-mock')}
                                disabled={true}
                                placeholder={'Etape PA'}
                                suggest={true}
                                textField='libelle'
                                valueField='id_etape_operation'
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
    getFiltersObj: getLayerFilterObj(state),
    getState: () => state
}), {
    /*PASS EVT AND METHODS HERE*/
    applyFilter: setTabouFilters,
    setFiltersObj: setTabouFilterObj,
    apply: applyFilterObj,
    reset: resetSearchFilters
})(Tabou2SearchPanel);