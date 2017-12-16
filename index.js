
const EventEmitter = require('events').EventEmitter;

function Fiber(id, task, queue, eventHub) {
  this.id = id;
  this.task = task;
  this.queue = queue;
  this.eventHub = eventHub;
}

Fiber.prototype = {
  constructor: Fiber,
  async run() {
    while (true) {
      let param = this.queue.shift();
      if (typeof param === 'undefined') {
        break;
      }
      let result = await this.task.apply(null, param);
      this.eventHub.emit('result', this.id, param, result)
    }
    return this.id;
  }
};


function Nodecc(task, queue, max) {
  this.task = task;
  this.queue = queue.slice(0);
  this.queueLen = queue.length;
  this.max = max;
  this.fibers = [];
  this.results = [];
  this.eventHub = new EventEmitter();
}

Nodecc.prototype = {
  constructor: Nodecc,
  async run() {
    for (let i = 0; i < this.max; i++) {
      this.fibers[i] = new Fiber(i, this.task, this.queue, this.eventHub);
      this.fibers[i].run().then(id => {
        this.eventHub.emit('fiberfinished', id);
      });
    }
    return this;
  },
  on(event, callback) {
    if (event === 'ffinish') {
      this.eventHub.on('fiberfinished', id => callback(id));
    }
    if (event === 'result') {
      this.eventHub.on('result', (id, param, result) => callback(id, param, result));
    }
    if (event === 'finish') {
      let num = 0;
      this.eventHub.on('result', (_, param, result) => {
        num ++;
        this.results.push({param, result});
        if (num === this.queueLen) {
          callback(this.results);
        }
      });
    }
  }
};

module.exports = Nodecc;