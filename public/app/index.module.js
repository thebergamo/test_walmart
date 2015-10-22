(function () {
  'use strict';

  angular
    .module('app', [
      'ui.router',
      'ui.filters',
      'ngMaterial',
      'ngMdIcons',
      'md.data.table',
      'app.query',
      // 'app.login',
      // 'app.plan',
      // 'app.price'
    ]);

    // extending currency
    angular.module('ui.filters', [])
    .filter('customCurrency', customCurrency);

    customCurrency.$inject = ['$filter'];

    function customCurrency ($filter) {
      return function(value, symbol) {
        var currency = $filter('currency')(value, symbol || 'R$') || "";
        currency = currency.split('.');
        currency[0] = currency[0].replace(/,/g, '.');
        return currency.join(',');
      }
    }

})();
