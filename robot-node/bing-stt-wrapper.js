var HTTPSWAPPER = require('./https-helper.js');
var events = require('events');
var util = require('util');
var uuid = require('node-uuid');
var fs = require("fs");
//curl -v -X POST "https://api.cognitive.microsoft.com/sts/v1.0/issueToken" 
//-H "Content-type: application/x-www-form-urlencoded" 
//-H "Content-Length: 0" 
//-H "Ocp-Apim-Subscription-Key: your_subscription_key"


function BingSTTAPI () {
  events.EventEmitter.call(this)
}

util.inherits(BingSTTAPI, events.EventEmitter);

BingSTTAPI.prototype.accquireToken = function(subscriptionKey,onData, onError){
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

BingSTTAPI.prototype.speechToText = function (token, fn, appId, onData, onError){
    //curl -v -X 
    //POST "https://speech.platform.bing.com/recognize?scenarios=smd&appid=D4D52672-91D7-4C74-8AD8-42B1D98141A5&locale=your_locale&device.os=your_device_os&version=3.0&format=json&instanceid=your_instance_id&requestid=your_request_id"
    //-H 'Authorization: Bearer your_access_token' 
    //-H 'Content-type: audio/wav; codec="audio/pcm"; samplerate=16000' --data-binary @your_wave_file
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
                        '/recognize?scenarios=websearch&appid=' + appId + '&locale=zh-TW&device.os=your_device_os&version=3.0&format=json&instanceid=' + instanceId + '&requestid=' + requestId ,
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
    //curl -v -X 
    //POST "https://speech.platform.bing.com/recognize?scenarios=smd&appid=D4D52672-91D7-4C74-8AD8-42B1D98141A5&locale=your_locale&device.os=your_device_os&version=3.0&format=json&instanceid=your_instance_id&requestid=your_request_id"
    //-H 'Authorization: Bearer your_access_token' 
    //-H 'Content-type: audio/wav; codec="audio/pcm"; samplerate=16000' --data-binary @your_wave_file
    var https = new HTTPSWAPPER();
        var headers = {
            'Content-type':'application/ssml+xml',
            'X-Search-AppId':uuid.v1(),
            'X-Search-ClientID':uuid.v1(),
            'User-Agent':'bing-stt-wrapper',
            'Authorization':'Bearer ' + token,
            'X-Microsoft-OutputFormat' : 'ssml-16khz-16bit-mono-tts'
        };
        var body = "<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)'>" + phrase + "</voice></speak>";
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
