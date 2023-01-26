import React, { useState, useEffect } from 'react';
import { keys, get, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { Checkbox, Col, Row, FormGroup, Grid, Panel, Glyphicon, Alert } from 'react-bootstrap';
import { currentActiveTabSelector, currentTabouFilters, getLayerFilterObj, searchLoading, getTabouErrors } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import SearchCombo from '@js/extension/components/form/SearchCombo';
import Tabou2Combo from '../form/Tabou2Combo';
import { getRequestApi, searchPlui } from '../../api/requests';
import { setTabouFilterObj, setTabouFilters, resetSearchFilters } from '../../actions/tabou2';
import { getNewFilter, getSpatialCQL, getCQL, getTabouLayersInfos, createWfsPostRequest } from '../../utils/search';
import { SEARCH_ITEMS, SEARCH_CALENDARS } from '@js/extension/constants';
import Message from "@mapstore/components/I18N/Message";
import Tabou2Date from '../common/Tabou2Date';
import "@js/extension/css/tabou.css";

function Tabou2SearchPanel({ change, searchState, getFiltersObj, currentTab, changeFiltersObj, changeFilters, currentFilters, ...props }) {
    if (currentTab !== 'search') return null;
    const layersInfos = getTabouLayersInfos(props?.pluginCfg?.layersCfg || {});
    const config = props.pluginCfg.searchCfg;

    const [comboValues, setComboValues] = useState({});
    const [parents, setParents] = useState({});

    useEffect(() => {
        if (!isEmpty(searchState) && isEmpty(comboValues)) {
            setComboValues(searchState);
        }
    }, [searchState]);

    /**
     * Reset all filters value
     */
    const reset = () => {
        props.resetFiltersObj();
        setComboValues({});
        change({});
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
     * Get info from request and set / replace MapStore filters for each tabou2 layers.
     * Steps :
     *      1. Create CQL filter
     *      2. Change, replace or delete filter for each tabou layer if needed
     *      3. Trigger WFS request to only get id's of feature to display for this filter
     *      4. Trigger action to create new TOC layer filter
     * @param {*} type
     * @param {*} filter
     * @param {*} value
     * @param {*} value
     * @return -
     */
    const changeCqlFilter = (type, filter, value, filterConf) => {
        let cqlCondition = "";
        if (filterConf.cqlCcondition) {
            cqlCondition = filterConf.cqlCcondition[value];
        }
        const layers = keys(layersInfos);
        let filtersObj = getFiltersObj;
        let filters = [];
        layers.forEach(lyr => {
            let cql = "";
            if (lyr === filterConf.layer) {
                cql = getCQL(type, filterConf.filterField, value, cqlCondition);
            } else {
                cql = getSpatialCQL(type, layersInfos[lyr].geom, filterConf.layer, filterConf.geom,  filterConf.filterField, value, layers.includes(filterConf.layer), cqlCondition);
            }
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
            CQLStr.push('id_tabou IS NOT NULL');
            CQLStr = CQLStr.filter(el => el);
            // To change TOC wms request params
            return filters.push({
                layer: lyr,
                params: createWfsPostRequest(CQLStr.join(' AND '), lyr),
                idField: layersInfos[lyr]?.id,
                idType: layersInfos[lyr].type,
                geomField: layersInfos[lyr].geom
            });
        });
        props.searchIds(filters);
    };

    // trigger on filter action
    const changeFilter = (item, value = "") => {
        setComboValues({...comboValues, [item.name]: value});
        change({...comboValues, [item.name]: value});
        changeCqlFilter(get(item, "type"), item.name, value[get(config, `${item.name}.apiField`)], config[item.name]);
    };

    // if date was changed
    const changeDate = (calendar, value) => {
        let valDate = {
            ...comboValues,
            [calendar.name]: {
                start: calendar.isStart ? value : get(comboValues, `${calendar.name}.start`),
                end: !calendar.isStart ? value : get(comboValues, `${calendar.name}.end`)
            }
        };
        setComboValues(valDate);
        change(valDate);
        changeCqlFilter("date", calendar.name, valDate[calendar.name], config[calendar.name]);
    };

    // if checkbox change
    const changeChecked = (name) => {
        let isChecked = !comboValues[name];
        setComboValues({...comboValues, [name]: isChecked});
        change({...comboValues, [name]: isChecked});
        changeCqlFilter("boolean", name, isChecked, config[name]);
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
                <FormGroup className="tabou-form-group">
                    {
                        combo?.autocomplete ? (
                            <SearchCombo
                                minLength={1}
                                textField={get(config, `${combo.name}.apiLabel`)}
                                valueField={get(config, `${combo.name}.apiField`)}
                                value={comboValues[combo.name]}
                                forceSelection
                                search={
                                    text => searchPlui(text)
                                        .then(results =>
                                            results.elements.map(v => v)
                                        )
                                }
                                onSelect={v => changeFilter(combo, v)}
                                onChange={v => changeFilter(combo, v)}
                                className="tabou-search-combo"
                                name={combo.name}
                                placeholder={props.i18n(props.messages, combo.placeholder)}
                            />)
                            : (<Tabou2Combo
                                className="tabou-search-combo"
                                load={() => getRequestApi(get(combo, "api") || get(combo, "name"), props.pluginCfg.apiCfg, urlParams)}
                                disabled={isDisabled(combo, urlParams)}
                                placeholder={props.i18n(props.messages, combo.placeholder)}
                                parentValue={parentValue}
                                textField={get(config, `${combo.name}.apiLabel`)}
                                valueField={get(config, `${combo.name}.apiField`)}
                                onLoad={(r) => r?.elements || r}
                                name={combo.name}
                                value={comboValues[combo.name]}
                                onSelect={v => changeFilter(combo, v)}
                                onChange={(v) => !v ? changeFilter(combo, v) : null}
                                messages={{
                                    emptyList: props.i18n(props.messages, "tabou2.emptyList"),
                                    emptyFilter: props.i18n(props.messages, "tabou2.nodata")
                                }}
                            />)
                    }
                </FormGroup>
            </Col>
        );
    };

    /**
     * Create date form component with nativ mapstore2 UTCDateTimePicker component
     * @param {object} item
     * @returns
     */
    const getDate = (item) => {
        let defaultVal = get(comboValues, `${item.name}.${item.isStart ? "start" : "end"}`) || null;
        return (
            <Col xs={6}>
                <FormGroup className="tabou-form-group">
                    <Tabou2Date
                        type="date"
                        className="tabou-search-combo"
                        dropUp
                        placeholder={props.i18n(props.messages, item.label)}
                        calendar
                        time={false}
                        culture="fr"
                        value={defaultVal ? new Date(defaultVal) : null}
                        format="DD/MM/YYYY"
                        onSelect={(e) => changeDate(item, new Date(e).toISOString(e))}
                        onChange={(e) => !e ? changeDate(item, e) : null}
                    />
                </FormGroup>
            </Col>
        );
    };

    return (
        <>
            <Grid className={"col-xs-12"}>
                <div id="tabou2-tbar-container" className="text-center">
                    <Tabou2SearchToolbar
                        {...props}
                        filters={getFiltersObj}
                        apply={props.applyFilterObj}
                        reset={reset}/>
                </div>
                { props.getTabouErrors.msg ? (
                    <Alert className={"alert-" + props.getTabouErrors.typeMsg}>
                        <Glyphicon glyph="filter" />
                        <Message msgId={props.i18n(props.messages, props.getTabouErrors?.msg || " ")}/>
                    </Alert>) : null
                }
                <Row>
                    <Panel
                        header={(
                            <label><Message msgId="tabou2.search.partOne"/></label>
                        )}
                        className="tabou-panel"
                    >
                        { SEARCH_ITEMS.filter(f => f.group === 1).map((cb) => getCombo(cb)) }
                        <div className="col-xs-12">
                            <Checkbox
                                className="tabou-search-combo"
                                checked={get(comboValues, "pbil") || false}
                                onChange={() => changeChecked("pbil")}
                                inline
                                id={"search-pbil" + new Date().getTime()}>
                                <Message msgId="tabou2.search.pbil"/>
                            </Checkbox>
                        </div>
                    </Panel>
                </Row>
                <Row>
                    <Panel
                        header={(
                            <label><Message msgId="tabou2.search.partTwo"/></label>
                        )}
                        className="tabou-panel"
                    >
                        { SEARCH_ITEMS.filter(f => f.group === 2).map((cb, i) => getCombo(cb, i, 2)) }
                    </Panel>
                </Row>
                <Row>
                    <Panel
                        header={(
                            <label><Message msgId="tabou2.search.partThree"/></label>
                        )}
                        className="tabou-panel"
                    >
                        { SEARCH_ITEMS.filter(f => f.group === 3).map((cb, i) => getCombo(cb, i, 1)) }
                    </Panel>
                </Row>
                <Row>
                    <Panel
                        header={(
                            <label><Message msgId="tabou2.search.partFour"/></label>
                        )}
                        className="tabou-panel"
                    >
                        <div className="col-xs-12">
                            <Checkbox inline><Message msgId="tabou2.search.isHelp"/></Checkbox>
                        </div>
                        {
                            SEARCH_ITEMS.filter(f => f.group === 4).map((el, i) =>  (i < 1 || i > 0) ? getCombo(el, i) : null)
                        }
                        {
                            SEARCH_CALENDARS.filter((el, i) => i < 4 ).map(els => (
                                els.items.map(el => getDate(el))
                            ))
                        }
                        {
                            SEARCH_CALENDARS.filter((el, i) => i > 3 ).map(els => (
                                els.items.map(el => getDate(el))
                            ))
                        }
                    </Panel>
                </Row>
            </Grid>
        </>
    );
}

// mandatory to connect component with store / redux
export default connect((state) => ({
    // searchFilter: getSearchFilters
    currentTab: currentActiveTabSelector(state),
    currentFilters: currentTabouFilters(state),
    getFiltersObj: getLayerFilterObj(state),
    searchLoading: searchLoading(state),
    getTabouErrors: getTabouErrors(state)
}), {
    /* PASS EVT AND METHODS HERE*/
    changeFilters: setTabouFilters,
    changeFiltersObj: setTabouFilterObj,
    resetFiltersObj: resetSearchFilters
})(Tabou2SearchPanel);