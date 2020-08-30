const moment = require('moment')

const timeFormat = 'DD/MM/YYYY, HH:mm:ss';
const dateFormat = 'DD/MM/YYYY'

function getNow() {
    moment().locale('ms-my');
    const nowText = moment().format(timeFormat);
    return nowText;
}

function getDuration(timestamp) {
    moment().locale('ms-my');
    //20200829,240103
    const duration = moment(timestamp, timeFormat).fromNow();
    return duration;
}

function formatDate(timestamp, time) {
    moment().locale('ms-my');
    let format = '';
    if (time) {
        format = timeFormat;
    } else {
        format = dateFormat;
    }
    const noTime = moment(timestamp, timeFormat).format(format);
    return noTime;
}

module.exports = { getNow, getDuration, formatDate }