const https = require('https');

module.exports = (options) => {

    return new Promise((resolve, reject) => {

        const request = https.request(options, (response) => {

            const body = [];

            response.setEncoding('utf8');

            response.on('data', (chunk) => body.push(chunk));

            response.on('end', () => resolve(body.join('')));
        });

        request.on('error', (err) => reject(err));

        request.write(options.body.toString());
        request.end();
    })
};