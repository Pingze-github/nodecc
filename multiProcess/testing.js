
const circulate_num = 1000000000;
const task_num = 8;

async function task_circulate() {
  start = new Date().getTime();
  id = start + Math.random();
  console.log(id, '执行开始');
  const num = circulate_num / task_num;
  for (let i = 0; i < num ; i++) {}
  console.log(id, '执行完毕，耗时', new Date().getTime() - start)
  return id;
}

function main() {
  let queue = [];
  for (let i = 0; i < task_num; i++) {
    queue.push([i]);
  }

  const Nodecc = require('./index');
  const nodecc = new Nodecc(task_circulate, queue, 1, 1);

  const start = new Date().getTime();
  nodecc.on('result', resultData => {
    console.log(resultData);
  });
  nodecc.on('finish', results => {
    console.log(results);
    console.log('总耗时', new Date().getTime() - start);
  });
  nodecc.run();
}

// 因为每个子进程都会require任务函数所在文件，立即执行的代码都要放在 if (!module.parent) {} 里
if (!module.parent) {
  main();
}

// 必须将需要执行的函数exports（不能改名）
module.exports = {task_circulate};

// 多进程能够切实提高并发运算速度，这是单进程异步事件并发做不到的。

// 测试：
// 任务：每次执行10亿次空循环，执行8组
// 环境：4核8线程 CPU
// 非并发 单进程 耗时 8190 (1014 * 8)
// 并发2 进程2 耗时 6474 (1650 * 4)
// 并发4 进程4 耗时 10109 (4950 * 2)
// 并发8 进程8 耗时 11278
// 并发8 进程1 耗时 7862
// 并发2 进程1 耗时 7900

// 结论：并发数不影响效率。进程数影响。进程数为2时效率最高。


// TODO 此文件会被子进程多次require，导致此文件中直接执行的代码也会多次执行，这应该是一种保留方案
// TODO 提供一种将任务函数单独为一个文件的方案，作为推荐方案

// TODO 测试多进程是否有实际性能提升