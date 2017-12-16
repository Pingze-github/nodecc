
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

async function task(a, b) {
  await sleep(1000);
  return a + b;
}

let queue = [];
for (let i = 0; i < 50; i++) {
  queue.push([i, i *2]);
}

const Nodecc = require('./index');

const nodecc = new Nodecc(task, queue, 10);

nodecc.run();
nodecc.on('result', (id, item, result) => {
  console.log(id, item, result);
});
nodecc.on('finish', results => {
  console.log(results);
});