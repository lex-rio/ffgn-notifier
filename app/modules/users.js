class User {
    constructor (id, options) {
        this.id = id;
        this.history = {};
        this.options = Object.assign({teamsToWatch: []}, options);
    }

    notify (bot, announcement) {
        let team = this.getTeam().replace(/\s/g, '').toLowerCase();
        if (team && announcement.gamesStr.indexOf(team) !== -1) {
            announcement.games.forEach(game => {
                if (game.string.indexOf(team) !== -1 && this.history[game.pair] !== game.time) {
                    let message = this.history[game.pair]
                        ? "\nОбновили время:\n"
                        : "\nНовый анонс:\n";
                    bot.sendMessage(this.id, announcement.link + message + game.time + " " + game.pair);
                    this.history[game.pair] = game.time;
                }
            });
        } else {
            bot.sendMessage(
                this.id,
                announcement.link + (team ? "\n" + this.getTeam() + " нет в анонсе, возможно вы задали неверное имя" : '')
            );
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
     * @returns User[]
     */
    getAll: () => Object.values(users),

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