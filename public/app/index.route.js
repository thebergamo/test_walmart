(function () {
  'use strict';

  angular
    .module('app')
    .config(routeConfig)

  function routeConfig ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('query', {
        url: '/',
        templateUrl: 'app/query/query.html',
        controller: 'QueryController',
        controllerAs: 'query'
      });
      // .state('login', {
      //   url: '/login',
      //   templateUrl: 'app/login/login.html',
      //   controller: 'LoginController',
      //   controllerAs: 'login'
      // })
      // .state('plan', {
      //   url: '/plan',
      //   templateUrl: 'app/plan/plan.html',
      //   controller: 'PlanController',
      //   controllerAs: 'plan'
      // })
      // .state('price', {
      //   url: '/price',
      //   templateUrl: 'app/price/price.html',
      //   controller: 'PriceController',
      //   controllerAs: 'price'
      // });

      $urlRouterProvider.otherwise('/');
  }
})();
