# nodecc
Node高效并发任务控制库

### 前言

node默认使用并发，但想要有效控制并发，提高并发性能并不简单。

其一，node使用异步事件循环模型实现并发。
优点是开销小、不用考虑资源抢占。
缺点就是不能真正并行，一个过程的密集计算就可能阻塞其他过程。

其二，node的异步事件循环模型，不默认存在类似进程、线程的数量概念，
不好控制并发数量。

其三，node提供了cluster来进行多进程编程，但使用并没有那么方便。

综合考虑，node本身侧重的就是IO集中环境，使用单线程的并发就足以处理这类问题。
再进一步，则可封装child_process.fork()来实现多进程并发。

### 实现

+ 使用类似Python多线程的实现方法，来实现node的单线程异步并发控制。
建立多个类似“纤程”的对象，不断从任务队列中取值执行，并控制“纤程”的数量。
+ 利用child_process库，实现多进程执行和进程间通信
+ 结合以上两者，在多个进程间实现“纤程”级别的并发控制。

### 使用

```
// 定义任务和数据队列
function task(a, b) {return a+b}
const queue = [];
for (let i = 0; i < 100; i++) {
    queue.push([i, i]);
}

// 使用Nodecc进行并发控制
const Nodecc = require('./nodecc');
const ncc = new Nodecc(task, queue, 10);
ncc.on('result', resultData => {
    let {fid, pid, param, result} = resultData;
    // fid 纤程id
    // pid 进程id
    // param 任务参数
    // result 结果
});
ncc.run();
```

### 参数

##### new Nodecc(task, queue, cmax[, pmax])

\- task \<Function> 任务函数 <br>
\- queue \<Array> 参数列表，指多组参数。每组参数也是一个由参数组成的Array <br>
\- cmax \<Number> 最大并发数 <br>
\- pmax \<Number> 最大进程数。应同时小于CPU核心数和最大并发数。默认为2。

### 测试
任务：每次执行10亿次空循环，执行8组 <br>
环境：4核8线程 CPU <br>

&emsp; \- 并发1 进程1 耗时 8190 (1014) <br>
&emsp; \- 并发2 进程2 耗时 6474 (1650) <br>
&emsp; \- 并发4 进程4 耗时 10109 (4950) <br>
&emsp; \- 并发8 进程8 耗时 11278 (11278) <br>
&emsp; \- 并发8 进程1 耗时 7862 (1002) <br>
&emsp; \- 并发2 进程1 耗时 7900 (1010) <br>
\* 以上单位为ms。( )内为单个任务执行时间。

结论：<br>
并发数增加不影响计算性能。 <br>
进程数影响计算性能。<br>
进程数使并发计算得以实现，但也会使单个进程计算减慢。<br>
在测试环境中，进程数为2时，效率最高。
