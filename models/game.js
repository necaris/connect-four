// Init reqs
/* jslint node: true */
'use strict';

var mongoose = require('mongoose');

// Init the module
module.exports = function() {

  var dataCheck,   // check data - function
      playerCheck, // check player - function
      gameSchema;

  // Checks whether data has error or not
  dataCheck = function(data) {

    if(typeof data === 'undefined' || !(data instanceof Array))
      return 'invalid data';

    if(data.length !== 7)
      return 'invalid rows';

    for(var i = 0, len = data.length; i < len; i++) {
      if(!(data[i] instanceof Array) || data[i].length !== 6)
        return 'invalid columns';
    }

    if(playerCheck(data) === false)
      return 'invalid player turn';

    return;
  };

  // Checks current player
  playerCheck = function(data) {

    var diff    = 0,
        p1count = 0,
        p2count = 0;

    if(typeof data !== 'undefined' || data instanceof Array) {
      for(var i = 0, len = data.length; i < len; i++) {
        if(!(data[i] instanceof Array))
          return false;

        for(var j = 0, lenj = data[i].length; j < lenj; j++) {
          if(data[i][j]) {
            if(data[i][j] === 1) {
              p1count++;
            } else if(data[i][j] === 2) {
              p2count++;
            } else {
              return false;
            }
          }
        }
      }
      
      diff = p1count - p2count;
      if(diff === 0) {
        return 1;
      } else if(diff === 1) {
        return 2;
      }
    }

    return false;
  };

  // Schema
  // Validate feature is not enough flexible for this case so methods used
  gameSchema = mongoose.Schema({data: Array});

  // Schema methods
  gameSchema.method({
    'dataCheck': dataCheck,
    'playerCheck': playerCheck
  });

  // Return
  return mongoose.model('Game', gameSchema);
}();