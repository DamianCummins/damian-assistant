// Modules
const nconf = require("nconf");
const request = require("request");

// Functions
function sendPayloadLogs(options) {
    return new Promise((resolve, reject) => {
            
        const env = nconf.get("env");
        const openscaleConfig = nconf.get("openscale");

		let host;
		if (env === "icp") {
			const icpConfig = nconf.get("icp");
			host = icpConfig.host + ":" + icpConfig.port;
		} else {
			host = openscaleConfig.host;
        }
        
        const bindingId = openscaleConfig.binding_id;
        const dataMartId = openscaleConfig.data_mart_id;
        const subscriptionId = openscaleConfig.subscription_id;
        const deploymentId = openscaleConfig.deployment_id;
        
        const url = `https://${host}/v1/data_marts/${dataMartId}/scoring_payloads`;
        console.log(options.payloadData);
        const apiReqOpts = {
            url: url,
            headers: {
                "Authorization": "Bearer " + options.authToken,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify([{ ...options.payloadData,
                binding_id: bindingId,
                subscription_id: subscriptionId,
                deployment_id: deploymentId
            }])
        };
        
        request.post(apiReqOpts, function(err, response, body) {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(body));
        });
    });
}

export default {
    sendPayloadLogs
}
