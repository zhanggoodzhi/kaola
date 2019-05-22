define(['angular', 'ng-table', 'jquery-scrollbar', 'jquery-mousewheel'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('ExamForOrgSelectPaperCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'ExamForOrgSelectPaperService', '$rootScope', '$state', 'SlideMenuService', function ($scope, AuthService, Constants, NgTableParams, ExamForOrgSelectPaperService, $rootScope, $state, SlideMenuService) {

        //#region 处理页面跳转参数
        $scope.ExamPlanID = '';
        $scope.backState = 'examfororg';
        $scope.PaperCount = 0;
        console.log('params:', $state.params);
        $scope.SelectAllPaperTag = false;
        var data = $state.params.data;
        if (data != undefined) {
            $scope.ExamPlanID = data.ExamPlanID;

            var bs = data.backState;
            if (bs != undefined && bs != '') {
                $scope.backState = bs;
            }
        }
        if ($scope.ExamPlanID == undefined || $scope.ExamPlanID == '') {
            $state.go($scope.backState);
        }

        SlideMenuService.SetActiveSideMenu('examfororg', 200);

        $scope.Back = function () {
            if ($scope.backState != undefined && $scope.backState != '') {
                $state.go($scope.backState, { data: { 'ExamPlanID': $scope.ExamPlanID } });
            }
        };
        //#endregion

        $scope.ExamOrgSelectedPaperList = new NgTableParams({ count: 10 }, {
            counts: [10],
            getData: function (params) {
                var param = { ExamPlanID: $scope.ExamPlanID };
                param.PostParams = params.parameters();
                return ExamForOrgSelectPaperService.GetExamPaperList(param).then(function (results) {
                    $scope.PaperCount = results.data.length;
                    return results.data;
                });
            }
        });
        $scope.ExamOrgSelectedPaperList.reload();
        $scope.SelectedPaperList = new NgTableParams({ count: 10 }, {
            counts: [10],
            getData: function (params) {
                var param = { PaperName: $scope.FilterPaperName, ExamPlanID: $scope.ExamPlanID };
                param.PostParams = params.parameters();
                return ExamForOrgSelectPaperService.GetSelectPaperList(param).then(function (results) {
                    return results.data.Data;
                });
            }
        });

        $scope.RemoveExamPaper = function (paperid) {
            $rootScope.openCommonModalDialog("确认", "是否确定移除该套试卷？", function () {
                ExamForOrgSelectPaperService.RemoveExamPaper(paperid, $scope.ExamPlanID).then(function (result) {
                    var d = result.data;
                    //console.log(d);
                    if (d.Success) {
                        $scope.ExamOrgSelectedPaperList.reload();
                    } else {
                        $rootScope.openCommonErrorDialog("错误", d.State);
                    }
                })
            })
        }

        $scope.OpenImportNewPaper = function () {
            $scope.NewPackageCode = "";
            $scope.ValidatePackageMessage = "";
            angular.element("#packageCode").blur()
            angular.element('#ImportNewPaperDialog').modal({ backdrop: 'static', keyboard: false });
        };

        $scope.SelectedFromPaperBase = function () {
            $scope.FilterPaperName = "";
            $scope.SelectPaperCount = 0;
            $scope.SelectAllPaperTag = false;
            $scope.SelectedPaper = [];
            $scope.SelectedPaperList.reload();
            angular.element('#SelectPaperDialog').modal({ backdrop: 'static', keyboard: false });
        }

        $scope.ImportNewPaper = function () {
            if ($scope.NewPackageCode == "") {
                $scope.ValidatePackageMessage = "请输入内容序列号";
                return;
            }
            ExamForOrgSelectPaperService.ImportNewPaper($scope.NewPackageCode, $scope.ExamPlanID).then(function (result) {
                angular.element('#ImportNewPaperDialog').modal('hide');
                $scope.ExamOrgSelectedPaperList.reload();
            }, function (error) {
                $scope.ValidatePackageMessage = error.data.Message;
            });
        };

        $scope.SearchByPaperName = function () {
            $scope.SelectPaperCount = 0;
            $scope.SelectAllPaperTag = false;
            $scope.SelectedPaper = [];
            $scope.SelectedPaperList.reload();
        }

        $scope.SelectAllPaperTag = false;

        $scope.SelectAllPaper = function (event) {
            event.stopPropagation(); // 阻止事件冒泡
            $scope.SelectAllPaperTag = $scope.SelectAllPaperTag ? false : true;
            $scope.SelectAll($scope.SelectedPaperList.data, $scope.SelectAllPaperTag);
            $scope.SelectPaperCount = GetSelectedPaper($scope.SelectedPaperList.data).length;
        }

        function GetSelectedPaper(data) {
            $scope.SelectedPaper = [];
            if (angular.isArray(data) && data.length > 0) {
                angular.forEach(data, function (item, i) {
                    if (item.Selected == 1 || item.Selected == "1") {
                        $scope.SelectedPaper.push(item.PaperID);
                    }
                });
            }
            return $scope.SelectedPaper;
        }

        $scope.SelectAll = function (data, flag) {
            var newValue = "0";
            if (flag) {
                newValue = "1";
            }
            var message = '';
            if (angular.isArray(data) && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    data[i].Selected = newValue;
                }
            }
        };

        $scope.ChoosePaper = function (choosePaperID) {
            var data = $scope.SelectedPaperList.data;
            if (choosePaperID != undefined && choosePaperID != null) {
                if (angular.isArray(data) && data.length > 0) {
                    for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                        if (data[dataIndex].PaperID == choosePaperID) {
                            if (data[dataIndex].Selected == 1) {
                                data[dataIndex].Selected = 0;
                                $scope.SelectAllPaperTag = false;
                            }
                            else {
                                data[dataIndex].Selected = 1;

                            }
                            break;
                        }
                    }

                }
            }
            $scope.SelectPaperCount = GetSelectedPaper(data).length;
            if ($scope.SelectedPaper.length == data.length) {
                $scope.SelectAllPaperTag = true;
            }
        }

        $scope.SaveExamPlanPaper = function () {
            var params = {
                PaperIDs: $scope.SelectedPaper,
                ExamPlanID: $scope.ExamPlanID
            };
            ExamForOrgSelectPaperService.SaveExamPaperList(params).then(function (result) {
                var d = result.data;
                if (d.Success) {
                    $scope.ExamOrgSelectedPaperList.reload();
                    angular.element('#SelectPaperDialog').modal('hide');
                } else {
                    if ($scope.SelectedPaper == undefined) {
                        angular.element('#SelectPaperDialog').modal('hide');
                    }
                    else {
                        $rootScope.openCommonErrorDialog("错误", d.State);
                    }
                }
            });
        }

        $scope.CancleSelect = function () {
            angular.element('#SelectPaperDialog').modal("hide");
        };
        //#endregion

        //刷新自定义滚动条
        customScrollbarHelper.refreshScrollbar();
    }])

        /*
        * Services
        */
        .service('ExamForOrgSelectPaperService', function ($http, Constants) {
            var self = this;
            self.ImportNewPaper = function (packageCode, examPlanID) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/importnewpaper',
                    { PackageCode: packageCode, ExamPlanID: examPlanID });
            };
            self.GetExamPaperList = function (param) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/getexampaperlist', param);
            };
            self.RemoveExamPaper = function (paperID, examPlanID) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/removeexampaper', { ExamPlanID: examPlanID, PaperID: paperID });
            };
            self.GetSelectPaperList = function (param) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/getselectpaperlist', param);
            };
            self.SaveExamPaperList = function (param) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/saveexampaperlist', param);
            };
        })



});
