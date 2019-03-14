const EventEmitter = require('events');
var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

class SoEmitter extends EventEmitter {}

const soEmitter = new SoEmitter();

if (argv.t && argv.s) {
    console.log("-s -t 不能同时使用")
    return;
}
if (argv.l) {
    let listen = require('./listen')(argv, soEmitter)
}
if (argv.c) {
    let wsClient = require('./wsclient')(argv, soEmitter)
}
if (argv.t) {
    let target = require('./target')(argv, soEmitter)
}
if (argv.s) {
    let wsserver = require('./wsserver')(argv, soEmitter)
}