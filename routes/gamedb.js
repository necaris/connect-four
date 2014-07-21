// Init reqs
/* jslint node: true */
'use strict';

var Game = require('../models/game');

// Init the module
module.exports = function() {

  var newGame, // route handler - function
      save,    // route handler - function
      load;    // route handler - function

  // Handler for new game route
  newGame = function(req, res) {

    var game = new Game({
          data: [
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null]
          ]
        });

    game.save(function(err) {
      if(err) {
        return res.json(500, {code: '500', msg: err.message});
      }

      res.json({id:game._id, data:game.data});
    });
  };

  // Handler for save game route
  save = function(req, res) {

    var id   = req.params.id,
        data = req.body;

    if(!id) {
      return res.json(400, {code: '400', msg: 'missing game id'});
    }

    Game.findOne({_id: id}, function(err, game) {
      if(err) {
        return res.json(500, {code: '500', msg: err.message});
      }

      if(!game) {
        return res.json(404, {code: '404', msg: 'game could not be found'});
      }

      var dataErr = game.dataCheck(data);
      if(dataErr) {
        return res.json(400, {code: '400', msg: 'invalid game data (' + dataErr + ')'});
      }
      
      game.data = data;
      game.save(function(err) {
        if(err) {
          return res.json(500, {code: '500', msg: err.message});
        }

        res.json({id: game._id, msg: 'saved'});
      });
    });
  };

  // Handler for load game route
  load = function(req, res) {

    var id = req.params.id;

    if(!id) {
      return res.json(400, {code: '400', msg: 'missing game id'});
    }

    Game.findOne({_id: id}, function(err, game) {
      if(err) {
        return res.json(500, {code: '500', msg: err.message});
      }

      if(!game) {
        return res.json(404, {code: '404', msg: 'game could not be found'});
      }

      var dataErr = game.dataCheck(game.data);
      if(dataErr) {
        return res.json(400, {code: '400', msg: 'invalid game data (' + dataErr + ')'});
      }
      var currentPlayer = game.playerCheck(game.data) || 1;

      res.json({id: game._id, currentPlayer: currentPlayer, data: game.data});
    });
  };

  // Return
  return {
    newGame: newGame,
    save: save,
    load: load
  };
}();