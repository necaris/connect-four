// Init reqs
/* jslint node: true */
/* global describe: false */
/* global it: false */
/* global before: false */
/* global after: false */
'use strict';

var spawn    = require('child_process').spawn,
    request  = require('request'),
    expect   = require('chai').expect,
    mongoose = require('mongoose'),
    Game     = require('../models/game');

// Tests

// Test for the game model
describe('Tests for game model', function() {

  var dbUri = process.env.NODE_DBURI || 'mongodb://localhost/test',
      game  = new Game({
        data: [
          [null, null, null, null, null, 1],
          [null, null, null, null, null, 2],
          [null, null, null, null, null, 1],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null]
        ]
      });

  before(function(done) {
    mongoose.connect(dbUri, function(err) {
      if(err) return done(err);
      
      done();
    });
  });

  // save game
  it('should create or save a game (Game.save)', function(done) {
    game.save(function(err) {
      if(err) return done(err);

      expect(game).to.have.property('_id').to.be.a('object');
      expect(game).to.have.property('data').to.be.a('array');
      expect(game.data).to.have.property('length').to.be.equal(7);

      done();
    });
  });

  // check data
  it('should check data (Game.dataCheck)', function(done) {
    var dataErr = game.dataCheck(game.data);
    if(dataErr) return done(dataErr);

    done();
  });

  // check player
  it('should check player (Game.playerCheck)', function(done) {
    expect(game.playerCheck(game.data)).to.be.equal(2);

    done();
  });
});

// Test for the app
describe('Tests for `app.js --mdb`', function() {

  var appCmd,
      baseUrl  = 'http://localhost:3000',
      reqHdrs  = {'Content-Type': 'application/json'},
      gameData = [
        [null, null, null, null, null, 1],
        [null, null, null, null, null, 2],
        [null, null, null, null, null, 1],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null]
      ],
      gameId;

  before(function(done) {
    appCmd = spawn('node', ['app.js', '--mdb', '--quiet'], {stdio: 'inherit', env: process.env});
    setTimeout(done, 2000);
  });

  // page info
  it('should get correct title (GET /)', function(done) {
    request(baseUrl, function (err, res, body) {
      if(err) return done(err);

      expect(res.statusCode).to.equal(200);
      expect(body).to.have.string('<title>Connect Four');

      done();
    });
  });

  // new game
  it('should create a new game (GET /new)', function(done) {
    request(baseUrl + '/new', function (err, res, body) {
      if(err) return done(err);

      expect(res.statusCode).to.equal(200);
      var resData = JSON.parse(body);
      expect(resData).to.have.property('id').to.be.a('string');
      expect(resData).to.have.property('data').to.be.a('array');
      expect(resData.data).to.have.property('length').to.be.equal(7);

      gameId = resData.id;

      done();
    });
  });

  // save game
  it('should save a game (POST /:id)', function(done) {
    request({method: 'POST', uri: baseUrl + '/' + gameId, headers: reqHdrs, body: JSON.stringify(gameData)}, function (err, res, body) {
      if(err) return done(err);

      expect(res.statusCode).to.equal(200);
      var resData = JSON.parse(body);
      expect(resData).to.have.property('id').to.be.equal(gameId);
      expect(resData).to.have.property('msg').to.be.equal('saved');

      done();
    });
  });

  // load game
  it('should load a game (GET /:id)', function(done) {
    request(baseUrl + '/' + gameId, function (err, res, body) {
      if(err) return done(err);

      expect(res.statusCode).to.equal(200);
      var resData = JSON.parse(body);
      expect(resData).to.have.property('id').to.be.equal(gameId);
      expect(resData).to.have.property('currentPlayer').to.be.equal(2);
      expect(resData).to.have.property('data').to.be.a('array');
      expect(resData.data).to.have.property('length').to.be.equal(7);
      expect(resData.data[0]).to.have.property(5).to.be.equal(1);
      expect(resData.data[1]).to.have.property(5).to.be.equal(2);
      expect(resData.data[2]).to.have.property(5).to.be.equal(1);

      done();
    });
  });

  after(function(done) {
    appCmd.kill();
    done();
  });
});