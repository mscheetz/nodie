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

app.get('/api', asyncMiddleware(async function(req, res, next){
  	res.status(200).json({'about': 'Nodie\'s apis are nested under here'});
}));

app.get('/api/exchange/', asyncMiddleware(async function(req, res, next){
  if(!this.headerCheck(req)) {
    this.errorResponse(res);
  } else {
  	res.status(200).json({'about': 'Collection of exchange api calls'});
  }
}));

app.get('/api/exchange/info/:exchange', asyncMiddleware(async function(req, res, next){
  const exchange = req.params.exchange;
  if(!this.headerCheck(req)) {
    this.errorResponse(res);
  } else if (!this.exchangeCheck(exchange)) {
    this.noExchangeResponse(res);
  } else {
    console.log('valid exchange: ' + exchange);
    const result = exchange === "binance" ? await binanceSvc.getExchangeInfo() : {};

	  res.status(200).json(result);
  }
}));

app.get('/api/exchange/symbols/:exchange', asyncMiddleware(async function(req, res, next){
  const exchange = req.params.exchange;
  if(!this.headerCheck(req)) {
    this.errorResponse(res);
  } else if (!this.exchangeCheck(exchange)) {
    this.noExchangeResponse(res);
  } else {
  	const result = exchange === "binance" ? await binanceSvc.getPairs() : {};

  	res.status(200).json(result);
  }
}));

app.get('/api/exchange/tickers/:exchange', asyncMiddleware(async function(req, res, next){
  const exchange = req.params.exchange;
  if(!this.headerCheck(req)) {
    this.errorResponse(res);
  } else if (!this.exchangeCheck(exchange)) {
    this.noExchangeResponse(res);
  } else {
    const result = exchange === "binance" ? await binanceSvc.getTickers() : {};

	 res.status(200).json(result);
  }
}));

app.get('/api/exchange/klines/:exchange/:pair/:interval', asyncMiddleware(async function(req, res, next){
  const exchange = req.params.exchange;
  if(!this.headerCheck(req)) {
    this.errorResponse(res);
  } else if (!this.exchangeCheck(exchange)) {
    this.noExchangeResponse(res);
  } else {
  	const pair = req.params.pair.toUpperCase();
  	const interval = req.params.interval;
    const result = exchange === "binance" ? await binanceSvc.getKlines(pair, interval) : {};

  	res.status(200).json(result);
  }
}));

const whitelistUsers = new Map([['volitility-d', 'b59e052f-891d-45be-b316-0c22b561bb11'],['volitility-p', 'e64b33f6-54af-4303-9e6e-cc390d2add10']]);

exchangeCheck = function(exchange) {
  if(typeof exchange === 'undefined' || exchange === "") {
    return false;
  }
  return true;
}

noExchangeResponse = function(res) {
    return res.status(400).json({'code': 400, 'message': 'You forgot an exchange...'});
}

errorResponse = function(res) {
	return res.status(400).json({'code': 400, 'message': 'You said whaaaaaa??'});
}

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