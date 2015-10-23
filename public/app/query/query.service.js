/* global angular */
(function () {
  'use strict';

  angular
    .module('app.query.service', [])
    .factory('QueryService', QueryService);

  function QueryService ($http, $q, API) {
    return {
      get: get,
      query: query
    };

    function query (options) {
      var defer = $q.defer();
      var url = '/plan/' + options.plan + '/query?';
      delete options['plan'];
      url = url + queryParams(options);

      $http.get(API.URL + url).success((result) => {
        defer.resolve(result);
      }).error((error) => {
        defer.reject(error);
      });

      return defer.promise;
    }

    function get (endpoint) {
      var defer = $q.defer();

      $http.get(API.URL + '/' + endpoint).success((result) => {
        defer.resolve(result);
      }).error((error) => {
        defer.reject(error);
      });

      return defer.promise;
    }
  }

  function queryParams (obj) {
    var array = [];

    for (var key in obj) {
      array.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }

    return array.join('&');
  }
})();

