import React from 'react';
import { connect } from 'react-redux';

import { Checkbox, Col, Row, FormGroup, FormControl, Grid } from 'react-bootstrap';


function Tabou2IdentContent({
    response,
    layerName,
    ...props
}) {
    const fields = [
        {
            name: 'estoff',
            fieldApi: 'diffusionRestreinte',
            label: 'Est off',
            api: '',
            type: 'boolean',
            layers: []
        }, {
            name: 'ID_Tabou',
            api: '',
            type: 'number',
            label: 'ID Tabou',
            fieldApi: 'id',
            layers: []
        }, {
            name: 'code',
            api: '',
            label: 'Code',
            type: 'text',
            fieldApi: 'code',
            layers: []
        }, {
            name: 'commune',
            fieldApi: '',
            api: '',
            label: 'Commune',
            type: 'string',
            layers: []
        }, {
            name: 'nature',
            api: '',
            label: 'Nature',
            fieldApi: 'libelle',
            type: 'string',
            layers: []
        }, {
            name: 'nom',
            fieldApi: 'nom',
            label: 'Nom',
            api: '',
            type: 'string',
            layers: []
        }, {
            name: 'numads',
            label: 'Num ADS',
            fieldApi: 'numAds',
            api: '',
            type: 'string',
            layers: []
        }
    ];

    const marginTop = '10px';
    return (
        <Grid style={{ width: '100%' }} className={""} key={'grid-ident-form'}>
            {
                fields.map(field => (
                    <Row style={{ marginTop: marginTop }} key={`key-formrow-${field.name}`}>
                        <Col xs={12}>
                            <FormGroup key={`key-formgp-${field.name}`}>
                                {
                                    field.type === 'boolean' ?
                                        (<Checkbox inline key={`key-chbox-${field.name}`} className="col-xs-3">{field.label}</Checkbox>) : null

                                }
                                {
                                    field.type != 'boolean' ?
                                        (<FormControl
                                            type='text'
                                            key={`key-ctrl-${field.name}`}
                                            placeholder={field.label} />) : null
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                ))
            }

        </Grid>
    )
}
export default connect((state) => ({}), {/*PASS EVT AND METHODS HERE*/ })(Tabou2IdentContent);
