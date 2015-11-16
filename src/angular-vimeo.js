(function(window, angular) {
  'use strict';

  angular
    .module('ngVimeo', [])
    /*.config(['$sce', function($sce) {
      $sce.getTrustedResourceUrl('http://player.vimeo.com/video/*');
    }])*/
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
      method: {},
      event: {}
    })
    .directive('vimeo', ['ngVimeoConfig', '$window', '$timeout', '$compile', function(ngVimeoConfig, $window, $timeout, $compile) {

      var vimeoEventList = [
        'loadProgress',
        'playProgress',
        'play',
        'pause',
        'finish',
        'seek'
      ];

      var vimeoMethodList = [
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
        restrict: 'E',
        replace: true,
        template: '<div></div>',
        scope: {
          settings: '=',
          iframeId: '@',
          url: '@',
          type: '@',
          width: '@',
          height: '@',
          options: '@'
        },
        link: function(scope, element, attrs) {

          var iframe = '<iframe id="{{iframeId}}" src="https://player.vimeo.com/video/76979871"></iframe>';
          var vimeoVideo, options;
          var playerOrigin = '*';

          function initOptions() {
           options = angular.extend(angular.copy(ngVimeoConfig), {
              responsive: scope.responsive || true,
              iframeId: scope.id || 'vimeoPlayer',
              url: scope.url,
              type: scope.type || 'js',
              width: scope.width,
              height: scope.height,
              options: scope.options,
            }, scope.settings);
          }

          function buildIframe() {
            var iframeOptions = ['id', 'fullscreen'];
            var iframe = '<iframe id="{{ifrane.Id}}"></iframe>';
          }

          function destroy() {

          }

          function init() {

            initOptions();
            var vimeoElement = angular.element(element)[0];
            angular.element(element).css('display', 'block');

            $timeout(function() {
              //add the video to the iframe;
              element.html(iframe);
              vimeoVideo = $compile(element.contents())(scope);
            }, 0);

            if (options.resize) {
              $window.on('resize', function() {
                console.log('resize');
              });
            }

            $window.addEventListener('message', onMessageReceived, false);

          }

          function onMessageReceived(event) {
            // Handle messages from the vimeo player only
            if (!(/^https?:\/\/player.vimeo.com/).test(event.origin)) {
              return false;
            }

            if (playerOrigin === '*') {
              playerOrigin = event.origin;
            }

            var data = JSON.parse(event.data);

            if (data.event === 'ready') {
              attachDetachListeners(vimeoEventList, 'addEventListener');
            }

            if (typeof options.event[data.event] === 'function') {
              return options.event[data.event]();
            }
          }

          function destroyAndInit() {
            destroy();
            init();
          }

          function post(action, value) {
            var data = {
              method: action,
            };
            if (value) {
              data.value = value;
            }
            var message = JSON.stringify(data);
            vimeoVideo[0].contentWindow.postMessage(message, playerOrigin);
          }

          function attachDetachListeners(methods, type) {
            angular.forEach(methods, function(method, key) {
                post(type, method);
            });
          }

          function setMethods(methods) {

            scope.internalControl = methods || {};

            // Method
            vimeoMethodList.forEach(function (value) {
              scope.internalControl[value] = function() {;
                var args;
                args = Array.prototype.slice.call(arguments);
                args.unshift(value);
                post(value);
              };
            });

          }

          element.one('$destroy', function() {
            return destroy();
          });

          scope.$watch('settings', function(newVal) {
            if (newVal !== null && newVal !== undefined) {
              setMethods(newVal.method);
              return destroyAndInit();
            }
          }, true);

        }
      };
    }]);
})(window, window.angular);
