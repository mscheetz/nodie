const axios = require('axios')
const binanceBase = "https://api.binance.com"

const getExchangeInfo = async () => {
    let endpoint = "/api/v1/exchangeInfo";
    let url = binanceBase + endpoint;

	try {
		const response = await axios.get(url);
		const data = response.data;

		return data;
	} catch (error) {
		console.log(error);
	}
}


const getPairs = async () => {
    let endpoint = "/api/v1/exchangeInfo";
    let url = binanceBase + endpoint;

	try {
		const response = await axios.get(url);
		const datas = response.data.symols;
		const symbols = [];
		datas.foreach(data => {
			symbols.push({
				pair: data.symbol,
				asset: data.baseAsset,
				market: data.quoteAsset
			});
		})
		return symbols;
	} catch (error) {
		console.log(error);
	}
}

const getTickers = async () => {
    let endpoint = "/api/v1/ticker/24hr";
    let url = binanceBase + endpoint;

	try {
		const response = await axios.get(url);
		const datas = response.data;
		const tickers = [];
		datas.foreach(data => {
			tickers.push({
				pair: data.symbol,
				percent24h: data.priceChangePercent,
				open: data.openPrice,
				close: data.lastPrice,
				high: data.highPrice,
				low: data.lowPrice,
				volume: data.volume,
				marketVolume: data.quoteVolume
			});
		});
		return tickers;
	} catch (error) {
		console.log(error);
	}
}

const getKlines = async (pair, interval) => {
    let endpoint = "/api/v1/klines";
    let qs = "?symbol="+ pair +"&interval="+ interval +"&limit=20";
    let url = binanceBase + endpoint + qs;

	try {
		const response = await axios.get(url);
		const datas = response.data;
		const klines = [];
		datas.foreach(data => {
			klines.push({
				open: data[1],
				close: data[4],
				high: data[2],
				low: data[3],
				openTime: data[0],
				closeTime: data[6],
				volume: data[5],
				marketVolume: data[7],
				numberTrades: data[8]
			})
		})
		return klines;
	} catch (error) {
		console.log(error);
	}
}

module.exports = {
	getExchangeInfo,
	getTickers,
	getKlines
}
