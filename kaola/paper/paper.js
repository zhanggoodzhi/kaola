define(['angular', 'ng-table'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('PaperCtrl', ['$scope', '$rootScope', '$stateParams', 'NgTableParams', 'AuthService', 'Constants', 'PaperService', '$state', 'ShowService', function ($scope, $rootScope, $stateParams, NgTableParams, AuthService, Constants, PaperService, $state, ShowService) {

        //#region 检查自由组卷的功能权限
        $scope.EnablePaperDesign  
            $scope.EnablePaperDesign = AuthService.CheckModuleEnable('PaperDesign'); 
        //#endregion

        //#region main UI adjust
        $scope.ShowSlideMenu = function () {
            angular.element("#sidebar_menu").show();
            angular.element("#div_mainChildView").removeClass();
            angular.element("#div_mainChildView").addClass('col-xs-11 col-sm-11 col-md-11');
        }
        $scope.ShowSlideMenu();

        //#endregion


        $scope.Filter = {
            PaperName: "",
            IsCustomPaper: 0
        }
        $scope.FilterPaperName = function () {
            if ($scope.Filter.IsCustomPaper == 0) {
                $scope.LoadSchoolPaperList({ pageIndex: 1 });
            }
            else {
                $scope.LoadCustomPaperList({ pageIndex: 1 });
            }
            $scope.LoadPaperListSummary();
        }
        $scope.PaperListTabChange = function (isCustomPaperFlag) {
            $scope.Filter.IsCustomPaper = isCustomPaperFlag;

            if ($scope.Filter.IsCustomPaper == 0) {
                $scope.LoadSchoolPaperList();
            }
            else {
                $scope.LoadCustomPaperList();
            }
        }


        $scope.SchoolPaperList = new NgTableParams({ count: 20 }, {
            counts: [20],
            getData: function (params) {
                var param = { PaperName: $scope.Filter.PaperName, IsCustomPaper: 0 };
                param.PostParams = params.parameters();
                return PaperService.GetPaperList(param).then(function (results) {
                    params.total(results.data.Count);
                    return results.data.Data;
                });
            }
        });
        $scope.CustomPaperList = new NgTableParams({ count: 20 }, {
            counts: [20],
            getData: function (params) {

                if ($scope.EnablePaperDesign == false) {
                    return;
                }
                var param = { PaperName: $scope.Filter.PaperName, IsCustomPaper: 1 };

                param.PostParams = params.parameters();
                return PaperService.GetPaperList(param).then(function (results) {
                    params.total(results.data.Count);
                    return results.data.Data;
                });
            }
        });

        $scope.LoadSchoolPaperList = function (param) {
            if (param != undefined && param.pageIndex != undefined) {
                $scope.SchoolPaperList.parameters().page = param.pageIndex;
            }
            $scope.SchoolPaperList.reload();
        }
        $scope.LoadCustomPaperList = function (param) {
            if (param != undefined && param.pageIndex != undefined) {
                $scope.CustomPaperList.parameters().page = param.pageIndex;
            }
            $scope.CustomPaperList.reload();
        }
        $scope.LoadPaperListSummary = function () {
            PaperService.GetPaperListSummary($scope.Filter).then(function (result) {
                $scope.PaperListSummary = result.data;
            });

        }


        $scope.LoadPaperListSummary();
        $scope.DeleteCustomPaper = function (paperID) {
            $rootScope.openCommonModalDialog("确认", "确认要删除该试卷吗?", function () {
                PaperService.DeleteCustomPaper(paperID).then(function (response) {
                    console.log(response.data);
                    $scope.LoadCustomPaperList();
                    $scope.LoadPaperListSummary();
                });
            });
        }

        $scope.OpenPaperDesignView = function (paperID) {
            if (paperID == undefined || paperID.length == 0) {
                paperID = guid();
                $state.go("paperdesign", { paperID: paperID });
            }
            else {
                PaperService.EditCustomPaper(paperID).then(function (response) {
                    if (response.data.Success) {
                        var newPaperID = response.data.State;
                        if (newPaperID != paperID) {
                            $state.go("paperdesign", { paperID: newPaperID, originalPaperID: paperID });
                        } else {
                            $state.go("paperdesign", { paperID: newPaperID });
                        }
                    }
                    else {
                        $rootScope.openCommonErrorDialog("错误", "编辑试卷出错");
                    }
                });
            }

        }
    }])

        /*
        * Services
        */
    .service('PaperService', function ($http, Constants) {
        var self = this;

        self.GetPaperList = function (filter) {
            return $http.post(GLOBAL_API_URL + 'api/paper/list', filter);
        }

        self.GetPaperFilterOption = function () {
            return $http.get(GLOBAL_API_URL + 'api/paper/paperTagFilterOption');
        }

        self.GetPaperDetail = function (paperID) {
            return $http.get(GLOBAL_API_URL + 'api/paper/detail/' + paperID);
        }

        self.DeleteCustomPaper = function (paperID) {
            return $http.post(GLOBAL_API_URL + 'api/paperdesign/deteteCustomPaper', { PaperID: paperID });
        }

        self.GetPaperListSummary = function (filter) {
            return $http.post(GLOBAL_API_URL + 'api/paper/summary', filter);
        }

        self.EditCustomPaper = function (paperID) {
            return $http.post(GLOBAL_API_URL + 'api/paperdesign/editCustomPaper', { PaperID: paperID });
        }
         
    })


    /*
    * Directives
    */

});
