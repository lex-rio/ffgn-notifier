/**
 * list of users key:{data}
 */
let users = {212565743: {}};

module.exports = {

    /**
     *
     * @param id
     * @param obj
     * @returns {boolean}
     */
    save: (id, obj) => users[id] = obj,

    /**
     *
     * @returns {{}}
     */
    getAll: () => users,

    /**
     *
     * @param id
     * @returns {*|null}
     */
    getOne: (id) => users[id] || null,

    /**
     *
     * @returns {Array}
     */
    getAllAsArray: () => Object.values(users),

    /**
     *
     * @returns {Array}
     */
    getKeys: () => Object.keys(users)
};