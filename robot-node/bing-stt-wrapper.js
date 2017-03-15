var HTTPSWAPPER = require('./https-helper.js');
var events = require('events');
var util = require('util');
var uuid = require('node-uuid');
var fs = require("fs");

function BingSTTAPI () {  events.EventEmitter.call(this);}

util.inherits(BingSTTAPI, events.EventEmitter);
var SUBSCRIPTIONKEY = "";



BingSTTAPI.prototype.setSubscriptionKey = function(subscriptionKey){
    SUBSCRIPTIONKEY = subscriptionKey;
}
BingSTTAPI.prototype.accquireToken = function(onData, onError){
    var https = new HTTPSWAPPER();
    var headers = {
        'Content-type':'application/x-www-form-urlencoded',
        'Content-Length':0,
        'Ocp-Apim-Subscription-Key':subscriptionKey
    };
    https.request('api.cognitive.microsoft.com','/sts/v1.0/issueToken','POST',
                    headers,
                    '',
                    function (data){
                        console.log('data=' + data);
                        onData(data);
                    },
                    function (error){
                        console.log('error=' + error);
                        onError(error);
                    });
}

BingSTTAPI.prototype.speechToText = function (token, fn, appId, locale, onData, onError){
	console.log('token='+token);
    instanceId = uuid.v1();
    requestId = uuid.v1();
    var https = new HTTPSWAPPER();
        var headers = {
            'Content-type':'audio/wav; samplerate=44000',
            'Authorization':'Bearer ' + token
        };
        console.log('speechToText, fn=' + fn);
        var data = fs.readFileSync(fn);//,'binary');
        console.log('sending request...');
        
        https.request('speech.platform.bing.com',
                        '/recognize?scenarios=websearch&appid=' + appId + '&locale=' + locale + '&device.os=your_device_os&version=3.0&format=json&instanceid=' + instanceId + '&requestid=' + requestId ,
                        'POST',
                        headers,
                        data,
                        function (data){
                            console.log('data=' + data);
                            onData(data);
                        },
                        function (error){
                            console.log('error=' + error);
                            onError(error);
                        });
}

BingSTTAPI.prototype.textToSpeech = function (token, phrase, appId, instanceId, requestId){

    var https = new HTTPSWAPPER();
        var headers = {
            'Content-type':'application/ssml+xml',
            'X-Search-AppId':uuid.v1(),
            'X-Search-ClientID':uuid.v1(),
            'User-Agent':'bing-stt-wrapper',
            'Authorization':'Bearer ' + token,
            'X-Microsoft-OutputFormat' : 'ssml-16khz-16bit-mono-tts'
        };
        var body = "<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female'" +
                        " name='Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)'>" + 
                        phrase + "</voice></speak>";
        var req = https.request('speech.platform.bing.com','/synthesize' ,'POST',
                        headers,
                        body,
                        function (data){
                            console.log('data=' + data);
                            onData(data);
                        },
                        function (error){
                            console.log('error=' + error);
                            onError(error);
                        }
        );

}

module.exports = BingSTTAPI;
