const { isConfigExist, readConfig, saveConfig } = require('./config/config');
const { runSetup }    = require('./cli/setup');
const { ProofOfTime } = require('./consensus/proof_of_time');
const { Blockchain }  = require('./core/blockchain');
const { createServer } = require('./network/server');

// ─────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────

async function main() {
  let config;

  if (!isConfigExist()) {
    config = await runSetup();
    saveConfig(config);
    console.log('\nConfig saved. Starting server...\n');
  } else {
    config = readConfig();
    console.log(`\nWelcome back, ${config.coinName} (${config.coinSymbol})\n`);
  }

  const blockchain = new Blockchain();
  const consensus  = new ProofOfTime({
    baseInterval: config.baseInterval,
    reward:       config.rewardAmount,
  });

  const sockets = new Map(); // address => socket

  const server = createServer(config, consensus, blockchain, sockets);

  server.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log(`\n${config.coinSymbol}> `);
  });

  setInterval(() => {
    const eligible = consensus.tick();
    for (const { address, reward } of eligible) {
      const block = blockchain.addBlock({
        type:    'reward',
        address: address,
        amount:  reward,
      });

      console.log(`[Reward] ${address} +${reward} ${config.coinSymbol} | block #${block.index}`);

      const socket = sockets.get(address);
      if (socket) {
        socket.write(JSON.stringify({
          type:   'reward',
          amount: reward,
          block:  block.index,
        }) + '\n');
      }
    }
  }, 1000);
}

main();