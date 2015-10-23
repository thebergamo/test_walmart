'use strict';

// load env variables
require('dotenv').load();

// load deps
let Promise = require('bluebird');

// load database
let db = require('../helpers/database');

db['database'].on('connected', doFixtures);

function doFixtures () {
  let Price = Promise.promisifyAll(db.Price);
  let Plan = Promise.promisifyAll(db.Plan);

  Promise
    .props({
      plans: Plan.createAsync(getPlans()),
      prices: Price.createAsync(getPrices())
    })
    .then((result) => {
      console.log('Imported');
      process.exit(0);
    })
    .catch((err) => {
      throw err;
    });
}

function getPlans () {
  return [
    {
      name: 'FaleMais 30',
      pack: {
        cost: 30,
        extra: 10,
        minutes: 30
      }
    },
    {
      name: 'FaleMais 60',
      pack: {
        cost: 60,
        extra: 10,
        minutes: 60
      }
    },
    {
      name: 'FaleMais 120',
      pack: {
        cost: 120,
        extra: 10,
        minutes: 120
      }
    }
  ];
}

function getPrices () {
  return [
    {
      origin: '011',
      destinations: [
        {
          cost: 1.9,
          destination: '016'
        },
        {
          cost: 1.7,
          destination: '017'
        },
        {
          cost: 0.9,
          destination: '018'
        }
      ]
    },
    {
      origin: '016',
      destinations: [
        {
          destination: '011',
          cost: 2.9
        }
      ]
    },
    {
      origin: '017',
      destinations: [
        {
          destination: '011',
          cost: 2.7
        }
      ]
    },
    {
      origin: '018',
      destinations: [
        {
          destination: '011',
          cost: 1.9
        }
      ]
    }
  ];
}
