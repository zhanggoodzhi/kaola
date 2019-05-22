define(['angular', 'ng-table', 'ngToaster', 'bootstrap-datetimepicker', 'bootstrap-datetimepicker-locales-zh-CN'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('ExamForOrgDetailCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'ExamForOrgDetailService', '$rootScope', '$state', '$filter', 'SlideMenuService', '$timeout', function ($scope, AuthService, Constants, NgTableParams, ExamForOrgDetailService, $rootScope, $state, $filter, SlideMenuService, $timeout) {


        $scope.CurrentExamPlan = { ExamPlanID: '', ExamPlanName: '' };
        $scope.CityAreaForExamPlan = {};
        $scope.ExamPlanSchoolData = [];
        $scope.GetExamPlanList = function () {
            return [$scope.CurrentExamPlan];
        }
        //#region 处理页面跳转参数
        $scope.backState = 'examfororg';
        //console.log('params:', $state.params);
        var data = $state.params.data;
        if (data != undefined) {
            $scope.CurrentExamPlan.ExamPlanID = data.ExamPlanID;
            var bs = data.backState;
            if (bs != undefined && bs != '') {
                $scope.backState = bs;
            }
        }
        //$scope.CurrentExamPlan.ExamPlanID = "2b764be1-2564-41ae-8cff-24b571a83088";
        if ($scope.CurrentExamPlan.ExamPlanID == undefined || $scope.CurrentExamPlan.ExamPlanID == '') {
            $state.go($scope.backState);
        }

        SlideMenuService.SetActiveSideMenu('examfororg');

        $scope.Back = function () {
            if ($scope.backState != undefined && $scope.backState != '') {
                $state.go($scope.backState);
            }
        }
        //#endregion

        //#region   ExamPlan Detail

        $scope.QueryExamPlanParams = {
            ExamPlanID: ''
        }
        $scope.QueryCityAreaParams = {
            ExamPlanID: '',
        }
        $scope.QuerySchoolDataParams = {
            ExamPlanID: '',
            SchoolSearchParam: {
                CityID: '',
                AreaIDs: [],
                SchoolName: ''
            },
            SchoolTaskStatusList: [],//学校任务状态过滤参数 未开始 = 1, 进行中 = 2, 已完成 = 3, 评分中 = 4, 评分结束 = 5, 已结束 = 6, 
            SchoolDataExceptionFilter: 0,//学校数据是否有异常 ,过滤参数 0=全部, 1=正常, 2=异常 
            SchoolTablePost: {
                page: 1,
                count: 10,
                sorting: { SchoolName: 'ASC' }
            }
        }

        $scope.GetExamPlanDetail = function () {
            $scope.QueryExamPlanParams.ExamPlanID = $scope.CurrentExamPlan.ExamPlanID;

            //ExamPlan
            ExamForOrgDetailService.GetExamPlanDetail($scope.QueryExamPlanParams).then(function (result) {
                var d = result.data;
                $scope.CurrentExamPlan = d;
            })

            //CityAreaForExamPlan
            $scope.QueryCityAreaParams.ExamPlanID = $scope.CurrentExamPlan.ExamPlanID;
            ExamForOrgDetailService.GetCityAreaForExamPlan($scope.QueryCityAreaParams).then(function (result) {
                var d = result.data;
                $scope.CityAreaForExamPlan = d;
                $scope.CityAreaForExamPlan.AreaList.splice(0, 0, { AreaID: '', AreaName: '全部', CityID: d.CityID });
                $scope.QuerySchoolDataParams.SchoolSearchParam.CityID = d.CityID;
            })

            //ExamPlanSchoolData
            $scope.GetSchoolData();
        }
        $scope.SchoolTaskTable = new NgTableParams({ count: 10 }, {
            counts: [10],
            getData: function (params) {
                $scope.QuerySchoolDataParams.SchoolTablePost = params.parameters();
                $scope.QuerySchoolDataParams.ExamPlanID = $scope.CurrentExamPlan.ExamPlanID;

                return ExamForOrgDetailService.GetExamPlanSchoolData($scope.QuerySchoolDataParams).then(function (result) {
                    var d = result.data;
                    params.total(d.SchoolDataCount);
                    $scope.ExamPlanSchoolData = d;
                    return d.ExamRelationSchoolTaskDetailList;
                });
            }
        })
        $scope.GetSchoolData = function () {
            $scope.SchoolTaskTable.reload();
        }

        $scope.GetExamPlanDetail();

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

        $scope.GetPaperAssigneRule = function (ep) {
            //试卷分配规则 1 按IP地址间隔 2 按座位号 
            //console.log(ep.PaperAssignmentRule)
            if (ep.PaperAssignmentRule == 1) { return '按IP地址间隔' }

            if (ep.PaperAssignmentRule == 2) { return '按座位号间隔' }

            return '未设置';

        }
        $scope.GetListenAreaDisplayRule = function (ep) {
            //MixQuestionOrder题序打乱,MixAnswerOrder=答案打乱 
            var s = '';
            if (ep.MixQuestionOrder) {
                s += '题序打乱';
            }
            if (ep.MixAnswerOrder) {
                if (s != '') {
                    s += ',';
                }
                s += '答案打乱';
            }
            if (s == '') s = '无';
            return s;
        }



        //#region 查询过滤
        $scope.SelectArea = function (a) {
            if (a.AreaID != '') {
                $scope.QuerySchoolDataParams.SchoolSearchParam.AreaIDs = [a.AreaID];
            } else {
                $scope.QuerySchoolDataParams.SchoolSearchParam.AreaIDs = [];
                $scope.QuerySchoolDataParams.SchoolSearchParam.CityID = a.CityID;
            }
            console.log($scope.QuerySchoolDataParams);
            $scope.GetSchoolData();
        }
        $scope.IsSelect = function (a) {
            if (a.AreaID != '') {
                return $scope.QuerySchoolDataParams.SchoolSearchParam.AreaIDs[0] == a.AreaID;
            } else {
                return $scope.QuerySchoolDataParams.SchoolSearchParam.CityID == a.CityID && $scope.QuerySchoolDataParams.SchoolSearchParam.AreaIDs.length == 0;
            }
            return false;
        }

        //#endregion  

        //#endregion


        //#region Add/Update ExamPlan

        $scope.NeedUpdateExamPlan = {};
        $scope.ValidateExamPlanMessage = '';

        //update
        $scope.OpenUpdateExamPlanDialog = function (d) {

            ExamForOrgDetailService.GetUpdateExamPlan({ ExamPlanID: d.ExamPlanID }).then(function (result) {
                var d = result.data;

                $scope.NeedUpdateExamPlan = d;

                console.log($scope.NeedUpdateExamPlan);

                $("#Update_ExamPlanStartDateTime").datetimepicker({
                    format: "yyyy-mm-dd", autoclose: true, todayBtn: true, language: 'zh-CN', pickerPosition: "bottom-left",
                    minView: 2, startDate: new Date()
                });
                $("#Update_ExamPlanStartDateTime").val(DateTimeUtility.format($scope.NeedUpdateExamPlan.ExamPlanStartDateTime, 'yyyy-MM-dd'));
                $("#Update_ExamPlanEndDateTime").datetimepicker({
                    format: "yyyy-mm-dd", autoclose: true, todayBtn: true, language: 'zh-CN',
                    minView: 2, startDate: new Date()
                });
                $("#Update_ExamPlanEndDateTime").val(DateTimeUtility.format($scope.NeedUpdateExamPlan.ExamPlanEndDateTime, 'yyyy-MM-dd'));

                angular.element('#UpdateExamPlanDialog').modal('show');

            })

        }
        $scope.UpdateExamPlan = function () {
            $scope.NeedUpdateExamPlan.ExamPlanStartDateTime = $("#Update_ExamPlanStartDateTime").val();
            $scope.NeedUpdateExamPlan.ExamPlanEndDateTime = $("#Update_ExamPlanEndDateTime").val();

            if ($scope.ValidateExamPlan($scope.NeedUpdateExamPlan) == false) {
                return;
            }

            ExamForOrgDetailService.UpdateExamPlan($scope.NeedUpdateExamPlan).then(function (result) {
                var d = result.data;
                //console.log(d);
                if (d.Success) {
                    angular.element('#UpdateExamPlanDialog').modal('hide');
                    $scope.GetExamPlanDetail({ reset: true });
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
            console.log("ValidateExamPlan:", d);
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
                ExamForOrgDetailService.DeleteExamPlan(ep.ExamPlanID).then(function (result) {
                    var d = result.data;
                    //console.log(d);
                    if (d.Success) {
                        $scope.GetExamPlanDetail({ reset: true });
                    } else {
                        $rootScope.openCommonErrorDialog("错误", d.State);
                    }
                })
            })
        }
        //#endregion


        //#region ExamPlan Operations
        $scope.UpdateExamPlanSetting = function (ep) {
            $scope.settingExamOrgId = ep.ExamPlanID;
            $scope.CurrentAssignRule = ep.PaperAssignmentRule;
            $scope.SettingMixAnswerOrder = ep.MixAnswerOrder;
            $scope.SettingMixQuestionOrder = ep.MixQuestionOrder;
            angular.element('#ExamSettingDialog').modal({ backdrop: 'static', keyboard: false });
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
            ExamForOrgDetailService.ExamPlanSetting(param).then(function (result) {
                var d = result.data;
                //console.log(d);
                if (d.Success) {
                    angular.element('#ExamSettingDialog').modal('hide');
                    $scope.GetExamPlanDetail({ reset: true });
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

            $state.go('selectpaperfororg', { data: { 'ExamPlanID': ep.ExamPlanID, 'backState': 'examfororgdetail' } });
        }
        $scope.ChooseExamRelationSchool = function (ep) {
            $state.go('selectschoolfororg', { data: { 'ExamPlanID': ep.ExamPlanID, 'backState': 'examfororgdetail' } });
        }
        //#endregion


        //#region 生成考试任务
        $scope.GenerateTaskInfo = {};
        $scope.GenerateTask = function (ep) {
            ExamForOrgDetailService.GetGenerateTaskInfo({ ExamPlanID: ep.ExamPlanID }).then(function (result) {
                var d = result.data;
                $scope.GenerateTaskInfo = d;
                angular.element('#ConfirmGenerateTaskDialog').modal('show');
            })
        }

        $scope.JobList = [];
        $scope.GetProcessValueTimer = null;
        $scope.GetProcessValueTimerInterval = 5000;
        $scope.DialogProcessValue = 0;
        $scope.DialogProcessErrorMessage = "";

        $scope.ConfirmGenerateTask = function (ep) {
            $scope.DialogProcessErrorMessage = "";
            ExamForOrgDetailService.StartGenerateTask({
                DataType: 1,
                ExamPlanID: $scope.CurrentExamPlan.ExamPlanID,
                HasDone: $scope.GetHasDone()
            }).then(function (result) {
                var d = result.data;
                console.log("start new generate task:", d);

                angular.element('#ConfirmGenerateTaskDialog').modal('hide');
                angular.element('#GenerateTaskProgressDialog').modal({ backdrop: 'static', keyboard: false });

                $scope.GetRunningJobs();
                $scope.ProcessHandler = $scope.ProcessForExamPlan;

            }, function (error) {
                console.log('start new generate task with error:', error);
                $rootScope.openCommonErrorDialog('错误', '生成考试任务作业启动出错');
            })
        }
        $scope.ReGenerateAllTask = function (ep) {
            var msg = "您确定要批量重新生成考试任务吗？重新生成后，对应任务需要重新组织考试，请谨慎操作！";
            $rootScope.openCommonModalDialog("确认", msg, function () {
                $scope.ConfirmGenerateTask(ep);
            });
        }

        $scope.ProcessHandler = undefined;
        $scope.ProcessSchoolID = undefined;
        $scope.ProcessForExamPlan = function () {
            $scope.DialogProcessValue = 0;
            $scope.DialogProcessErrorMessage = "";

            var examPlanJob = undefined;
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (!item.SchoolID) {
                        examPlanJob = item;
                        break;
                    }
                }
            }
            if (!examPlanJob) {
                return;
            }
            var ProcessValue = examPlanJob.ProcessValue;
            var TotalValue = Math.max(examPlanJob.TotalValue, 1);

            $scope.DialogProcessValue = Math.round(ProcessValue * 100.0 / TotalValue, 0);
            if (examPlanJob.Result && examPlanJob.Result.ErrorMsg) {
                $scope.DialogProcessErrorMessage = examPlanJob.Result.ErrorMsg;
            }
            if (TotalValue > 0 && ProcessValue == TotalValue) {
                $timeout(function () { angular.element('#GenerateTaskProgressDialog').modal('hide'); }, 1000);
            }
        }
        $scope.ProcessForSchool = function () {
            $scope.DialogProcessValue = 0;
            $scope.DialogProcessErrorMessage = "";

            var schoolJob = undefined;
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (item.SchoolID == $scope.ProcessSchoolID) {
                        schoolJob = item;
                        break;
                    }
                }
            }
            if (!schoolJob) {
                return;
            }
            var ProcessValue = schoolJob.ProcessValue;
            var TotalValue = Math.max(schoolJob.TotalValue, 1);
            $scope.DialogProcessValue = Math.round(ProcessValue * 100.0 / TotalValue, 0);

            if (schoolJob.Result && schoolJob.Result.ErrorMsg) {
                $scope.DialogProcessErrorMessage = schoolJob.Result.ErrorMsg;
            }
            if (TotalValue > 0 && ProcessValue == TotalValue) {
                $timeout(function () { angular.element('#GenerateTaskProgressDialog').modal('hide'); }, 1000);
            }
        }
        angular.element('#GenerateTaskProgressDialog').on('hidden.bs.modal', function () {
            $scope.GetSchoolData();
        });

        $scope.GenerateTaskForSchool = function (t) {
            console.log("GenerateTaskForSchool:", t.SchoolID);
            $rootScope.openCommonModalDialog("确认", "确定要生成该学校的任务?", function () {
                ExamForOrgDetailService.GenerateTaskBySchool({
                    ExamPlanID: $scope.CurrentExamPlan.ExamPlanID,
                    SchoolID: t.SchoolID,
                    DataType: 1
                }).then(function (result) {
                    var d = result.data;
                    console.log(d);

                    angular.element('#GenerateTaskProgressDialog').modal({ backdrop: 'static', keyboard: false });
                    $scope.GetRunningJobs();
                    $scope.ProcessSchoolID = t.SchoolID;
                    $scope.ProcessHandler = $scope.ProcessForSchool;
                    $scope.GetSchoolData();

                })
            })
        }
        $scope.ReGenerateTask = function (taskID) {
            console.log("ReGenerateTask:", taskID);

            $rootScope.openCommonModalDialog("确认", "确定要重新生成该任务?", function () {
                ExamForOrgDetailService.ReGenerateTask({
                    ExamPlanID: $scope.CurrentExamPlan.ExamPlanID,
                    TaskID: taskID
                }).then(function (result) {
                    var d = result.data;
                    console.log(d);
                    if (d.Success == false) {
                        $rootScope.openCommonErrorDialog("错误", "重新生成该任务失败");
                    }
                    $scope.GetSchoolData();
                    $scope.GetRunningJobs();
                })
            })
        }

        $scope.DeleteTask = function (taskID) {
            console.log("DeleteTask:", taskID);
            $rootScope.openCommonModalDialog("确认", "确定要删除该任务?", function () {
                ExamForOrgDetailService.DeleteTask({
                    ExamPlanID: $scope.CurrentExamPlan.ExamPlanID,
                    TaskID: taskID
                }).then(function (result) {
                    var d = result.data;
                    console.log(d);
                    $scope.GetSchoolData();
                })
            })
        }

        //#region 按钮的状态控制
        $scope.GetHasDone = function () {
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (!item.SchoolID) {
                        return item.HasDone;

                    }
                }
            }
            return false;
        }
        $scope.ShowGenerateTaskButton = function () {

            var hasTaskGenerated = false;
            if ($scope.ExamPlanSchoolData && $scope.ExamPlanSchoolData.ExamRelationSchoolTaskDetailList && $scope.ExamPlanSchoolData.ExamRelationSchoolTaskDetailList.length > 0) {
                //console.log($scope.ExamPlanSchoolData);
                var schoolTaskList = $scope.ExamPlanSchoolData.ExamRelationSchoolTaskDetailList;
                for (var tIndex = 0; tIndex < schoolTaskList.length; tIndex++) {
                    if (schoolTaskList[tIndex].TaskGeneratedCount > 0) {
                        //已经生成了任务
                        hasTaskGenerated = true;
                        break;
                    }
                }
            }
            ///没有生成任务,才能显示一键生成
            if (hasTaskGenerated) { return false; }

            var examPlanJob = undefined;
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (!item.SchoolID) {
                        examPlanJob = item;
                        break;
                    }
                }
            }
            //没有关联job 
            if (!examPlanJob) {
                return true;
            }

            return false;
        }
        $scope.ShowReGenerateAllTaskButton = function () {

            var hasTaskGenerated = false;
            if ($scope.ExamPlanSchoolData && $scope.ExamPlanSchoolData.ExamRelationSchoolTaskDetailList && $scope.ExamPlanSchoolData.ExamRelationSchoolTaskDetailList.length > 0) {
                //console.log($scope.ExamPlanSchoolData);
                var schoolTaskList = $scope.ExamPlanSchoolData.ExamRelationSchoolTaskDetailList;
                for (var tIndex = 0; tIndex < schoolTaskList.length; tIndex++) {
                    if (schoolTaskList[tIndex].TaskGeneratedCount > 0) {
                        //已经生成了任务
                        hasTaskGenerated = true;
                        break;
                    }
                }
            }

            var examPlanJob = undefined;
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (!item.SchoolID) {
                        examPlanJob = item;
                        break;
                    }
                }
            }

            //有关联job, 看关联job的状态
            if (examPlanJob) {
                var guid = examPlanJob.Guid;
                var status = examPlanJob.Status;
                var hasDone = examPlanJob.HasDone;

                if (guid && (status >= 2)) {
                    // 已完成, 执行异常, 执行完成_有数据错误
                    //console.log('ShowReGenerateTaskButton true');
                    return true;
                }
            } else {
                //没有关联job,但是已经生成了任务, 则显示重新生成按钮
                if (hasTaskGenerated) {
                    return true;
                }
            }
            return false;
        }

        $scope.CheckAllowGenerateTaskForSchool = function (t) {
            var schoolID = t.SchoolID;
            var examPlanJob = undefined;
            var schoolJob = undefined;
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (!item.SchoolID) {
                        examPlanJob = item;
                    }
                    if (item.SchoolID == schoolID) {
                        schoolJob = item;
                    }

                    if (examPlanJob && schoolJob) {
                        break;
                    }
                }
            }
            if (!examPlanJob && !schoolJob) {
                return true;
            }
            if (examPlanJob) {
                var guid = examPlanJob.Guid;
                var status = examPlanJob.Status;
                var hasDone = examPlanJob.HasDone;
                if (guid && (status == 0 || status == 1)) {
                    //未开始,进行中,已完成
                    //批量生成考试任务的job正在运行, 不允许再单独执行生成学校任务
                    return false;
                }
            }
            if (!schoolJob) {
                return true;
            }
            var schoolJobGuid = schoolJob.Guid;
            var schoolJobStatus = schoolJob.Status;
            if (schoolJobGuid && (schoolJobStatus == 0 || schoolJobStatus == 1)) {
                //生成学校任务的job正在运行, 不允许再执行
                return false;
            }
            else {
                return true;
            }
        }
        $scope.CheckRunningGenerateTaskForSchool = function (t) {
            var schoolID = t.SchoolID;
            var schoolJob = undefined;
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];

                    if (item.SchoolID == schoolID) {
                        schoolJob = item;
                        break;
                    }
                }
            }

            if (!schoolJob) {
                return false;
            }
            var schoolJobGuid = schoolJob.Guid;
            var schoolJobStatus = schoolJob.Status;
            if (schoolJobGuid && (schoolJobStatus == 0 || schoolJobStatus == 1)) {
                //生成学校任务的job正在运行, 不允许再执行
                return true;
            }
            return false;
        }

        $scope.ShowGenerateAllTaskProgress = function () {
            var examPlanJob = undefined;
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (!item.SchoolID) {
                        examPlanJob = item;
                        break;
                    }
                }
            }
            if (!examPlanJob) {
                return false;
            }
            var status = examPlanJob.Status;
            if (status == 0 || status == 1) {
                return true;
            }
            return false;
        }
        $scope.GetGenerateAllTaskProgress = function () {
            var examPlanJob = undefined;
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (!item.SchoolID) {
                        examPlanJob = item;
                        break;
                    }
                }
            }
            if (!examPlanJob) {
                return 0;
            }
            var ProcessValue = examPlanJob.ProcessValue;
            var TotalValue = Math.max(examPlanJob.TotalValue, 1);
            return Math.round(ProcessValue * 100.0 / TotalValue, 0);
        }
        //#endregion 

        //#region 查询系统中是否已经有运行中的job

        $scope.GetRunningJobs = function () {
            ExamForOrgDetailService.GetRunningJob({
                examPlanID: $scope.CurrentExamPlan.ExamPlanID,
                dataType: 1
            }).then(function (result) {
                var d = result.data;
                if (d != undefined && d.length > 0) {
                    console.log('找到与该考试' + $scope.CurrentExamPlan.ExamPlanID + '关联的任务列表:', d);
                    $scope.JobList = d;
                    if ($scope.ProcessHandler) {
                        $scope.ProcessHandler();
                    }
                    //start timer to retrieve job status
                    if ($scope.GetProcessValueTimer) {
                        $timeout.cancel($scope.GetProcessValueTimer);
                    }
                    if ($scope.CanStartTimer()) {
                        $scope.GetProcessValueTimer = $timeout(function () { $scope.GetRunningJobs() }, $scope.GetProcessValueTimerInterval);
                    }

                } else {
                    console.log('未找到与该考试' + $scope.CurrentExamPlan.ExamPlanID + '关联的任务列表');
                    $scope.JobList = [];
                }
            })
        }
        $scope.CanStartTimer = function () {
            if ($scope.JobList && $scope.JobList.length > 0) {
                for (var i = 0; i < $scope.JobList.length; i++) {
                    var item = $scope.JobList[i];
                    if (item.Status == 0 || item.Status == 1) {
                        //存在job: 未开始,进行中
                        return true;
                    }
                }
            }
            return false;
        }
        $scope.GetRunningJobs();
        //#endregion


        //#region 考试任务详情
        $scope.UpdateSchoolDataExceptionFilter = function (f) {
            $scope.QuerySchoolDataParams.SchoolDataExceptionFilter = f;
            $scope.GetSchoolData();
        }
        $scope.ViewTaskList = function (t, type, clearPreviousDiv) {
            if (clearPreviousDiv == undefined) clearPreviousDiv = false;
            var delayTime = 100;
            //console.log(t);
            var schoolID = t.SchoolID;
            var trElement = angular.element('#tr_' + schoolID)[0];
            if (trElement) {
                var expandDivID = 'expand-tr-' + schoolID;
                var findExpandDiv = angular.element('#' + expandDivID)[0];
                if (findExpandDiv) {
                    //$(findExpandDiv).slideToggle(delayTime);
                    var isDisplay = $(findExpandDiv).is(":visible");
                    if (isDisplay == false) {
                        $(findExpandDiv).slideDown(delayTime);
                    } else {
                        $(findExpandDiv).slideUp(delayTime);
                    }
                }
                else {

                    if (clearPreviousDiv) {
                        var previousDivs = $('.expand-tr');
                        if (previousDivs && previousDivs.length > 0) {
                            for (var i = 0; i < previousDivs.length; i++) {
                                $(previousDivs[i]).slideUp(delayTime, function () {
                                    $(this).remove();
                                })
                            }
                        }
                    }

                    var newDiv = document.createElement('tr');
                    $(newDiv).attr('id', 'expand-tr-' + schoolID);
                    $(newDiv).addClass('expand-tr');

                    var tableElement = $(trElement).parents("table")[0];
                    var thCount = $(tableElement).find(".ng-table-sort-header th").length;
                    //console.log("thCount:", thCount);

                    var tdHtml = $scope.GenerateHTMLFragment(t, type);

                    newDiv.innerHTML = '<td colspan="' + thCount + '">' + tdHtml + '</td>';
                    $(newDiv).insertAfter(trElement);
                    $(newDiv).slideDown(delayTime);

                }


            }
        }
        $scope.GenerateHTMLFragment = function (t, type) {
            //console.log(t);
            var htmlStr = '';

            var opColWidth = "230px";

            if (t.SchoolClassTaskList && t.SchoolClassTaskList.length > 0) {
                for (var i = 0; i < t.SchoolClassTaskList.length; i++) {
                    var item = t.SchoolClassTaskList[i];
                    var clickEvent = "angular.element(this).scope().ReGenerateTask('" + item.TaskID + "')";
                    var clickEvent2 = "angular.element(this).scope().DeleteTask('" + item.TaskID + "')";
                    htmlStr += '<div class="expand-tr-td-div">'
                            + '<div class="frag-task-name">' + item.TaskName + '</div>'
                            + '<div class="frag-operation" style="width:' + opColWidth + ';"><a class="operation-a" href="javascript:void(0)" onclick="' + clickEvent + '">重新生成</a><a class="operation-a" href="javascript:void(0)" onclick="' + clickEvent2 + '">删除</a></div>'
                            + '</div>'
                }
            }
            return htmlStr;
        }


        //#endregion


        $scope.$on("$destroy", function (event) {
            console.log('$destroy');
            if ($scope.GetProcessValueTimer) {
                $timeout.cancel($scope.GetProcessValueTimer);
            }
        });
    }])

/*
* Services
*/
    .service('ExamForOrgDetailService', function ($http, Constants) {

        var self = this;

        self.GetExamPlanDetail = function (param) {
            return $http.get('/api/examplan/getExamPlanDetail/' + param.ExamPlanID);
        }
        self.GetCityAreaForExamPlan = function (param) {
            return $http.get('/api/examplan/getCityAreaForExamPlan/' + param.ExamPlanID);
        }
        self.GetExamPlanSchoolData = function (param) {
            return $http.post('/api/examplan/getExamPlanSchoolData', param);
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

        //任务生成
        self.GetGenerateTaskInfo = function (param) {
            return $http.post('/api/examPlanTask/getGenerateTaskInfo', param);
        }

        self.ReGenerateTask = function (param) {
            return $http.post('/api/examPlanTask/reGenerateTask', param);
        }

        self.GetProcessValue = function (param) {
            return $http.get('/api/examPlanTask/getProcessValue/' + param.taskGuid);
        }

        self.StartGenerateTask = function (param) {
            return $http.post('/api/examPlanTask/startGenerateTask', param);
        }
        self.GetRunningJob = function (param) {
            return $http.get('/api/examPlanTask/getRunningJob/' + param.dataType + "/" + param.examPlanID);
        }

        self.DeleteTask = function (param) {
            return $http.post('/api/examPlanTask/deleteTask', param);
        }
        self.GenerateTaskBySchool = function (param) {
            return $http.post('/api/examPlanTask/generateTaskBySchool', param);
        }

    })



});
