import React, {useEffect, useState } from "react";
import { capitalize, isEmpty, isEqual, get } from "lodash";
import { Table, Col, Row, Grid } from "react-bootstrap";
import "@js/extension/css/identify.css";

export default function Tabou2SecProgLiesAccord({ initialItem, programme, operation, mapFeature, ...props }) {
    let layer = props?.selection?.layer;

    const [values, setValues] = useState({});
    const [fields, setFields] = useState([]);

    // get fields for this section
    const getFields = () => [{
        name: "programmes",
        type: "table",
        fields: ["nom", "promoteur", "etape", "dateLiv"],
        labels: [
            "tabou2.identify.accordions.name",
            "tabou2.identify.accordions.promoteur",
            "tabou2.identify.accordions.step",
            "tabou2.identify.accordions.dateLiv"
        ],
        layers: ["layerOA", "layerSA"],
        source: props?.tabouInfos?.programmes?.elements || [],
        readOnly: true
    }].filter(el => el?.layers?.includes(layer) || !el?.layers);

    // get value for field - usefull to display date info correctly
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
    };

    // hooks
    useEffect(() => {
        const calculFields = getFields();
        if (!isEqual(initialItem, values)) {
            setValues(initialItem);
            setFields(calculFields);
        }
    }, [initialItem]);

    return (
        <Grid style={{ width: "100%" }} className={""}>
            {
                fields.filter(f => isEmpty(f.layers) || f?.layers.indexOf(layer) > -1).map(item => (
                    <Row className="attributeInfos tableInfos">
                        <Col xs={12} style={{maxHeight: "100%", overflow: "auto"}}>
                            {
                                item.type === "table" ? (
                                    <Table striped bordered condensed hover>
                                        <thead>
                                            <tr>
                                                {item.fields.map((fieldName, i) =>
                                                    (
                                                        <th>{capitalize(props.i18n(props.messages, item.labels[i]))}</th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                item.source.map(programmeItem => (
                                                    <tr>
                                                        {item.fields.map(field => (
                                                            <>
                                                                <td>{getValueByField(field, get(programmeItem, field))}</td>
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
