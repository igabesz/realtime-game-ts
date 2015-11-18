import { AdminController } from './AdminController'; 

var mainModule = angular.module('spacegame', []);

mainModule.controller('AdminController', AdminController);

mainModule.filter('capitalize', function() {
  return function(input: string) {
  if (input!=null) {
    return input.substring(0,1).toUpperCase()+input.substring(1);
	}
	return '';
  }
});
