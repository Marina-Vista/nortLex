'use strict';

const crypto = require('crypto');

// ─────────────────────────────────────────────
//  BLOCK
// ─────────────────────────────────────────────

class Block {
  /**
   * @param {number} index        - Posisi block di chain
   * @param {string} previousHash - Hash block sebelumnya
   * @param {any}    data         - Payload block (transaksi, reward, dll)
   * @param {number} timestamp    - Unix timestamp (ms), default = sekarang
   */
  constructor(index, previousHash, data, timestamp = Date.now()) {
    this.index        = index;
    this.timestamp    = timestamp;
    this.previousHash = previousHash;
    this.data         = data;
    this.hash         = this.computeHash();
  }

  /**
   * Hitung SHA-256 dari seluruh isi block.
   * Dipanggil saat konstruksi dan saat validasi.
   * @returns {string} hex digest
   */
  computeHash() {
    const content = JSON.stringify({
      index:        this.index,
      timestamp:    this.timestamp,
      previousHash: this.previousHash,
      data:         this.data,
    });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Cek apakah hash tersimpan masih sesuai dengan isi block.
   * @returns {boolean}
   */
  isValid() {
    return this.hash === this.computeHash();
  }
}

// ─────────────────────────────────────────────
//  BLOCKCHAIN
// ─────────────────────────────────────────────

class Blockchain {
  constructor() {
    this.chain = [this._createGenesisBlock()];
  }

  // ── Internal ──────────────────────────────

  /**
   * Block pertama — hard-coded, tidak punya previousHash.
   * @returns {Block}
   */
  _createGenesisBlock() {
    return new Block(0, '0'.repeat(64), { message: 'Genesis Block' }, 0);
  }

  // ── Public API ────────────────────────────

  /**
   * Ambil block paling akhir di chain.
   * @returns {Block}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Tambahkan block baru ke chain.
   * previousHash otomatis diisi dari block terakhir.
   * @param {any} data - Payload bebas
   * @returns {Block}  Block yang baru ditambahkan
   */
  addBlock(data) {
    const latest   = this.getLatestBlock();
    const newBlock = new Block(latest.index + 1, latest.hash, data);
    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Validasi seluruh chain dari genesis sampai ujung.
   * Dua kondisi yang dicek per block:
   *   1. Hash tersimpan == hash yang dihitung ulang  (block tidak dimodif)
   *   2. previousHash   == hash block sebelumnya      (chain tidak putus)
   * @returns {{ valid: boolean, reason?: string, blockIndex?: number }}
   */
  validate() {
    for (let i = 1; i < this.chain.length; i++) {
      const current  = this.chain[i];
      const previous = this.chain[i - 1];

      if (!current.isValid()) {
        return {
          valid:      false,
          reason:     'Block hash does not match',
          blockIndex: i,
        };
      }

      if (current.previousHash !== previous.hash) {
        return {
          valid:      false,
          reason:     'Blockchain is broken',
          blockIndex: i,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Ringkasan chain — berguna untuk debug / logging.
   * @returns {object}
   */
  summary() {
    return {
      length:      this.chain.length,
      latestHash:  this.getLatestBlock().hash,
      latestIndex: this.getLatestBlock().index,
    };
  }
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────

module.exports = { Block, Blockchain };