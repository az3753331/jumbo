const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const azure = require('azure-storage');
const fs = require('fs');
const uuid = require('node-uuid'); 
const BOTCLIENT = require('../botclient.js'); 
const HTTPSWAPPER = require('../https-helper.js'); 
const URL = require('url');
const models = new Models(); 
const AUDIO_CONFIG = 
{
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16
};
const CONFIGURATION = 
{
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
};

var fnIndex = 0;
var fnPrefix = 'test-js-';

var blobSvc = azure.createBlobService(
                      CONFIGURATION.StorageInfo.account,
                      CONFIGURATION.StorageInfo.key);

models.add({
  file: 'resources/hello2.pmdl',
  sensitivity: '0.5',
  hotwords : 'hello'
});

//const detector = new Detector({


function _setupHotwordDetection(){
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
    /*
    detector.on('error', function (err) {
    console.log('[snowboy]error:' + err);
    });
    */

    detector.on('hotword', function (index, hotword) {
        console.log('[snowboy]====== hotword =>', index, hotword);
        _stopListening();
        _startListeningAndUpload(
            function (listeningMic){
                _setupHotwordDetection();
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
    var ws = blobSvc.createWriteStreamToBlockBlob('upload',
                                                    fnPrefix +  (fnIndex++) + '.wav',
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
    m.on('data', function(data){
        console.log('...speaking...');
    });
    m.on('end',function(){
        console.log('...end...');
        _stopListening();
        //m.unpipe(ws);
        onEnd(m);
    });
    //var ws = fs.createWriteStream('./test-js.wav',{autoClose:true});
    m.pipe(ws);
}


//var mic = _setupHotwordDetection();
//mic.pipe(detector);

_setupHotwordDetection();

