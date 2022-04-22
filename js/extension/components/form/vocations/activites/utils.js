import { find } from "lodash";
export const findValueInfoProg = (code, values) => {
    return find(values.informationsProgrammation, ["typeProgrammation.code", code]);
};

export const changeInfoProg = (code, value, values) => {
    const findThisCode = findValueInfoProg(code, values);
    if (!findThisCode) return values;
    const infosProg = values.informationsProgrammation;
    const newInfosProg = infosProg.filter(f => f.typeProgrammation.code !== code);
    newInfosProg.push({ ...findThisCode, description: value });
    return { ...values, informationsProgrammation: newInfosProg };
};

