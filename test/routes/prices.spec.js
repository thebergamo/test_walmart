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

describe('Routes /price', () => {
  describe('GET /prices', () => {
    beforeEach((done) => {
      db.Price.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/price',
          payload: {}
        };

        for (let i = 0; i < 10; i++) {
          options.payload.origin = '011' + i;
          options.payload.destinations = [{destination: '016', cost: 1.9}];

          server.inject(options, (response) => {});
        }
        done();
      });
    });

    it('returns 200 HTTP status code', (done) => {
      db.Plan.remove(() => {
        let options = {method: 'GET', url: '/prices'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });
    });

    it('returns an empty array when plans is empty', (done) => {
      db.Plan.remove(() => {
        let options = {method: 'GET', url: '/prices'};
        server.inject(options, (response) => {
          expect(response).to.have.property('result');
          expect(response.result).to.have.length.least(0);
          done();
        });
      });
    });

    it('return 10 plans at a time', (done) => {
      let options = {method: 'GET', url: '/prices'};
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.length.least(10);
        for (let i = 0; i < 10; i++) {
          let destination = response.result[i];
          expect(destination).to.have.property('origin');
          expect(destination).to.have.property('destinations');
          expect(destination.destinations).to.be.an.Array;
          expect(destination.destinations.length).to.have.least(1);
          expect(destination.destinations[0]).to.have.property('destination', '016');
          expect(destination.destinations[0]).to.have.property('cost', 1.9);
        }
        done();
      });
    });
  });

  describe('GET /price/{id}', () => {
    let price;
    before((done) => {
      db.Plan.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/price',
          payload: {
            origin: '011',
            destinations: [{
              destination: '016',
              cost: 1.9
            }]
          }
        };

        server.inject(options, (response) => {
          price = response.result;
          done();
        });
      });
    });

    it('returns 200 HTTP status code', (done) => {
      let options = {method: 'GET', url: '/price/' + price._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        done();
      });
    });

    it('returns 1 plan at a time', (done) => {
      let options = {method: 'GET', url: '/price/' + price._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('origin', '011');
        expect(response.result).to.have.property('destinations');
        expect(response.result.destinations).to.be.an.Array;
        expect(response.result.destinations.length).to.have.least(1);
        expect(response.result.destinations[0]).to.have.property('destination', '016');
        expect(response.result.destinations[0]).to.have.property('cost', 1.9);
        done();
      });
    });

    it('returns 400 HTTP status code when the specified id is invalid', (done) => {
      let options = {method: 'GET', url: '/price/12'};
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
      let options = {method: 'GET', url: '/price/561fd08d9607e21a7d39819d'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 404);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 404);
        expect(response.result).to.have.property('error', 'Not Found');
        done();
      });
    });
  });

  describe('POST /price', () => {
    it('returns 400 HTTP status code  when no body is sended', (done) => {
      let options = {method: 'POST', url: '/price'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', '"value" must be an object');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `origin` is send', (done) => {
      let options = {method: 'POST', url: '/price', payload: {}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `origin` is empty', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `origin` isn\'t a string', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `origin` haven\'t more than 30 chars', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" length must be less than or equal to 30 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `destinations` is send', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `destinations` is empty', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011', destinations: []}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" must contain at least 1 items]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `destinations.destination` is send', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011', destinations: [{}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "destination" fails because ["destination" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `destinations.destination` isn\'t a string', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011', destinations: [{destination: 1}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "destination" fails because ["destination" must be a string]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `destinations.destination` haven\'t more than 30 chars', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011', destinations: [{destinations: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "destination" fails because ["destination" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `destinations.cost` is send', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011', destinations: [{destination: '016'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "cost" fails because ["cost" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `destinations.cost` isn\'t an integer', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011', destinations: [{destination: '016', cost: 'A'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "cost" fails because ["cost" must be a number]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `destinations.cost` isn\'t positive', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011', destinations: [{destination: '016', cost: -1}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "cost" fails because ["cost" must be a positive number]]]');
        done();
      });
    });

    it('returns 202 HTTP status code when all data is correct', (done) => {
      let options = {method: 'POST', url: '/price', payload: {origin: '011', destinations: [{destination: '016', cost: 1.9}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 202);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('_id');
        expect(response.result).to.have.property('origin', '011');
        expect(response.result).to.have.property('destinations');
        expect(response.result.destinations).to.be.an.Array;
        expect(response.result.destinations.length).to.have.least(1);
        expect(response.result.destinations[0]).to.have.property('destination', '016');
        expect(response.result.destinations[0]).to.have.property('cost', 1.9);
        done();
      });
    });
  });

  describe('PUT /price/{id}', () => {
    let price;
    before((done) => {
      db.Price.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/price',
          payload: {
            origin: '011',
            destinations: [{
              destination: '016',
              cost: 1.9
            }]
          }
        };

        server.inject(options, (response) => {
          price = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      let options = {method: 'PUT', url: '/price/', payload: {}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "id" fails because ["id" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `origin` is empty', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `origin` isn\'t a string', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `origin` haven\'t more than 30 chars', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "origin" fails because ["origin" length must be less than or equal to 30 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `destinations` is empty', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: []}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" must contain at least 1 items]');
        done();
      });
    });
    it('returns 400 HTTP status code  when no `destinations.destination` is send', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: [{}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "destination" fails because ["destination" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `destinations.destination` isn\'t an string', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: [{destination: 0}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "destination" fails because ["destination" must be a string]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `destinations.destination` is empty', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: [{destination: ''}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "destination" fails because ["destination" is not allowed to be empty]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `destinations.destination` haven\'t more than 30 chars', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: [{destination: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "destination" fails because ["destination" length must be less than or equal to 30 characters long]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `destinations.cost` is send', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: [{destination: '016'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "cost" fails because ["cost" is required]]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `destinations.cost` isn\'t an integer', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: [{destination: '016', cost: 'A'}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "cost" fails because ["cost" must be a number]]]');
        done();
      });
    });

    it('return 400 HTTP status code when `destinations.cost` isn\'t positive', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: [{destination: '016', cost: -1}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destinations" fails because ["destinations" at position 0 fails because [child "cost" fails because ["cost" must be a positive number]]]');
        done();
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      let options = {method: 'PUT', url: '/price/' + price._id, payload: {origin: '011', destinations: [{destination: '016', cost: 2.9}]}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('_id');
        expect(response.result._id).to.be.eql(price._id);
        expect(response.result).to.have.property('origin', '011');
        expect(response.result).to.have.property('destinations');
        expect(response.result.destinations).to.be.an.Array;
        expect(response.result.destinations.length).to.have.least(1);
        expect(response.result.destinations[0]).to.have.property('destination', '016');
        expect(response.result.destinations[0]).to.have.property('cost', 2.9);
        done();
      });
    });
  });

  describe('DELETE /price/{id}', () => {
    let price;
    before((done) => {
      db.Price.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/price',
          payload: {
            origin: '011',
            destinations: [{
              destination: '016', cost: 1.9
            }]
          }
        };

        server.inject(options, (response) => {
          price = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      let options = {method: 'DELETE', url: '/price/'};
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
      let options = {method: 'DELETE', url: '/price/' + price._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.be.empty;
        done();
      });
    });
  });
});
