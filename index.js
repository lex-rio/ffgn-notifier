"use strict";
const config = require('./config.js');
//libs
const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const cheerio = require("cheerio");

const bot = new TelegramBot(config.botToken, {polling: true});
const users = require('./app/modules/users.js');
const articles = require('./app/modules/articles.js');
const url = 'http://ffgn.com.ua/';

users.save(212565743);

bot.onText(/\/start/, (msg, match) => {
    let user = users.save(msg.chat.id);
    articles.each((link, article) => user.notify(bot, msg.chat.id, link));
});

bot.on('callback_query', msg => {
    console.log(msg);
    // users.save(msg.chat.id, msg);
});

//in case of error, increase config.grabInterval to config.grabIntervalForError
let loop = (config, request, cheerio, url) => {
    let delay = config.grabInterval;
    request(url, (error, response, body) => {
        if (error) {
            delay = config.grabIntervalForError;
            bot.sendMessage(config.admin, "Error: " + error);
            return false;
        }
        const $ = cheerio.load(body),
            headers = $("#content .article_col:first-child article.post .entry-title a");

        //if there is new article, notify each user
        headers.each((index, el) => {
            if (el.attribs.title.toLowerCase().indexOf('анонс') !== -1 && !articles.getOne(el.attribs.href)) {
                articles.save(el.attribs.href, {});
                users.each((id, user) => user.notify(bot, id, el.attribs.href));
            }
        });
    });
    setTimeout(loop, delay, config, request, cheerio, url);
};

loop(config, request, cheerio, url);
