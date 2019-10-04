import express from "express";
import bodyParser from "body-parser";
import boolParser from "express-query-boolean";
import router from "../routes";
import deploymentsRouter from "../routes/deployments";
import assistantUtil from "../lib/utils/assistantUtil";

const PORT = process.env.PORT || 8080;

function create() {
  const app = express();
  app.use(bodyParser.json({
    limit: "10mb",
    type: ["application/json"]
  }));
  app.use(boolParser());

  app.use(router);
  app.use("/v1/deployments", deploymentsRouter);
  return app;
}

assistantUtil.init().then(() => {
  create().listen(PORT, () => {
    console.log(`SSR running on port ${PORT}`);
  });
});


module.exports = {
  create
}