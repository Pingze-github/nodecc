# nodecc
Node并发任务控制库

### 前言

node默认使用并发，但想要有效控制并发，提高并发性能并不简单。

其一，node使用异步事件循环模型实现并发。
优点是开销小、不用考虑资源抢占。
缺点就是不能真正并行，一个过程的密集计算就可能阻塞其他过程。

其二，node的异步事件循环模型，不默认存在类似进程、线程的数量概念，
不好控制并发数量。

其三，node提供了cluster来进行多进程编程，但使用并没有那么方便。

综合考虑，node本身侧重的就是IO集中环境，使用单线程的并发就足以处理这类问题。
如果希望进一步提高多核计算性能，则可封装cluster实现。

### 实现

+ 使用类似Python多线程的实现方法，来实现node的单线程异步并发控制。过程间数据传递使用eventEmitter。

### 使用

```
function task(a) {return a+1}
const queue = [1, 2, 3];

const Nodecc = require('./nodecc');
const ncc = new Nodecc(task, queue, 10);
ncc.on('result', (id, item, result) => {
    // deal with result
});
ncc.run();
```

