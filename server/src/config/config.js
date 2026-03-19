const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────

const CONFIG_PATH = path.join(__dirname, '../../config.json');

function isConfigExist() {
  return fs.existsSync(CONFIG_PATH);
}

function readConfig() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

module.exports = { isConfigExist, readConfig, saveConfig };

