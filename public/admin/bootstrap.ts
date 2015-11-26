declare var System: any;
declare var angular: ng.IAngularStatic;

// Config settings for System.js
// Put the further 3rd party dependencies here
System.config({
	defaultJSExtensions: true, // We don't have to put .js to everywhere
	map: {
		
	}
});

// Loading app and bootstrapping angular
var app = System.import('./app.js').then(function(app) {
	angular.bootstrap(document, ['admin']);
});
