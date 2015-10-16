'use strict';

// load deps
let lab = exports.lab = require('lab').script();
let expect = require('chai').expect;

// prepare environment
let it = lab.it;
let describe = lab.describe;
let before = lab.before;
let beforeEach = lab.beforeEach;

// get the server
let server = require('../../helpers/server');
let db = server.database;

describe('Routes /map', () => {
  before((done) => {
    db['database'].on('connected', () => {
      done();
    });
  });

  describe('GET /maps', () => {
    beforeEach((done) => {
      db.Map.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/map',
          payload: {}
        };

        for (let i = 0; i < 10; i++) {
          options.payload.name = 'map' + i;
          options.payload.roads = [{origin: 'A', destination: 'B', cost: 10}];

          server.inject(options, (response) => {});
        }
        done();
      });
    });

    it('returns 200 HTTP status code', (done) => {
      db.Map.remove(() => {
        let options = {method: 'GET', url: '/maps'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });
    });

    it('returns an empty array when maps is empty', (done) => {
      db.Map.remove(() => {
        let options = {method: 'GET', url: '/maps'};
        server.inject(options, (response) => {
          expect(response).to.have.property('result');
          expect(response.result).to.have.length.least(0);
          done();
        });
      });
    });

    it('return 10 maps at a time', (done) => {
      let options = {method: 'GET', url: '/maps'};
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.length.least(10);
        for (let i = 0; i < 10; i++) {
          let map = response.result[i];
          expect(map).to.have.property('name', 'map' + i);
          expect(map).to.have.property('roads');
          expect(map.roads).to.have.length.least(1);
          expect(map.roads[0]).to.have.property('origin', 'A');
          expect(map.roads[0]).to.have.property('destination', 'B');
          expect(map.roads[0]).to.have.property('cost', 10);
        }
        done();
      });
    });
  });

  describe('GET /map/{id}', () => {
    let map;
    before((done) => {
      db.Map.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/map',
          payload: {
            name: 'Barretos',
            roads: [
              {
                origin: 'Barretos', destination: 'Colina', cost: 18
              },
              {
                origin: 'Barretos', destination: 'Jaborandi', cost: 31
              },
              {
                origin: 'Barretos', destination: 'Colombia', cost: 43
              },
              {
                origin: 'Barretos', destination: 'Olimpia', cost: 42
              },
              {
                origin: 'Bebedouro', destination: 'Viradouro', cost: 22
              },
              {
                origin: 'Colina', destination: 'Jaborandi', cost: 13
              },
              {
                origin: 'Colina', destination: 'Bebedouro', cost: 32
              },
              {
                origin: 'Jaborandi', destination: 'Terra Roxa', cost: 16
              },
              {
                origin: 'Terra Roxa', destination: 'Viradouro', cost: 10
              }
            ]
          }
        };

        server.inject(options, (response) => {
          map = response.result;
          done();
        });
      });
    });

    it('returns 200 HTTP status code', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        done();
      });
    });

    it('returns 1 map at a time', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('name', 'Barretos');
        expect(response.result).to.have.property('roads');
        expect(response.result.roads).to.have.length.least(9);
        for (let i = 0; i < 9; i++) {
          let road = response.result.roads[i];
          expect(road).to.have.property('origin');
          expect(road).to.have.property('destination');
          expect(road).to.have.property('cost');
        }
        done();
      });
    });

    it('returns 400 HTTP status code when the specified id is invalid', (done) => {
      let options = {method: 'GET', url: '/map/12'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "id" fails because ["id" with value "12" fails to match the _id pattern]');

        done();
      });
    });

    it('returns 404 HTTP status code when the specified id is not found', (done) => {
      let options = {method: 'GET', url: '/map/561fd08d9607e21a7d39819d'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 404);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 404);
        expect(response.result).to.have.property('error', 'Not Found');
        done();
      });
    });
  });

  describe('POST /map', () => {
    it('returns 400 HTTP status code  when no body is sended', (done) => {
      let options = {method: 'POST', url: '/map'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', '"value" must be an object');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `name` is send', (done) => {
      let options = {method: 'POST', url: '/map', payload: {}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` is empty', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` isn\'t a string', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `name` haven\'t more than 30 chars', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" length must be less than or equal to 30 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `roads` is send', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads` is empty', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: []}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" must contain at least 1 items]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `roads.origin` is send', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "origin" fails because ["origin" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.origin` is empty', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: ''}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "origin" fails because ["origin" is not allowed to be empty]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.origin` isn\'t a string', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 0}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "origin" fails because ["origin" must be a string]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `roads.origin` haven\'t more than 30 chars', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasaaaaaaaa'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "origin" fails because ["origin" length must be less than or equal to 30 characters long]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `roads.destination` is send', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'Jaborandi'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "destination" fails because ["destination" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.destination` is empty', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: ''}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "destination" fails because ["destination" is not allowed to be empty]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.destination` isn\'t a string', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 0}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "destination" fails because ["destination" must be a string]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `roads.destination` haven\'t more than 30 chars', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasaaaaaaaa'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "destination" fails because ["destination" length must be less than or equal to 30 characters long]]]');
        done();
      });
    });

    it('returns 400 HTTP status code when no `roads.cost` is send', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'Colina'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "cost" fails because ["cost" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.cost` isn\'t an integer', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'Colina', cost: ''}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "cost" fails because ["cost" must be a number]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `roads.cost` isn\'t positive', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'Colina', cost: -1}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "cost" fails because ["cost" must be a positive number]]]');
        done();
      });
    });

    it('returns 202 HTTP status code when all data is correct', (done) => {
      let options = {method: 'POST', url: '/map', payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'Colina', cost: 10}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 202);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('_id');
        expect(response.result).to.have.property('name', 'Barretos');
        expect(response.result).to.have.property('roads');
        expect(response.result.roads).to.have.length.least(1);
        expect(response.result.roads[0]).to.have.property('origin', 'Jaborandi');
        expect(response.result.roads[0]).to.have.property('destination', 'Colina');
        expect(response.result.roads[0]).to.have.property('cost', 10);
        done();
      });
    });
  });

  describe('PUT /map/{id}', () => {
    let map;
    before((done) => {
      db.Map.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/map',
          payload: {
            name: 'Barretos',
            roads: [
              {
                origin: 'Barretos', destination: 'Colina', cost: 18
              }
            ]
          }
        };

        server.inject(options, (response) => {
          map = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      let options = {method: 'PUT', url: '/map/', payload: {}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "id" fails because ["id" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` is empty', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` isn\'t a string', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `name` haven\'t more than 30 chars', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" length must be less than or equal to 30 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads` is empty', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: []}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" must contain at least 1 items]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `roads.origin` is send', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "origin" fails because ["origin" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.origin` is empty', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: ''}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "origin" fails because ["origin" is not allowed to be empty]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.origin` isn\'t a string', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 0}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "origin" fails because ["origin" must be a string]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `roads.origin` haven\'t more than 30 chars', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasaaaaaaaa'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "origin" fails because ["origin" length must be less than or equal to 30 characters long]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `roads.destination` is send', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 'Jaborandi'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "destination" fails because ["destination" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.destination` is empty', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: ''}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "destination" fails because ["destination" is not allowed to be empty]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.destination` isn\'t a string', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 0}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "destination" fails because ["destination" must be a string]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `roads.destination` haven\'t more than 30 chars', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasaaaaaaaa'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "destination" fails because ["destination" length must be less than or equal to 30 characters long]]]');
        done();
      });
    });

    it('returns 400 HTTP status code when no `roads.cost` is send', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'Colina'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "cost" fails because ["cost" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roads.cost` isn\'t an integer', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'Colina', cost: ''}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "cost" fails because ["cost" must be a number]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `roads.cost` isn\'t positive', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Barretos', roads: [{origin: 'Jaborandi', destination: 'Colina', cost: -1}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roads" fails because ["roads" at position 0 fails because [child "cost" fails because ["cost" must be a positive number]]]');
        done();
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      let options = {method: 'PUT', url: '/map/' + map._id, payload: {name: 'Bebedouro', roads: [{origin: 'Barretos', destination: 'Guaira', cost: 32}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('_id');
        expect(response.result._id).to.be.eql(map._id);
        expect(response.result).to.have.property('name', 'Bebedouro');
        expect(response.result).to.have.property('roads');
        expect(response.result.roads).to.have.length.least(1);
        expect(response.result.roads[0]).to.have.property('origin', 'Barretos');
        expect(response.result.roads[0]).to.have.property('destination', 'Guaira');
        expect(response.result.roads[0]).to.have.property('cost', 32);
        done();
      });
    });
  });

  describe('GET /map/{id}/route/', () => {
    let map;
    before((done) => {
      db.Map.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/map',
          payload: {
            name: 'Barretos',
            roads: [
              {
                origin: 'Barretos', destination: 'Colina', cost: 18
              },
              {
                origin: 'Barretos', destination: 'Jaborandi', cost: 31
              },
              {
                origin: 'Barretos', destination: 'Colombia', cost: 43
              },
              {
                origin: 'Barretos', destination: 'Olimpia', cost: 42
              },
              {
                origin: 'Bebedouro', destination: 'Viradouro', cost: 22
              },
              {
                origin: 'Colina', destination: 'Jaborandi', cost: 13
              },
              {
                origin: 'Colina', destination: 'Bebedouro', cost: 32
              },
              {
                origin: 'Jaborandi', destination: 'Terra Roxa', cost: 16
              },
              {
                origin: 'Terra Roxa', destination: 'Viradouro', cost: 10
              }
            ]
          }
        };

        server.inject(options, (response) => {
          map = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when query param no `origin` is send', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param `origin` is empty', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin='};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param no `destination` is send', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destination" fails because ["destination" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param `destination` is empty', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi&destination='};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destination" fails because ["destination" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param no `autonomy` is send', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi&destination=Barretos'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "autonomy" fails because ["autonomy" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param `autonomy` is empty', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi&destination=Barretos&autonomy='};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "autonomy" fails because ["autonomy" must be a number]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param `autonomy` isn`t a positive value', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi&destination=Barretos&autonomy=-1'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "autonomy" fails because ["autonomy" must be a positive number]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param no `gas` is send', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi&destination=Barretos&autonomy=10'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "gas" fails because ["gas" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param `gas` is empty', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi&destination=Barretos&autonomy=10&gas='};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "gas" fails because ["gas" must be a number]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param `gas` isn`t a positive value', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi&destination=Barretos&autonomy=10&gas=-1'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "gas" fails because ["gas" must be a positive number]');
        done();
      });
    });

    it('returns 400 HTTP status code when origin not in range', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Jaborandi&destination=Sao Paulo&autonomy=10&gas=2.5'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'Origin or Destination is invalid. Please try again with new data');
        done();
      });
    });

    it('returns 200 HTTP status code when params are correct and the best route is traced', (done) => {
      let options = {method: 'GET', url: '/map/' + map._id + '/route?origin=Barretos&destination=Viradouro&autonomy=10&gas=2.5'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('path');
        expect(response.result.path).to.have.length.least(4);
        expect(response.result.path).to.be.eql(['Barretos', 'Jaborandi', 'Terra Roxa', 'Viradouro']);
        expect(response.result).to.have.property('cost', 14.25);
        done();
      });
    });
  });
  describe('DELETE /map/{id}', () => {
    let map;
    before((done) => {
      db.Map.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/map',
          payload: {
            name: 'Barretos',
            roads: [
              {
                origin: 'Barretos', destination: 'Colina', cost: 18
              }
            ]
          }
        };

        server.inject(options, (response) => {
          map = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      let options = {method: 'DELETE', url: '/map/'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "id" fails because ["id" is required]');
        done();
      });
    });

    it('returns 200 HTTP status code when record is deleted', (done) => {
      let options = {method: 'DELETE', url: '/map/' + map._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.be.empty;
        done();
      });
    });
  });
});
