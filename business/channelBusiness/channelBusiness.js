define(['angular'], function (angular) {
    'use strict';

    angular.module('ChannelBusiness', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('channelBusiness', {
            url: "/channelBusiness",
            views: {
                'mainChildView': {
                    templateUrl:  "business/channelBusiness/channelBusiness.html",
                    controller: 'ChannelBusinessCtrl'
                }
            }
        });
    }])
    /*
    * Controllers
    */
    .controller('ChannelBusinessCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'ChannelBusinessService', '$rootScope', 'toaster', function ($scope, AuthService, Constants, NgTableParams, ChannelBusinessService, $rootScope, toaster) {

        $scope.QueryParams = {
            BusinessName: "",
        };

        $scope.ChannelBusinesList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 30, 50],
            getData: function (params) {
                $scope.QueryParams.PostParam = params.parameters();
                return ChannelBusinessService.GetBusinessViewList($scope.QueryParams).then(function (results) {
                    //console.log(results);
                    params.total(results.data.Count);
                    return results.data.ChannelBViewList;
                });
            }
        });

        $scope.SearchChannelBusiness = function () {
            console.log($scope.QueryParams);
            $scope.ChannelBusinesList.parameters().page = 1;
            $scope.ChannelBusinesList.reload();
        }


        $scope.BusinessParam = {
            BusinessName: "",
            BusinessID: "",
        };

        $scope.OpenAddChannelBusDialog = function () {
            $scope.BusinessParam = {
                BusinessID: "",
                BusinessName: "",
            };

            angular.element('#AddBusinessDialog').modal('show');
        }

        $scope.BusinessAdd = function () {
            ChannelBusinessService.BusinesslAdd($scope.BusinessParam).then(function (result) {
                $scope.SearchChannelBusiness();
                angular.element('#AddBusinessDialog').modal('hide');
            }, function (result) {               
                toaster.clear("dialog1");
                toaster.error({ body: result.data.Message, toasterId: 'dialog1' });
            });
        }

        $scope.OpenUpdateBusinessDialog = function (business) {
            $scope.BusinessParam = {
                BusinessID: business.BusinessID,
                BusinessName: business.BusinessName,
            };

            angular.element('#UpdateBusinessDialog').modal('show');
        }

        $scope.BusinessUpdate = function () {

            ChannelBusinessService.BusinesslUpdate($scope.BusinessParam).then(function (result) {
                $scope.SearchChannelBusiness();
                angular.element('#UpdateBusinessDialog').modal('hide');
            }, function (result) {
                toaster.clear("dialog2");
                toaster.error({ body: result.data.Message, toasterId: 'dialog2' });
            });
        }

        //------删除

        $scope.OpenDeleteBusinessDialog = function (business) {
            $scope.BusinessParam = {
                BusinessID: business.BusinessID,
                BusinessName: business.BusinessName,
            };
            var tr = jQuery("#" + business.BusinessID);
            tr.addClass("delete-background");
            $rootScope.openCommonModalDialog('删除', '您确定要删除此渠道商吗？', $scope.DelChannelBusiness, function () {
                tr.removeClass("delete-background");
            });
        }
        $scope.DelChannelBusiness = function () {
            ChannelBusinessService.DelBusiness($scope.BusinessParam.BusinessID).then(function (result) {
                $scope.SearchChannelBusiness();
            }, function (result) {
                toaster.clear("dialog0");
                toaster.error({ body: result.data.Message, toasterId: 'dialog0' });
            });
        }


        //----------查看

        $scope.ChannelDetailQuery = {
            ContentPackageReq: {
                BusinessID: "",
            },
            SchoolDogReq: {
                BusinessID: "",
            }
        };

        $scope.ChoosedBusiness = {};
        $scope.OpenBusinessDetailDialog = function (business) {
            $scope.CurrentTabIndex = 1;
            $scope.ChoosedBusiness = business;

            $scope.ChannelDetailQuery = {
                ContentPackageReq: {
                    BusinessID: business.BusinessID,
                },
                SchoolDogReq: {
                    BusinessID: business.BusinessID,
                }

            };

            $scope.ContentPackageList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    $scope.ChannelDetailQuery.ContentPackageReq.PostParam = params.parameters();
                    return ChannelBusinessService.GetChannelContetPList($scope.ChannelDetailQuery.ContentPackageReq).then(function (results) {
                        //console.log(results);
                        params.total(results.data.Count);
                        return results.data.ChannelCPackageList;
                    });
                }
            });

            $scope.SchoolDogList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    //console.log(params.parameters());
                    $scope.ChannelDetailQuery.SchoolDogReq.PostParam = params.parameters();
                    return ChannelBusinessService.GetSchoolDongleList($scope.ChannelDetailQuery.SchoolDogReq).then(function (results) {
                        //console.log(results);
                        params.total(results.data.Count);
                        return results.data.SchoolDongleList;
                    });
                }
            });

            angular.element('#BusinessDetailDialog').modal('show');

        }


        $scope.KeyupSearchChannelBusiness = function (e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                $scope.SearchChannelBusiness();
            }
        }


        $scope.CurrentTabIndex = 1;
        $scope.TabChange = function (step) {
            $scope.CurrentTabIndex = step;
        }
    }])

    /*
    * Services
    */
    .service('ChannelBusinessService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;

        self.GetBusinessViewList = function (param) {
            return $http.post(serviceBase + 'api/business/channelBusinessView', param);
        }


        self.BusinesslAdd = function (addParam) {
            return $http.post(serviceBase + 'api/business/businessAdd', addParam);
        }

        self.BusinesslUpdate = function (addParam) {
            return $http.post(serviceBase + 'api/business/businessUpdate', addParam);
        }

        self.DelBusiness = function (businessID) {
            return $http.get(serviceBase + 'api/business/delbusiness/' + businessID);
        }

        self.GetChannelContetPList = function (param) {
            return $http.post(serviceBase + 'api/business/channelContentP', param);
        }

        self.GetSchoolDongleList = function (param) {
            return $http.post(serviceBase + 'api/business/schoolDongle', param);
        }

    });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
