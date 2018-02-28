"use strict";
const config = require('./config.heroku.js');
//libs
const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const cheerio = require("cheerio");

const bot = new TelegramBot(config.botToken, {webHook: {port: config.appPort}});
const users = require('./app/modules/users.js');
const baseUrl = 'http://ffgn.com.ua/';

bot.setWebHook(`${config.appUrl}/bot${config.botToken}`);

let lastAnnouncement = {link: '', games: [], gamesStr: ''};

users.load(_ => loop(config, request, cheerio, baseUrl));

bot.onText(/\/ping/, msg => bot.sendMessage(msg.chat.id, 'I am alive on Heroku!'));

bot.onText(/\/start/, msg => {
    users.save(msg.chat.id);
    bot.sendMessage(msg.chat.id, "Вы подписаны на анонсы сайта http://ffgn.com.ua/, " +
        "\nчтоб подписаться на анонсы одной команды - введите /team <название команды>" +
        "\nчтоб вывести список команд на которые вы подписаны - введите /myteams" +
        "\nэто Open source проект, желающие могут приобщиться https://github.com/lex-rio/ffgn-notifier");
});

bot.onText(/\/team (.+)/, (msg, match) => {
    let user = users.getOne(msg.chat.id) || users.save(msg.chat.id);
    user.addTeam(match[1])
        .notify(bot, lastAnnouncement)
});


bot.onText(/\/myteams/, msg => bot.sendMessage(msg.chat.id, users.getOne(msg.chat.id).getTeams().join(', ')));

bot.onText(/\/debuguser/, msg => bot.sendMessage(msg.chat.id, JSON.stringify(users.getOne(msg.chat.id))));

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
