define(['angular', 'angucomplete'], function (angular) {
    'use strict';

    angular.module('ExamManageForManager', ['ui.router'])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state('examManageForManager', {
                    url: "/examManageForManager",
                    views: {
                        'mainChildView': {
                            templateUrl: "business/examOrg/examManage/examManage.html",
                            controller: 'ExamManageForManagerCtrl'
                        }
                    }, params: { 'data': {} }
                });
            }
        ])
        /*
         * Controllers
         */
        .controller('ExamManageForManagerCtrl', [
            '$scope', 'Constants', 'NgTableParams', 'ExamManageForManagerService', '$rootScope', '$timeout', '$state', 'SlideMenuService',
            function ($scope, Constants, NgTableParams, ExamOrgService, $rootScope, $timeout, $state, SlideMenuService) {

                $scope.ExamOrgID = '';
                $scope.ExamOrgName = '';
                $scope.BackState = '';
                console.log('params:', $state.params);
                var data = $state.params.data;
                if (data != undefined) {
                    $scope.ExamOrgID = data.examOrgID;
                    $scope.ExamOrgName = data.examOrgName;
                    $scope.BackState = data.backState;
                }

                SlideMenuService.SetActiveSideMenu('examOrg');

                $scope.Back = function () {
                    if ($scope.BackState != undefined && $scope.BackState != '') {
                        $state.go($scope.BackState);
                    }
                }
            }
        ])

/*
 * Services
 */
        .service('ExamManageForManagerService', function ($http, Constants) {
            var serviceBase = Constants.apiServiceBaseUri;
            var self = this;



        });

});