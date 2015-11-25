(function(window, angular) {
  'use strict';

  angular
    .module('ngVimeo', [
      'ngSanitize'
    ])
    .config(['$sceDelegateProvider', function($sceDelegateProvider) {
      $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'http://player.vimeo.com/video/*'
      ]);
    }])
    .constant('ngVimeoConfig', {
      method: {},
      event: {}
    })
    .constant('playerBaseURI', 'https://player.vimeo.com/video/')
    .constant('originExpression', /^https?:\/\/player.vimeo.com/)
    .directive('vimeoPlayer', [
      'ngVimeoConfig',
      '$window',
      '$timeout',
      '$compile',
    function(ngVimeoConfig, $window, $timeout, $compile) {

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

      var vimeoWrapperCss = {
        'position': 'relative',
        'padding-bottom': '56.25%',
        'height': 0
      };

      var iframeCss = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      };

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
          options: '@',
          responsive: '@'
        },
        link: function(scope, element, attrs) {


          var vimeoElement = angular.element(element)[0];
          angular.element(element).css('display', 'none');

          var vimeoVideo, options;
          var playerOrigin = '*';

          function initOptions() {
           options = angular.extend(angular.copy(ngVimeoConfig), {
              responsive: scope.responsive || true,
              id: scope.id || 'vimeoPlayer',
              src: scope.src,
              type: scope.type || 'js',
              width: scope.width,
              height: scope.height,
              options: scope.options,
            }, scope.settings);
          }

          function buildStyle(cssObject, responsive, isWrapper) {
            if (!responsive) {
              return '';
            }
            var css = Object.keys(cssObject).map(function(key) {

              var val = (typeof responsive === 'string' && key === 'padding-bottom') ?
                        responsive :
                        cssObject[key];

              return key + ':' + val + ';';
            }).join(' ');
            return ' style="' + css + '" ';
          }

          function buildIframe(opt, iframeStyle, wrapperStyle) {
            opt.src = 'https://player.vimeo.com/video/' + opt.src;
            var iframeOptions = ['id', 'src'];
            var vimeoSettings = iframeOptions.map(function(val, index) {
              return val + '="' + opt[val] + '"';
            }).join(' ');
            return  '<div ' + wrapperStyle + '><iframe ' + iframeStyle + vimeoSettings + '></iframe></div>';
          }

          function initFromMethod() {
            destroy();
            init(true);
          }

          function destroyAndInit() {
            destroy();
            init();
          }

          function destroy() {

            // we need to check if we have the vimeo element
            if (!vimeoVideo) {
              return;
            }

            attachDetachListeners(vimeoEventList, 'removeEventListener');
            $window.removeEventListener('message', onMessageReceived, false);
            vimeoElement.removeChild(vimeoVideo[0]);
            angular.element(element).css('display', 'none');
            vimeoVideo = null;
          }

          function init(manualInit) {

            initOptions();

            if (options.haltInit && !manualInit) {
              options.method.setup = initFromMethod;
              return;
            }

            if (!options.src) {
              console.warn('you need to supply a vimeo src');
              return;
            }

            options.method.destroy = destroy;
            angular.element(element).css('display', 'block');

            $timeout(function() {
              //add the video to the iframe;
              element.html(buildIframe(
                options,
                buildStyle(iframeCss, options.responsive, true),
                buildStyle(vimeoWrapperCss, options.responsive, false)
              ));
              vimeoVideo = $compile(element.contents())(scope);
            }, 0);


            if (typeof options.event.resize === 'function') {
              var debounce = false;
              if (debounce !== false) {
                $timeout.cancel(debounce);
              }
              debounce = $timeout(function() {
                return $window.on('resize', options.event.resize, 200);
              });
            }

            // Lets add all methods fro mVimeoMethodList
            setMethods(options.method);

            // Lets add the global eventlitsener
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
              return options.event[data.event](event);
            }
          }

          function post(action, value) {
            var data = {
              method: action,
            };
            if (value) {
              data.value = value;
            }
            var message = JSON.stringify(data);
            vimeoVideo.find('iframe')[0].contentWindow.postMessage(message, playerOrigin);
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
              scope.internalControl[value] = function() {

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

          scope.$watch('settings', function(settings) {
            if (settings !== null && settings !== undefined) {
              return destroyAndInit();
            }
          }, true);

        }
      };
    }]);
})(window, window.angular);
