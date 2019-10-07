// Modules
import nconf from "nconf";
import request from "request";

let cachedToken;
let expiryDate;


// Functions
function getAuthToken() {
	if (cachedToken && expiryDate && new Date().getMilliseconds() < expiryDate) {
		console.log("Using cached token");
		return Promise.resolve(cachedToken);
	} else {
		console.log("Retrieving new token");
		const getToken = nconf.get("env") === "icp" ? _getICPAuthToken : _getIAMAuthToken;
		return getToken().then((authToken) => {
			cachedToken = authToken;
			expiryDate = authToken.expiration
			return Promise.resolve(authToken);
		});
	}
}

function _getIAMAuthToken() {
	const prom = new Promise((resolve, reject) => {
		const config = nconf.get("iam");
		const host = config.host;
		const apikey = config.apikey
		const apiReqOpts = {
			url: `https://${host}/identity/token`,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			form: {
				grant_type: "urn:ibm:params:oauth:grant-type:apikey",
				apikey: apikey
			}
		};

		request.post(apiReqOpts, function(err, response, body) {
			if (err) {
				reject(err);
				return;
			}

			resolve(JSON.parse(body));
		});
	});

	return prom;
}

function _getICPAuthToken() {
	const prom = new Promise((resolve, reject) => {
		const config = nconf.get("icp");
		const host = config.host + ":" + config.port;
		const credentials = {
			username: config.username,
			password: config.password
		};
		const apiReqOpts = {
			url: `https://${host}/icp4d-api/v1/authorize`,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(credentials)
		};

		request.post(apiReqOpts, function(err, response, body) {
			if (err) {
				reject(err);
				return;
			}
			resolve(JSON.parse(body));
		});
	});

	return prom;
}

export default {
	getAuthToken
}

