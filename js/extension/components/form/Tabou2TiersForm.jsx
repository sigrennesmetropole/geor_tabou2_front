import React from "react";
import { Checkbox, Col, Row, FormGroup, FormControl, Grid, ControlLabel } from "react-bootstrap";
import { isEmpty } from "lodash";
import { TIERS_FORMS } from '@ext/constants';

export default function Tabou2TiersForm({ idTier }) {
    const marginTop = "10px";
    return (
        <FormGroup>
            {
                TIERS_FORMS.map(f => (
                    <Col xs={6}>
                        <ControlLabel>{f.label}</ControlLabel>
                        <FormControl
                            type={f.type}
                            pattern={f.pattern}
                            required={f.required}
                            placeholder={f.label} />
                    </Col>
                ))
            }
        </FormGroup>
    );
}
