import React from 'react';
import { connect } from 'react-redux';
import { Checkbox, Col, Row, ControlLabel, FormGroup, Grid, FormControl, Form } from 'react-bootstrap';
import { DropdownList, DateTimePicker, Combobox } from 'react-widgets';
import { currentActiveTabSelector } from '../../selectors/tabou2';
import utcDateWrapper from '@mapstore/components/misc/enhancers/utcDateWrapper';

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

function Tabou2SearchPanel({ currentTab }) {
    if (currentTab != 'search') return;
    const marginTop = '10px';
    const comboMarginTop = '5px';
    return (
        <Grid fluid className={"fluid-container adjust-display"}>
            <Row>
                <Col xs={8}>
                    {/* search by input */}
                    <FormGroup controlId="searchInWfs">
                        <ControlLabel inline>Recherche :</ControlLabel>
                        <FormControl
                            inline
                            placeholder="Saisir un nom..."
                            key="search-in-wfs-title"
                            size="sm"
                            sm={4}
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
                        <Combobox
                            style={{ marginTop: comboMarginTop }}
                            key="search-commune-box"
                            data={['Rennes', 'Cesson-Sévigné', 'Vezin-le-Coquet', 'Saint-Grégoire']}
                            placeholder={'COMMUNES'} />

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
    )
}

export default connect((state) => ({
    currentTab: currentActiveTabSelector(state)
}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2SearchPanel);