var HTTPSWAPPER = require('./https-helper.js');
var events = require('events');
var util = require('util');
var uuid = require('node-uuid');
var fs = require("fs");
//var io = require('socket.io-client');

function BotClient () {  events.EventEmitter.call(this);}

util.inherits(BotClient, events.EventEmitter);

var SUBSCRIOTIONKEY = "";
var TOKEN = "";
var https = new HTTPSWAPPER();
var socket;
var currentWatermark = '';


var _receiveLastMessageSync = function (conversationId){
    var headers = {
            'Authorization': 'Bearer ' + TOKEN
        };
    var resp = https.requestSync('directline.botframework.com','/v3/directline/conversations/' + conversationId + '/activities','GET',
                    headers,
                    '');
    //console.log(JSON.stringify(JSON.parse(resp.body)));
    var o = JSON.parse(resp.body);
    var last = o.activities[o.activities.length - 1];
    if(o.watermark != currentWatermark){
        currentWatermark = o.watermark;
        return last;
    }else{
        return null;
    }
}
//http://vmiv.blogspot.tw/2016/04/nodejssocketio.html
//https://www.npmjs.com/package/socket.io-client
BotClient.prototype.receiveMessagesSync = function(conversationId){
    //v3/directline/conversations/abc123/activities
    var headers = {
        'Authorization': 'Bearer ' + TOKEN
    };
    var resp = https.requestSync('directline.botframework.com','/v3/directline/conversations/' + conversationId + '/activities','GET',
                    headers,
                    '');

    return resp;
}

BotClient.prototype.receiveLastMessageSync = function(conversationId){
    return _receiveLastMessageSync(conversationId);
    //v3/directline/conversations/abc123/activities
    var headers = {
        'Authorization': 'Bearer ' + TOKEN
    };
    var resp = https.requestSync('directline.botframework.com','/v3/directline/conversations/' + conversationId + '/activities','GET',
                    headers,
                    '');
    //console.log(JSON.stringify(JSON.parse(resp.body)));
    var o = JSON.parse(resp.body);
    return o.activities[o.activities.length - 1];
}
BotClient.prototype.startConversation = function(onMessageReceived){
    var headers = {
        'Authorization': 'Bearer ' + TOKEN
    };
    var resp = https.requestSync('directline.botframework.com','/v3/directline/conversations','POST',
                    headers,
                    '');
    console.log('respString=' + JSON.stringify(resp.body));
    var streamUrl = '';
    if(resp.statusCode == 200 || resp.statusCode == 201){
        var resultObj = JSON.parse(resp.body);
    
        streamUrl = resultObj.streamUrl;
        
        //console.log('conversationId=' + resultObj.conversationId);
        console.log('streamUrl=' + streamUrl);
        console.log(JSON.stringify(resultObj));
    }else{
        console.log('[Error]StartConversation::' + resp.statusCode);
        return null;
    }
    
    //somehow I can't make websocket works in my environment, so use polling GET instead for now.
    setInterval(function() {
                    console.log('polling...');
                    var activity = _receiveLastMessageSync(resultObj.conversationId);
                    if(activity != null && activity != 'undefined'){
                        onMessageReceived(activity);
                    }
                },500);
    /*
    socket = require('socket.io-client')(streamUrl,
                                            {
                                                extraHeaders:{
                                                    Upgrade:'websocket',
                                                    Conneciton:'upgrade'
                                                }
                                            });
                                            
    socket.on('connect', function(){console.log('socket connected');});
    socket.on('*', function(){console.log('socket ***');});
    socket.on('message', function(data){
        console.log('event data=' + data);
        onMessageReceived(data);
    });
    socket.on('onmessage', function(data){
        console.log('event data=' + data);
        onMessageReceived(data);
    });
    socket.on('onevent', function(data){
        console.log('Message data=' + data);
       onMessageReceived(data);
    });
    socket.on('event', function(data){
        console.log('Message data=' + data);
       onMessageReceived(data);
    });

    console.log('socket created');
    */
    return resultObj;               
/*
{
  "conversationId": "abc123",
  "token": "RCurR_XV9ZA.cwA.BKA.iaJrC8xpy8qbOF5xnR2vtCX7CZj0LdjAPGfiCpg4Fv0y8qbOF5xPGfiCpg4Fv0y8qqbOF5x8qbOF5xn",
  "expires_in": 1800,
  "streamUrl": "https://directline.botframework.com/v3/directline/conversations/abc123/stream?t=RCurR_XV9ZA.cwA..."
}
*/
}

BotClient.prototype.sendAttachment = function(conversationId, fromUserId, attachment){
    var headers = {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type' : attachment.contentType,
        'Content-Disposition':'name="file"; filename="' + attachment.fileName + '"'
    };
    
    
    https.request('directline.botframework.com','/v3/directline/conversations/' + conversationId + '/upload?userId=' + fromUserId,'POST',
                    headers,
                    attachment.buffer,
                    function (data){
                        console.log('data=' + data);
                        onData(data);
                    },
                    function (error){
                        console.log('error=' + error);
                        onError(error);
                    });
    
}
BotClient.prototype.sendMessage = function(conversationId, fromUserId, text){
    var activity = {
        'type':'message',
        'from':{'id':fromUserId},
        'text':text
    };
    var activityString = JSON.stringify(activity);
    var headers = {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(activityString)
    };
    /*
    {
        "type": "message",
        "from": {
            "id": "user1"
        },
        "text": "hello"
    }
    */
    
    https.request('directline.botframework.com',
                    '/v3/directline/conversations/' + conversationId + '/activities',
                    'POST',
                    headers,
                    activityString,
                    function (data){
                        console.log('data=' + data);
                        //onData(data);
                    },
                    function (error){
                        console.log('error=' + error);
                        //onError(error);
                    });
    
}

BotClient.prototype.setDirectlineSecret = function(subscriptionKey){
    SUBSCRIOTIONKEY = subscriptionKey;
    console.log('SUBSCRIOTIONKEY=' + SUBSCRIOTIONKEY);
}
/*
BotClient.prototype.startListen = function(onData){
    var socket = io.connect(); 
    socket.on('connect', function () { 
        socket.on('message', function (data) { 
            if(onData != null && onData != 'undefined'){
                onData(data);
            }
        }); 
    }); 
}
*/
BotClient.prototype.refershToken = function(){
    //v3/directline/tokens/refresh
    var https = new HTTPSWAPPER();
    var headers = {
        'Authorization': 'Bearer ' + SUBSCRIOTIONKEY
    };
    https.request('directline.botframework.com','/v3/directline/tokens/refresh','POST',
                    headers,
                    '',
                    function (data){
                        console.log('token=' + data);
                        var o = JSON.parse(data);
                        if(o.token != 'undefined' && o.token != ''){
                            TOKEN = o.token;
                        }
                        onData(TOKEN);
                    },
                    function (error){
                        console.log('error=' + error);
                        onError(error);
                    });
}

BotClient.prototype.accquireToken = function(onData, onError){
    var https = new HTTPSWAPPER();
    console.log('SUBSCRIOTIONKEY=' + SUBSCRIOTIONKEY);
    var headers = {
        'Authorization': 'Bearer ' + SUBSCRIOTIONKEY
    };
    https.request('directline.botframework.com','/v3/directline/tokens/generate','POST',
                    headers,
                    '',
                    function (data){
                        var o = JSON.parse(data);
                        if(o.token != 'undefined' && o.token != ''){
                            TOKEN = o.token;
                        }
                        console.log('token=' + data);
                        onData(o.token);
                    },
                    function (error){
                        console.log('error=' + error);
                        onError(error);
                    });
}


module.exports = BotClient;