const READ_TASKS = ["print", "search", "consult"];

/**
 * See tabou level
 * https://github.com/sigrennesmetropole/geor_tabou2_front/issues/87
 *
 * Reading the Off is allowed to everybody: the API decides which operations a user can see (US-323).
 * Editing the Off stays reserved to referents.
 *
 * @param {string} role
 * @param {string} task
 * @param {boolean} isOff
 * @returns boolean
 */
export function getTaskByRole(role, task, isOff) {
    if (role.isReferent) return true;
    if (isOff) return READ_TASKS.includes(task);
    // limited role
    if (role.isConsult === "isConsult") {
        return READ_TASKS.includes(task);
    }
    // not off infos and not a referent ==> this is a contrib level ax expected
    return true;
}
