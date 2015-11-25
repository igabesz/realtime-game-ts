import { AdminController } from './AdminController'; 

var mainModule = angular.module('spacegame', []);

mainModule.controller('AdminController', AdminController);

mainModule.filter('capitalize', function() {
  return function(input: string) {
  if (input!=null) {
    return (input.substring(0, 1).toUpperCase() + input.substring(1)).replace('/', ' ');
	}
	return '';
  }
});

mainModule.directive('hoverable', function() {
  return {
    restrict: 'C',
    link: function(scope: ng.IScope, element: ng.IAugmentedJQuery) {
      element.bind('mouseenter', (eventObject: JQueryEventObject) => {
		    element.addClass('hover');
      });
      
      element.bind('mouseleave', (eventObject: JQueryEventObject) => {
		    element.removeClass('hover');
      });
    }
  }
});