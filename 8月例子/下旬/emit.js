var Emitter = require('events').EventEmitter;

var emitter = new Emitter();

emitter.on('someEvent',function(stream){

console.log(stream + 'from eventHandler1');

});

emitter.on('someEvent',function(stream){

console.log(stream + 'from eventHandler2');

});

emitter.emit('someEvent','I am a stream!');
//可以减少代码的耦合度