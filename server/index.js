require("core-js/stable");
require("regenerator-runtime/runtime");
require("ignore-styles");
require("@babel/register")({
  ignore: [
    /(node_modules)/
  ],
  presets: ["@babel/preset-env", "@babel/preset-react"]
});

const nconf = require("nconf");
nconf.file({ file: "config/config.json" });

require("./server")