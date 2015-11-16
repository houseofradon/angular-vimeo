/*!
 * angular-vimeo
 * Philip Knape <philip.knape@gmail.com>
 * 
 * Version:  - 2015-11-13T10:50:39.991Z
 * License: ISC
 */


'use strict';

angular
  .module('ngVimeo', [])
  .config(['$sce', function($sce) {
    $sce.getTrustedResourceUrl('http://player.vimeo.com/video/*');
  }])
  .factory('VimeoService', function ($http) {
    var endpoint = 'https://www.vimeo.com/api/oembed.json';
    return {
      oEmbed: function (params) {
        return $http.jsonp(endpoint, {params: params}).then(function(res) {
          return res.data;
        });
      }
    };
  })
  .constant('ngVimeoConfig', {
    methods: {},
    events: {}
  })
  .directive('vimeo', ['ngVimeoConfig', '$window', '$timeout', function(ngVimeoConfig, $window, $timeout) {

    var vimeoEvents = [
      'ready',
      'loadProgress',
      'playProgress',
      'play',
      'pause',
      'finish',
      'seek'
    ];

    var vimeoMethods = [
      'play', //play():void
      'pause', //pause():void
      'paused', //paused():Boolean
      'seekTo', //seekTo(seconds:Number):void
      'unload', //unload():void
      'getCurrentTime', //getCurrentTime():number
      'getDuration', //getDuration():number
      'getVideoEmbedCode', //getVideoEmbedCode():string
      'getVideoHeight', //getVideoHeight():Number
      'getVideoWidth', //getVideoWidth():Number
      'getVideoUrl', //getVideoUrl():String
      'getColor', //getColor():String
      'setColor', //setColor(color:String):void
      'setLoop', //setLoop(loop:Boolean):void
      'getVolume', //getVolume():Number
      'setVolume', //setVolume(volume:Number):void
      'addEventListener' //addEventListener(event:String, listener:String):void
    ];

    return {
      restrict: 'AE',
      scope: {
        settings: '',
        id: '@',
        url: '@',
        type: '@',
        width: '@',
        height: '@',
        options: '@'
      },
      link: function(scope, element, attrs) {

        var iframe = '<iframe id="player"></iframe>';
        var options;

        function initOptions() {
         options = angular.extend(angular.copy(ngVimeoConfig), {
            responsive: scope.responsive || true,
            id: scope.id,
            url: scope.url,
            type: scope.type || 'js',
            width: scope.width,
            height: scope.height,
            options: scope.options,
          }, scope.settings);
        }

        function destroy() {

        }

        function init() {

          initOptions();
          var vimeoElement = angular.element(element)[0];


          $timeout(function() {
            //add the video to the iframe;

          }, 0);

          if (options.resize) {
            $window.on('resize', function() {
              console.log('resize');
            });
          }

          // attach the events
          if (typeof options.event.loadProgress === 'function') {
            vimeoElement.addEventListener('loadProgress', function(event) {
              options.event.loadProgress(event);
            });
          }

          if (typeof options.event.playProgress === 'function') {
            vimeoElement.addEventListener('playProgress', function(event) {
              options.event.playProgress(event);
            });
          }

          if (typeof options.event.play !== 'undefined') {
            vimeoElement.addEventListener('play', function(event) {
              options.event.play(event);
            });
          }

          if (typeof options.event.pause !== 'undefined') {
            vimeoElement.addEventListener('pause', function(event) {
              options.event.pause(event);
            });
          }
        }

        function destroyAndInit() {
          destroy();
          init();
        }

        function methods() {

        }

        element.one('$destroy', function() {
          return destroy();
        });

        scope.$watch('settings', function(newVal) {
           if (newVal !== null && newVal !== undefined) {
            return destroyAndInit();
           }
        }, true);

      }
    };
  }]);
