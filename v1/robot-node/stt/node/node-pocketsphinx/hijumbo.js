var fs = require('fs');

var ps = require('.').ps;

modeldir = "../../pocketsphinx/model/en-us/"


var config = new ps.Decoder.defaultConfig();
config.setString("-hmm", modeldir + "en-us");
config.setString("-dict", modeldir + "cmudict-en-us.dict");
config.setString("-lm", modeldir + "en-us.lm.bin");
var decoder = new ps.Decoder(config);

fs.readFile("../../pocketsphinx/test/data/goforward.raw", function(err, data) {
//fs.readFile("../../test.wav",function(err,data){
    if (err) throw err;
    decoder.startUtt();
    decoder.processRaw(data, false, false);
//decoder.startStream();
    decoder.endUtt();
    console.log(decoder.hyp())
});
