/**
 *
 * @type {{id: {history: {}, options: {}}}}
 */
let users = {
    212565743: {
        history: {},
        options: {}
    }
};

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