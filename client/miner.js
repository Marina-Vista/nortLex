const crypto = require('crypto');

class Miner {
  constructor() {
    this.miningActive = false;
    this.currentWork = null;
    this.currentNonce = 0;
    this.onBlockFound = null; 
  }

  start(work, callback) {
    if (this.miningActive) {
      console.log('New work arrived, restarting mining...');
      this.stop();
    }
    this.miningActive = true;
    this.currentWork = work;
    this.currentNonce = 0;
    this.onBlockFound = callback;
    console.log(`Mining started. Difficulty: ${work.difficulty || 4}`);
    this._mineLoop();
  }

  stop() {
    if (this.miningActive) {
      this.miningActive = false;
      console.log('Mining stopped.');
    }
  }

  _mineLoop() {
    if (!this.miningActive) return;

    const BATCH_SIZE = 1000;
    const processBatch = () => {
      if (!this.miningActive) return;

      const startNonce = this.currentNonce;
      for (let i = 0; i < BATCH_SIZE && this.miningActive; i++) {
        const nonce = startNonce + i;
        const dataToHash = this.currentWork.data + nonce;
        const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
        const difficulty = this.currentWork.difficulty || 4;
        if (hash.startsWith('0'.repeat(difficulty))) {
          console.log('Block found! Submitting...');
          if (this.onBlockFound) {
            this.onBlockFound(nonce, hash, this.currentWork.data);
          }
          this.stop();
          return;
        }
      }
      this.currentNonce += BATCH_SIZE;
      setImmediate(processBatch);
    };

    processBatch();
  }

  isActive() {
    return this.miningActive;
  }

  getCurrentWork() {
    return this.currentWork;
  }
}

module.exports = Miner;