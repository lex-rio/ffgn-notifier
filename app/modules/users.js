let Datastore = require('nedb'),
    db = new Datastore({filename : 'users', autoload: true});

// db.ensureIndex({fieldName: 'id', unique: true});

class User {
    constructor (id, teamsToWatch, history = {}) {
        this.id = id;
        this.teamsToWatch = teamsToWatch;
        this.history = history;
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
                    db.update({id: this.id}, {$set: {history: this.history}});
                }
            });
        } else {
            bot.sendMessage(
                this.id,
                announcement.link + (team ? "\n" + this.getTeam() + " нет в анонсе, возможно вы задали неверное имя, da" : '')
            );
        }
    }

    addTeam (team) {
        // this.teamsToWatch.push(team);
        this.teamsToWatch[0] = team;
        db.update({id: this.id}, {$set: {teamsToWatch: this.teamsToWatch}});
        return this;
    }

    getTeam () {
        return this.teamsToWatch[0] || '';
    }

    getTeams () {
        return this.teamsToWatch;
    }
}

/**
 *
 * @type {{}}
 */
let users = {};

module.exports = {

    load: callback => {
        db.find({}).exec((err, docs) => {
            docs.forEach(doc => users[doc.id] = new User(doc.id, doc.teamsToWatch, doc.history));
            callback();
        });
    },

    /**
     *
     * @param id
     * @param team
     * @returns {User}
     */
    save: (id, team = null) => {
        users[id] = new User(id, [team]);
        db.insert(users[id]);
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
};