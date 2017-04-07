const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const request   = require('request');
const uuid = require('node-uuid');

const models = new Models();

var fs = require('fs');
var stream = null;

var IS_TRIGGERED = false;
var silenceCount = 0;
var BING_TOKEN = '';
var buffer = null;
var index = 0;
//https://github.com/Kitt-AI/snowboy/issues/1
function setTriggered (triggered){
    if(IS_TRIGGERED == triggered)        return;

    IS_TRIGGERED = triggered;
    console.log('>>>>>>>>>>>>>> ' + IS_TRIGGERED + ' <<<<<<<<<<<<<<<<<<<');
}

models.add({
  file: 'resources/hijumbo.pmdl',
  sensitivity: '0.5',
  hotwords : 'hijumbo'
});

const detector = new Detector({
  resource: "resources/common.res",
  models: models,
  audioGain: 2.0
});

detector.on('silence', function () {
  console.log('silence');
  if(IS_TRIGGERED){
      silenceCount ++;
      if(silenceCount >= 5){
        silenceCount = 0;
        setTriggered(false);          
      }
  }
});

detector.on('sound', function () {
  console.log('sound');
});

detector.on('error', function () {
  console.log('error');
  setTriggered(false);
});

detector.on('hotword', function (index, hotword) {
  console.log('hotword', index, hotword);
  setTriggered(true);
});

var mic = record.start({
  threshold: 0,
  verbose: true
});

function getWavData(buffer){
  var header = new Buffer(1024);
  header.write('RIFF',0);

  //file length
  header.writeUInt32LE(32 + Buffer.byteLength(buffer,{encoding:'binary'}) * 2,4);
  header.write('WAVE',8);

  //format chunk idnetifier
  header.write('fmt ',12);

  //format chunk length
  header.writeUInt32LE(16,16);

  //sample format (raw)
  header.writeUInt16LE(1,20);

  //Channel Count
  header.writeUInt16LE(detector.numChannels(),22);

  //sample rate
  header.writeUInt32LE(detector.sampleRate(),24);

  //byte rate
  //header.writeUInt32LE(detector.sampleRate() * 4,28);
  header.writeUInt32LE(32000,28);

  //block align (channel count * bytes per sample)
  header.writeUInt16LE(2,32);

  //bits per sample
  header.writeUInt16LE(16,34);

  //data chunk identifier
  header.write('data',36);

  //data chunk length
  header.writeUInt32LE(15728640,40);

  var ret = Buffer.concat([header, buffer]);
  
  return ret;
}
function onData_V2(data){
  var fn = './test_' + index + '.wav';
  if(IS_TRIGGERED){
    if(buffer == null){
      buffer = new Buffer(data);
    }else{
      buffer = Buffer.concat([buffer, new Buffer(data)]);
    }
  }else{
    if(buffer != null){
      var wav = getWavData(buffer);
      var f = fs.createWriteStream(fn, {encoding:'binary'});
      f.write(wav);
      f.end();
      index ++;
      buffer = null;
    }
  }
}

mic.on('data', function(data){
  onData_V2(data);
});

mic.pipe(detector);
