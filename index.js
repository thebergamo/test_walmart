'use strict';
// load deps
let server = require('./helpers/server');

server.start((err) => {
  if (err) { throw err; }

  console.log('info', 'Server running at: ' + server.info.uri);
});
