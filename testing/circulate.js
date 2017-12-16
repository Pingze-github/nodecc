
const circulate_num = 1000000000;
const task_num = 1000;
const concurrent_num = 1;

async function task_circulate(a) {
  for (let i = 0; i < circulate_num / task_num; i++) {}
  return a;
}

let queue = [];
for (let i = 0; i < task_num; i++) {
  queue.push([i]);
}


const Nodecc = require('../index');
const nodecc = new Nodecc(task_circulate, queue, concurrent_num);

const start = new Date().getTime();
/*nodecc.on('result', (id, item, result) => {
  console.log(id, item, result);
});*/
nodecc.on('finish', () => {
  console.log(`总共循环 ${circulate_num * task_num} 次，并发数 ${concurrent_num}，耗时 ${new Date().getTime() - start} ms`)
});
nodecc.run();

// 测试报告
/*
总共空循环10亿次，分成1000次任务：
  不并发 耗时13374ms
  并发100，耗时13771ms
  并发1000，耗时13759ms
* */
// 结论：单线程并发，使用事件循环机制，对纯cpu密集型业务没有性能提升