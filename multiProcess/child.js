
const taskPath = process.argv[2];
const taskName = process.argv[3];
task = require(taskPath)[taskName];

process.on('message', msg => {
  const param = msg.param;
  const tid = msg.tid;
  // console.log('子进程接收参数', process.pid, param);
  task.apply(null, param).then(result => {
    // console.log('子进程发送结果', process.pid, result, tid);
    process.send({result, tid});
  });
});