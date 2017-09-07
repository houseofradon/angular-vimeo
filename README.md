angular-vimeo
============

<p align="center">
  <img src="./example/logo.png" width="200px" />
</p>


Please visit: [http://houseofradon.github.io/angular-vimeo/](http://houseofradon.github.io/angular-vimeo/ "ngVimeo")

Installation
-----

- Using [bower](http://bower.io/) to install it.

`bower install angular-vimeo-player`

- Add `angular` and `angular-vimeo` to your code.

```html
    <script src="../bower_components/angular/angular.js"></script>
    <script src="../bower_components/angular-sanitize/angular-sanitize.js"></script>
    <script src="../bower_components/angular-vimeo/dist/angular-vimeo.min.js"></script>
```

- Add the sortable module as a dependency to your application module: `ngVimeo`

```js
var myAppModule = angular.module('MyApp', ['ngVimeo'])
```

Usage
-----

### Prerequisited HTML

This directive allows you to use the angular-vimeo plugin as
an angular directive. It can be specified in your HTML
as either a `<div>` attribute or a `<vimeo>` element.

```html
    <vimeo settings="vimeoConfig"></vimeo>
```

### Attributes, Methods and Events ###

`settings`: required `Object` containing any of the vimeos options. Consult [here](https://developer.vimeo.com/player/js-api).
 - `method` optional containing vimeo method. discussed [below](#method) in detail
 - `event` optional containing vimeo event. discussed [below](#event) in detail

```javascript
$scope.vimeoConfig = {
    videoId: '20687326',
    method: {},
    event: {}
};
```
## Attributes ##

### `videoId`
* **required:** ```true```
* **value:** ```string```
* **default value:** ```null```

Video ID of the displayed video from Vimeo.

### `iframeId`
* **required:** ```false```
* **value:** ```string```
* **default value:** ```undefined```

Specify the id of the iFrame

### `width`
* **required:** ```false```
* **value:** ```number```
* **default value:** ```undefined```

Specify the width of the iFrame

### `height`
* **required:** ```false```
* **value:** ```number```
* **default value:** ```undefined```

Specify the height of the iFrame

### `responsive`
* **required:** ```false```
* **value:** ```boolean``` or ```string```
* **default value:** ```true```

Specify if the player should be responsive by default, fallbacks to standard 16:9 if set to true. Pass a procentage string to specify specfic dimention.

### `playerId`
* **required:** ```false```
* **value:** ```string```
* **default value:** ```undefined```

A unique name where the video can be identified. Use this if you are using more then one vimeo player on the page and want to use methods or events.

## Method ##
1. All the functions in the plugin are exposed through a control
attribute.
2. To utilize this architecture, and have two-way data-binding,
define an empty control handle on scope:
```js
    $scope.vimeoConfig = {
        method: {}
    }
```
3. Pass it as the value to control attribute. Now, you can call any plugin methods
as shown in the example.

```html
<button ng-click="vimeoConfig.method.slideTo(2)">slideTo(2)</button>
<button ng-click="vimeoConfig.method.prev()">prev()</button>
<button ng-click="vimeoConfig.method.next()">next()</button>
<button ng-click='vimeoConfig.method.reset()'>reset()</button>
<button ng-click='vimeoConfig.method.destroy()'>detroy()</button>
```

## Event ##

All the events for vimeo are exposed through event object. For full list of available events see the vimeo javascript documentation.

Todo
----
- Tests
- More documentation
- More examples

Credits
-------
* PhilipKnape ([@philipknape](https://twitter.com/philipknape))

Lisence
-------
This project is under the MIT license.
