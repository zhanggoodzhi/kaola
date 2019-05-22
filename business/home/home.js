define(['angular'], function (angular) {
    'use strict';

    angular.module('Home', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('home', {
            url: "/home",
            views: {
                'mainChildView': {
                    templateUrl:  "business/home/home.html",
                    controller: 'HomeCtrl'
                },
            }

        });
    }])
    /*
    * Controllers
    */
    .controller('HomeCtrl', ['$scope', 'AuthService', '$state', '$location', 'LocationService', function ($scope, AuthService, $state, $location, LocationService) {

        LocationService.GotoDefaultURL();

    }])

    /*
    * Services
    */
    .service('HomeService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;



    });

    /*
    * Directives
    */

    /*
    * Filters
    */
});