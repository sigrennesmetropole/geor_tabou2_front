import { find } from "lodash";
export const findValueByType = (code, values, type) => {
    const field = type === "contributions" ? "typeContribution" : "typeProgrammation";
    return find(values[type], [`${field}.code`, code]);
};

export const changeByType = (code, value = "", values, type, codeId) => {
    const field = type === "contributions" ? "typeContribution" : "typeProgrammation";
    const infos = values[type];
    const newInfos = infos.filter(f => f[field].code !== code);
    let findThisCode = findValueByType(code, values, type);
    // add new one if not already exists
    if (!findThisCode) {
        findThisCode = {
            [field]: { id: codeId }
        };
    }
    // set or update description value
    newInfos.push({ ...findThisCode, description: value });
    return { ...values, [type]: newInfos };
};

export const addNewType = (value, field, id) => ({
    description: value,
    [field]: {id: id}
});
