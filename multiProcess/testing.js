
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

async function task_sleep(a, b) {
  await sleep(1000);
  return a + b;
}

function main() {
  let queue = [];
  for (let i = 0; i < 10000; i++) {
    queue.push([i, i]);
  }

  const Nodecc = require('./index');
  const nodecc = new Nodecc(task_sleep, queue, 10, 2);

  nodecc.on('result', resultData => {
    console.log(resultData);
  });
  nodecc.on('finish', results => {
    // console.log(results);
  });
  nodecc.run();
}

// 因为每个子进程都会require任务函数所在文件，立即执行的代码都要放在 if (!module.parent) {} 里
if (!module.parent) {
  main();
}

// 必须将需要执行的函数exports（不能改名）
module.exports = {task_sleep};

// TODO 此文件会被子进程多次require，导致此文件中直接执行的代码也会多次执行，这应该是一种保留方案
// TODO 提供一种将任务函数单独为一个文件的方案，作为推荐方案