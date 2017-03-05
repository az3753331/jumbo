var util = require('util');
var https = require('https');
var events = require('events')

function HttpsWrapper () {
  events.EventEmitter.call(this)
}

util.inherits(HttpsWrapper, events.EventEmitter)

HttpsWrapper.prototype.request = function (host,path,method,httpHeaders,body,onData,onError) {
    var options = {
        host: host,
        port: 443,
        path: path,
        method: method,
        headers: httpHeaders
    };
    var req = https.request(options, function(res) {
        console.log(res.statusCode);
        res.on('data', function(d) {
                        onData(d);
                    });
                });
    if(body != null && body != "" && body != 'undefined'){
        req.write(body);
    }
    req.end();

    req.on('error', function(e) {
        onError(e);
    });
}

module.exports = HttpsWrapper;
