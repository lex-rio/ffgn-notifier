"use strict";
const config = require('./config.js');
//libs
const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const cheerio = require("cheerio");

const bot = new TelegramBot(config.botToken, {polling: true});
const users = require('./app/modules/users.js');
const baseUrl = 'http://ffgn.com.ua/';

let lastAnnouncement = {link: '', games: []};

users.save(config.admin, {teamsToWatch: ['globallogic']});

bot.onText(/\/start/, msg => users.save(msg.chat.id).notify(bot, "Последний анонс: " + lastAnnouncement.link));

bot.onText(/\/team (.+)/, (msg, match) => users.getOne(msg.chat.id).addTeam(match[1]));

bot.onText(/\/test/, msg => bot.sendMessage(msg.chat.id, "I'm working here"));

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

        let lastAnnouncementArticle;

        for (let i=0; i<headers.length; i++) {
            if (headers[i].attribs.title.toLowerCase().indexOf('анонс') !== -1) {
                lastAnnouncementArticle = headers[i];
                break;
            }
        }

        if (lastAnnouncementArticle.attribs.href === lastAnnouncement.link) {
            return false;
        }

        downloadAnnouncement(lastAnnouncementArticle.attribs.href, games => {
            lastAnnouncement.games = games;
            lastAnnouncement.link = lastAnnouncementArticle.attribs.href;

            users.each((id, user) => {
                /** @var User user */
                let team = user.getTeam();
                if (team) {
                    games.forEach(game => {
                        if (game.string.indexOf(team) !== -1) {
                            user.notify(bot, game.time + ' ' + game.pair + ' ' + lastAnnouncement.link);
                        }
                    });
                } else {
                    user.notify(bot, lastAnnouncement.link);
                }
            });
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
