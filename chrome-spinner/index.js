const crypto = require('crypto'),
      url = require('url'),
      debug = require('debug')('chrome-spinner'),
      express = require('express'),
      httpProxy = require('http-proxy'),
      puppeteer = require('puppeteer');

var app = express();
var proxy = new httpProxy.createProxyServer({ignorePath: true});

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
};

app.get('/json', function (req, res) {
   res.json([]);
});

app.get('/json/new', function (req, res, next) {
    const targetId = crypto.randomBytes(32).toString('hex').toUpperCase();
    res.json({
        description: '',
        id: targetId,
        title: '',
        type: 'page',
        url: 'about:blank',
        webSocketDebuggerUrl: 'ws://' + req.get('host') + '/devtools/page/' + targetId
    });
});

app.get('/json/activate/*', function (req, res) {
   res.send('Target activated');
});

app.get('/json/close/*', function (req, res) {
   res.send('Target is closing');
});

var server = app.listen(2229, function () {
    var host = server.address().address
    var port = server.address().port
   
    console.log("Example app listening at http://%s:%s", host, port)
});

server.on('upgrade', asyncMiddleware(async (req, socket, head) => {
    debug('chromium process up')
    const browser = await puppeteer.launch({args: ['--disable-gpu', '--no-sandbox']});
    
    socket.on('close', asyncMiddleware(async () => {
        debug('chromium process down');
        browser.close();
    }));
    
    // proxy either to the page or the browser urls
    if (req.url.indexOf('/page/') > -1) {
        const browserWsEndpoint = url.parse(browser.wsEndpoint());
        const browserPages = await browser.pages();
        const pageWsEndpoint = browserWsEndpoint.protocol + '//' + browserWsEndpoint.host + '/devtools/page/' + browserPages[0].target()._targetId;
        
        proxy.ws(req, socket, head, { target: pageWsEndpoint });
    } else {
        proxy.ws(req, socket, head, { target: browser.wsEndpoint() });
    }
}));
