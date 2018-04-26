/*!
 * angular-vimeo-player
 * Philip Knape <philip.knape@gmail.com>
 * 
 * License: MIT
 */


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
    .directive('vimeo', [
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

      var params = [
        'autopause',
        'autoplay',
        'badge',
        'byline',
        'color',
        'loop',
        'portrait',
        'title'
      ]

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
        restrict: 'EA',
        replace: true,
        template: '<div></div>',
        scope: {
          settings: '=',
          iframeId: '@',
          videoId: '@',
          width: '@',
          height: '@',
          haltinit: '@',
          responsive: '@',
          playerId: '@',
        },
        link: function(scope, element, attrs) {

          var vimeoElement = angular.element(element)[0];
          angular.element(element).css('display', 'none');

          var vimeoVideo, options;
          var playerOrigin = '*';

          function initOptions() {
           options = angular.extend(angular.copy(ngVimeoConfig), {
              responsive: scope.responsive || true,
              videoId: scope.videoId,
              iframeId: scope.iframeId || 'vimeoPlayer',
              haltInit: scope.haltinit,
              width: scope.width,
              height: scope.height,
              playerId: scope.playerId || 'angular-vimeo',
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

          function buildParams(values, opt, joiner, group) {
            var g = group ? '"' : '';
            return values.filter(function(val) {
              return opt[val];
            }).map(function(val) {
              return val + '=' + g + opt[val] + g;
            }).join(joiner);
          }

          function buildPlayer(opt, p) {
            var src = 'src="https://player.vimeo.com/video/' + opt.videoId;
            var params = buildParams(p, opt, '&', false);

            return src + '?' + params + (params ? '&' : '') + 'api=1&player_id=' + opt.playerId + '" ';
          }

          function buildIframe(opt, iframeStyle, wrapperStyle) {
            var src = buildPlayer(opt, params);
            var iframeOptions = ['id', 'width', 'height', 'frameborder'];

            var vimeoSettings = buildParams(iframeOptions, opt, ' ', true);
            return  '<div ' + wrapperStyle + '><iframe ' + iframeStyle + src + vimeoSettings + '></iframe></div>';
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
            setMethods();
            vimeoVideo = null;
          }

          function init(manualInit) {

            initOptions();
            options.method.setup = initFromMethod;
            if (options.haltInit && !manualInit) {
              return;
            }

            if (!options.videoId) {
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

            if (typeof options.event[data.event] === 'function' &&
                data.player_id === options.playerId) {
                  return options.event[data.event].apply(null, Object.keys(data).map(function(key) {
                return data[key];
              }));
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
            if (!methods) {
              return;
            }

            // Method
            vimeoMethodList.forEach(function (value) {
              scope.internalControl[value] = function() {
                // Better way of unbinding the functions?
                if (!scope.internalControl[value]) {
                  return
                }
                var args;
                args = Array.prototype.slice.call(arguments);
                args.unshift(value);
                post.apply(null, args);

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
