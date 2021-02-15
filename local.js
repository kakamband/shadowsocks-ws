"use strict";

const fs = require('fs');
const url = require('url');
const net = require('net');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const argv = require('minimist')(process.argv.slice(2));

const config = {
    url: 'ws://localhost:8080/',
    server: "127.0.0.1",
    local_port: 1080,
    remote_port: 8787,
    password: "secret",
    method: "aes-256-gcm"
};

try {
    Object.assign(config, JSON.parse(fs.readFileSync(argv.c || 'config.json', {encoding: 'utf8'})));
    console.log('config loaded');
} catch (err) {};

function showUrl(c) {
    const userinfo = Buffer.from(c.method + ':' + c.password).toString('base64');
    console.log('ss://' + userinfo + '@' + c.server + ':' + c.remote_port);
}

showUrl(config);

const options = {
    timeout: 10000,
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0'
    }
};

const parsed = url.parse(config.url);
options.hostname = parsed.hostname;

const h = parsed.protocol === 'ws:' ? http : https;
const req = h.request(options, (res) => {
    if (res.headers['set-cookie']) {
        options.headers.cookie = res.headers['set-cookie'][0].split(';')[0];
        console.log('cookie saved');
    }
    start();
});

req.on('timeout', () => {
    console.log('timeout!');
    req.destroy();
});

req.on('error', (e) => {
    console.log(e);
});

console.log('testing...');
req.end();

function start() {
    const server = net.createServer();

    server.on('connection', (c) => {
        const ws = new WebSocket(config.url, null, options);
        ws.on('open', () => {
            ws.d = WebSocket.createWebSocketStream(ws);
            ws.d.pipe(c);
            c.pipe(ws.d);

            ws.d.on('error', (e) => {
                console.log('duplex', e);
            });
        });

        ws.on('close', () => {
            ws.d?.destroy();
            c.destroyed || c.destroy();
        });

        ws.on('unexpected-response', (req, res) => {
            console.log('server error');
            ws.d?.destroy();
            c.destroyed || c.destroy();
            server.close();
        });

        ws.on('error', (e) => {
            console.warn('websocket', e);
            ws.d?.destroy();
            c.destroyed || c.destroy();
        });

        c.on('close', () => {
            ws.d?.destroy();
            ws.terminate();
        });

        c.on('error', (e) => {
            console.warn('local', e);
            ws.d?.destroy();
            ws.terminate();
        });
    });

    server.on('error', (e) => {
        console.warn(e);
        process.exit(1);
    });

    server.listen(config.remote_port, () => {
        console.log('server started');
    });
}
