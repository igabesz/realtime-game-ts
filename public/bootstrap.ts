declare var System: any;
declare var angular: ng.IAngularStatic;

// Config settings for System.js
// Put the further 3rd party dependencies here
System.config({
	defaultJSExtensions: true, // We don't have to put .js to everywhere
	map: {
		'socket.io-client': '/socket.io/socket.io.js',
		'lodash': '/lodash/index.js',
		'phaser': '/phaser/build/phaser.js'
	}
});

// Loading app and bootstrapping angular
var app = System.import('./app.js').then(function(app) {
	angular.bootstrap(document, ['spacegame']);
});
