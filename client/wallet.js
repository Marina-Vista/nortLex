const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class Wallet {
  constructor(walletFile) {
    this.walletFile = walletFile;
    this.address = null;
    this.loadOrCreate();
  }

  loadOrCreate() {
    if (fs.existsSync(this.walletFile)) {
      const data = JSON.parse(fs.readFileSync(this.walletFile));
      this.address = data.address;
      console.log(`Wallet loaded: ${this.address}`);
    } else {
      this.address = `miner-${crypto.randomBytes(4).toString('hex')}`;
      fs.writeFileSync(this.walletFile, JSON.stringify({ address: this.address }, null, 2));
      console.log(`New wallet created: ${this.address}`);
    }
  }

  getAddress() {
    return this.address;
  }
}

module.exports = Wallet;