var events = require('events');
var util = require('util');
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

function RPiVoiceAgent (storageInfo, modelOptions) { 
    STORAGE_INFO = storageInfo;
    blobSvc = azure.createBlobService(storageInfo.account,storageInfo.key);
    modelOptions = Object.assign(modelOptionsDefaults,modelOptions);
    models.add(modelOptions);  

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
        onVoiceUploadedHandler(STORAGE_INFO.account,STORAGE_INFO.container,fn);  
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
                _start();
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
    onHotwordDetectedHandler = null;

RPiVoiceAgent.prototype.start = function(onVoiceUploaded,onHotwordDetected){
    onVoiceUploadedHandler = onVoiceUploaded;
    onHotwordDetectedHandler = onHotwordDetected;
    _start();
}

//_setupHotwordDetection();

module.exports = RPiVoiceAgent;