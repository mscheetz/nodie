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

const getTickers = async () => {
    let endpoint = "/api/v1/ticker/24hr";
    let url = binanceBase + endpoint;
	try {
		const response = await axios.get(url);
		const data = response.data;
		return data;
	} catch (error) {
		console.log(error);
	}
}

const getKlines = async (pair, interval) => {
    let endpoint = "/api/v1/klines";
    let qs = "?symbol="+ pair +"&interval="+ interval +"&limit=20";
    let url = binanceBase + endpoint + qs;
    console.log(url);
	try {
		const response = await axios.get(url);
		const data = response.data;
		return data;
	} catch (error) {
		console.log(error);
	}
}

module.exports = {
	getExchangeInfo,
	getTickers,
	getKlines
}
