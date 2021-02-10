import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { isEmpty, isEqual } from 'lodash';
import { DropdownList } from 'react-widgets';

function Tabou2Selector({
    data,
    setIndex,
    id,
    createOptions,
    defaultIndex = 0
}) {

    const [options, setOptions] = useState([]);

    useEffect(() => { // options
        if (!isEmpty(data) && createOptions) {
            let newOptions = createOptions(data);
            if(!isEqual(newOptions, options)) {
                setOptions(newOptions);
            }
            //setIndex(0);
        }
    }, [data, setIndex]);

    return (
        <div id={id} style={{ flex: "1 1 0%", padding: "0px 4px" }}>
            <DropdownList
                defaultValue={defaultIndex}
                disabled={options.length ? false : true}
                key={'ddown-layer' + id}
                data={options}
                valueField={'value'}
                textField={'label'}
                onChange={setIndex}
                onSelect={(e) => console.log(e)}
                placeholder={'Sélection...'} />
        </div>
    )

}

export default connect((state) => ({
}), {})(Tabou2Selector);