import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { isEmpty, keys, isEqual } from 'lodash';
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
        if (!isEmpty(data)) {
            setOptions(createOptions(data));
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

export default connect((state) => ({}), {})(Tabou2Selector);