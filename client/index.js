// index.js
const readline = require('readline');
const { config, setConfigFromArgs, saveConfig } = require('./config');
const Wallet = require('./wallet');
const Miner = require('./miner');
const Client = require('./client');

// Parse CLI arguments
const args = process.argv.slice(2);
setConfigFromArgs(args);

// Inisialisasi wallet
const wallet = new Wallet(config.walletFile);
const miner = new Miner();
const client = new Client(config.host, config.port, wallet.getAddress());

// Setup CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// Event handlers
client.onWelcome = (msg) => {
  console.log(`Welcome! Coin: ${msg.coin} (${msg.symbol})`);
  rl.prompt();
};

client.onWork = (work) => {
  console.log('New mining work received.');
  miner.start(work, (nonce, hash, workData) => {
    client.submitBlock(nonce, hash, workData);
  });
  rl.prompt();
};

client.onBlockAccepted = () => {
  console.log('Block accepted by server.');
  rl.prompt();
};

client.onError = (err) => {
  console.error(`Connection error: ${err.message}`);
  rl.close();
  process.exit(1);
};

client.onClose = () => {
  console.log('Connection closed.');
  rl.close();
  process.exit(0);
};

// Koneksi ke server
client.connect();

// CLI commands
rl.on('line', (line) => {
  const cmd = line.trim().toLowerCase();
  if (cmd === '') {
    rl.prompt();
    return;
  }

  if (cmd === 'help') {
    console.log(`
Commands:
  help            - show this help
  start           - start mining manually (if work available)
  stop            - stop current mining
  status          - show mining status
  wallet          - show wallet address
  quit / exit     - disconnect and exit
    `);
  } else if (cmd === 'start') {
    if (!miner.isActive() && miner.getCurrentWork()) {
      miner.start(miner.getCurrentWork(), (nonce, hash, workData) => {
        client.submitBlock(nonce, hash, workData);
      });
    } else if (miner.isActive()) {
      console.log('Mining already active.');
    } else {
      console.log('No work available. Wait for server.');
    }
  } else if (cmd === 'stop') {
    miner.stop();
  } else if (cmd === 'status') {
    console.log(`Mining: ${miner.isActive() ? 'active' : 'idle'}`);
    const work = miner.getCurrentWork();
    if (work) console.log(`Work data: ${work.data.substring(0, 20)}..., difficulty: ${work.difficulty || 4}`);
    else console.log('No work data.');
    console.log(`Wallet address: ${wallet.getAddress()}`);
  } else if (cmd === 'wallet') {
    console.log(`Your wallet address: ${wallet.getAddress()}`);
  } else if (cmd === 'quit' || cmd === 'exit') {
    client.disconnect();
    rl.close();
    process.exit(0);
  } else {
    // Bisa juga tetap mengirim JSON langsung ke server jika diperlukan
    try {
      const obj = JSON.parse(cmd);
      client.send(obj);
      console.log('Message sent.');
    } catch (err) {
      console.error('Invalid command. Type "help" for commands.');
    }
  }
  rl.prompt();
});

rl.on('SIGINT', () => {
  console.log('\nDisconnecting...');
  client.disconnect();
  rl.close();
  process.exit(0);
});