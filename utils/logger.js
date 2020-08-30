// Import.
const fs = require('fs');
const date = require('./date')

const defaultFile = 'default.log';
const millionFile = 'million.log';

/**
 * Get date as text.
 * @returns {string} Date as text. Sample: "2018.12.03, 07:32:13.0162 UTC".
 */
function getDateAsText() {
  const nowText = date.getNow();
  return nowText;
}

/**
 * Log to file.
 * @param {string} text Text to log.
 * @param {string} [file] Log file path.
 */
function logToFile(text, file) {
  // Define file name.
  const filename = file !== undefined ? file : defaultFile;

  // Define log text.
  const logText = getDateAsText() + ' -> ' + text + '\r\n';

  // Save log to file.
  fs.appendFile(filename, logText, 'utf8', function (error) {
    if (error) {
      // If error - show in console.
      console.log(getDateAsText() + ' -> ' + error);
    }
  });
}

function readLog(text) {
  let split = text.split(' -> ');
  let timestamp = split[0].trim();
  let data = split[1].trim();

  return { timestamp, data };
}

// Export.
module.exports = { logToFile, readLog, millionFile, defaultFile };
