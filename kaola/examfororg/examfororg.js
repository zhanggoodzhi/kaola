define(['angular', 'ng-table', 'ngToaster', 'bootstrap-datetimepicker', 'bootstrap-datetimepicker-locales-zh-CN'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('ExamForOrgCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'ExamForOrgService', '$rootScope', '$state', '$filter', function ($scope, AuthService, Constants, NgTableParams, ExamForOrgService, $rootScope, $state, $filter) {
        //#region   ExamPlan List
        $scope.ShowLoadMore = true;
        $scope.ExamPlanList = [];
        $scope.TotalExamPlanCount = 0;
        $scope.QueryParams = {
            ExamLevel: [1],  //1=区级, 2=校级
            TablePost: {
                page: 1,
                count: 5,
                sorting: { ExamPlanStartDateTime: 'DESC' }
            }
        }

        $scope.SearchExamPlanList = function (p) {
            if (p != undefined && p.reset != undefined & p.reset == true) {
                $scope.QueryParams.TablePost.page = 1;
                $scope.ShowLoadMore = true;
            }
            ExamForOrgService.GetExamPlanList($scope.QueryParams).then(function (result) {

                if (p != undefined && p.reset != undefined & p.reset == true) {
                    $scope.ExamPlanList.splice(0, $scope.ExamPlanList.length);
                }
                var d = result.data;
                if (d.ExamPlanList.length > 0) {
                    for (var i = 0; i < d.ExamPlanList.length; i++) {
                        var findSameExamPlanID = false;
                        for (var j = 0; j < $scope.ExamPlanList.length; j++) {
                            if (d.ExamPlanList[i].ExamPlanID == $scope.ExamPlanList[j].ExamPlanID) {
                                findSameExamPlanID = true;
                                break;
                            }
                        }
                        if (findSameExamPlanID == false) {
                            $scope.ExamPlanList.push(d.ExamPlanList[i]);
                        }
                    }
                    if (d.Count >= ($scope.QueryParams.TablePost.count * $scope.QueryParams.TablePost.page)) {
                        $scope.QueryParams.TablePost.page++;
                        $scope.ShowLoadMore = true;

                    } else {
                        $scope.ShowLoadMore = false;
                    }
                }
                //console.log($scope.ShowLoadMore)
                //console.log($scope.ExamPlanList.Length)

                $scope.TotalExamPlanCount = d.Count;
            })
        }
        $scope.SearchExamPlanList();

        //状态控制
        $scope.GetExamPlanStatus = function (ep) {
            var authData = AuthService.AuthData();
            var userType = authData.userType;
            var status = $scope.GetStatus(ep, userType);

            var statusDesc = $filter('examPlanStatusFilter')(status, userType, 'desc');
            if (statusDesc.indexOf('倒计时') >= 0) {
                var day = DateTimeUtility.diff(ep.ExamPlanStartDateTime, new Date(), 'd');
                statusDesc = "考试倒计时 " + day + " 天";
            }
            return statusDesc;

        }
        $scope.GetStatus = function (ep, userType) {
            var status = undefined;
            if (ep != undefined && ep.ExamPlanStatus != undefined && ep.ExamPlanStatus != null) {
                status = ep.ExamPlanStatus[userType];
            }
            if (status == undefined) { status = 1; }
            return status;

        }
        $scope.GetExamPlanStatusCSS = function (ep) {
            var authData = AuthService.AuthData();
            var userType = authData.userType;
            var status = $scope.GetStatus(ep, userType);

            var statusName = $filter('examPlanStatusFilter')(status, userType, 'name');
            return statusName;
        }


        $scope.CheckByStatus = function (ep, statusArray) {

            var authData = AuthService.AuthData();
            var userType = authData.userType;
            var status = $scope.GetStatus(ep, userType);

            if (statusArray == undefined || statusArray.length == 0) { return true; }

            return ArrayUtility.containItem(statusArray, status);

        }
        //#endregion


        //#region Add/Update ExamPlan

        $scope.CurrentExamPlan = {};
        $scope.ValidateExamPlanMessage = '';
        $scope.InitExamPlan = function (d) {
            if (d != undefined) {

                var newD = {};
                newD.ExamPlanID = d.ExamPlanID;
                newD.ExamPlanName = d.ExamPlanName;
                newD.ExamPlanStartDateTime = DateTimeUtility.format(new Date(d.ExamPlanStartDateTime), 'yyyy-MM-dd');
                newD.ExamPlanEndDateTime = DateTimeUtility.format(new Date(d.ExamPlanEndDateTime), 'yyyy-MM-dd');
                newD.Grade = d.Grade;
                newD.ExamLevel = d.ExamLevel;
                return newD;

            } else {
                return {
                    ExamPlanID: '',
                    ExamPlanName: '',
                    ExamPlanStartDateTime: DateTimeUtility.format(new Date(), 'yyyy-MM-dd'),
                    ExamPlanEndDateTime: DateTimeUtility.format(new Date(), 'yyyy-MM-dd'),
                    Grade: '',
                    ExamLevel: 1
                }
            }
        }
        $scope.OpenAddExamPlanDialog = function () {
            $scope.CurrentExamPlan = $scope.InitExamPlan();

            console.log($scope.CurrentExamPlan);

            $("#Add_ExamPlanStartDateTime").datetimepicker({
                format: "yyyy-mm-dd", autoclose: true, todayBtn: true, language: 'zh-CN', pickerPosition: "bottom-left",
                minView: 2, startDate: new Date()
            });
            $("#Add_ExamPlanStartDateTime").val('');
            $("#Add_ExamPlanEndDateTime").datetimepicker({
                format: "yyyy-mm-dd", autoclose: true, todayBtn: true, language: 'zh-CN',
                minView: 2, startDate: new Date()
            });
            $("#Add_ExamPlanEndDateTime").val('');

            angular.element('#AddExamPlanDialog').modal('show');
            $scope.ValidateExamPlanMessage = '';

        }
        $scope.AddExamPlan = function () {
            $scope.CurrentExamPlan.ExamPlanStartDateTime = $("#Add_ExamPlanStartDateTime").val();
            $scope.CurrentExamPlan.ExamPlanEndDateTime = $("#Add_ExamPlanEndDateTime").val();

            if ($scope.ValidateExamPlan($scope.CurrentExamPlan) == false) {
                return;
            }

            ExamForOrgService.AddExamPlan($scope.CurrentExamPlan).then(function (result) {
                var d = result.data;
                //console.log(d);
                if (d.Success) {
                    angular.element('#AddExamPlanDialog').modal('hide');
                    $scope.SearchExamPlanList({ reset: true });
                } else {
                    $rootScope.openCommonErrorDialog("错误", d.State);
                }
            })
        }

        //update
        $scope.OpenUpdateExamPlanDialog = function (d) {

            ExamForOrgService.GetUpdateExamPlan({ ExamPlanID: d.ExamPlanID }).then(function (result) {
                var d = result.data;

                $scope.CurrentExamPlan = d;

                console.log($scope.CurrentExamPlan);

                $("#Update_ExamPlanStartDateTime").datetimepicker({
                    format: "yyyy-mm-dd", autoclose: true, todayBtn: true, language: 'zh-CN', pickerPosition: "bottom-left",
                    minView: 2, startDate: new Date()
                });
                $("#Update_ExamPlanStartDateTime").val(DateTimeUtility.format($scope.CurrentExamPlan.ExamPlanStartDateTime, 'yyyy-MM-dd'));
                $("#Update_ExamPlanEndDateTime").datetimepicker({
                    format: "yyyy-mm-dd", autoclose: true, todayBtn: true, language: 'zh-CN',
                    minView: 2, startDate: new Date()
                });
                $("#Update_ExamPlanEndDateTime").val(DateTimeUtility.format($scope.CurrentExamPlan.ExamPlanEndDateTime, 'yyyy-MM-dd'));

                angular.element('#UpdateExamPlanDialog').modal('show');
                $scope.ValidateExamPlanMessage = '';
            })

        }
        $scope.UpdateExamPlan = function () {
            $scope.CurrentExamPlan.ExamPlanStartDateTime = $("#Update_ExamPlanStartDateTime").val();
            $scope.CurrentExamPlan.ExamPlanEndDateTime = $("#Update_ExamPlanEndDateTime").val();

            if ($scope.ValidateExamPlan($scope.CurrentExamPlan) == false) {
                return;
            }

            ExamForOrgService.UpdateExamPlan($scope.CurrentExamPlan).then(function (result) {
                var d = result.data;
                //console.log(d);
                if (d.Success) {
                    angular.element('#UpdateExamPlanDialog').modal('hide');
                    $scope.SearchExamPlanList({ reset: true });
                } else {
                    $rootScope.openCommonErrorDialog("错误", d.State);
                }
            })
        }
        $scope.DisableUpdateExamPlanStartDateTime = function (ep) {
            var now = DateTimeUtility.format(new Date(), 'yyyy-MM-dd');
            var startDate = DateTimeUtility.format(ep.ExamPlanStartDateTime, 'yyyy-MM-dd');
            if (startDate < now) {
                console.log('Disable update ExamPlanStartDateTime');
                return true;
            }
            return false;
        }

        $scope.ValidateExamPlan = function (d) {
            console.log(d);
            $scope.ValidateExamPlanMessage = '';
            if (d.ExamPlanName == '') {
                $scope.ValidateExamPlanMessage = "考试名称不能为空！";
                return false;
            }
            if (d.ExamPlanName.length > 30) {
                $scope.ValidateExamPlanMessage = "考试名称长度最多30个字符！";
                return false;
            }

            if (d.ExamPlanStartDateTime == '' || d.ExamPlanEndDateTime == '') {
                $scope.ValidateExamPlanMessage = "请选择考试时间！";
                return false;
            }

            if (d.ExamPlanStartDateTime > d.ExamPlanEndDateTime) {
                $scope.ValidateExamPlanMessage = "结束日期必须大于开始日期！";
                return false;
            }
            if (d.Grade <= 0) {
                $scope.ValidateExamPlanMessage = "请选择考试年级！";
                return false;
            }
            return true;
        }

        //delete
        $scope.DeleteExamPlan = function (ep) {
            console.log("DeleteExamPlan:", ep);
            var authData = AuthService.AuthData();
            var userType = authData.userType;
            var status = $scope.GetStatus(ep, userType);

            var msg = "";
            if (status == 1) {
                msg = "您确定要删除该考试吗？";
            } if (status == 4 || status == 5) {
                msg = "一旦删除后，相关联的任务数据、成绩报告数据都将删除！请谨慎操作！";
            }
            $rootScope.openCommonModalDialog("确认", msg, function () {
                ExamForOrgService.DeleteExamPlan(ep.ExamPlanID).then(function (result) {
                    var d = result.data;
                    //console.log(d);
                    if (d.Success) {
                        $scope.SearchExamPlanList({ reset: true });
                    } else {
                        $rootScope.openCommonErrorDialog("错误", d.State);
                    }
                })
            })
        }
        //#endregion


        //#region ExamPlan Operations
        $scope.CurrentAssignRule= 0; 
        $scope.SettingMixAnswerOrder = false;
        $scope.SettingMixQuestionOrder = false;

        $scope.UpdateExamPlanSetting = function (ep) {
            $scope.settingExamOrgId = ep.ExamPlanID;
            var param = { ExamPlanID: ep.ExamPlanID };
            ExamForOrgService.GetExamPlanSetting(param).then(function (result) {
                $scope.CurrentAssignRule = result.data.PaperAssignmentRule;
                $scope.SettingMixAnswerOrder = result.data.MixAnswerOrder;
                $scope.SettingMixQuestionOrder = result.data.MixQuestionOrder;
                angular.element('#ExamSettingDialog').modal({ backdrop: 'static', keyboard: false });
            });

        }
        $scope.ViewExamPlanDetail = function (ep) {
            $state.go('examfororgdetail', { data: { 'ExamPlanID': ep.ExamPlanID, 'backState': 'examfororg' } });
        }
        $scope.SaveExamSetting = function () {
            var param =
                {
                    ExamPlanID: $scope.settingExamOrgId,
                    MixAnswerOrder: $scope.SettingMixAnswerOrder,
                    MixQuestionOrder: $scope.SettingMixQuestionOrder,
                    PaperAssignmentRule: $scope.CurrentAssignRule,
                };
            ExamForOrgService.ExamPlanSetting(param).then(function (result) {
                var d = result.data;
                //console.log(d);
                if (d.Success) {
                    angular.element('#ExamSettingDialog').modal('hide');
                    $scope.SearchExamPlanList({ reset: true });
                } else {
                    $rootScope.openCommonErrorDialog("错误", d.State);
                }
            });
        }
        $scope.CancelExamSetting = function () {
            angular.element('#ExamSettingDialog').modal('hide');
        }
        //#endregion

        //#region ExamPlan Operations
        $scope.ChooseExamRelationPaper = function (ep) {

            $state.go('selectpaperfororg', { data: { 'ExamPlanID': ep.ExamPlanID, 'backState': 'examfororg' } });
        }
        $scope.ChooseExamRelationSchool = function (ep) {
            $state.go('selectschoolfororg', { data: { 'ExamPlanID': ep.ExamPlanID, 'backState': 'examfororg' } });
        }
        //#endregion

        //#region Others

        $scope.Grade = {};
        $scope.InitGrade = function () {
            $scope.Grade = Constants.gradeItems;
            for (var i = $scope.Grade.length - 1; i >= 0; i--) {
                if ($scope.Grade[i].Grade <= 6) {
                    $scope.Grade.splice(i, 1);
                }
            }
            console.log($scope.Grade);
        }
        $scope.InitGrade();

         
        //#endregion
    }])

        /*
        * Services
        */
        .service('ExamForOrgService', function ($http, Constants) {

            var self = this;

            self.GetExamPlanList = function (param) {
                return $http.post('/api/examplan/getexamplanlist', param);
            }

            self.AddExamPlan = function (param) {
                return $http.post('/api/examplan/addexamplan', param);
            }
            self.UpdateExamPlan = function (param) {
                return $http.post('/api/examplan/updateexamplan', param);
            }
            self.GetUpdateExamPlan = function (param) {
                return $http.post('/api/examplan/getupdateexamplan', param);
            }

            self.DeleteExamPlan = function (examPlanID) {
                return $http.get('/api/examplan/deleteexamplan/' + examPlanID);
            }
            self.ExamPlanSetting = function (param) {
                return $http.post('/api/examplan/examplansetting', param);
            }
            self.GetExamPlanSetting = function (param) {
                return $http.post('/api/examplan/getexamplansetting', param);
            }
        })



});
