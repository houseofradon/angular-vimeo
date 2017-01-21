describe('Vimeo directive', function() {
  var scope, $rootScope, $compile, $timeout, $injector;

  beforeEach(module('ngVimeo'));

  beforeEach(inject(function(_$rootScope_, _$compile_, _$timeout_, _$injector_) {

    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    $compile = _$compile_;
    $timeout = _$timeout_;
    $injector = _$injector_;

  }));

  // DSL (domain-specific language)
  function compileTemplate(template) {
    var el = $compile(angular.element(template))(scope);
    scope.$digest();
    $timeout.flush();//Flush pending timeouts
    return el;
  }

  it('should init', function() {
    var id = '20687326';
    scope.config = {
      videoId: id,
      method: {},
      event: {}
    };
    var element = compileTemplate('\
    <vimeo settings="config"></vimeo>');
    scope.$digest();
    var iframeSrc = element.find('iframe').attr('src');
    expect(iframeSrc.indexOf(id)).not.toBeLessThan(0);
  });
});
