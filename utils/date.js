const moment = require('moment')

function getNow() {
    moment().locale('ms-my');
    const nowText = moment().format('DD/MM/YYYY, HH:mm:ss');
    return nowText;
}

function getDuration(timestamp) {
    moment().locale('ms-my');
    //20200829,240103
    const duration = moment(timestamp, 'DD/MM/YYYY, HH:mm:ss').fromNow();
    return duration;
}

module.exports = { getNow, getDuration }