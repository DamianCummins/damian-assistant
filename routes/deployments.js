import express from "express";
import nconf from "nconf";
import assistantUtil from "../lib/utils/assistantUtil";
import authClient from "../lib/clients/auth-client";
import openscaleClient from "../lib/clients/openscale-client";
import uuid from "uuid";

const router = express.Router();
const hostUrl = nconf.get("host");
const env = nconf.get("env");

router.get("/", (req, res, next) => {
	res.json({
		"count": 1,
		"resources": [
			{
				"metadata": {
					"guid": "assistant",
					"created_at": "2019-10-01T12:00:00Z",
					"modified_at": "2019-10-01T13:00:00Z"
				},
				"entity": {
					"name": "Damian Assistant",
					"description": "Damian Assistant deployment",
					"scoring_url": `https://${hostUrl}/v1/deployments/assistant/message`,
					"asset": {
						"name": "Damian Assistant",
						"guid": "assistant"
					},
					"asset_properties": {
						"problem_type": "multiclass",
						"input_data_type": "unstructured_text"
					}
				}
			}
		]
	});
});

router.post("/assistant/message", (req, res, next) => {
	const messageId = uuid.v4();
	const startDate = new Date();
	let endDate;
	const response = {
		fields: assistantUtil.getFields(),
		labels: assistantUtil.getClasses(),
		values: []
	}
	if (!req.body.values || !Array.isArray(req.body.values)) {
		res.status(400).send("Bad Request");
	}

	const logPayload = req.query.logPayload;

	Promise.all(req.body.values.map(assistantUtil.predict))
		.then((preds) => {
			endDate = new Date();
			response.values = preds;
			return logPayload ? authClient.getAuthToken() : Promise.resolve();
		}).then((authToken) => {
			if (logPayload) {
				const token = (env === "icp") ?
				authToken.token : authToken.access_token;
				return openscaleClient.sendPayloadLogs({
					authToken: token,
					payloadData: {
						response,
						request: req.body,
						scoring_id: messageId,
						scoring_timestamp: startDate.toISOString(),
						response_time: endDate.getTime() - startDate.getTime()
					},
				});
			}
			return Promise.resolve();
		}).then((payloadLoggingResponse) => {
			if(!logPayload) {
				response.messageId = messageId + "-1";
			}
			res.json(response);
			return;
		}).catch((err) => {
			next(err);
		});

});


module.exports = router;
