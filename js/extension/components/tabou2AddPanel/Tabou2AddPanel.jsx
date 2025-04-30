import React, { useState, useEffect } from 'react';
import { Grid } from 'react-bootstrap';

import { keys, isEqual } from 'lodash';
import Tabou2AddOaPaForm from '@js/extension/components/form/add/Tabou2AddOaPaForm';

export default function Tabou2AddPanel({feature, featureId, layer, ...props}) {
    const [type, setType] = useState("");
    const [selectedFeature, setSelectedFeature] = useState({});
    // hooks for feature change
    useEffect(() => {
        if (!isEqual(selectedFeature, feature)) {
            setSelectedFeature(feature);
        }
    }, [feature]);
    // hooks for layer change
    useEffect(() => {
        if (layer !== type) {
            setType(layer || "");
        }
    }, [layer]);
    // construct drop down data
    const ddOptions = keys(props.pluginCfg.layersCfg).filter(n => n !== "layerSA").map(x => {
        let layerName = props.pluginCfg.layersCfg[x].nom;
        return {
            value: x,
            name: layerName,
            label: props.tocLayers.filter(p => p.name === layerName)[0]?.title
        };
    });
    return (
        <Grid className={"col-xs-12"}>
            <Tabou2AddOaPaForm options={ddOptions} change={(v) => setType(v.value)}select={(v) => setType(v.value)} layer={type} feature={selectedFeature} {...props} pluginCfg={props.pluginCfg} />
        </Grid >
    );
}
