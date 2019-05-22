define(['angular'], function (angular) {
    'use strict';

    angular.module('ContentBusiness', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('contentBusiness', {
            url: "/contentBusiness",
            views: {
                'mainChildView': {
                    templateUrl:  "business/contentBusiness/contentBusiness.html",
                    controller: 'ContentBusinessCtrl'
                }
            }
        });
    }])
    /*
    * Controllers
    */
    .controller('ContentBusinessCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'ContentBusinessService', '$rootScope', 'toaster', function ($scope, AuthService, Constants, NgTableParams, ContentBusinessService, $rootScope, toaster) {

        $scope.QueryParams = {
            ContentProviderName: "",
        };


        $scope.ContentProviderList = new NgTableParams({ count: 20 }, {
            counts: [10, 20, 30, 50],
            getData: function (params) {
                $scope.QueryParams.PostParam = params.parameters();
                return ContentBusinessService.GetContentProviderList($scope.QueryParams).then(function (results) {
                    //console.log(results);
                    params.total(results.data.Count);
                    return results.data.ContentProviderList;
                });
            }
        });

        $scope.KeyupSearchContentProvider = function (e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                $scope.SearchContentProvider();
            }
        }

        $scope.SearchContentProvider = function () {
            console.log($scope.QueryParams);
            $scope.ContentProviderList.parameters().page = 1;
            $scope.ContentProviderList.reload();
        }

        $scope.ProviderParam = {
            ContentProviderName: "",
            ContentProviderID: "",
        };

        $scope.OpenAddProviderDialog = function () {
            $scope.ProviderParam = {
                ContentProviderName: "",
                ContentProviderID: "",
            };
            angular.element('#AddProviderDialog').modal('show');
        }

        $scope.ProviderAdd = function () {
            ContentBusinessService.ProviderAdd($scope.ProviderParam).then(function (result) {
                $scope.SearchContentProvider();
                angular.element('#AddProviderDialog').modal('hide');
            }, function (result) {
                toaster.clear("dialog1");
                toaster.error({ body: result.data.Message, toasterId: 'dialog1' });
            });
        }



        $scope.OpenUpdateProviderDialog = function (provider) {
            $scope.ProviderParam = {
                ContentProviderName: provider.ContentProviderName,
                ContentProviderID: provider.ContentProviderID,
            };

            angular.element('#UpdateProviderDialog').modal('show');
        }

        $scope.ProviderUpdate = function () {

            ContentBusinessService.ProviderUpdate($scope.ProviderParam).then(function (result) {
                $scope.SearchContentProvider();
                angular.element('#UpdateProviderDialog').modal('hide');
            }, function (result) {
                toaster.clear("dialog2");
                toaster.error({ body: result.data.Message, toasterId: 'dialog2' });
            });
        }


        //------删除

        $scope.OpenDeleteProviderDialog = function (provider) {
            if (provider.IsCanDel == false) {
                return;
            }
            $scope.ProviderParam = {
                ContentProviderName: provider.ContentProviderName,
                ContentProviderID: provider.ContentProviderID,
            };
            var tr = jQuery("#" + provider.ContentProviderID);
            tr.addClass("delete-background");
            $rootScope.openCommonModalDialog('删除', '您确定要删除此内容商吗？', $scope.DelProvider, function () {
                tr.removeClass("delete-background");
            });
        }
        $scope.DelProvider = function () {
            ContentBusinessService.DelProvider($scope.ProviderParam.ContentProviderID).then(function (result) {
                $scope.SearchContentProvider();
            }, function (result) {
                toaster.clear("dialog0");
                toaster.error({ body: result.data.Message, toasterId: 'dialog0' });
            });
        }

        //----------查看
        $scope.ProviderDetailQuery = {
            PaperPackageReq: {
                ContentProviderID: "",
            },
            PaperReq: {
                ContentProviderID: "",
            },
            PackageReq: {
                ContentProviderID: "",
            }
        };

        $scope.CurrentTabIndex = 2;
        $scope.TabChange = function (step) {
            $scope.CurrentTabIndex = step;
        }


        $scope.ChoosedProvider = {};

        $scope.OpenProdiverDetailDialog = function (provider) {
            $scope.CurrentTabIndex = 2;
            $scope.ChoosedProvider = provider;

            $scope.ProviderDetailQuery = {
                PaperPackageReq: {
                    ContentProviderID: provider.ContentProviderID,
                },
                PaperReq: {
                    ContentProviderID: provider.ContentProviderID,
                },
                PackageReq: {
                    ContentProviderID: provider.ContentProviderID,
                }
            };

            $scope.ProviderPaperPackageList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    $scope.ProviderDetailQuery.PaperPackageReq.PostParam = params.parameters();
                    return ContentBusinessService.GetProviderPaperPackageList($scope.ProviderDetailQuery.PaperPackageReq).then(function (results) {
                        //console.log(results);
                        params.total(results.data.Count);
                        return results.data.P_PaperPackageList;
                    });
                }
            });

            $scope.ProviderPaperList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    //console.log(params.parameters());
                    $scope.ProviderDetailQuery.PaperReq.PostParam = params.parameters();
                    return ContentBusinessService.GetProviderPaperList($scope.ProviderDetailQuery.PaperReq).then(function (results) {
                        //console.log(results);
                        params.total(results.data.Count);
                        return results.data.P_PapereList;
                    });
                }
            });


            $scope.ProviderPackageList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    //console.log(params.parameters());
                    $scope.ProviderDetailQuery.PackageReq.PostParam = params.parameters();
                    return ContentBusinessService.GetProviderPackageList($scope.ProviderDetailQuery.PackageReq).then(function (results) {
                        console.log('ProviderPackageList', results);
                        params.total(results.data.Count);
                        return results.data.P_PapereList;
                    });
                }
            });
            angular.element('#ProviderDetailDialog').modal('show');
        }

        $scope.PreviewPackageDetail = function (paperID) {
            ContentBusinessService.GetPaperDetail(paperID).then(function (result) {
                $scope.CurrentPaper = result.data;
                angular.element("#PreviewPackageDetailDialog").modal("show");
            });

        }

    }])

    /*
    * Services
    */
    .service('ContentBusinessService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;

        self.GetContentProviderList = function (param) {
            return $http.post(serviceBase + 'api/business/contentProviderList', param);
        }


        self.ProviderAdd = function (addParam) {
            return $http.post(serviceBase + 'api/business/providerAdd', addParam);
        }

        self.ProviderUpdate = function (addParam) {
            return $http.post(serviceBase + 'api/business/providerUpdate', addParam);
        }

        self.DelProvider = function (providerID) {
            return $http.get(serviceBase + 'api/business/delProvider/' + providerID);
        }


        self.GetProviderPaperPackageList = function (param) {
            return $http.post(serviceBase + 'api/business/providerPaperPackage', param);
        }

        self.GetProviderPaperList = function (param) {
            return $http.post(serviceBase + 'api/business/providerPaper', param);
        }

        self.GetProviderPackageList = function (param) {
            return $http.post(serviceBase + 'api/business/providerPackage', param);
        }

        self.GetPaperDetail = function (paperID) {
            return $http.get(serviceBase + 'api/paper/detail/' + paperID);
        }

    });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
