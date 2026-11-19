import React, {useEffect} from 'react';
import Proj4js from 'proj4';

const proj4 = Proj4js;
import {register} from 'ol/proj/proj4';
import {getLayersToRedirect} from './layers';

// Initialize proj4 projection definition
const initializeProjection = () => {
    proj4.defs("EPSG:3948", "+proj=lcc +lat_1=47.25 +lat_2=48.75 +lat_0=48 +lon_0=3 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    register(proj4);
};

// Tabou initialization wrapper component
const TabouInitWrapper = (Component) => (props) => {
    const {
        setUp = () => {
        }, closeTabou = () => {
        }, enabled, pluginCfg,
        tocLayers = [], changeLayerProperties = () => {
        }
    } = props;

    useEffect(() => {
        if (enabled) {
            setUp(pluginCfg);
            initializeProjection();
        }
        return () => {
            closeTabou(pluginCfg);
        };
    }, [enabled, setUp, closeTabou, pluginCfg]);

    // A layer with its own url in layersCfg (the operations layer, only readable through the API proxy, US-323) is
    // redirected to it, whatever the url saved in the context or in a user map. Done even when the panel is closed.
    useEffect(() => {
        getLayersToRedirect(tocLayers, pluginCfg?.layersCfg).forEach(({layer, url}) => changeLayerProperties(layer.id, {
            url,
            search: {type: "wfs", ...layer.search, url},
            // an url change alone does not rebuild the OpenLayers source, a forceProxy change does
            forceProxy: false
        }));
    }, [tocLayers, pluginCfg, changeLayerProperties]);

    return <Component {...props} />;
};

// Higher-order component for Tabou plugin initialization
const withTabouInit = () => TabouInitWrapper;

export default withTabouInit;

