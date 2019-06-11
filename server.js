const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');

const binanceSvc = require('./services/binance.js');

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

var corsOptions = {
  origin: function(origin, callback) {
  	let isWhitelisted = whitelist.indexOf(origin) !== -1;
  	callback(null, isWhitelisted);
  },
  //credentials: true //'http://localhost:8000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

const whitelist = [
'http://localhost:4200',
'http://produrl.com']

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(compression());
app.use(helmet());

app.get('/api/', asyncMiddleware(async function(req, res, next){
	res.json({'about': 'Collection of binance api calls'});
}))

app.get('/api/info', asyncMiddleware(async function(req, res, next){
	res.json(await binanceSvc.getExchangeInfo());
}))

app.get('/api/symbols', asyncMiddleware(async function(req, res, next){
	const data = await binanceSvc.getExchangeInfo();
	res.json(data.symbols);
}))

app.get('/api/tickers', asyncMiddleware(async function(req, res, next){
	res.json(await binanceSvc.getTickers());
}))

app.get('/api/klines/:pair/:interval', asyncMiddleware(async function(req, res, next){
	const pair = req.params['pair'].toUpperCase();
	const interval = req.params['interval'];

	res.json(await binanceSvc.getKlines(pair, interval));
}))

app.listen(8000, () => {
  console.log('Server started!')
})