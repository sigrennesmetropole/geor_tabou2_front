import React from 'react';
import { connect } from 'react-redux';
import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid, FormControl } from 'react-bootstrap';
import { DropdownList, DateTimePicker, Combobox } from 'react-widgets';
import { currentActiveTabSelector } from '../../selectors/tabou2';
import Tabou2SearchToolbar from './Tabou2SearchToolbar';
import Tabou2Combo from '../common/Tabou2Combo';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';
import { getCommunes } from '../../api/search';
import { getGeomByCql } from '../../api/wfs';
import { COMMUNE_LAYER_ID, GEOSERVER_WFS_URL } from '../../constants';

import filterBuilder from '@mapstore/utils/ogc/Filter/FilterBuilder';



const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ changeLayer, currentTab, filters = [], ...props }) {
    console.log(props);
    if (currentTab != 'search') return;
    const marginTop = '10px';
    const comboMarginTop = '5px';

    const getFilter = (layerTypeName, spatialFilter, textFilters, crossLayer) => {
        return {
            "featureTypeName": layerTypeName,
            "groupFields": [{
                "id": 1,
                "logic": "OR",
                "index": 0
            }],
            "filterFields": textFilters,
            "spatialField": spatialFilter,
            "pagination": null,
            "filterType": "OGC",
            "ogcVersion": "1.1.0",
            "sortOptions": null,
            "crossLayerFilter": crossLayer,
            "hits": false
        }
    }

    const getCommuneGeom = (layerName = 'urba_proj:v_oa_programme', code) => {
        getGeomByCql(COMMUNE_LAYER_ID, `code_insee in ('${code}')`).then(
            response => {

                if (!response.totalFeatures) return; // no CQL result

                //let layer = props.tocLayers.filter(lyr => lyr.name === layerName);
                /*let filter = getFilter(
                    layerName,
                    {
                        "method": null,
                        "operation": "INTERSECTS",
                        "geometry": response?.features[0]?.geometry,
                        "attribute": "shape"
                    },
                    null,
                    true
                );*/

                let layer = props.tocLayers.filter(lyr => lyr.name === 'espub_mob:gev_jeu');

                let url = "https://public.sig.rennesmetropole.fr/geoserver/wfs";
                let filterObj = JSON.parse('{"featureTypeName":"espub_mob:gev_jeu","groupFields":[{"id":1,"logic":"OR","index":0}],"filterFields":[{"rowId":1610996284418,"groupId":1,"attribute":"nom","operator":"like","value":"PLACE SIMON","type":"string","fieldOptions":{"valuesCount":0,"currentPage":1},"exception":null}],"spatialField":{"method":null,"operation":"INTERSECTS","geometry":null,"attribute":"shape"},"pagination":null,"filterType":"OGC","ogcVersion":"1.1.0","sortOptions":null,"crossLayerFilter":null,"hits":false}');

                filterObj.spatialField = {
                    "method": "BBOX",
                    "operation": "INTERSECTS",
                    "geometry": response?.features[0]?.geometry,
                    "attribute": "shape"
                };

                console.log(filterObj);

                // Apply attribute filter only ==> WORK WITHOUT SPATIAL FIELD !!
                //props.changeLayerProperties(layer[0]?.id, { layerFilter: filterObj });


                //props.onQuery(url, filterObj, { typeName: 'espub_mob:gev_jeu' });
                addFilterToLayer(layer.id, newFilter)

            }
        )
    }

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
                    <Col xs={6}>
                        {/* left checkbox group */}
                        <FormGroup>
                            <Checkbox key="search-chbox-oa" >Opération</Checkbox>
                            <Checkbox key="search-chbox-sa" >Secteur</Checkbox>
                            <Checkbox key="search-chbox-pr" >Programme</Checkbox>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        {/* right checkbox group */}
                        <FormGroup>
                            <Checkbox key="search-chbox-zac" >ZAC</Checkbox>
                            <Checkbox key="search-chbox-za" >ZA</Checkbox>
                            <Checkbox key="search-chbox-diffus" >En diffus</Checkbox>
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
                                onChange={(t) => { getCommuneGeom('urba_proj:v_oa_programme', t['code_insee']) }}
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
                    <Col xs={12}>
                        <FormGroup>
                            <Checkbox inline key="search-chbox-isaide" className="col-xs-3">Est aidé</Checkbox>
                            <Checkbox inline key="search-chbox-estpublic">Est public</Checkbox>
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
    currentTab: currentActiveTabSelector(state)
}), {
    /*PASS EVT AND METHODS HERE*/
    // changeFilter: setSearchFilters
})(Tabou2SearchPanel);