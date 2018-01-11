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

bot.onText(/\/start/, (msg, match) => {
    //add new chat id to db with default filters
    users.save(msg.chat.id, {});
});

//in case of error, increase config.grabInterval to config.grabIntervalForError

let loop = (config, request, cheerio, url) => {
    let delay = config.grabInterval;
    request(url, (error, response, body) => {
        if (error) {
            delay = config.grabIntervalForError;
            bot.sendMessage(config.admin, "Произошла ошибка: " + error);
            return false;
        }
        const $ = cheerio.load(body),
            headers = $("#content .article_col:first-child article.post .entry-title a");

        //if there is new article, notify each user
        headers.each((index, el) => {
            // console.log(el.attribs.title);
            if (el.attribs.title.toLowerCase().indexOf('анонс') !== -1
                && articles.getKeys().indexOf(el.attribs.href) === -1) {
                articles.save(el.attribs.href, {});
                // console.log(users.getKeys());
                users.getKeys().forEach(user => {
                    bot.sendMessage(user, el.attribs.href);
                });
            }
        });

    });
    setTimeout(loop, delay, config, request, cheerio, url);
};

loop(config, request, cheerio, url);

bot.on('callback_query', msg => {});

