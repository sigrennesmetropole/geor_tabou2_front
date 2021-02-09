import React, { useEffect } from 'react';

export default () => (Component) => ({ setUp = () => { }, tearDown = () => { }, getState = () => {}, ...props }) => {
    useEffect(() => {
        console.log('INIT');
        if (props.pluginCfg) {
            setUp(props?.pluginCfg);
        }
        return () => tearDown();
    }, [props.enabled]);
    return <Component {...props} />;
};
