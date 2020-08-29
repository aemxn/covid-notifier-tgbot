const TelegramBot = require('node-telegram-bot-api');
const lineReader = require('line-reader');
const htmlMiner = require('./utils/html-miner');
const { logToFile, logNextMillion, readLog, defaultFile } = require('./utils/logger');
const scaper = require('./utils/request');
const date = require('./utils/date');

if (process.platform === "win32")
    require('dotenv').config();
else
    require('dotenv').config({ path: '/var/www/html/covid-notifier-tgbot/.env' });

const token = process.env.BOT_TOKEN;
const channel_id = process.env.CHANNEL_ID;
const bot = new TelegramBot(token, { polling: false });

const tg_option = {
    parse_mode: 'HTML'
};

scaper.simpleRequest('https://www.worldometers.info/coronavirus/', 'GET', (html) => {
    const scrape = htmlMiner(html, '.maincounter-number');
    let cases = scrape[0];
    let deaths = scrape[1];
    let recovered = scrape[2];

    let todayCases = parseInt(scrape[0].replace(/,/g, '')); // xxx,xxx,xxx
    let parsed_deaths = parseInt(scrape[1].replace(/,/g, ''));
    let parsed_recovered = parseInt(scrape[2].replace(/,/g, ''));

    let timeNow = date.getNow();
    let messageTitle = '<b>Another 1M achieved!</b>\n' + '<i>' + timeNow + '</i>' + '\n\n';
    let messageTitle2 = '<b>COVID-19 Cases Tracker</b>' + '\n\n';

    let messageCases = 
    '<b>Cases:</b> <pre>' + cases + '</pre>\n'
    + '<b>Deaths:</b> <pre>' + deaths + '</pre>\n'
    + '<b>Recovered:</b> <pre>' + recovered + '</pre>\n\n';

    let messageDate = '<i>Date: ' + timeNow + '</i>';
    let messageFooter = '<i>For previous log, go <a href="https://rentry.co/niakorona">here</a> (1M - 20M). #NarrativeMatters</i>';

    // check if cases passed million from yesterday
    lineReader.eachLine('million.log', function(line, lastLine) {
        if (lastLine) {
            let millionLog = readLog(line);
            let nextMillion = parseInt(millionLog['data']);

            // 1. Send daily alert (every 8 hours cron)
            bot.sendMessage(channel_id, messageTitle2 + messageCases + messageDate, tg_option);
            
            if (todayCases >= nextMillion) {
                let firstDigitStr = nextMillion.toString()[0];
                let secondDigitStr = nextMillion.toString()[1];
                let duration = date.getDuration(millionLog['timestamp']).replace('ago', '');
                // 2. logging next million
                let sumFirstSecond = parseInt(firstDigitStr + secondDigitStr) + 1; // 25+1
                let logNextMillion = parseInt(sumFirstSecond.toString().concat('000000')); // 26+000000
                
                logToFile(logNextMillion, 'million.log');

                let messageDuration = '<b>Duration:</b> <pre>' + duration + '</pre>\n\n';
                // 3. Send 1 million alert
                bot.sendMessage(channel_id, messageTitle + messageCases + messageDuration + messageFooter, tg_option);
            }
        }
    });
});
