var HTTPSWAPPER = require('./https-helper.js');
var events = require('events');
var util = require('util');
var uuid = require('node-uuid');
var fs = require("fs");
var azure = require('azure-storage');
var stream = require('stream');

var CHANNELID = '';
var USERID = '';
var CONVERSATIONID = '';
var STORAGE_INFO = null;
var blobSvc = null;
//var io = require('socket.io-client');

function BotClient (channelId,userId,storageInfo) { 
    USERID = userId;
    CHANNELID = channelId;  
    STORAGE_INFO = storageInfo;
    blobSvc = azure.createBlobService(STORAGE_INFO.account,STORAGE_INFO.key);
    events.EventEmitter.call(this);
}

var SUBSCRIOTIONKEY = "";
var TOKEN = "";
var socket;
var currentWatermark = '1';
var https = new HTTPSWAPPER();


util.inherits(BotClient, events.EventEmitter);

var _receiveLastMessage = function (conversationId,onData,onError){
    var headers = {
            'Authorization': 'Bearer ' + TOKEN
        };
        
    var resp = https.request('directline.botframework.com','/v3/directline/conversations/' + conversationId + '/activities?watermark=' + currentWatermark,'GET',
                    headers,
                    '',
                    function (data){
                        //console.log('https.request()::response =' + data);
                        try{
                            var o = JSON.parse(data);
                            if(o.error != 'undefined' && o.error != null){
                                return null;
                            }else{
                                var last = o.activities[o.activities.length - 1];
                                if(o.watermark != currentWatermark && o.watermark != ''){
                                    console.log('========================');
                                    console.log('o.watermark='+ o.watermark);
                                    console.log('watermark='+currentWatermark);
                                    console.log('========================');
                                    currentWatermark = o.watermark;
                                    if(last.from != null && last.from.id != null && last.from.id != USERID){
                                        onData(last);
                                    }
                                }else{
                                    onData(null);
                                }
                            }
                        }catch(exp){
                            return null;
                        }
                        
                    },
                    function (err){
                        onError(err);
                    });
    
}
//http://vmiv.blogspot.tw/2016/04/nodejssocketio.html
//https://www.npmjs.com/package/socket.io-client

BotClient.prototype.receiveMessages = function(conversationId, onData, onError){
    //v3/directline/conversations/abc123/activities
    var headers = {
        'Authorization': 'Bearer ' + TOKEN
    };
    var resp = https.request('directline.botframework.com','/v3/directline/conversations/' + conversationId + '/activities','GET',
                    headers,
                    '',
                    onData,
                    onError);

    return resp;
}
BotClient.prototype.receiveLastMessage = function(conversationId, onData, onError){
    return _receiveLastMessage(conversationId, onData, onError);
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
    if(true){
        setInterval(function() {
                        console.log('polling...');
                        var activity = _receiveLastMessage(resultObj.conversationId,
                                                            function(activity){
                                                                if(activity != null && activity != 'undefined'){
                                                                    onMessageReceived(activity);
                                                                }
                                                            },
                                                            function(err){
                                                                
                                                            })
                            },500);
    
    }
    else{
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
        socket.on('data', function(data){
            console.log('data data=' + data);
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
    }   
    CONVERSATIONID = resultObj.conversationId;
    return resultObj;               

}
BotClient.prototype.getDownloadStream = function (container, blob, onComplete){
    var pass = new stream.PassThrough();
    blobSvc.getBlobToStream(container, blob, pass, function (error, result, response){onComplete(error, result, response);});
    return pass;
}
BotClient.prototype.downloadFile = function(blob, localFn, func){
    blobSvc.getBlobToStream(STORAGE_INFO.container,blob, fs.createWriteStream(localFn),
        function(error, result, response){
            func(error, result, response);
        });
}

BotClient.prototype.getUploadStream = function(attachment){
    var headers = {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type' : attachment.contentType,
        'Content-Disposition':'name="file"; filename="' + attachment.fileName + '"'
    };
    //console.log('**send attachment headers:' +JSON.stringify(headers));
    //console.log('**send attachment to url:' + '/v3/directline/conversations/' + CONVERSATIONID + '/upload?userId=' + USERID);

    var writeStream = blobSvc.createWriteStreamToBlockBlob(STORAGE_INFO.container,
                                                attachment.fileName,
                                                {
                                                    contentSettings: {
                                                        contentType: attachment.contentType
                                                    }
                                                },
                                                function(error, result, response){
                                                    if(error){
                                                        //console.log("Couldn't upload file %s from %s", fileName, domain);
                                                        console.error(error);
                                                    } else {
                                                        //console.log('File %s from %s uploaded', fileName, domain);
                                                    }
                                                });
    return writeStream;
    
}
BotClient.prototype.sendAttachment = function(attachment){
    
    https.requestSync('directline.botframework.com','/v3/directline/conversations/' + CONVERSATIONID + '/upload?userId=' + USERID,'POST',
                        headers,
                        attachment.buffer
                    );
}
BotClient.prototype.getAttachmentObject = function(fileName, content, contentType){
    var o = {
        'name':fileName,
        'contentType':contentType,
        'content':content
    };
    return o;
}
BotClient.prototype.sendMessage = function(text,attachments){
    console.log('sending message with token:' + TOKEN);
    var activity = {
        'type':'message',
        'from':{'id':USERID},
        'text':text,
        //'channelId':CHANNELID,
        'attachments':attachments
    };
    var activityString = JSON.stringify(activity);
    console.log(new Date() + '>>> bot sending:' + activityString);
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
                    '/v3/directline/conversations/' + CONVERSATIONID + '/activities',
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
