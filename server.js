const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

const binanceSvc = require('./services/binance.js');
const encryptionSvc = require('./services/encryption.js');

const port = process.env.PORT || 8000;

const whitelistOrigins = [
'http://localhost:4200',
'http://produrl.com'];

var corsOptions = {
  origin: function(origin, callback) {
  	let isWhitelisted = whitelistOrigins.indexOf(origin) !== -1;
  	callback(null, isWhitelisted);
  },
  //credentials: true //'http://localhost:8000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/binance/', asyncMiddleware(async function(req, res, next){
  if(!this.headerCheck(req)) {
    res.status(400).json('Invalid request');
  } else {
  	res.status(200).json({'about': 'Collection of binance api calls'});
  }
}));

app.get('/api/binance/info', asyncMiddleware(async function(req, res, next){
  if(!this.headerCheck(req)) {
    res.status(400).json('Invalid request');
  } else {
	 res.status(200).json(await binanceSvc.getExchangeInfo());
  }
}));

app.get('/api/binance/symbols', asyncMiddleware(async function(req, res, next){
  if(!this.headerCheck(req)) {
    res.status(400).json('Invalid request');
  } else {
  	const data = await binanceSvc.getExchangeInfo();
  	res.status(200).json(data.symbols);
  }
}));

app.get('/api/binance/tickers', asyncMiddleware(async function(req, res, next){
  if(!this.headerCheck(req)) {
    res.status(400).json('Invalid request');
  } else {
	 res.status(200).json(await binanceSvc.getTickers());
  }
}));

app.get('/api/binance/klines/:pair/:interval', asyncMiddleware(async function(req, res, next){
  if(!this.headerCheck(req)) {
    res.status(400).json('Invalid request');
  } else {
  	const pair = req.params['pair'].toUpperCase();
  	const interval = req.params['interval'];

  	res.status(200).json(await binanceSvc.getKlines(pair, interval));
  }
}));

const whitelistUsers = new Map([['volitility-d', 'b59e052f-891d-45be-b316-0c22b561bb11'],['volitility-p', 'e64b33f6-54af-4303-9e6e-cc390d2add10']]);

headerCheck = function(req) {
    let ip = req.socket.remoteAddress;
    let user = req.header('NODIE-USER');
    let message = req.header('NODIE-SIGNATURE');
    if(typeof user === 'undefined' || typeof message === 'undefined' 
      || user === "" || message === "") {
      console.log('poorly formatted request from: '+ ip);
      return false;
    }
    let token = whitelistUsers.get(user);
    if(typeof token === 'undefined' || token === "") {
      console.log('invalid user');
      return false;
    }
    let timestamp = Date.now();
    let decryptedTs = encryptionSvc.decryptHeader(message, token);

    let valid = timestamp + 2000 > decryptedTs && timestamp - 2000 < decryptedTs
    ? true : false;

    if(!valid) {
      console.log('unsynced request from: '+ ip);
    }

    return valid;
};

app.listen(port, () => {
  console.log('Server started on port: '+ port +'!')
});