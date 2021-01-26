const TelegramBot = require('node-telegram-bot-api');
const lineReader = require('line-reader');
const htmlMiner = require('./utils/html-miner');
const { logToFile, readLog, millionFile, defaultFile } = require('./utils/logger');
const scaper = require('./utils/request');
const date = require('./utils/date');

// path settings
let logPath = '';
let logPathDefault = '';
if (process.platform === "win32") {
    require('dotenv').config();
    logPath = millionFile;
    lotDefault = defaultFile;
} else {
    let dirPath = '/var/www/html/covid-notifier-tgbot';
    require('dotenv').config({ path: `${dirPath}/.env` });
    logPath = `${dirPath}/${millionFile}`;
    logPathDefault = `${dirPath}/${defaultFile}`;
}

// tg settings
const token = process.env.BOT_TOKEN;
const channel_id = process.env.CHANNEL_ID;
const bot = new TelegramBot(token, { polling: false });
const tg_option = {
    parse_mode: 'HTML',
    disable_web_page_preview: true
};

scaper.simpleRequest('https://www.worldometers.info/coronavirus/', 'GET', (html) => {
    const scrape = htmlMiner(html, '.maincounter-number');
    let cases = scrape[0];
    let deaths = scrape[1];
    let recovered = scrape[2];

    let parsed_cases = parseInt(scrape[0].replace(/,/g, '')); // xxx,xxx,xxx
    let parsed_deaths = parseInt(scrape[1].replace(/,/g, ''));
    let parsed_recovered = parseInt(scrape[2].replace(/,/g, ''));

    let todayCases = parsed_cases;

    // string builder
    let timeNow = date.getNow();
    let _n = '\n';
    let messageTitle = '<b>❗️ Another 1M cases achieved ❗️</b>';
    let messageTitle2 = '<b>COVID-19🦠 Cases Tracker</b>';

    let messageCases = 
    '😷 <b>Cases:</b> <code>' + cases + '</code>' + 
    _n +
    '😰 <b>Deaths:</b> <code>' + deaths + '</code>' +
    _n +
    '😊 <b>Recovered:</b> <code>' + recovered + '</code>';

    let messageDate = '📅 <b>Date:</b> <code>' + timeNow + '</code>';
    let messagePrevLog = '<i>For previous log, go <a href="https://rentry.co/niakorona">here</a> (1M - 20M). #NarrativeMatters #1M</i>';
    let messageFooter = '🔗 @niakorona';

    let dailyAlert = 
    messageTitle2 +
    _n + _n +
    messageCases +
    _n + _n +
    messageDate +
    _n + _n +
    messageFooter;

    // check if cases passed million from yesterday
    lineReader.eachLine(logPath, function(line, lastLine) {
        if (lastLine) {
            let millionLog = readLog(line);
            let nextMillion = parseInt(millionLog['data']);

            // 1. Send daily alert (every 8 hours cron)
	    // disabled since changing polling to 1 hour
            //bot.sendMessage(channel_id, dailyAlert, tg_option);

            if (todayCases >= nextMillion) {
                let firstDigitStr = nextMillion.toString()[0];
                let secondDigitStr = nextMillion.toString()[1];
                let duration = date.getDuration(millionLog['timestamp']).replace('ago', '').trim();

                let previousDate = date.formatDate(millionLog['timestamp'], false);
                let nowDate = date.formatDate(date.getNow(), false);

                let logCases = JSON.stringify({ cases: parsed_cases, deaths: parsed_deaths, recovered: parsed_recovered });

                let messageToNow = previousDate + ' - ' + nowDate;
                let messageDuration = '<b>⌛️ Duration:</b> <code>' + messageToNow + ' (' + duration + ')</code>';
                // 2. Send 1 million alert
                let millionAlert =
                messageTitle + 
                _n + _n +
                messageCases + 
                _n + _n + 
                messageDuration + 
                _n + _n +
                messagePrevLog + 
                _n + _n + 
                messageFooter;

                bot.sendMessage(channel_id, millionAlert, tg_option);

                // 3. logging next million
                let sumFirstSecond = parseInt(firstDigitStr + secondDigitStr) + 1; // 25+1
                let logNextMillion = parseInt(sumFirstSecond.toString().concat('0000000')); // 26+000000
                logToFile(logNextMillion, logPath); // log million (million.log)
                logToFile(logCases, logPathDefault); // log current cases (default.log)
            }
        }
    }, function (err) {
       if (err) throw err;
    });
});
