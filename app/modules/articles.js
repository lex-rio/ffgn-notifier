/**
 * list of articles key:{data}
 */
let articles = {};

module.exports = {

    /**
     *
     * @param id
     * @param obj
     * @returns {boolean}
     */
    save: (id, obj) => articles[id] = obj,

    /**
     *
     * @returns {{}}
     */
    getAll: () => articles,

    /**
     *
     * @param id
     * @returns {*|null}
     */
    getOne: (id) => articles[id] || null,

    /**
     *
     * @returns {Array}
     */
    getAllAsArray: () => Object.values(articles),

    /**
     *
     * @returns {Array}
     */
    getKeys: () => Object.keys(articles),

    each: (callback) => {
        Object.entries(articles).forEach(([id, article]) => callback(id, article));
    }
};