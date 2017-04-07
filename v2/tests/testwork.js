const record = require('node-record-lpcm16'); 
const Detector = require('snowboy').Detector; 
const Models = require('snowboy').Models; 
const uuid = require('node-uuid'); 
const BOTCLIENT = require('./botclient.js'); 
const HTTPSWAPPER = require('./https-helper.js'); 
const URL = require('url'); 
var header = require("waveheader"); 
var fs = require('fs'); 
const AUDIO_CONFIG = {
                sampleRate: 16000,
                channels: 1,
                bitDepth: 16
            };
const CONFIGURATION = {
    StorageInfo:{
                    account:'botstatusdb',
                    key:'4ga82rAldePN4yaMKrUBOyjHPKie3pViVqzuNK2Lt1BGSniqmh1GfCfQ49q56Nh2cDhfz5Z0C/ELR+ymnjq5uw==',
                    container:'upload'
                },
    BotInfo:{
        DirectLineSecret:'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4'
    },
    CognitiveServiceInfo:{
        BingSpeechApiSubscriptionKey:'84517151739b4a4f83ea1ce042cc348c'
    }
}
const models = new Models(); 
var bot = new BOTCLIENT('jumbo','michael',CONFIGURATION.StorageInfo); 
var stream = null; 
var IS_TRIGGERED = false; 
var silenceCount = 0; 
var BING_TOKEN = ''; 
var buffer = null; 
var index = 0; 
var currentFileName = ''; //https://github.com/Kitt-AI/snowboy/issues/1 
bot.setDirectlineSecret(CONFIGURATION.BotInfo.DirectLineSecret); 
bot.accquireToken(function(data){
        var result = bot.startConversation(function(data){
            console.log('****** message recevied from bot = ' + JSON.stringify(data));
            var id = data.id.split("|")[0];
            var wavFN = id + '-sync.wav';
            console.log('==>>' + data.attachments != null && data.attachments != 'undefined');
            if(data.attachments != null && data.attachments != 'undefined'){
                var url = data.attachments[0].contentUrl;
                //Download file from contentUrl
                bot.downloadFile(data.attachments[0].name, data.attachments[0].name,
                    function (error, result, response){
                        if(!error){
                        }
                });
                var headers = {
                        
                };
                var u = URL.parse(url);
                
            }
        });
        convId = result.conversationId;
        //bot.sendMessage(result.conversationId,'user1','測試');
    },
    function(error){
        console.log('error=' + error);
    }
); function setTriggered (triggered){
    if(IS_TRIGGERED == triggered) return;
    IS_TRIGGERED = triggered;
    console.log('>>>>>>>>>>>>>> ' + IS_TRIGGERED + ' <<<<<<<<<<<<<<<<<<<');
}
models.add({
  file: 'resources/hello2.pmdl',
  sensitivity: '0.5',
  hotwords : 'hello'
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
  threshold: 0.3,
  verbose: false,
  sampleRate: 16000,
});
function onData_V2(data){
  if(IS_TRIGGERED){
    if(buffer == null){
        buffer = new Buffer(data);
        currentFileName = 'blob-' + uuid.v1() + '.wav';
        
    }else{
        buffer = Buffer.concat([buffer, new Buffer(data)]);
    }
    console.log('*** writting data to blob:' + data.byteLength);
    
  }else{
    if(buffer != null){
        console.log('*** end writting data to blob');
        index++;
       
        var t = bot.getUploadStream(
            {
                contentType:'audio/wav',
                fileName:currentFileName
            }
        );
        
        t.write(header(44100 * 8, {
            sampleRate: 16000,
            channels: 1,
            bitDepth: 16
            }));
        t.write(buffer);
        t.end();
        buffer = null;
        //send message to bot
        bot.sendMessage('',[{
                contentType:'audio/wav',
                contentUrl:'https://' + CONFIGURATION.StorageInfo.account + '.blob.core.windows.net/' +
                                        CONFIGURATION.StorageInfo.container + '/' +
                                        currentFileName,
                name:currentFileName
            }]
        );
    }
  }
}
mic.on('data', function(data){
  onData_V2(data);
});
mic.pipe(detector);
