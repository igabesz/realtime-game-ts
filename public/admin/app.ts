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

mainModule.directive('tooltip', function($compile: ng.ICompileService) {
  return {
    restrict: 'A',
    link: function(scope: ng.IScope, element: ng.IAugmentedJQuery, attr: any/*ng.IAttributes*/) {
      element.bind('mouseenter', (eventObject: JQueryEventObject) => {
        let tooltip: ng.IAugmentedJQuery = $compile('<div>')(scope);
        tooltip.addClass('tooltip');
        tooltip.text(attr.tooltip);
        element.append(tooltip);
        element.addClass('tooltipped');
      });
      
      element.bind('mouseleave', (eventObject: JQueryEventObject) => {
        element.children('div.tooltip').remove();
        element.removeClass('tooltipped');
      });
    }
  }
});