import React, { useState } from 'react';
import { keys, get } from 'lodash';
import { connect } from 'react-redux';
import axios from '@mapstore/libs/ajax';
import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid } from 'react-bootstrap';
import { DateTimePicker } from 'react-widgets';
import { currentActiveTabSelector, currentTabouFilters, getLayerFilterObj } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import Tabou2Combo from '../form/Tabou2Combo';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import { getRequestApi } from '../../api/search';

import { setTabouFilterObj, setTabouFilters, resetSearchFilters, resetCqlFilters } from '../../actions/tabou2';

import { getNewFilter, getNewCqlFilter, getGeoServerUrl, getCQL, getTabouLayersInfos } from '../../utils/search';

import { SEARCH_ITEMS, SEARCH_CALENDARS } from '@ext/constants';


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

    const [parents, setParents] = useState({});
    const [values, setValues] = useState({});

    /**
     * Get info from request and set / replace MapStore filters for each tabou2 layers
     * TODO :
     *  1 - Externalize this function outside by action, epic or util
     *  2 - Short code to generate combo with only one function or component
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

    /**
     * Update combo values and cql filters
     * @param {string} type
     * @param {object} combo
     * @param {string} value
     */
    const changeState = (type, combo, value) => {
        let name = combo.name;
        values[name] = value;
        setValues(values);
        changeCqlFilter(type, name, value[get(config, `${name}.apiField`)], config[name]);
    };

    /**
     * get disabled value according to disabled value and take parent value into account
     * @param {Object} cb
     * @param {string} p
     * @returns
     */
    const isDisabled = (cb, p) => {
        if (get(cb, 'disabled') || (cb.parent && !p)) return true;
        return false;
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

    /**
     * TODO : FIX reload on combobox input text
     */
    const getCombo = (combo) => {
        let urlParams = '';
        let reload = '';
        if (combo.parent && values[combo.parent]) {
            // if combo.parent : "communes" and combo.parentField : "codeInsee"
            // will return URL params ?codeInsee=35238
            reload = get(values[combo.parent], combo.parentField);
            urlParams = JSON.parse(`{"${combo.cascadeField}":${reload}}`);

            // use to store childs and clean filters when parent is clear
            if (!parents[combo.parent]) parents[combo.parent] = [];
            if (!parents[combo.parent].includes(combo.name)) {
                parents[combo.parent].push(combo.name);
                setParents(parents);
            }
        }
        // avoid conflict and allow to clean combo properly
        if (isDisabled(combo, urlParams)) {
            return (
                <Tabou2Combo
                    style={{ marginTop: comboMarginTop }}
                    placeholder={combo.placeholder}
                    value={''}
                    disabled
                />
            );
        }
        return (
            <Tabou2Combo
                style={{ marginTop: comboMarginTop }}
                load={() => getRequestApi(get(combo, "api") || get(combo, "name"), props.pluginCfg.apiCfg, urlParams)}
                valueField={get(config, `${combo.name}.apiField`)}
                placeholder={combo.placeholder}
                filter="contains"
                textField={get(config, `${combo.name}.apiLabel`)}
                onLoad={(r) => r?.elements}
                disabled={isDisabled(combo, urlParams)}
                reloadValue={reload || ''}
                onSelect={(t) => changeState(get(combo, 'type'), combo, t)}
                onChange={(t) => !t ? changeState(get(combo, 'type'), combo, t) : null}
                messages={{
                    emptyList: 'La liste est vide.',
                    openCombobox: 'Ouvrir la liste'
                }}
            />
        );
    };

    const getDate = (item, pos, i, type) => {
        return (
            <Col xs={6}>
                <FormGroup>
                    <ControlLabel inline="true"> {item.label}
                        <UTCDateTimePicker inline="true"
                            type="date"
                            placeholder="Choisir une date"
                            calendar={get(type, "isCalendar") || true}
                            time={get(type, "isTime") || false}
                            culture="fr"
                            format="MM/DD/YYYY"
                            onChange={(e) => e} />
                    </ControlLabel>
                </FormGroup>
            </Col>
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
                            <Checkbox inline className="col-xs-3">Est aidé</Checkbox>
                            <Checkbox inline className="col-xs-3">PBIL</Checkbox>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: marginTop }} >
                    <Col xs={6} >
                        {/* left combo box */}
                        <FormGroup >
                            {
                                SEARCH_ITEMS.filter(f => f.group === 1).map((cb, i) => getCombo(cb, i))
                            }
                        </FormGroup>
                    </Col>
                    <Col xs={6} >
                        <FormGroup >
                            {
                                SEARCH_ITEMS.filter(f => f.group === 2).map((cb, i) => getCombo(cb, i))
                            }
                        </FormGroup>
                    </Col>
                </Row>
                {
                    SEARCH_CALENDARS.map((els, num) => { return (<Row  style={{ marginTop: marginTop }}>{els.items.map((el, i) => getDate(el, i, num))}</Row>); })
                }
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
