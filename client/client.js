const net = require('net');

class Client {
  constructor(host, port, walletAddress) {
    this.host = host;
    this.port = port;
    this.walletAddress = walletAddress;
    this.socket = null;
    this.onWelcome = null;
    this.onWork = null;
    this.onBlockAccepted = null;
    this.onError = null;
    this.onClose = null;
  }

  connect() {
    this.socket = net.createConnection({ host: this.host, port: this.port }, () => {
      console.log('Connected to server.');
      this.send({ type: 'join', address: this.walletAddress });
    });

    this.socket.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const msg = JSON.parse(line);
          this._handleMessage(msg);
        } catch (err) {
          console.error('Failed to parse server message.');
        }
      }
    });

    this.socket.on('close', () => {
      if (this.onClose) this.onClose();
    });

    this.socket.on('error', (err) => {
      if (this.onError) this.onError(err);
    });
  }

  _handleMessage(msg) {
    switch (msg.type) {
      case 'welcome':
        if (this.onWelcome) this.onWelcome(msg);
        break;
      case 'work':
        if (this.onWork) this.onWork(msg);
        break;
      case 'block':
        if (msg.status === 'accepted' && this.onBlockAccepted) {
          this.onBlockAccepted(msg);
        }
        break;
      case 'error':
        if (this.onError) this.onError(new Error(msg.reason));
        break;
      default:
        break;
    }
  }

  send(obj) {
    if (this.socket && !this.socket.destroyed) {
      this.socket.write(JSON.stringify(obj) + '\n');
    }
  }

  submitBlock(nonce, hash, workData) {
    this.send({
      type: 'block',
      nonce: nonce,
      hash: hash,
      workData: workData
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.end();
    }
  }
}

module.exports = Client;