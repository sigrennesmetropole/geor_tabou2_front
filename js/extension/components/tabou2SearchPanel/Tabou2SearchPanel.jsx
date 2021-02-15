import React, { useState } from 'react';
import { keys, get } from 'lodash';
import { connect } from 'react-redux';
import axios from '@mapstore/libs/ajax';

import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid } from 'react-bootstrap';
import { DateTimePicker, Combobox } from 'react-widgets';
import { currentActiveTabSelector, currentTabouFilters, getLayerFilterObj } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import Tabou2Combo from '../form/Tabou2Combo';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import { getRequestApi } from '../../api/search';

import { setTabouFilterObj, setTabouFilters, resetSearchFilters, resetCqlFilters } from '../../actions/tabou2';

import { getNewFilter, getNewCqlFilter, getGeoServerUrl, getCQL, getTabouLayersInfos } from '../../utils/search';

import { SEARCH_ITEMS } from '@ext/constants';


const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ getFiltersObj, currentTab, changeFiltersObj, changeFilters, currentFilters, ...props }) {
    if (currentTab !== 'search') return null;
    const marginTop = '10px';
    const comboMarginTop = '5px';
    const layersInfos = getTabouLayersInfos(props?.pluginCfg?.layersCfg || {});
    const config = props.pluginCfg.searchCfg;

    /**
     * Get info from request and set / replace MapStore filters for each tabou2 layers
     * TODO :
     *  1 - End change / select and autocompletion event
     *  2 - Externalize this function outside by action, epic or util
     *  3 - Short code to generate combo with only one function or component
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
            if (!currentFilters[lyr]) {
                currentFilters[lyr] = {};
            }
            delete currentFilters[lyr][filter];
            if (value) {
                currentFilters[lyr][filter] = `${cql}`;
            }
            changeFilters(currentFilters);


            // get WFS features from CQL
            let allFilters = currentFilters[lyr];
            let CQLStr = keys(allFilters).map(k => allFilters[k]);
            if (!CQLStr.length) {
                // Manage case when user select "All" value for each combo
                let newFilter = getNewFilter(lyr, null, [], null);
                filtersObj[lyr] = newFilter;
                // stock MapStore layer filter object
                return changeFiltersObj(filtersObj);
            }
            // create WFS request
            const requestParams = {
                CQL_FILTER: CQLStr.join(' AND '),
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                TYPENAME: lyr, // tabou2:iris
                OUTPUTFORMAT: 'application/json',
                VERSION: '1.0.0'
            };

            let paramsToStr = keys(requestParams).map(k => `${k}=${requestParams[k]}`);
            return axios.post(`${geoserverURL}/ows`, paramsToStr.join('&'), {
                timeout: 60000,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(response => {
                // read features id to filter toc layer
                let ids = [];
                let idsCql = '';
                if (response.data && response.data.totalFeatures) {
                    ids = response.data.features.map(feature => feature?.properties[idField] || '');
                    ids = ids.filter(id => id);
                    idsCql = idType === 'string' ? ids.map(i => `'${i}'`) : (ids.length ? ids : [0]);
                    idsCql = idsCql.join(',');
                }
                let geomFilter = getNewCqlFilter({
                    mapLayerGeom: layersInfos[lyr].geom,
                    crossGeom: layersInfos[lyr].geom,
                    crossName: lyr,
                    cqlFilter: `${idField} IN (${idsCql})`
                });
                // replace current layer filter
                let newFilter = getNewFilter(lyr, null, [], null);
                newFilter.crossLayerFilter = geomFilter;
                // update filter obj before change layer
                filtersObj[lyr] = newFilter;
                changeFiltersObj(filtersObj);
            })
                // eslint-disable-next-line no-console
                .catch(error => console.log(error));
        });
    };

    const [values, setValues] = useState({});
    const changeState = (type, name, value) => {
        values[name] = value;
        setValues(values);
        changeCqlFilter(type, name, value[get(config, `${name}.apiField`)], config[name]);
    };

    /**
     * Reset all filters value
     */
    const reset = () => {
        props.resetFiltersObj();
        props.resetFiltersCql();
        keys(values).forEach(k => {
            // null value allow to force value to element find with null valueField value
            values[k] = null;
        });
        setValues(values);
    };

    const getCombo = (combo, pos) => {
        return (
            <Tabou2Combo
                style={{ marginTop: comboMarginTop }}
                key={`${combo.name}-${pos}-key`}
                load={() => getRequestApi(get(combo, "api") || get(combo, "name"))}
                value={values[combo.name]}
                placeholder={combo.placeholder}
                filter="contains"
                textField={get(config, `${combo.name}.apiLabel`)}
                onLoad={(r) => r?.elements}
                disabled={get(combo, "disabled")}
                onSelect={(t) => changeState(get(combo, 'type'), combo.name, t)}
                onChange={(t) => changeState(get(combo, 'type'), combo.name, t)}
            />
        );
    };

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
                            {
                                SEARCH_ITEMS.filter(f => f.group === 1).map((cb, i) => getCombo(cb, i))
                            }

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-amemagoa-box"
                                data={[256, 512]}
                                filter="contains"
                                disabled="true"
                                placeholder={'Aménageur OA'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-promoteuroa-box"
                                filter="contains"
                                data={[256, 512]}
                                disabled="true"
                                placeholder={'Aménageur PA'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-typefin-box"
                                data={[256, 512]}
                                disabled="true"
                                filter="contains"
                                placeholder={'Type financement'} />
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup >
                            {
                                SEARCH_ITEMS.filter(f => f.group === 2).map((cb, i) => getCombo(cb, i))
                            }
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline>Date DOC du
                                <UTCDateTimePicker inline
                                    type="date"
                                    calendar="true"
                                    time="false"
                                    culture="fr"
                                    format="MM/DD/YYYY"
                                    onChange={() => null} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline> à la date du :
                                <UTCDateTimePicker inline
                                    type="date"
                                    calendar="true"
                                    time="false"
                                    culture="fr"
                                    format="MM/DD/YYYY"
                                    onChange={() => null} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline>Date DAT du :
                                <UTCDateTimePicker inline
                                    type="date"
                                    calendar="true"
                                    time="false"
                                    culture="fr"
                                    format="MM/DD/YYYY"
                                    onChange={() => null} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline> à la date du :
                                <UTCDateTimePicker inline
                                    type="date"
                                    calendar="true"
                                    time="false"
                                    culture="fr"
                                    format="MM/DD/YYYY"
                                    onChange={() => null} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline>Date de livraison du :
                                <UTCDateTimePicker inline
                                    type="date"
                                    calendar="true"
                                    time="false"
                                    culture="fr"
                                    format="MM/DD/YYYY"
                                    onChange={() => null} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline> à la date du :
                                <UTCDateTimePicker inline
                                    type="date"
                                    calendar="true"
                                    time="false"
                                    culture="fr"
                                    format="MM/DD/YYYY"
                                    onChange={() => null} />
                            </ControlLabel>
                        </FormGroup>
                    </Col>
                </Row>
            </Grid >
        </>
    );
}

export default connect((state) => ({
    // searchFilter: getSearchFilters
    currentTab: currentActiveTabSelector(state),
    currentFilters: currentTabouFilters(state),
    getFiltersObj: getLayerFilterObj(state)
}), {
    /* PASS EVT AND METHODS HERE*/
    changeFilters: setTabouFilters,
    changeFiltersObj: setTabouFilterObj,
    resetFiltersObj: resetSearchFilters,
    resetFiltersCql: resetCqlFilters
})(Tabou2SearchPanel);
