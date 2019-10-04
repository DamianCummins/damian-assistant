import express from "express";
import fs from "fs";
import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";

const router = express.Router();

router.get("/", function(req, res, next) {
	fs.readFile(path.resolve("./build/index.html"), "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).send("An error occurred");
		}
		return res.send(
			data.replace(
				`<div id="root"></div>`,
				`<div id="root">${ReactDOMServer.renderToString(<App/>)}</div>`
			)
		);
	});
});

router.use(
	express.static(path.resolve(__dirname, "..", "build"), { maxAge: "30d" })
);

module.exports = router;
