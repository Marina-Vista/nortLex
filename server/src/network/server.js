const net = require('net');

// ─────────────────────────────────────────────
//  NETWORK SERVER
// ─────────────────────────────────────────────

function createServer(config, consensus, blockchain, sockets) {
  const server = net.createServer((socket) => {
    let address = null;

    socket.on('data', (raw) => {
      try {
        const message = JSON.parse(raw.toString());

        if (message.type === 'join') {
          address = message.address;
          consensus.join(address);
          sockets.set(address, socket);

          send(socket, {
            type:   'welcome',
            coin:   config.coinName,
            symbol: config.coinSymbol,
          });

          console.log(`[+] ${address} joined`);
        }

      } catch (e) {
        send(socket, { type: 'error', reason: 'Invalid message format' });
      }
    });

    socket.on('close', () => {
      if (address) {
        consensus.leave(address);
        sockets.delete(address);
        console.log(`[-] ${address} disconnected`);
      }
    });

    socket.on('error', (err) => {
      console.log(`[!] Socket error: ${err.message}`);
    });
  });

  return server;
}

function send(socket, object) {
  socket.write(JSON.stringify(object) + '\n');
}

module.exports = { createServer };