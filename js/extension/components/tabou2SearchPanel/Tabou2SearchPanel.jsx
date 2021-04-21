import React, { useState, useEffect } from 'react';
import { keys, get } from 'lodash';
import { connect } from 'react-redux';
import axios from '@mapstore/libs/ajax';
import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid, Panel } from 'react-bootstrap';
import { DateTimePicker } from 'react-widgets';
import { currentActiveTabSelector, currentTabouFilters, getLayerFilterObj } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import Tabou2Combo from '../form/Tabou2Combo';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import { getRequestApi } from '../../api/search';

import { setTabouFilterObj, setTabouFilters, resetSearchFilters, resetCqlFilters, applyFilterObj } from '../../actions/tabou2';

import { getNewFilter, getNewCqlFilter, getGeoServerUrl, getCQL, getTabouLayersInfos } from '../../utils/search';

import { SEARCH_ITEMS, SEARCH_CALENDARS } from '@ext/constants';


const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ getFiltersObj, currentTab, changeFiltersObj, changeFilters, currentFilters, ...props }) {
    if (currentTab !== 'search') return null;
    const comboMarginTop = '5px';
    const layersInfos = getTabouLayersInfos(props?.pluginCfg?.layersCfg || {});
    const config = props.pluginCfg.searchCfg;

    const [comboValues, setComboValues] = useState({});
    const [parents, setParents] = useState({});
    const [val, setVal] = useState("");
    const [reloadVal, setReloadVal] = useState("");

    useEffect(() => {
        if (val !== reloadVal) {
            setReloadVal(val);
        }
    }, [val]);

    /**
     * Reset all filters value
     */
    const reset = () => {
        props.resetFiltersObj();
        props.resetFiltersCql();
        setComboValues({});
        setVal("");
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
                console.log(filtersObj);
                changeFiltersObj(filtersObj);
            })
                // eslint-disable-next-line no-console
                .catch(error => console.log(error));
        });
    };

    const changeFilter = (combo, value) => {
        comboValues[combo.name] = value;
        setVal(value[get(config, `${combo.name}.apiField`)]);
        setComboValues(comboValues);
        changeCqlFilter(get(combo, "type"), combo.name, value[get(config, `${combo.name}.apiField`)], config[combo.name]);
    };

    /**
     * Create tabou2 search combobox loadable from api
     * @param {object} combo
     * @returns combobox component
     */
    const getCombo = (combo) => {
        let urlParams = "";
        let parentValue = "";
        if (combo.parent && comboValues[combo.parent]) {
            // if combo.parent : "communes" and combo.parentField : "codeInsee"
            // will return URL params ?codeInsee=35238
            parentValue = get(comboValues[combo.parent], combo.parentField);
            urlParams = JSON.parse(`{"${combo.cascadeField}":${parentValue}}`);

            // use to store childs and clean filters when parent is clear
            if (!parents[combo.parent]) parents[combo.parent] = [];
            if (!parents[combo.parent].includes(combo.name)) {
                parents[combo.parent].push(combo.name);
                setParents(parents);
            }
        }
        return (
            <Col xs={6}>
                <FormGroup>
                    <Tabou2Combo
                        style={{ marginTop: comboMarginTop }}
                        load={() => getRequestApi(get(combo, "api") || get(combo, "name"), props.pluginCfg.apiCfg, urlParams)}
                        disabled={isDisabled(combo, urlParams)}
                        placeholder={combo.placeholder}
                        parentValue={parentValue}
                        filter="contains"
                        textField={get(config, `${combo.name}.apiLabel`)}
                        valueField={get(config, `${combo.name}.apiField`)}
                        onLoad={(r) => r?.elements || r}
                        name={combo.name}
                        value={comboValues[combo.name]}
                        onSelect={v => changeFilter(combo, v)}
                        onChange={(v) => !v ? changeFilter(combo, v) : null}
                        messages={{
                            emptyList: 'La liste est vide.',
                            openCombobox: 'Ouvrir la liste'
                        }}
                    />
                </FormGroup>
            </Col>
        );
    };

    /**
     * Create date form component with nativ mapstore2 UTCDateTimePicker component
     * @param {object} item
     * @param {string} type
     * @returns
     */
    const getDate = (item, type) => {
        return (
            <Col xs={6}>
                <FormGroup>
                    <ControlLabel inline="true"> {item.label}
                        <UTCDateTimePicker inline="true"
                            type="date"
                            dropUp
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
            <Grid className={"col-xs-12"}>
                <div id="tabou2-tbar-container" className="text-center">
                    <Tabou2SearchToolbar filters={getFiltersObj} apply={props.applyFilterObj} reset={reset}/>
                </div>
                <Row>
                    <Panel
                        header={(
                            <label>1 - Définir les éléments du référentiel cartographique</label>
                        )}
                    >
                        <Checkbox inline>PBIL</Checkbox>
                        <Row>
                            { SEARCH_ITEMS.filter(f => f.group === 1).map((cb, i) => getCombo(cb, i, 2)) }
                        </Row>
                    </Panel>
                </Row>
                <Row>
                    <Panel
                        header={(
                            <label>2 - Définir les critères liés aux secteurs</label>
                        )}
                    >
                        { SEARCH_ITEMS.filter(f => f.group === 2).map((cb, i) => getCombo(cb, i, 2)) }
                    </Panel>
                </Row>
                <Row>
                    <Panel
                        header={(
                            <label>3 - Définir les critères liés aux opérations</label>
                        )}
                    >
                        { SEARCH_ITEMS.filter(f => f.group === 3).map((cb, i) => getCombo(cb, i, 1)) }
                    </Panel>
                </Row>
                <Row>
                    <Panel
                        header={(
                            <label>4 - Définir les critères liés aux programmes</label>
                        )}
                    >
                        <Checkbox inline>Est aidé</Checkbox>
                        <Row>
                            {
                                SEARCH_ITEMS.filter(f => f.group === 4).map((el, i) =>  i < 1 ? getCombo(el, i) : null)
                            }
                            {
                                SEARCH_ITEMS.filter(f => f.group === 4).map((el, i) =>  i > 0 ? getCombo(el, i) : null)
                            }
                        </Row>
                        {
                            SEARCH_CALENDARS.filter((el, i) => i < 4 ).map(els => (
                                <Row  style={{ marginTop: "5px" }}>{els.items.map(el => getDate(el))}</Row>
                            ))
                        }
                        {
                            SEARCH_CALENDARS.filter((el, i) => i > 3 ).map(els => (
                                <Row  style={{ marginTop: "5px" }}>{els.items.map(el => getDate(el))}</Row>
                            ))
                        }
                    </Panel>
                </Row>
            </Grid>
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
