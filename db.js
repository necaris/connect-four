// Init reqs
/* jslint node: true */
'use strict';

var mongoose = require('mongoose'),
    game     = require('./routes/gamedb');

// Init the module
module.exports = function(app, callback) {

  // Check the callback
  if(typeof callback !== 'function')
    callback = function callback(err) { return err; };

  // Check the app
  if(!app || typeof app.use !== 'function')
    return callback(new Error('Invalid app instance!'));

  // Init the app
  app.set('dburi', process.env.NODE_DBURI || 'mongodb://localhost/test');

  app.get('/new', game.newGame);
  app.post('/:id', game.save);
  app.get('/:id', game.load);

  mongoose.connect(app.get('dburi'), function(err) {
    if(err) return callback('Database connection error: ' + err);

    app.set('db', mongoose.connection);

    app.get('db').on('error', function(err) {
      if(!app.get('optQuiet'))
        console.log('Database connection error: ' + err);
    });

    app.get('db').once('open', function() {
      if(!app.get('optQuiet'))
        console.log('Database connection is ready (' + app.get('dburi') + ')');

      return callback();
    });
  });
};