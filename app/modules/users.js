class User {
    constructor(id, options) {
        this.id = id;
        this.history = [];
        this.options = Object.assign({teamsToWatch: []}, options);
    }

    notify (bot, chatId, message) {
        if (this.history.indexOf(message) === -1) {
            bot.sendMessage(chatId, message);
            this.history.push(message);
        }
    }
}

/**
 *
 * @type {{}}
 */
let users = {};

module.exports = {

    /**
     *
     * @param id
     * @param obj
     * @returns {*}
     */
    save: (id, obj = {}) => {
        users[id] = new User(id, obj);
        return users[id];
    },

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
    getKeys: () => Object.keys(users),

    /**
     *
     * @param callback
     */
    each: (callback) => {
        Object.entries(users).forEach(([id, user]) => callback(id, user));
    }
};