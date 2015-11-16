'use strict';

angular
  .module('vimeoApp', ['ngVimeo', 'ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'VimeoController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .controller('VimeoController', function($scope, $timeout) {

    $scope.vimeoSettings = {
      haltInit: true,
      src: '76979871',
      method: {},
      event: {
        play: function() {
          console.log('play');
          console.log(arguments);
        },
        pause: function() {
          console.log('pause')
          console.log(arguments);
        },
        finish: function() {
          console.log('done');
          console.log(arguments);
        },

      }
    }

    $scope.play = function() {
      console.log($scope.vimeoSettings);
      console.log('click');
      $scope.vimeoSettings.method.play();
    }

  });
