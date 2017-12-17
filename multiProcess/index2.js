
const EventEmitter = require('events').EventEmitter;
const fork = require('child_process').fork;

const taskEventHub = new EventEmitter();

function getFuncName(func) {
  return func.toString().match(/function (\w+)\(/)[1];
}

function getChild(childs) {
  let child = childs[0];
  let childsLen = childs.length;
  for (let i = 1; i < childsLen; i++) {
    if (childs[i].runningNum < child.runningNum) {
      child = childs[i];
    }
  }
  return {
    pid: child.pid,
    child
  }
}

function killAllChilds(childs) {
  for (let child of childs) {
    if (!child.killed && child.runningNum === 0) child.kill()
  }
}

function forkRun(child, param) {
  return new Promise(resolve => {
    const tid = new Date().getTime().toString() + child.pid + Math.random();
    child.runningNum ++;
    child.send({param, tid});
    taskEventHub.once(tid, msg => {
      // console.log('主进程接收到返回', child.pid, msg);
      child.runningNum --;
      resolve(msg.result);
    });
  });
}


/**
 * 纤程
 */
function Fiber(id, task, queue, eventHub, childs) {
  this.id = id;
  this.task = task;
  this.queue = queue;
  this.eventHub = eventHub;
  this.childs = childs;
}

Fiber.prototype = {
  constructor: Fiber,
  run() {
    return new Promise(resolve => {
      const loop = () => {
        const param = this.queue.shift();
        if (typeof param === 'undefined') {
          killAllChilds(this.childs);
          return;
        }
        const {pid, child} = getChild(this.childs);
        forkRun(child, param).then(result => {
          const resultData = {fid: this.id, pid, param, result};
          this.eventHub.emit('result', resultData);
          loop();
        });
      };
      loop();
      return resolve(this.id);
    });
  }
};

/**
 * 并发模型
 */
function Nodecc(task, queue, cmax, pmax) {
  this.task = task;
  this.queue = queue.slice(0);
  this.queueLen = queue.length;
  this.cmax = cmax;
  this.fibers = [];
  this.results = [];
  this.eventHub = new EventEmitter();
  if (pmax > cmax) throw new Error('进程数pmax不应大于并发数cmax');
  this.childs = __initChilds(pmax || 2);
  function __initChilds(processMax) {
    const childs = [];
    for (let i = 0; i < processMax; i++) {
      const child = fork('./child.js', [module.parent.filename, getFuncName(task)]);
      child.runningNum = 0;
      childs.push(child);
      child.on('message', msg => {
        taskEventHub.emit(msg.tid, msg);
      });
    }
    return childs;
  }
}

Nodecc.prototype = {
  constructor: Nodecc,
  run() {
    for (let i = 0; i < this.cmax; i++) {
      this.fibers[i] = new Fiber(i, this.task, this.queue, this.eventHub, this.childs);
      this.fibers[i].run().then(id => {
        this.eventHub.emit('fiberfinished', id);
      });
    }
  },
  on(event, callback) {
    if (event === 'ffinish') {
      this.eventHub.on('fiberfinished', id => callback(id));
    }
    if (event === 'result') {
      this.eventHub.on('result', resultData => callback(resultData));
    }
    if (event === 'finish') {
      let num = 0;
      this.eventHub.on('result', resultData => {
        let {param, result} = resultData;
        num ++;
        this.results.push({param, result});
        if (num === this.queueLen) {
          callback(this.results);
        }
      });
    }
  },
  __initChilds() {

  }
};

module.exports = Nodecc;