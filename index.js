"use strict";
const config = require('./config.js');
//libs
const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const cheerio = require("cheerio");

const bot = new TelegramBot(config.botToken, {polling: true});
const users = require('./app/modules/users.js');
const articles = require('./app/modules/articles.js');
const baseUrl = 'http://ffgn.com.ua/';

users.save(config.admin, {teamsToWatch: ['globallogic']});

bot.onText(/\/start/, (msg, match) => {
    let user = users.save(msg.chat.id),
        message = ["Последние анонсы:"];
    articles.each((link, article) => message.push(link));
    user.notify(bot, message.join("\n"));
});

bot.onText(/\/team (.+)/, (msg, match) => {
    let user = users.getOne(msg.chat.id);
    user.addTeam(match[1]);
});

bot.onText(/\/test/, (msg, match) => {
    bot.sendMessage(msg.chat.id, "I'm working here");
});

//in case of error, increase config.grabInterval to config.grabIntervalForError
let loop = (config, request, cheerio, baseUrl) => {
    let delay = config.grabInterval;
    request(baseUrl, (error, response, body) => {
        if (error) {
            delay = config.grabIntervalForError;
            bot.sendMessage(config.admin, "Error: " + error);
            return false;
        }
        const $ = cheerio.load(body),
            headers = $("#content .article_col:first-child article.post .entry-title a");

        headers.each((index, el) => {
            //if there is new article, notify each user
            if (el.attribs.title.toLowerCase().indexOf('анонс') !== -1 && !articles.getOne(el.attribs.href)) {
                articles.save(el.attribs.href, {});
                downloadAnnouncement(el.attribs.href, games => {
                    users.each((id, user) => {
                        /** @var User user */
                        let team = user.getTeam();
                        if (team) {
                            games.forEach(game => {
                                if (game.string.indexOf(team) !== -1) {
                                    user.notify(bot, game.time + ' ' + game.pair + ' ' + el.attribs.href);
                                }
                            });
                        } else {
                            user.notify(bot, el.attribs.href);
                        }
                    });
                });
            }
        });
    });
    setTimeout(loop, delay, config, request, cheerio, baseUrl);
};

let downloadAnnouncement = (url, callback) => {
    request(url, (error, response, body) => {
        if (!error) {
            const $ = cheerio.load(body);
            const rows = $(".entry-content table tr");

            let games = [];

            rows.each((i, el) => {
                let matchInfo = $(el).children('td'),
                    hours = $(matchInfo[0]).text(),
                    minutes = $(matchInfo[1]).text(),
                    pair = $(matchInfo[2]).text() + " vs " + $(matchInfo[3]).text();

                if (hours && minutes) {
                    games.push({
                        'time': hours + ':' + minutes,
                        'pair': pair,
                        'string': pair.replace(/\s/g, '').toLowerCase()
                    });
                }
            });
            callback(games);
        }
    });
};

loop(config, request, cheerio, baseUrl);
