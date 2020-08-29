const TelegramBot = require('node-telegram-bot-api');
const lineReader = require('line-reader');
const htmlMiner = require('./utils/html-miner');
const { logToFile, defaultFile } = require('./utils/logger');
const scaper = require('./utils/scraper');
const date = require('./utils/date');

require('dotenv').config();

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

    let covid_stats = { cases: todayCases, deaths: parsed_deaths, recovered: parsed_recovered };

    let duration = '';
    let timeNow = date.getNow();
    let messageTitle = '<b>Another 1M achieved!</b>\n' + '<i>' + timeNow + '</i>' + '\n\n';
    let messageTitle2 = '<b>COVID-19 Cases Tracker</b>' + '\n\n';

    let messageCases = 
    '<b>Cases:</b> <pre>' + cases + '</pre>\n'
    + '<b>Deaths:</b> <pre>' + deaths + '</pre>\n'
    + '<b>Recovered:</b> <pre>' + recovered + '</pre>\n\n';

    let messageDate = '<i>Date: ' + timeNow + '</i>';
    let messageFooter = '<i>For previous log, go <a href="https://rentry.co/niakorona">here</a> (1M - 20M). #NarrativeMatters</i>';

    // 1. Send daily alert (11:59pm GMT+8)
    bot.sendMessage(channel_id, messageTitle2 + messageCases + messageDate, tg_option);

    lineReader.eachLine(defaultFile, function(line, last) {
        if (last) {
            let split = line.split(' -> ');
            let timestamp = split[0].trim();
            let pastCases = split[1].trim();

            let duration = date.getDuration(timestamp).replace('ago', '');

            let pastCasesJson = JSON.parse(pastCases);
            let yesterdayCases = parseInt(pastCasesJson['cases']);
            
            if (todayCases >= yesterdayCases) {
                let messageDuration = '<b>Duration:</b> <pre>' + duration + '</pre>\n\n';
                console.log('log 1mill');
                // 2. Send 1 million alert
                bot.sendMessage(channel_id, messageTitle + messageCases + messageDuration + messageFooter, tg_option);
            }

            // 3. do logging to file
            logToFile(JSON.stringify(covid_stats));
        }
    });
});