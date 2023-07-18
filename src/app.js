angular.module('beamng.apps')
.directive('BeamRadio', ['StreamsManager', function (StreamsManager) {
  return {
    template:  '<button ng-click="hello()">Click Me</button>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      scope.hello = function () {
        // do something here.
      };
    }
  };
}])