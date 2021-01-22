import React from 'react';
import { isEqual, find } from 'lodash';
import { connect } from 'react-redux';
import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid, FormControl } from 'react-bootstrap';
import { DropdownList, DateTimePicker, Combobox } from 'react-widgets';
import { currentActiveTabSelector, currentTabouFilters } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import Tabou2Combo from '../common/Tabou2Combo';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import { getCommunes } from '../../api/search';
import { getGeomByCql } from '../../api/wfs';
import { COMMUNE_LAYER_ID } from '../../constants';

import { setTabouFilters } from '../../actions/tabou2';



const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ currentTab, applyFilter = () => { }, currentFilters, ...props }) {
    if (currentTab != 'search') return;
    const marginTop = '10px';
    const comboMarginTop = '5px';

    const getFilter = (layerTypeName = '', spatialFilter = {}, textFilters = [], crossLayer = null) => {
        return {
            "featureTypeName": layerTypeName || '',
            "groupFields": [{
                "id": 1,
                "logic": "OR",
                "index": 0
            }],
            "filterFields": textFilters || [],
            "spatialField": spatialFilter || {},
            "pagination": null,
            "filterType": "OGC",
            "ogcVersion": "1.1.0",
            "sortOptions": null,
            "crossLayerFilter": crossLayer || null,
            "hits": false
        }
    };


    // set commune filter
    const addTextCommFilters = (layer, val) => {
        if (!val) return currentFilters
        console.log(currentFilters);
        const newFilter = {
            attribute: 'code_insee',
            exception: null,
            fieldOptions: { valuesCount: 0, currentPage: 1 },
            groupId: 1,
            operator: "=",
            rowId: null,
            type: 'number', // number, string
            value: val,
        }
        if (!Object.keys(currentFilters).length) {
            currentFilters = getFilter(layer, null, [], null);
        }
        let filters = currentFilters.filterFields;
        // drop already exist attribute filter on this field
        filters = filters.filter(f => !f.attribute === 'code_insee');
        filters.push(newFilter);

        currentFilters.filterFields = filters;

        return applyFilter(currentFilters);
    };


    // set commune filter
    const changeQuartJardin = (layer, val) => {
        if (!val) return currentFilters
        const newFilter = {
            attribute: 'nuquart',
            exception: null,
            fieldOptions: { valuesCount: 0, currentPage: 1 },
            groupId: 1,
            operator: "=",
            rowId: null,
            type: 'number', // number, string
            value: val,
        }

        currentFilters = getFilter(layer, null, [], null);

        let filters = currentFilters.filterFields;
        // drop already exist attribute filter on this field
        filters = filters.filter(f => !f.attribute === 'nuquart');
        filters.push(newFilter);

        currentFilters.filterFields = filters;

        return applyFilter(currentFilters);
    };


    // WFS request
    const getCommuneGeom = (layerName = 'urba_proj:v_oa_programme', code) => {
        return addTextCommFilters(layerName, code);
        getGeomByCql(COMMUNE_LAYER_ID, `code_insee in ('${code}')`).then(
            response => {
                if (!response.totalFeatures) return; // no CQL result
                return;
            }
        )
    };

    return (
        <>
            <div id="tabou2-tbar-container" style={{ display: "flex", margin: "auto", justifyContent: "center" }} className="text-center">
                <Tabou2SearchToolbar />
            </div>
            <Grid fluid className={"fluid-container adjust-display"}>
                <Row>
                    <Col xs={8}>
                        {/* search by input */}
                        <FormGroup controlId="searchInWfs">
                            <ControlLabel inline>Recherche :</ControlLabel>
                            <FormControl
                                className='col-xs-8'
                                inline
                                placeholder="Saisir un nom..."
                                key="search-in-wfs-title"
                                size="sm"
                                type="text" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: marginTop }}>
                    <Col xs={12}>
                        <FormGroup>
                            <Checkbox inline key="search-chbox-diffus" className="col-xs-3">En diffus</Checkbox>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: marginTop }}>
                    <Col xs={12}>
                        <FormGroup>
                            <Checkbox inline key="search-chbox-isaide" className="col-xs-3">Est aidé</Checkbox>
                            <Checkbox inline key="search-chbox-estpublic">Est public</Checkbox>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: marginTop }}>
                    <Col xs={6}>
                        {/* left combo box */}
                        <FormGroup>
                            <Tabou2Combo
                                style={{ marginTop: comboMarginTop }}
                                key='search-commune-boxTest'
                                load={getCommunes}
                                placeholder='COMMUNES'
                                textField='nom'
                                searchField='elements'
                                valueField='code_insee'
                                onLoad={(r) => { return r?.elements }}
                                onChange={(t) => { addTextCommFilters('tabou2:v_oa_programme', t['code_insee']) }}
                            />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-quartierjardin-box"
                                data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                                placeholder={'DEV-QUARTIERS'}
                                onChange={(t) => { changeQuartJardin('espub_mob:gev_jeu', t) }}
                            />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-irisjardin-box"
                                data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                                placeholder={'DEV-IRIS'}
                                onChange={(t) => { changeQuartJardin('espub_mob:gev_jeu', t) }}
                            />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-quartier-box"
                                data={['Centre', 'Cleunay', 'Sacrés-Coeur', 'Thabor', 'Poterie', 'Patton']}
                                placeholder={'QUARTIER'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-iris-box"
                                data={['RENNES', 'LAILLE', 'TORIGNE OUEST', 'BRUZ CENTRE NORD', 'VERN SUR SEICHE SUD ET EST', 'PACE SUD']}
                                placeholder={'IRIS'} />

                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-etape-box"
                                data={[256, 512]}
                                placeholder={'ETAPE'} />
                            <Combobox
                                style={{ marginTop: comboMarginTop }}
                                key="search-maitre-box"
                                data={[256, 512]}
                                placeholder={"MAITRE D\'OUVRAGE"} />
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup >
                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-secsamspeu-nature"
                                data={['ZAC', 'ZA']}
                                placeholder={'Nature'} />
                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-secsamspeu-box"
                                data={[256, 512]}
                                placeholder={'Sec. Sam/Speu'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-secfon-box"
                                data={[256, 512]}
                                placeholder={'Sec. Foncier'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-sechab-box"
                                data={[256, 512]}
                                placeholder={'Sec. Habitat'} />

                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-typefinan-box"
                                data={[256, 512]}
                                placeholder={'Type Financement'} />
                            <DropdownList
                                style={{ marginTop: comboMarginTop }}
                                key="search-anneeliv-box"
                                data={[2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]}
                                placeholder={'Année de livraison'} />
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel inline>Livraison du :
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