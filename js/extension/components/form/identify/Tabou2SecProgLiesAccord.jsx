import React, {useEffect, useState } from "react";
import { capitalize, isEmpty, isEqual, get } from "lodash";
import { Table, Col, Row, Grid, ControlLabel } from "react-bootstrap";
import "@ext/css/identify.css";

export default function Tabou2SecProgLiesAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);
    const getFields = () => [{
        name: "programmes",
        label: "Liste des programmes",
        type: "table",
        fields: ["nom", "promoteur", "etape", "dateLiv"],
        labels: ["Nom", "Promoteur", "Etape", "Date de livraison"],
        layers:["layerOA","layerSA"],
        source: props?.tabouInfos?.programmes?.elements || [],
        readOnly: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    const getValueByField = (field, val) => {
        let fieldVal;
        switch (field) {
            case "dateLiv":
                fieldVal = val ? new Date(val).toLocaleDateString() : val;
                break;
            default:
                fieldVal = val;
                break;
        }
        return fieldVal;
    }

    /**
     * Effect
     */
    // return writable fields as object-keys

    useEffect(() => {
        const calculFields = getFields();
        if (!isEqual(initialItem, values)) {
            setFields(calculFields);
        }
    }, [initialItem]);

    /**
     * COMPONENT
     */
    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos">
                        <Col xs={12}>
                        {
                            item.type !== "checkbox" ? <ControlLabel>{item.label + ' :'}</ControlLabel> :  null
                        }
                        </Col>
                        <Col xs={12}>
                        {
                            item.type === "table" ? (
                                <Table striped bordered condensed hover>
                                    <thead>
                                        <tr>
                                            {item.fields.map((fieldName,i) => (<th>{capitalize(item.labels[i])}</th>))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            item.source.map(programme => (
                                                <tr>
                                                    {item.fields.map(field => (
                                                        <>
                                                            <td>{getValueByField(field, get(programme, field))}</td>
                                                        </>
                                                    ))}
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            ) : null
                        }
                        </Col>
                    </Row>
                ))
            }
        </Grid>
    );
}
