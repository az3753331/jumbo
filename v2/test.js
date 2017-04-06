const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const request   = require('request');
const uuid = require('node-uuid');
const BOTCLIENT = require('./botclient.js');
const BOT_DIRECTLINE_KEY = 'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4';
const BING_SUBSCRIPTION_KEY = '84517151739b4a4f83ea1ce042cc348c';
const models = new Models();

var bot = new BOTCLIENT('jumbo','michael');
var fs = require('fs');
var stream = null;

var IS_TRIGGERED = false;
var silenceCount = 0;
var BING_TOKEN = '';
var buffer = null;
var index = 0;
//https://github.com/Kitt-AI/snowboy/issues/1
bot.setDirectlineSecret(BOT_DIRECTLINE_KEY);

bot.accquireToken(function(data){
        var result = bot.startConversation(function(data){
            console.log('****** message recevied from bot = ' + JSON.stringify(data));
            var id = data.id.split("|")[0];
            var wavFN = id + '-sync.wav';
            console.log('==>>' + data.attachments != null && data.attachments != 'undefined');
            if(data.attachments != null && data.attachments != 'undefined'){
                var url = data.attachments[0].contentUrl;
                //Download file from contentUrl
                var headers = {
                        
                };
                var u = URL.parse(url);
                
                console.log('downloading voice file...');
                var result = https.requestSync(u.host, u.path, 'GET', null, null);
                
                var buffer = new Buffer(result.body,'binary');
                //fs.writeFile(id + '-sync-2.wav',result.body,null);
                fs.writeFile(wavFN,buffer,'binary',function(e){
                                    console.log('done');
                                     //PlayVoice(wavFN);
                                });
                //player.play(wavFN);
                //StartRecord('/tmp/','temp_');
            }
        });
        convId = result.conversationId;
        //bot.sendMessage(result.conversationId,'user1','測試');
    },
    function(error){
        console.log('error=' + error);
    }
);


function setTriggered (triggered){
    if(IS_TRIGGERED == triggered) return;
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
      //bot.sendAttachment(attachment)
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
/*
request.post({
  'url'     : 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
  'headers' :  {
        'Content-type':'application/x-www-form-urlencoded',
        'Content-Length':0,
        'Ocp-Apim-Subscription-Key':'84517151739b4a4f83ea1ce042cc348c'
    }},
  function(err,resp,body){
    console.log(body);
    BING_TOKEN = body;
  });
*/
mic.pipe(detector);
