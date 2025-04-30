import React, { useEffect } from 'react';
import Proj4js from 'proj4';
const proj4 = Proj4js;
import { register } from 'ol/proj/proj4.js';

export default () => (Component) => ({ setUp = () => { }, closeTabou = () => { }, ...props }) => {
    // configuration load and initial setup
    useEffect(() => {
        if (props.enabled) {
            setUp(props?.pluginCfg);
            proj4.defs("EPSG:3948", "+proj=lcc +lat_1=47.25 +lat_2=48.75 +lat_0=48 +lon_0=3 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
            register(proj4);
        }
        return () => {
            closeTabou(props?.pluginCfg);
        };
    }, [props.enabled]);
    return <Component {...props} />;
};
