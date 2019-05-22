define(['angular', 'ng-table'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('PackageCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'PackageService', '$rootScope', function ($scope, AuthService, Constants, NgTableParams, PackageService, $rootScope) {

        $scope.PackageList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 30, 50],

            getData: function (params) {
                //console.log(params);
                return PackageService.GetPackageList(params.parameters()).then(function (results) {
                    console.log(results);
                    params.total(results.data.Count);
                    return results.data;
                });
            }

        });

        function GetPaperPackageHeaderInfo() {
            PackageService.GetPaperPackageHeaderInfo().then(function (result) {
                console.log(result);

                $scope.PaperPackageHeaderInfo.PapaerPackageCount = result.data.PapaerPackageCount;
                $scope.PaperPackageHeaderInfo.PaperCount = result.data.PaperCount;
                $scope.PaperPackageHeaderInfo.PaperQuestionCount = result.data.PaperQuestionCount;
            });
        }

        GetPaperPackageHeaderInfo();

        $scope.NewPackageCode = "";
        $scope.ValidatePackageMessage = "";

        $scope.AddNewPackageDialog = function () {
            $scope.NewPackageCode = "";
            $scope.ValidatePackageMessage = "";
            angular.element("#packageCode").blur()
            angular.element('#NewPackageDialog').modal({ backdrop: 'static', keyboard: false });

        }

        $scope.ActiveNewPackage = function () {
            if ($scope.NewPackageCode == "") {
                $scope.ValidatePackageMessage = "请输入内容序列号";
                return;
            }

            PackageService.ActivePackageCode($scope.NewPackageCode).then(function (result) {
                angular.element('#NewPackageDialog').modal('hide');
                GetPaperPackageHeaderInfo();
                $scope.PackageList.reload();
            }, function (error) {
                //$scope.ValidatePackageMessage = error.data.Message;
                $scope.ValidatePackageMessage = "无效的序列号，请重新输入";
            });

        }

        $scope.PackagePaperList = new NgTableParams({ count: 999 }, {
            counts: [],
            dataset: []
        }
        );

        $scope.ViewPackageDetail = function (packageCode) {

            PackageService.GetPackagePaper(packageCode).then(function (result) {
                $scope.PackagePaperList.settings({
                    dataset: result.data
                });
                angular.element('#ViewPackagePaperDialog').modal({ backdrop: 'static', keyboard: false });

            });
        }

        $scope.UpdatePackagePaperActiveFlag = function (packageCode, paperID, activeFlag) {
            PackageService.UpdatePackagePaperActiveFlag(packageCode, paperID, activeFlag).then(function (result) {
                if (result.data.errorno == 0) {
                    PackageService.GetPackagePaper(packageCode).then(function (result) {
                        $scope.PackagePaperList.settings({
                            dataset: result.data
                        });
                    });
                }
                else {
                    $rootScope.openCommonErrorDialog("错误", "修改试卷状态出错,", null);
                }
            });
        }

        $scope.PaperPackageHeaderInfo = {
            PapaerPackageCount: 0,
            PaperCount: 0,
            PaperQuestionCount: 0,
        }

    }])

/*
* Services
*/
    .service('PackageService', function ($http, Constants) {
        
        var self = this;

        self.GetPackageList = function (param) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/package/list', param);
        }

        self.ActivePackageCode = function (packageCode) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/package/active', { PackageCode: packageCode });
        }
        self.GetPackagePaper = function (packageCode) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/package/paperlist', { PackageCode: packageCode });
        }

        self.UpdatePackagePaperActiveFlag = function (packageCode, paperID, activeFlag) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/package/updatePaperStatus', { PackageCode: packageCode, PaperID: paperID, ActiveFlag: activeFlag });
        }

        self.GetPaperPackageHeaderInfo = function () {
            return $http.get(GLOBAL_CENTRAL_URL + 'api/teacher/GetPaperPackageHeaderInfo');
        }

    })

    /*
    * Directives
    */



});
