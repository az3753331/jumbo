var BOTWRAPPER = require('../botclient.js');

var key = '<your directline key>';
var bot = new BOTWRAPPER();
var socket;
var convId = '';

bot.setDirectlineSecret(key);
bot.accquireToken(function(data){
        var result = bot.startConversation(function(data){
            console.log('***** message recevied from bot = ' + JSON.stringify(data));
        });
        convId = result.conversationId;
        bot.sendMessage(result.conversationId,'user1','test message');
    },
    function(error){
        console.log('error=' + error);
    }
);

process.stdin.on('data', function (text) {
    //console.log('received data:', util.inspect(text));
    if (text === 'quit\n') {
      done();
    }else{
        bot.sendMessage(convId,'user1','test');
        var resp = bot.receiveLastMessageSync(convId);

        console.log(JSON.stringify((resp)));
        /*
        {"type":"message","id":"1GiRVbh54c223QHZcoYepv|0000003","timestamp":"2017-03-15T01:52:23.8100989Z","channelId":"directline","from":{
        "id":"jumbochatbot","name":"Jumbo"},"conversation":{"id":"1GiRVbh54c223QHZcoYepv"},"text":"You sent test which was 4 characters","re
        plyToId":"1GiRVbh54c223QHZcoYepv|0000002"}
        */
    }
  });

