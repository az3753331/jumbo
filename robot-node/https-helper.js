var util = require('util');
var https = require('https');
var events = require('events')

var httpsync;
try 
{
  httpsync = require('http-sync');
} 
catch (ex) 
{
  httpsync = require('http-sync-win');
}

function HttpsWrapper () {
  events.EventEmitter.call(this)
}

util.inherits(HttpsWrapper, events.EventEmitter)

HttpsWrapper.prototype.requestSync = function(host, requestPath, method, httpsHeaders,body){
    var req = httpsync.request({
        host: host,
        protocol: 'https',
        port:443,
        path:requestPath,
        method: method,
        headers: httpsHeaders,
        body:body
    });
    //if(body != null && body != '' && body != 'undefined'){
    //    req.write(body);
    //}
    var res = req.end();

    return res;
}
HttpsWrapper.prototype.request = function (host,path,method,httpHeaders,body,onData,onError) {
    var options = {
        host: host,
        port: 443,
        path: path,
        method: method,
        headers: httpHeaders,
        body:body
    };
    var req = https.request(options, function(res) {
        console.log(res.statusCode);
        res.on('data', function(d) {
                        onData(d);
                    });
                });
    if(body != null && body != "" && body != 'undefined'){
        console.log('writting post data...' + body);
        req.write(body);
    }
    req.end();

    req.on('error', function(e) {
        onError(e);
    });
}

module.exports = HttpsWrapper;
