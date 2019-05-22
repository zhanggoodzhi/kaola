define(['angular'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('HomeCtrl', ['$scope', 'AuthService', '$state', '$location', 'LocationService', function ($scope, AuthService, $state, $location, LocationService) {

        //console.log("enter Home Controller");

        var authData = AuthService.AuthData();
        var isAuth = authData ? authData.isAuth : false;
        if (isAuth) { 
            LocationService.GotoDefaultURL(); 
        } else {
            LocationService.Goto('login');
        }
    }])

    /*
    * Services
    */
    .service('HomeService', function ($http, Constants) {
       
    });

    /*
    * Directives
    */

    /*
    * Filters
    */
});