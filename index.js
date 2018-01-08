"use strict";
const config = require('./config.js');
//libs
const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const cheerio = require("cheerio");

const bot = new TelegramBot(config.botToken, {polling: true});
const storage = require('./storage.js');
const url = 'http://ffgn.com.ua/';

let users = storage.getAll();

bot.onText(/\/start/, (msg, match) => {
    //add new chat id to db with default filters
    storage.save(msg.chat.id, {});
    users.push(msg.chat.id);
});

// const $ = cheerio.load(body);


//in case of error, increase config.grabInterval to higher value

setInterval(() => {
    request(url, (error, response, body) => {
        if (!error) {
            bot.sendMessage(config.admin, "Все гут");
        } else {
            bot.sendMessage(config.admin, "Произошла ошибка: " + error);
            console.log("Произошла ошибка: " + error);
        }
    });
    // console.log("Site grubbed");
}, config.grabInterval);

bot.on('callback_query', msg => {});

