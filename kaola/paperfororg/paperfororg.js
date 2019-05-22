define(['angular', 'ng-table', 'ngToaster'], function (angular) {
    'use strict';
    /*
    * Controllers
    */
    angular.module('app').controller('PaperForOrgCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'PaperForOrgService', '$rootScope', function ($scope, AuthService, Constants, NgTableParams, PaperForOrgService, $rootScope) {
        $scope.SchoolPaperList = new NgTableParams({ count: 10 }, {
            counts: [10],
            getData: function (params) {
                var param = {  };
                param.PostParams = params.parameters();
                return PaperForOrgService.GetPaperList(param).then(function (results) {
                    params.total(results.data.Count);
                    return results.data.Data;
                });
            }
        });
        $scope.ImportNewPackageDialog = function () {
            $scope.NewPackageCode = "";
            $scope.ValidatePackageMessage = "";
            angular.element("#packageCode").blur()
            angular.element('#NewPackageDialog').modal({ backdrop: 'static', keyboard: false });
        }
        $scope.ActiveNewPackage = function () {
            if ($scope.NewPackageCode == "") {
                $scope.ValidatePackageMessage = "请输入内容序列号！";
                return;
            }
            PaperForOrgService.ActivePackageCode($scope.NewPackageCode).then(function (result) {
                angular.element('#NewPackageDialog').modal('hide');
                //GetPaperPackageHeaderInfo();
                $scope.SchoolPaperList.reload();
            }, function (error) {
                //$scope.ValidatePackageMessage = error.data.Message;
                if (error.data.Message != '') {
                    $scope.ValidatePackageMessage = error.data.Message;
                }
                else {
                    $scope.ValidatePackageMessage = "无效的序列号，请重新输入";
                }
            });

        }
    }])

    /*
    * Services
    */
    .service('PaperForOrgService', function ($http, Constants) {

        var self = this;
        self.GetPaperList = function (filter) {
            return $http.post(GLOBAL_API_URL + 'api/paper/listforexamorg', filter);
        }
        self.GetPaperPackageHeaderInfo = function () {
            return $http.get(GLOBAL_CENTRAL_URL + 'api/teacher/GetPaperPackageHeaderInfo');
        }
        self.ActivePackageCode = function (packageCode) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/paper/activeorgpackage', { PackageCode: packageCode });
        }
    })

     

});
