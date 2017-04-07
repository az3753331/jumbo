var events = require('events');
var util = require('util');
var JUMBO = require('./botclient.js');
var stream = require('stream');
const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const azure = require('azure-storage');
const fs = require('fs');
const uuid = require('node-uuid'); 
const BOTCLIENT = require('./botclient.js'); 
const HTTPSWAPPER = require('./https-helper.js'); 
const URL = require('url');
const models = new Models();
var Speaker = require('speaker');

const AUDIO_CONFIG = {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16
};
var STORAGE_INFO = null;

var blobSvc = null;

var modelOptionsDefaults = {
  file: 'resources/hello2.pmdl',
  sensitivity: '0.5',
  hotwords : 'hello'
};
var ERROR_WAV = {
                            ERROR_ERROR_OCCUR : './media/erroroccur.wav',
                            ERROR_IDONTUNDERSTAND : './media/idontunderstand.wav'
                };
var bot = null;

function RPiVoiceAgent (storageInfo, modelOptions, botInfo , errors ) { 
    STORAGE_INFO = storageInfo;
    blobSvc = azure.createBlobService(storageInfo.account,storageInfo.key);
    ERROR_WAV = Object.assign(ERROR_WAV, errors);
    modelOptions = Object.assign(modelOptionsDefaults,modelOptions);
    models.add(modelOptions);  

    bot = new JUMBO(botInfo.botId,botInfo.userId,storageInfo);
    bot.setDirectlineSecret(botInfo.DirectLineSecret);
    events.EventEmitter.call(this);
}

util.inherits(RPiVoiceAgent, events.EventEmitter);



function _stopListening(){
    record.stop();
}

function _startListeningAndUpload(onEnd){
    var m = record.start({
        threshold: 0.6,
        silence: '1.5',
        verbose: false,
        sampleRate: 16000,
    });
    var fn = uuid.v1() + '.wav';
    var ws = blobSvc.createWriteStreamToBlockBlob(STORAGE_INFO.container,
                                                    fn,
                                                    {
                                                        contentSettings: {
                                                            contentType: 'audio/wav'
                                                        }
                                                    },
                                                    function(error, result, response){
                                                        if(error){
                                                            console.error('error creating stream:' + error);
                                                        } else {
                                                        }
                                                    });
    ws.on('close', function(){
        var result = onVoiceUploadedHandler(STORAGE_INFO.account,STORAGE_INFO.container,fn);
        if(result == null || result == 'undefined')
        {
            console.log('sending result:' + JSON.stringify(result));
            result = [{
                        contentType:'audio/wav',
                        contentUrl:'https://' + STORAGE_INFO.account + '.blob.core.windows.net/' +
                                                STORAGE_INFO.container + '/' +
                                                fn,
                        name:fn
                    }];
        }
        bot.sendMessage(
                    '',
                    result);        
            });
            m.on('data', function(data){
                console.log('...speaking...');
            });
            m.on('end',function(){
                console.log('...end...');
                _stopListening();
                onEnd(m);
            });

            m.pipe(ws);
}

function _start(){
    var detector = new Detector({
        resource: "resources/common.res",
        models: models,
        audioGain: 2.0
    });

    detector.on('silence', function () {
        console.log('[snowboy]silence');
    });

    detector.on('sound', function () {
        console.log('[snowboy]sound');
    });

    detector.on('hotword', function (index, hotword) {
        console.log('[snowboy]====== hotword =>', index, hotword);
        onHotwordDetectedHandler();
        _stopListening();
        _startListeningAndUpload(
            function (listeningMic){
                //module.exports.start();
                console.log('_startListeningAndUpload callback called');
                //_start();
            });
    });
    var m = record.start({
                    threshold: 0.3,
                    verbose: false,
                    sampleRate: 16000,
                });
    m.on('data', function(data){
        console.log('[snowboy]logging...');
    });
    console.log('[snowboy]hotword detection setup completed !');
    
    m.pipe(detector);
}


var onVoiceUploadedHandler = null,
    onHotwordDetectedHandler = null,
    onBotReplyReceivedHandler = null;

RPiVoiceAgent.prototype.start = function(onVoiceUploaded,onHotwordDetected,onBotReplyReceived){
    onVoiceUploadedHandler = onVoiceUploaded;
    onBotReplyReceivedHandler = onBotReplyReceived;
    onHotwordDetectedHandler = onHotwordDetected;


    bot.accquireToken(
        function(data){
            var result = bot.startConversation(function(data){
                onBotReplyReceivedHandler(data);
                console.log('****** message recevied from bot = ' + data.text);
                if(data.attachments != null && data.attachments != 'undefined'){
                    
                    var url = data.attachments[0].contentUrl;
                    console.log('has attachments:' + url);
                    //Streaming
                    if(true){
                        var speaker = new Speaker({
                            channels: 1,          // 2 channels
                            bitDepth: 16,         // 16-bit samples
                            sampleRate: 16000     // 44,100 Hz sample rate
                        });
                        speaker.on('error',function(err){
                            console.log('speaker error=' + err);
                            //TODO: play a local wav file to notify error
                            _start();
                        });
                        speaker.on('close',function(){
                            console.log('speaker closed');
                            _start();
                        });
                        console.log('has attachments, playing audio...' + STORAGE_INFO.container + '/' + data.attachments[0].name);
                        var passStream = bot.getDownloadStream(
                                                STORAGE_INFO.container, 
                                                data.attachments[0].name, 
                                                function(err,result,response){
                                                    console.log('in stream download completed event, closing passthrough stream...');
                                                    passStream.end();
                                            });
                        //we will need to pause hotwords detection in order to prevent unexpected sound detect
                        passStream.pipe(speaker);
                    }else{
                        //file download
                        bot.downloadFile(data.attachments[0].name, data.attachments[0].name,
                            function (error, result, response){
                                if(!error){
                                    
                                }
                        });                        
                    }
                }
            });
            convId = result.conversationId;
        },
        function(error){
            console.log('error=' + error);
        }
    );

    _start();
    
}

//_setupHotwordDetection();

module.exports = RPiVoiceAgent;