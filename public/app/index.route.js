/* global angular */
(function () {
  'use strict';

  angular
    .module('app')
    .config(routeConfig);

  function routeConfig ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('query', {
      url: '/',
      templateUrl: 'app/query/query.html',
      controller: 'QueryController',
      controllerAs: 'query'
    });

    $urlRouterProvider.otherwise('/');
  }
})();
