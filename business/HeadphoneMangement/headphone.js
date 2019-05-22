define(['angular'], function (angular) {
    'use strict';

    angular.module('Headphone', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {

        $stateProvider.state('headphone', {
            url: "/headphone",
            views: {
                'mainChildView': {
                    templateUrl:  "business/HeadphoneMangement/headphone.html",
                    controller: 'HeadphoneMangementCtrl'
                }
            }
        })

    }])
    /*
    * Controllers
    */
    .controller('HeadphoneMangementCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'HeadphoneMangementService', '$state', '$rootScope', 'toaster', function ($scope, AuthService, Constants, NgTableParams, HeadphoneMangementService, $state, $rootScope, toaster) {

        $scope.addHeadphoneValidateMessage = '';
        $scope.chooseHeadphone = {};
        $scope.QueryParams = {
            HeadphoneNoDescription: ''
        };

        $scope.SearchHeadPhones = function () {
            $scope.HeadphoneList.parameters().page = 1;
            $scope.HeadphoneList.reload();
        };

        $scope.HeadphoneList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 30, 50],
            getData: function (params) {
                $scope.QueryParams.PostParam = params.parameters();
                return HeadphoneMangementService.GetHeadphoneList($scope.QueryParams).then(function (results) {
                    params.total(results.data.Count);
                    return results.data.HeadphoneList;
                });
            }
        });

        $scope.DeleteHeadphone = function () {
            HeadphoneMangementService.DeleteHeadphone($scope.chooseHeadphone.HeadphoneId).then(function () {
                $scope.HeadphoneList.parameters().page = 1;
                $scope.HeadphoneList.reload();
            });
        };

        $scope.OpeDeleteHeadphoneDialog = function (headphone) {
            var tr = jQuery("#" + headphone.HeadphoneId);
            tr.addClass("delete-background");
            $scope.chooseHeadphone = headphone;
            $rootScope.openCommonModalDialog("删除", "您确定要删除此耳麦？", $scope.DeleteHeadphone, function () {
                tr.removeClass("delete-background");
            });
        }

        $scope.OpenAddHeadphoneDialog = function () {
            angular.element('#AddHeadphoneDialog').modal('show');
        };

        $scope.KeyupSearchHeadPhones = function (e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                $scope.SearchHeadPhones();
            }
        }

        $scope.SaveHeadphone = function () {

            if (!$scope.HeadphoneNo) {
                $scope.addHeadphoneValidateMessage = '硬件序列号不能为空';
                return;
            }
            if (!$scope.HeadphoneDescription) {
                $scope.addHeadphoneValidateMessage = '设备描述不能为空';
                return;
            }
            HeadphoneMangementService.AddHeadphone({ HeadphoneNo: $scope.HeadphoneNo, HeadphoneDescription: $scope.HeadphoneDescription }).then(function (result) {
                angular.element('#AddHeadphoneDialog').modal('hide');
                $scope.HeadphoneList.parameters().page = 1;
                $scope.HeadphoneList.reload();
            }, function (result) {
                $scope.addHeadphoneValidateMessage = result.data.Message;
            });
        };
    }])

    /*
    * Services
    */
    .service('HeadphoneMangementService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;

        self.GetHeadphoneList = function (params) {
            return $http.post(serviceBase + 'api/headphone/getheadphonelist', params);
        }

        self.DeleteHeadphone = function (params) {
            return $http.get(serviceBase + 'api/headphone/deleteheadphone/' + params);
        }

        self.AddHeadphone = function (params) {
            return $http.post(serviceBase + 'api/headphone/addheadphone', params);
        }
    });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
