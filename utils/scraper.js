const url = require('url');
const https = require('https');

const simpleRequest = (_url, _method, _callback) => {
    let html = '';
    const options = url.parse(_url);
    options.method = _method || 'GET';
    options.headers = {
        'User-Agent': 'request',
    };

    const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            html += chunk;
        });
        res.on('end', () => {
            _callback.apply(this, [html, options]);
        });
    });

    req.on('error', (e) => {
        process.stdout.write(`problem with request: ${e.message}`);
    });

    req.end();
};

module.exports = { simpleRequest };