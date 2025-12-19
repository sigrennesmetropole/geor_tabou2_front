import React from "react";
import find from "lodash/find";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import {Row, Col, FormControl, ControlLabel, Checkbox} from "react-bootstrap";
import Message from "@mapstore/components/I18N/Message";
import Tabou2Select from '@js/extension/components/form/Tabou2Select';
import Tabou2Date from '@js/extension/components/common/Tabou2Date';
import SearchCombo from '@js/extension/components/form/SearchCombo';
import {getRequestApi} from "@js/extension/api/requests";

export const findValueByType = (codeId, values, type) => {
    const field = type === "contributions" ? "typeContribution" : "typeProgrammation";
    return find(values[type], [`${field}.id`, codeId]);
};

export const renderField = (item, i18n, messages, allowChange) => (
    <Row key={item.name}>
        <Col xs={4}>
            <ControlLabel><Message msgId={item.label}/></ControlLabel>
        </Col>
        <Col xs={4}>
            {
                ["text", "number"].includes(item.type) ?
                    (<FormControl
                        componentClass={item.isArea ? "textarea" : "input"}
                        placeholder={i18n(messages, item.label)}
                        style={{height: item.isArea ? "100px" : "auto"}}
                        type={item.type}
                        min="0"
                        step={item?.step}
                        value={get(item.source(), item.field) || ""}
                        readOnly={item.readOnly || !allowChange}
                        onChange={(v) => {
                            return item.change(item.type === "number" && v.target.value < 0 ? "" : v.target.value);
                        }}
                        onKeyDown={(v) => {
                            if (item.type !== "number") return;
                            // only keep numeric and special key control as "Delete" or "Backspace"
                            if (!/^[0-9.,]/.test(v.key) && v.key.length < 2) {
                                v.returnValue = false;
                                if (v.preventDefault) v.preventDefault();
                            }
                        }}
                    />) : null
            }
        </Col>
    </Row>
);

export const shouldShowField = (field, layer) => {
    return isEmpty(field.layers) || field.layers?.indexOf(layer) > -1;
};

export const changeByType = (codeId, value = "", values, type) => {
    const field = type === "contributions" ? "typeContribution" : "typeProgrammation";
    const infos = values[type];
    const newInfos = infos.filter(f => f[field].id !== codeId);
    let findThisCode = findValueByType(codeId, values, type);
    // add new one if not already exists
    if (!findThisCode) {
        findThisCode = {
            [field]: {id: codeId}
        };
    }
    // set or update description value
    newInfos.push({...findThisCode, description: value});
    return {[type]: newInfos};
};

export const getCodeIdByCode = (ids, code) => {
    const codeToUse = ids.filter(el => el.code === code);
    if (!codeToUse.length) {
        console.log("This code don't exists : " + code);
    }
    return ids.filter(el => el.code === code)[0]?.id;
};

export const getCompositionProgrammationFields = (values, setValues) => [
    {
        name: "compositionProgrammation",
        label: "tabou2.vocation.compoProg",
        isArea: true,
        field: "operation",
        type: "text",
        layers: [],
        source: () => values,
        change: (value) => setValues({operation: value}),
        readOnly: false
    }
];

export const renderProgrammationField = (item, i18n, messages, allowChange, values) => (
    <Row key={item.name}>
        <Col xs={4}>
            <ControlLabel><Message msgId={item.label}/></ControlLabel>
        </Col>
        <Col xs={4}>
            {
                ["text", "number"].includes(item.type) && (
                    <FormControl
                        componentClass={item.isArea ? "textarea" : "input"}
                        placeholder={i18n(messages, item.label)}
                        style={{height: item.isArea ? "100px" : "auto"}}
                        type={item.type}
                        min="0"
                        step={item?.step}
                        value={get(item.source(), item.field)}
                        readOnly={item.readOnly || !allowChange}
                        onChange={(v) => {
                            return item.change(v.target.value);
                        }}
                        onKeyDown={(v) => {
                            if (item.type !== "number") return;
                            // only keep numeric and special key control as "Delete" or "Backspace"
                            if (!/^[0-9.,]/.test(v.key) && v.key.length < 2) {
                                v.returnValue = false;
                                if (v.preventDefault) v.preventDefault();
                            }
                        }}
                    />
                )
            }
            {item.type === "checkbox" && (
                <Checkbox
                    checked={get(values, item.field) || false}
                    disabled={!allowChange}
                    style={{marginBottom: "10px"}}
                    id={`${item.name}-progLogements-${new Date().getTime()}`}
                    onChange={() => {
                        item.change();
                    }}
                    change
                />)
            }
            {
                item.type === "combo" && (
                    <Tabou2Select
                        load={item.api}
                        defaultValue={get(values, item.field)}
                        placeholder={i18n(messages, item.label)}
                        textField={item.apiLabel}
                        disabled={!allowChange}
                        filter={false}
                        value={get(values, item.field) || ""}
                        onLoad={(r) => r?.elements || r}
                        onSelect={(t) => {
                            item.change(t);
                        }}
                        onChange={(t) => {
                            if (!t) item.change("");
                        }}
                    />
                )
            }
            {item.type === "date" && (
                <Tabou2Date
                    type="date"
                    className="identifyDate"
                    placeholder={i18n(messages, item.label)}
                    readOnly={item?.readOnly || !allowChange}
                    calendar
                    culture="fr"
                    time={false}
                    value={get(values, item.field) ? new Date(get(values, item.field)) : null}
                    format="DD/MM/YYYY"
                    onSelect={(t) => {
                        item.change(t ? new Date(t).toISOString() : null);
                    }}
                    onChange={(t) => {
                        item.change(t ? new Date(t).toISOString() : null);
                    }}
                />
            )}
        </Col>
    </Row>
);

/**
 * Get date value from item and source for identify accordions
 */
export const getDateValue = (item, src) => {
    let defaultValue = null;
    if (item.name !== item.field) {
        defaultValue = get(src, `${item.name}.${item.field}`);
    } else if (src[item.name]) {
        defaultValue = get(src, item.name);
    }
    return defaultValue ? new Date(defaultValue) : null;
};

/**
 * Handle date change for identify accordions
 */
export const handleDateChange = (item, v, initialItem, changeProp) => {
    if (item.name !== item.field) {
        changeProp({
            [item.name]: {
                ...initialItem[item.name],
                [item.field]: v ? new Date(v).toISOString() : ""
            }
        });
    } else {
        changeProp({[item.name]: v ? new Date(v).toISOString() : ""});
    }
};

/**
 * Render date field for identify accordions
 */
export const renderIdentifyDateField = (item, initialItem, changeProp, i18n, messages, allowChange) => (
    <Tabou2Date
        type="date"
        className="identifyDate"
        inline="true"
        dropUp
        placeholder={i18n(messages, item?.label || "")}
        readOnly={item.readOnly || !allowChange}
        calendar
        time={false}
        culture="fr"
        value={getDateValue(item, initialItem) || null}
        format="DD/MM/YYYY"
        refreshValue={initialItem}
        refresh={(o, n) => isEqual(o, n)}
        onSelect={(v) => handleDateChange(item, v, initialItem, changeProp)}
        onChange={(v) => handleDateChange(item, v, initialItem, changeProp)}
    />
);

/**
 * Render autocomplete combo for identify accordions
 */
export const renderIdentifyAutoCompleteCombo = (item, handleApiSearch, i18n, messages, initialItem) => (
    <SearchCombo
        minLength={3}
        textField={item.apiLabel}
        valueField={item.apiField}
        forceSelection
        value={item.value}
        search={handleApiSearch(item)}
        onSelect={(e) => item.select(e, initialItem)}
        onChange={(e) => item.change(e, initialItem)}
        name={item.name}
        placeholder={i18n(messages, item?.label || "")}
    />
);

/**
 * Render standard combo for identify accordions
 */
export const renderIdentifyStandardCombo = (item, apiCfg, i18n, messages, allowChange, initialItem) => (
    <Tabou2Select
        load={() => item.values ? Promise.resolve(item.values) : getRequestApi(item.api, apiCfg, {})}
        placeholder={i18n(messages, item?.placeholder || "")}
        filter="contains"
        disabled={item.readOnly || !allowChange}
        textField={item.apiLabel}
        onLoad={(r) => r?.elements || r}
        name={item.name}
        value={item.value}
        onSelect={item.select ? (v) => item.select(v, initialItem) : null}
        onChange={(v) => !v ? item.change(v, initialItem) : null}
        messages={{
            emptyList: i18n(messages, "tabou2.emptyList"),
            openCombobox: i18n(messages, "tabou2.displayList")
        }}
    />
);

/**
 * Render text or number field for identify accordions
 */
export const renderIdentifyTextOrNumberField = (item, i18n, messages, allowChange, types, initialItem) => (
    <FormControl
        componentClass={item.isArea ? "textarea" : "input"}
        placeholder={i18n(messages, item?.label || "")}
        value={item.value}
        type={item.type}
        min="0"
        style={{height: item.isArea ? "100px" : "auto"}}
        readOnly={item.readOnly || !allowChange}
        onChange={(v) => item.change(v.target.value, types, initialItem)}
    />
);
