import React, {useState, useEffect} from "react";
import { Col, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { get, keys } from "lodash";

export default function Tabou2TiersForm({ readOnly = false, visible, tier, change = () => {}}) {
    const marginTop = "10px";

    const [thisTier, setThisTier] = useState({});

    useEffect(() => {
        setThisTier(tier);
    }, [visible]);

    const changeProps = (field, val) => {
        let newProp = {};
        newProp[field] = val;
        setThisTier({...thisTier, ...newProp});
        change(thisTier.id, field, val);
    };

    const TIERS_FORMS = [{
        apiField: "adresseCp",
        label: "Code postal",
        type: "text",
        required: true,
        pattern: "^[0-9]*$"
    }, {
        apiField: "adresseNum",
        label: "Numéro",
        type: "text",
        required: false,
        pattern: "^[0-9]*$"
    }, {
        apiField: "adresseRue",
        label: "Rue",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "adresseVille",
        label: "Ville",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "contact",
        label: "Contact",
        type: "text",
        required: true,
        pattern: ""
    }, {
        apiField: "email",
        label: "Email",
        type: "email",
        required: true,
        pattern: ""
    }, {
        apiField: "siteWeb",
        label: "Site web",
        type: "string",
        required: false,
        pattern: ""
    }, {
        apiField: "telecopie",
        label: "Fax",
        type: "text",
        required: false,
        pattern: "^[0-9]*$"
    }, {
        apiField: "telephone",
        label: "Téléphone",
        type: "text",
        required: true,
        pattern: "^[0-9]*$"
    }];

    return (
        <FormGroup>
            {
                TIERS_FORMS.filter(t => keys(tier).includes(t.apiField)).map(f => (
                    <Col xs={6} style={{marginTop: marginTop}}>
                        <ControlLabel>{f.label}</ControlLabel>
                        <FormControl
                            type={f.type}
                            required={f.required}
                            value={get(thisTier, f.apiField)}
                            placeholder={f.label}
                            readOnly={readOnly || false}
                            onChange={(t) => changeProps(f.apiField, t.target.value)}
                        />
                    </Col>
                ))
            }
        </FormGroup>
    );
}
