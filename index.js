"use strict";
const config = require('./config.js');
//libs
const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const cheerio = require("cheerio");

const bot = new TelegramBot(config.botToken, {polling: true});
const users = require('./app/modules/users.js');
const baseUrl = 'http://ffgn.com.ua/';

let lastAnnouncement = {link: '', games: [], gamesStr: ''};

users.load(_ => loop(config, request, cheerio, baseUrl));

// users.save(config.admin, 'globallogic');

bot.onText(/\/start/, msg => bot.sendMessage(msg.chat.id, "Чтобы подписаться на анонсы сайта http://ffgn.com.ua/, введите /team <название команды>"));

bot.onText(/\/team (.+)/, (msg, match) => users.save(msg.chat.id, match[1]).notify(bot, lastAnnouncement));

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

        for (let i=0, l=headers.length; i<l; i++) {
            if (headers[i].attribs.title.toLowerCase().indexOf('анонс') !== -1) {
                downloadAnnouncement(headers[i].attribs.href, games => {
                    let gamesStr = JSON.stringify(games);
                    if (gamesStr !== lastAnnouncement.gamesStr) {
                        lastAnnouncement.link = headers[i].attribs.href;
                        lastAnnouncement.games = games;
                        lastAnnouncement.gamesStr = gamesStr;
                        users.getAll().forEach(user => user.notify(bot, lastAnnouncement));
                    }
                });
                break;
            }
        }
    });
    setTimeout(loop, delay, config, request, cheerio, baseUrl);
};

let downloadAnnouncement = (url, callback) => {
    request(url, (error, response, body) => {
        if (!error) {
            const $ = cheerio.load(body),
                rows = $(".entry-content table tr");

            let games = [],
                weekDay;

            rows.each((i, el) => {
                const matchInfo = $(el).children('td'),
                    hours = $(matchInfo[0]).text(),
                    minutes = $(matchInfo[1]).text(),
                    team1 = $(matchInfo[2]).text(),
                    team2 = $(matchInfo[3]).text();

                if ((!hours || !minutes) && team1) {
                    weekDay = team1;
                }

                if (hours && minutes) {
                    games.push({
                        'time': weekDay + ' ' + hours + ':' + minutes,
                        'pair': team1 + " vs " + team2,
                        'string': (team1 + "vs" + team2).replace(/\s/g, '').toLowerCase()
                    });
                }
            });
            callback(games);
        }
    });
};
