var fs = require('fs');
var dweetClient = require("node-dweetio");
var dweetio = new dweetClient();

var iotName = 'henrik_binggl_raspi_temp';
var sensorPath = '/sys/bus/w1/devices/10-000802b56875/w1_slave';
var interval = 1000;

/**
 * read the sensor value from the device
 * @returns temperature within a callback
 */
function readTemperatureSensorValue(callback) {
  fs.readFile(sensorPath, 'utf-8', function(err, data) {
    if(err) {
      console.error(err);
      callback(-1); 
      return;
    }

    // parse the data - the value is t=xxxxx
    // 2f 00 4b 46 ff ff 02 10 9f : crc=9f YES
    // 2f 00 4b 46 ff ff 02 10 9f t=23625
    data = data.trim(); 
    var result = data.split('t=');
    if(result && result.length === 2) {
      var temp = result[1] / 1000;
      callback(temp);
    } else {
      callback(-1);
    }

  });
}


setInterval(function() {
  var temp = 0;
  readTemperatureSensorValue(function(value) {
    console.log(value);

    dweetio.dweet_for(iotName, { temp:value }, function(err, dweet){

      if(err) {
        console.error(err);
        return;
      }
      console.log(dweet.thing); // "my-thing"
      console.log(dweet.created); // The create date of the dweet

    });
  });
}, interval);
