import React, { useEffect } from 'react';

export default () => (Component) => ({ setUp = () => { }, tearDown = () => {}, openOnLoad, open = () => {}, ...props }) => {
    // configuration load and initial setup
    useEffect(() => {
        setUp(props?.pluginCfg);
    }, []);
    return <Component {...props} />;
};
