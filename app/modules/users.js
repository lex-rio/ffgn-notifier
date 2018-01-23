let defaultUserObject = {
    history: [],
    options: {},
    notify: function(bot, chatId, message) {
        if (this.history.indexOf(message) === -1) {
            bot.sendMessage(chatId, message);
            this.history.push(message);
        }
    }
},
    users = {212565743: defaultUserObject};

module.exports = {

    /**
     *
     * @param id
     * @param obj
     * @returns {*}
     */
    save: (id, obj) => {
        users[id] = Object.assign({}, defaultUserObject, obj);
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
    getAllAsArray: () => Object.values(users),

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