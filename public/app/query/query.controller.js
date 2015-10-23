/* global angular */
(function () {
  'use strict';

  angular
    .module('app.query', ['app.query.service'])
    .controller('QueryController', QueryController);

  function QueryController (QueryService) {
    var vm = this;
    vm.greeting = 'Bem vindo à scupTel';
    vm.plan = null;
    vm.plans = [];
    vm.location = null;
    vm.locations = [];
    vm.destination = null;
    vm.destinations = [];
    vm.minutes = null;
    vm.completedFields = false;

    vm.loadPlans = loadPlans;
    vm.loadLocations = loadLocations;
    vm.loadDestinations = loadDestinations;
    vm.doQuery = doQuery;
    vm.close = close;

    function loadPlans () {
      QueryService.get('plans').then((response) => {
        vm.plans = response;
      });
    }
    function loadLocations () {
      QueryService.get('prices').then((response) => {
        vm.locations = response;
        vm.destinations = [];
        vm.destination = null;
      });
    }
    function loadDestinations () {
      vm.destinations = vm.location.destinations;
    }
    function doQuery () {
      let options = {
        plan: vm.plan._id,
        origin: vm.location.origin,
        destination: vm.destination.destination,
        minutes: vm.minutes
      };
      QueryService.query(options)
        .then((response) => {
          vm.result = response;
        });
    }
    function close () {
      vm.result = undefined;
    }
  }
})();

