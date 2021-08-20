/**
 * See tabou level
 * https://github.com/sigrennesmetropole/geor_tabou2_front/issues/87
 *
 * @param {string} role
 * @param {string} task
 * @param {boolean} isOff
 * @returns boolean
 */
export function getTaskByRole(role, task, isOff) {
    if (role.isReferent) return true;
    // only referent could access to off functionallity
    if (isOff) return false;
    // limited role
    if (role.isConsult === "isConsult") {
        return ["print", "search", "consult"].includes(task);
    }
    // not off infos and not a referent ==> this is a contrib level ax expected
    return true;
}
