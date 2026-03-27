const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');

let config = {
  host: 'localhost',
  port: 3000,
  walletFile: 'wallet.json'
};

if (fs.existsSync(CONFIG_PATH)) {
  const saved = JSON.parse(fs.readFileSync(CONFIG_PATH));
  config = { ...config, ...saved };
}

function saveConfig() {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function setConfigFromArgs(args) {
  if (args[0]) config.host = args[0];
  if (args[1]) config.port = parseInt(args[1], 10);
  if (args[2]) config.address = args[2]; 
}

module.exports = { config, saveConfig, setConfigFromArgs };