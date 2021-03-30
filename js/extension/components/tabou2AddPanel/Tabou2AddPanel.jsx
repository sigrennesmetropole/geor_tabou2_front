import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, FormGroup, Checkbox, FormControl, ControlLabel } from 'react-bootstrap';
import { DropdownList} from 'react-widgets';
import Tabou2Combo from '@ext/components/form/Tabou2Combo';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { get, keys } from 'lodash';
import { getRequestApi } from '@ext/api/search';
import Tabou2AddOaPaForm from '@ext/components/form/add/Tabou2AddOaPaForm';
import { ADD_OA_FORM, ADD_PA_FORM } from '@ext/constants';

export default function Tabou2AddPanel({layer, ...props}) {
    let types = [{
        value: "layerOA",
        label: "Opération"
    }, {
        value: "layerPA",
        label: "Programme"
    }];
    const [type, setType] = useState("layerOA");
    const [operation, setOperation] = useState({});
    const [nature, setNature] = useState("");
    const [emprise, setEmprise] = useState({});
    const [infos, setInfos] = useState({
        code: "",
        nom: "",
        secteur: false,
        etape: ""
    });

    /**
     * TODO : event on combobox layerOA / layerPA change to display correct form panel
     */
    useEffect(() => {
        return;
    }, [type]);

    const comboMarginTop = "10px";

    const valid = () => {
        return false;
    };

    const changeState = (combo, value) => {
        infos[combo.name] = value;
        setInfos(infos);
    };

    return (
        <Grid className={"col-xs-12"}>
            <Row>
                <Col xs={12}>
                    <FormGroup >
                        <DropdownList
                            style={{ marginTop: comboMarginTop }}
                            data = {types}
                            valueField = {"value"}
                            textField = {"label"}
                            defaultValue = {layer || "layerOA"}
                            onChange={(value) => {
                                setType(value.value);
                            }}
                        />
                    </FormGroup>
                </Col>
            </Row>
            {
                type === "layerOA" || !type ? (
                    <Tabou2AddOaPaForm layer={type} childs={ADD_OA_FORM} pluginCfg={props.pluginCfg} />
                ) : (
                    <Tabou2AddOaPaForm layer={type} childs={ADD_PA_FORM} pluginCfg={props.pluginCfg} />
                )
            }
            <Row className="tabou-idToolbar-row text-center" style={{ display: "flex", margin: "auto", justifyContent: "center" }}>
                <Toolbar
                    btnDefaultProps={{
                        className: "square-button-md",
                        bsStyle: "primary"
                    }}
                    btnGroupProps={{
                        style: {
                            margin: 10
                        }
                    }}
                    buttons={[{
                        glyph: "ok",
                        tooltip: "Enregistrer",
                        id: "saveNewEmprise",
                        onClick: () => valid()
                    }]}
                />
            </Row>
        </Grid >
    );
}
