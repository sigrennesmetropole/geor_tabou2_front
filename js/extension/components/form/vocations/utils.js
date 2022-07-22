import { find } from "lodash";
export const findValueByType = (codeId, values, type) => {
    const field = type === "contributions" ? "typeContribution" : "typeProgrammation";
    return find(values[type], [`${field}.id`, codeId]);
};

export const changeByType = (codeId, value = "", values, type) => {
    const field = type === "contributions" ? "typeContribution" : "typeProgrammation";
    const infos = values[type];
    const newInfos = infos.filter(f => f[field].id !== codeId);
    let findThisCode = findValueByType(codeId, values, type);
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

export const getCodeIdByCode = (ids, code) => {
    const codeToUse = ids.filter(el => el.code === code);
    if (!codeToUse.length) {
        console.log("This code don't exists : " + code);
    }
    return ids.filter(el => el.code === code)[0]?.id;
};
