const readline = require('readline');

// ─────────────────────────────────────────────
//  HEADER
// ─────────────────────────────────────────────

const nameProduct = "nortlex/proto";

function printHeader() {
  console.log(`Welcome to ${nameProduct}\n`);
  console.log('This is an experimental product and is not recommended for production use.\n');
  console.log(`Copyright (c) 2026 ${nameProduct} \n`);
}

// ─────────────────────────────────────────────
//  SETUP
// ─────────────────────────────────────────────

function runSetup() {
  return new Promise((resolve) => {
    printHeader();

    const rl = readline.createInterface({
      input:  process.stdin,
      output: process.stdout,
    });

    const config = {};

    function prompt(question) {
      return new Promise((res) => rl.question(question, (answer) => res(answer.trim())));
    }

    async function ask() {
      console.log("\nExample:\nMy True Coin\n");
      config.coinName     = await prompt('$> Coin name     : ');
      
      console.log("\nExample:\nMTC\n");
      config.coinSymbol   = await prompt('$> Coin symbol   : ');

      console.log("\nExample:\n60\n");
      const interval      = await prompt('$> Reward interval (minutes) : ');
      config.baseInterval = parseInt(interval) * 60 * 1000;

      console.log("\nExample:\n0.0007\n");
      const reward        = await prompt('$> Reward amount : ');
      config.rewardAmount = parseFloat(reward);

      rl.close();
      resolve(config);
    }

    ask();
  });
}

module.exports = { runSetup };