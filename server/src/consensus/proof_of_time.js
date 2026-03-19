'use strict';

// ─────────────────────────────────────────────
//  PROOF OF TIME
// ─────────────────────────────────────────────

const DEFAULT_BASE_INTERVAL = 10 * 60 * 1000; // 10 menit dalam ms
const MIN_INTERVAL          =  2 * 60 * 1000; //  2 menit dalam ms
const DEFAULT_REWARD        = 0.0007;              // coin per reward

class ProofOfTime {
  /**
   * @param {object} options
   * @param {number} options.baseInterval - Interval solo dalam ms (default 10 menit)
   * @param {number} options.minInterval  - Interval minimum dalam ms (default 2 menit)
   * @param {number} options.reward       - Jumlah coin per reward (default 10)
   */
  constructor(options = {}) {
    this.baseInterval = options.baseInterval ?? DEFAULT_BASE_INTERVAL;
    this.minInterval  = options.minInterval  ?? MIN_INTERVAL;
    this.reward       = options.reward       ?? DEFAULT_REWARD;

    this.participants = new Map(); // address => { connectedAt, lastRewardAt }
  }

  // ── Internal ──────────────────────────────

  /**
   * Hitung interval saat ini berdasarkan jumlah peserta aktif.
   * @returns {number} interval dalam ms
   */
  _currentInterval() {
    const count    = this.participants.size || 1;
    const interval = this.baseInterval / count;
    return Math.max(interval, this.minInterval);
  }

  // ── Public API ────────────────────────────

  /**
   * Daftarkan peserta baru saat konek ke server.
   * @param {string} address - Wallet address peserta
   */
  join(address) {
    if (this.participants.has(address)) return;
    const now = Date.now();
    this.participants.set(address, {
      connectedAt:  now,
      lastRewardAt: now,
    });
  }

  /**
   * Hapus peserta saat disconnect dari server.
   * @param {string} address - Wallet address peserta
   */
  leave(address) {
    this.participants.delete(address);
  }

  /**
   * Cek semua peserta, kembalikan siapa saja yang berhak dapat reward sekarang.
   * Dipanggil secara berkala oleh server (misal tiap detik).
   * @returns {Array<{ address: string, reward: number }>}
   */
  tick() {
    const now      = Date.now();
    const interval = this._currentInterval();
    const eligible = [];

    for (const [address, state] of this.participants) {
      const elapsed = now - state.lastRewardAt;
      if (elapsed >= interval) {
        eligible.push({ address, reward: this.reward });
        state.lastRewardAt = now;
      }
    }

    return eligible;
  }

  /**
   * Info status konsensus saat ini.
   * @returns {object}
   */
  status() {
    return {
      participants:    this.participants.size,
      currentInterval: this._currentInterval(),
      reward:          this.reward,
    };
  }
}

module.exports = { ProofOfTime };