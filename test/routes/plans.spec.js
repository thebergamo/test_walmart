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

describe('Routes /plan', () => {
  before((done) => {
    db['database'].on('connected', () => {
      done();
    });
  });

  describe('GET /plans', () => {
    beforeEach((done) => {
      db.Plan.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/plan',
          payload: {}
        };

        for (let i = 0; i < 10; i++) {
          options.payload.name = 'plan' + i;
          options.payload.pack = {minutes: 30, extra: 10, cost: 30};

          server.inject(options, (response) => {});
        }
        done();
      });
    });

    it('returns 200 HTTP status code', (done) => {
      db.Plan.remove(() => {
        let options = {method: 'GET', url: '/plans'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });
    });

    it('returns an empty array when plans is empty', (done) => {
      db.Plan.remove(() => {
        let options = {method: 'GET', url: '/plans'};
        server.inject(options, (response) => {
          expect(response).to.have.property('result');
          expect(response.result).to.have.length.least(0);
          done();
        });
      });
    });

    it('return 10 plans at a time', (done) => {
      let options = {method: 'GET', url: '/plans'};
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.length.least(10);
        for (let i = 0; i < 10; i++) {
          let plan = response.result[i];
          expect(plan).to.have.property('name', 'plan' + i);
          expect(plan).to.have.property('pack');
          expect(plan.pack).to.have.property('minutes', 30);
          expect(plan.pack).to.have.property('extra', 10);
          expect(plan.pack).to.have.property('cost', 30);
        }
        done();
      });
    });
  });

  describe('GET /plan/{id}', () => {
    let plan;
    before((done) => {
      db.Plan.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/plan',
          payload: {
            name: 'FaleMais 30',
            pack: {
              minutes: 30,
              extra: 10,
              cost: 30
            }
          }
        };

        server.inject(options, (response) => {
          plan = response.result;
          done();
        });
      });
    });

    it('returns 200 HTTP status code', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        done();
      });
    });

    it('returns 1 plan at a time', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('name', 'FaleMais 30');
        expect(response.result).to.have.property('pack');
        expect(response.result.pack).to.have.property('minutes', 30);
        expect(response.result.pack).to.have.property('extra', 10);
        expect(response.result.pack).to.have.property('cost', 30);
        done();
      });
    });

    it('returns 400 HTTP status code when the specified id is invalid', (done) => {
      let options = {method: 'GET', url: '/plan/12'};
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
      let options = {method: 'GET', url: '/plan/561fd08d9607e21a7d39819d'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 404);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 404);
        expect(response.result).to.have.property('error', 'Not Found');
        done();
      });
    });
  });

  describe('POST /plan', () => {
    it('returns 400 HTTP status code  when no body is sended', (done) => {
      let options = {method: 'POST', url: '/plan'};
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
      let options = {method: 'POST', url: '/plan', payload: {}};
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
      let options = {method: 'POST', url: '/plan', payload: {name: ''}};
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
      let options = {method: 'POST', url: '/plan', payload: {name: 0}};
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
      let options = {method: 'POST', url: '/plan', payload: {name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" length must be less than or equal to 30 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `pack` is send', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais30'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because ["pack" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `pack.minutes` is send', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "minutes" fails because ["minutes" is required]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `pack.minutes` isn\'t an integer', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: '30A'}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "minutes" fails because ["minutes" must be a number]]');
        done();
      });
    });

    it('return 400 HTTP status code when `pack.minutes` isn\'t positive', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: -1}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "minutes" fails because ["minutes" must be a positive number]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `pack.extra` is send', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: 30}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "extra" fails because ["extra" is required]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `pack.extra` isn\'t an integer', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: '10s'}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "extra" fails because ["extra" must be a number]]');
        done();
      });
    });

    it('return 400 HTTP status code when `pack.extra` isn\'t positive', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: -1}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "extra" fails because ["extra" must be a positive number]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `pack.cost` is send', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: 10}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "cost" fails because ["cost" is required]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `pack.cost` isn\'t an integer', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: 10, cost: 'A'}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "cost" fails because ["cost" must be a number]]');
        done();
      });
    });

    it('return 400 HTTP status code when `pack.cost` isn\'t positive', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: 10, cost: -1}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "cost" fails because ["cost" must be a positive number]]');
        done();
      });
    });

    it('returns 202 HTTP status code when all data is correct', (done) => {
      let options = {method: 'POST', url: '/plan', payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: 10, cost: 30}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 202);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('_id');
        expect(response.result).to.have.property('name', 'FaleMais 30');
        expect(response.result).to.have.property('pack');
        expect(response.result.pack).to.have.property('minutes', 30);
        expect(response.result.pack).to.have.property('extra', 10);
        expect(response.result.pack).to.have.property('cost', 30);
        done();
      });
    });
  });

  describe('PUT /plan/{id}', () => {
    let plan;
    before((done) => {
      db.Plan.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/plan',
          payload: {
            name: 'FaleMais 30',
            pack: {
              minutes: 30,
              extra: 10,
              cost: 30
            }
          }
        };

        server.inject(options, (response) => {
          plan = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      let options = {method: 'PUT', url: '/plan/', payload: {}};
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
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: ''}};
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
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 0}};
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
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" length must be less than or equal to 30 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `pack.minutes` is send', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "minutes" fails because ["minutes" is required]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `pack.minutes` isn\'t an integer', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {minutes: '30A'}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "minutes" fails because ["minutes" must be a number]]');
        done();
      });
    });

    it('return 400 HTTP status code when `pack.minutes` isn\'t positive', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {minutes: -1}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "minutes" fails because ["minutes" must be a positive number]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `pack.extra` is send', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {minutes: 30}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "extra" fails because ["extra" is required]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `pack.extra` isn\'t an integer', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: '10s'}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "extra" fails because ["extra" must be a number]]');
        done();
      });
    });

    it('return 400 HTTP status code when `pack.extra` isn\'t positive', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: -1}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "extra" fails because ["extra" must be a positive number]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `pack.cost` is send', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: 10}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "cost" fails because ["cost" is required]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `pack.cost` isn\'t an integer', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: 10, cost: 'A'}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "cost" fails because ["cost" must be a number]]');
        done();
      });
    });

    it('return 400 HTTP status code when `pack.cost` isn\'t positive', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 30', pack: {minutes: 30, extra: 10, cost: -1}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "pack" fails because [child "cost" fails because ["cost" must be a positive number]]');
        done();
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      let options = {method: 'PUT', url: '/plan/' + plan._id, payload: {name: 'FaleMais 35', pack: {minutes: 35, extra: 15, cost: 35}}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('_id');
        expect(response.result._id).to.be.eql(plan._id);
        expect(response.result).to.have.property('name', 'FaleMais 35');
        expect(response.result).to.have.property('pack');
        expect(response.result.pack).to.have.property('minutes', 35);
        expect(response.result.pack).to.have.property('extra', 15);
        expect(response.result.pack).to.have.property('cost', 35);
        done();
      });
    });
  });

  describe('GET /plan/{id}/query/', () => {
    let plan;
    before((done) => {
      db.Price.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/price',
          payload: {
            origin: '011',
            destinations: [
              {
                destination: '016',
                cost: 1.90
              },
              {
                destination: '017',
                cost: 1.70
              },
              {
                destination: '018',
                cost: 0.90
              }
            ]
          }
        };

        return new Promise((resolve) => {
          server.inject(options, () => {
            resolve();
          });
        });
      })
      .then(db.Plan.removeAsync({}))
      .then(() => {
        let options = {
          method: 'POST',
          url: '/plan',
          payload: {
            name: 'FaleMais 30',
            pack: {
              minutes: 30, extra: 10, cost: 30
            }
          }
        };

        server.inject(options, (response) => {
          plan = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when query param no `origin` is send', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query'};
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
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin='};
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
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=011'};
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
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=011&destination='};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "destination" fails because ["destination" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param no `minutes` is send', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=011&destination=016'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "minutes" fails because ["minutes" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param `minutes` is empty', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=011&destination=016&minutes='};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "minutes" fails because ["minutes" must be a number]');
        done();
      });
    });

    it('returns 400 HTTP status code when query param `minutes` isn`t a positive value', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=011&destination=016&minutes=-1'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "minutes" fails because ["minutes" must be a positive number]');
        done();
      });
    });

    it('returns 400 HTTP status code when origin not in range', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=012&destination=016&minutes=10'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 404);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 404);
        expect(response.result).to.have.property('error', 'Not Found');
        expect(response.result).to.have.property('message', 'Origin is invalid. Please try again with new data');
        done();
      });
    });

    it('returns 400 HTTP status code when origin not in range', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=011&destination=010&minutes=10'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 404);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 404);
        expect(response.result).to.have.property('error', 'Not Found');
        expect(response.result).to.have.property('message', 'Destination is invalid for this Origin. Please try again with new data');
        done();
      });
    });

    it('returns 200 HTTP status code when params are corrects and 20 minutes is send to FaleMais 30', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=011&destination=016&minutes=20'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('origin', '011');
        expect(response.result).to.have.property('destination', '016');
        expect(response.result).to.have.property('minutes', 20);
        expect(response.result).to.have.property('plan', 'FaleMais 30');
        expect(response.result).to.have.property('planCost', 0);
        expect(response.result).to.have.property('noPlanCost', 38);
        done();
      });
    });

    it('returns 200 HTTP status code when params are corrects and 80 minutes is send to FaleMais 30', (done) => {
      let options = {method: 'GET', url: '/plan/' + plan._id + '/query?origin=011&destination=016&minutes=80'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('origin', '011');
        expect(response.result).to.have.property('destination', '016');
        expect(response.result).to.have.property('minutes', 80);
        expect(response.result).to.have.property('plan', 'FaleMais 30');
        expect(response.result).to.have.property('planCost', 104.5);
        expect(response.result).to.have.property('noPlanCost', 152);
        done();
      });
    });
  });
  describe('DELETE /plan/{id}', () => {
    let plan;
    before((done) => {
      db.Plan.removeAsync({})
      .then(() => {
        let options = {
          method: 'POST',
          url: '/plan',
          payload: {
            name: 'FaleMais 30',
            pack: {
              minutes: 30, extra: 10, cost: 30
            }
          }
        };

        server.inject(options, (response) => {
          plan = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      let options = {method: 'DELETE', url: '/plan/'};
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
      let options = {method: 'DELETE', url: '/plan/' + plan._id};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.be.empty;
        done();
      });
    });
  });
});
