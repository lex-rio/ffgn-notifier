class User {
    constructor(id, options) {
        this.id = id;
        this.history = [];
        this.options = Object.assign({teamsToWatch: []}, options);
    }

    notify (bot, message) {
        if (this.history.indexOf(message) === -1) {
            bot.sendMessage(this.id, message);
            this.history.push(message);
        }
    }

    addTeam (team) {
        this.options.teamsToWatch[0] = team.replace(/\s/g, '').toLowerCase();
    }

    getTeam () {
        return this.options.teamsToWatch[0];
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
     * @returns User
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
     * @returns {User|null}
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