
const net = require('net');

function scan(port, ip) {
  return new Promise(resolve => {
    const client = net.connect(port, ip, () => {
      resolve('connect');
      client.destroy();
    });
    client.on('error', err => {
      resolve(err.code)
    });
    setTimeout(() => {
      resolve('timeout');
    }, 2000);
  });
}

async function task_tcp_port_scan(ip, port) {
  return await scan(port, ip);
}

let queue = [];
for (let i = 1; i <= 65535; i++) {
  queue.push(['10.32.64.228', i]);
}


const Nodecc = require('../index');
const nodecc = new Nodecc(task_tcp_port_scan, queue, 10000);

const start = new Date().getTime();
const opens = [];
nodecc.on('finish', results => {
  results.forEach(result => {
    if (result.result === 'connect') {
        opens.push(result.param[1]);
    }
  });
  console.log(`检查 ${results.length} 个端口，耗时 ${new Date().getTime() - start} ms`);
  console.log(`开放端口：`, opens.join(','));
});
nodecc.run();
