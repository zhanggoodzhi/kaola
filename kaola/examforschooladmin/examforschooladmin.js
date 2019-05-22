define(['angular', 'ng-table', 'ngToaster', 'bootstrap-datetimepicker', 'bootstrap-datetimepicker-locales-zh-CN'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app')
        .controller('ExamForSchoolAdminCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', '$state', '$stateParams', 'ExamForSchoolAdminService', '$rootScope', '$timeout', function ($scope, AuthService, Constants, NgTableParams, $state, $stateParams, ExamForSchoolAdminService, $rootScope, $timeout) {
            $scope.PlanDetailList = [];
            $scope.ShowLoadMore = true;
            $scope.CurrentExamPlanID = '';
            $scope.QueryParams = {
                PostParams: {
                    page: 1,
                    count: 5,
                    sorting: { ExamPlanStartDateTime: 'DESC' }
                }
            }
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
            $scope.SearchPlanDetailList = function (p) {
                if (p != undefined && p.reset != undefined & p.reset == true) {
                    $scope.QueryParams.PostParams.page = 1;
                    $scope.ShowLoadMore = true;
                    $scope.PlanDetailList =[];
                }
                ExamForSchoolAdminService.GetExamPlanDetailList($scope.QueryParams).then(function (results) {
                    if (p != undefined && p.reset != undefined & p.reset == true) {
                        $scope.PlanDetailList.splice(0, $scope.PlanDetailList.length);
                    }
                    var d = results.data;
                    if (d.ExamPlanDetailList.length > 0) {
                        for (var i = 0; i < d.ExamPlanDetailList.length; i++) {
                            var findSameExamPlanID = false;
                            for (var j = 0; j < $scope.PlanDetailList.length; j++) {
                                if (d.ExamPlanDetailList[i].ExamPlan.ExamPlanID == $scope.PlanDetailList[j].ExamPlan.ExamPlanID) {
                                    $scope.PlanDetailList[j] = d.ExamPlanDetailList[i];
                                    findSameExamPlanID = true;
                                    break;
                                }
                            }
                            if (findSameExamPlanID == false) {
                                $scope.PlanDetailList.push(d.ExamPlanDetailList[i]);
                            }
                        }
                        if (d.ExamPlanDetailList.length >= $scope.QueryParams.PostParams.count) {
                            $scope.QueryParams.PostParams.page++;
                        } else {
                            $scope.ShowLoadMore = false;
                        }
                    }
                    console.log("PlanDetailList：", $scope.PlanDetailList);
                });
            }
            $scope.SearchPlanDetailList();
            $scope.OpenSelectClassDialog = function (plan) {
                $scope.CurrentExamPlanID = plan.ExamPlanID;
                $scope.SelectedClassList.reload();
                $scope.SelectAllClassTag = false;
                $scope.SelectClassCount = 0;
                angular.element('#SelectClassDialog').modal({ backdrop: 'static', keyboard: false });
            };
            $scope.OpenAddExamPlanDialog = function () {
                //$scope.CurrentExamPlan = $scope.InitExamPlan();
                ////console.log($scope.CurrentExamPlan);ssss
                $state.go('examforschooladmin.addnewschoolexamplan', { data: { 'dialogElement': 'AddExamPlanDialog' } });
                angular.element('#AddExamPlanDialog').modal('show');
            }
            $scope.OpenUpdateExamPlanDialog = function (ep) {
                //$scope.CurrentExamPlan = $scope.InitExamPlan();
                ////console.log($scope.CurrentExamPlan);ssss
                $scope.CurrentExamPlanID = ep.ExamPlanID;
                $scope.CurrentExamPlan = $scope.InitExamPlan(ep);
                angular.element('#EditExamPlanDialog').modal('show');
                $scope.ValidateExamPlanMessage = '';
            }
            $scope.EditExamPlan = function () {
                ExamForSchoolAdminService.UpdateSchoolExamPlan($scope.CurrentExamPlan).then(function (result) {
                    var d = result.data;
                    if (d.Success) {
                        $scope.SearchPlanDetailList();
                        angular.element('#SelectClassDialog').modal('hide');
                } else {
                        $rootScope.openCommonErrorDialog("错误", d.State);
                        }
                });
            }
            $scope.InitExamPlan = function (d) {
                if (d != undefined) {
                    var newD = {
                    };
                    newD.ExamPlanID = d.ExamPlanID;
                    newD.ExamPlanName = d.ExamPlanName;
                    newD.ExamPlanStartDateTime = DateTimeUtility.format(new Date(d.ExamPlanStartDateTime), 'yyyy-MM-dd');
                    newD.ExamPlanEndDateTime = DateTimeUtility.format(new Date(d.ExamPlanEndDateTime), 'yyyy-MM-dd');
                    newD.PaperAssignRule = d.PaperAssignmentRule;
                    newD.MixAnswerOrder = d.MixAnswerOrder;
                    newD.MixQuestionOrder = d.MixQuestionOrder;
                    return newD;
                } else {
                    return {
                        ExamPlanID: '',
                        ExamPlanName: '',
                        ExamPlanStartDateTime: DateTimeUtility.format(new Date(), 'yyyy-MM-dd'),
                        ExamPlanEndDateTime: DateTimeUtility.format(new Date(), 'yyyy-MM-dd'),
                        Grade: '',
                        ExamLevel: 2,
                        PaperAssignRule: 1,
                        MixAnswerOrder: false,
                        MixQuestionOrder: false
                    }
                }
            }
            angular.element('#AddExamPlanDialog').on('hidden.bs.modal', function () {
                console.log("AddExamPlanDialog dismiss and go back to state [examforschooladmin]");
                $state.go('examforschooladmin');
                $scope.SearchPlanDetailList({reset:true});
            });
            $scope.DeleteExamPlan = function (ep) {
                $rootScope.openCommonModalDialog("确认", "是否确定删除该考试？", function () {
                    ExamForSchoolAdminService.DeleteSchoolExamPlan(ep).then(function (result) {
                        var d = result.data;
                        //console.log(d);
                        if (d.Success) {
                            $scope.SearchPlanDetailList({ reset: true });
                        } else {
                            $rootScope.openCommonErrorDialog("错误", d.State);
                        }
                    })
                })
        }
            $scope.SelectedClassList = new NgTableParams({
                count: 10
            }, {
                counts: [10],
                getData: function (params) {
                    var param = {
                        ExamPlanID: $scope.CurrentExamPlanID
                    };
                    param.PostParams = params.parameters();
                    return ExamForSchoolAdminService.GetSelectClassList(param).then(function (results) {
                        return results.data;
                    });
                }
            });
            $scope.SelectAllClassTag = false;
            $scope.SelectAllClass = function (event) {
                event.stopPropagation(); // 阻止事件冒泡
                $scope.SelectAllClassTag = $scope.SelectAllClassTag ? false : true;
                $scope.SelectAll($scope.SelectedClassList.data, $scope.SelectAllClassTag);
                $scope.SelectClassCount = GetSelectedClass($scope.SelectedClassList.data).length;
            }
            function GetSelectedClass(data) {
                $scope.SelectedClass = [];
                if (angular.isArray(data) && data.length > 0) {
                    angular.forEach(data, function (item, i) {
                        if (item.Selected == 1 || item.Selected == "1") {
                            $scope.SelectedClass.push(item.ClassID);
                        }
                    });
                }
                return $scope.SelectedClass;
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
            $scope.ChooseClass = function (chooseClassID) {
                var data = $scope.SelectedClassList.data;
                if (chooseClassID != undefined && chooseClassID != null) {
                    if (angular.isArray(data) && data.length > 0) {
                        for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                            if (data[dataIndex].ClassID == chooseClassID) {
                                if (data[dataIndex].Selected == 1) {
                                    data[dataIndex].Selected = 0;
                                }
                                else {
                                    data[dataIndex].Selected = 1;
                                }
                                break;
                            }
                        }
                    }
                };
                $scope.SelectClassCount = GetSelectedClass(data).length;
            }
            $scope.CancleSelect = function () {
                angular.element('#SelectClassDialog').modal('hide');
            };
            $scope.CancleEdit = function () {
                angular.element('#EditExamPlanDialog').modal('hide');
            };
            $scope.SaveExamPlanClass = function () {
                var params = {
                    ClassIDs: $scope.SelectedClass,
                    ExamPlanID: $scope.CurrentExamPlanID
                };
                ExamForSchoolAdminService.SaveExamClassList(params).then(function (result) {
                    var d = result.data;
                    if (d.Success) {
                        $scope.SearchPlanDetailList();
                        angular.element('#SelectClassDialog').modal('hide');
                    } else {
                        $rootScope.openCommonErrorDialog("错误", d.State);
                    }
                });
            }
            $scope.RemoveExamPlanClass = function (ClassID, ExamPlanID) {
                var params = {
                    ClassID: ClassID,
                    ExamPlanID: ExamPlanID
                };
                ExamForSchoolAdminService.RemoveExamClass(params).then(function (result) {
                    var d = result.data;
                    if (d.Success) {
                        $rootScope.openCommonInfoDialog("提示", "移除成功！");
                        $scope.SearchPlanDetailList();
                    } else {
                        $rootScope.openCommonErrorDialog("错误", d.State);
                    }
                });
            }
            ////------------- 开始机器评分
            $scope.TaskAnswerLackStudentTable = new NgTableParams({ count: 9999 }, {
                counts: [],
                dataset: []
            });
            $scope.StartMarkTaskID = '';
            $scope.StartMark = function (taskID, directlyStartMark) {

                angular.element('#ImportSummaryInfoDialog').modal('hide');

                $scope.StartMarkTaskID = taskID;

                //直接开始, 不需要再确认
                if (directlyStartMark != undefined && directlyStartMark != null && directlyStartMark != "" && directlyStartMark == true) {
                    $scope.ConfirmStartMark();
                    return;
                }

                //显示任务的答卷包统计信息
                ExamForSchoolAdminService.GetTaskAnswerImportSummaryInfo($scope.StartMarkTaskID).then(function (result) {
                    if (result.data != undefined) {
                        $scope.TaskAnswerImportSummaryData = result.data;
                        $scope.TaskAnswerLackStudentTable.settings({
                            dataset: $scope.TaskAnswerImportSummaryData.LackStudentList
                        });
                        angular.element("#TaskAnswerImportSummaryInfoDialog").modal({ backdrop: 'static', keyboard: false });
                    }
                });

            }
            $scope.ConfirmStartMark = function () {
                var newTaskStatus = 4;//评分中
                ExamForSchoolAdminService.UpdateTaskStatus($scope.StartMarkTaskID, newTaskStatus).then(function (result) {
                    $scope.TaskList.reload();
                    angular.element('#TaskAnswerImportSummaryInfoDialog').modal('hide');
                });
            }
            ////------------- 开始机器评分
            /////----------下载离线任务包-----
            $scope.GenerateTaskPackagePercent = 10;
            $scope.updateGenerateTaskPackagePercent = function () {
                $scope.updateGenerateTaskPackagePercentTimer = $timeout(function () {
                    if ($scope.GenerateTaskPackagePercent > 80) {
                        //nothing to do 
                    } else {
                        $scope.GenerateTaskPackagePercent += 5;
                    }

                    $scope.updateGenerateTaskPackagePercent();

                }, 500);
            }
            $scope.updateGenerateTaskPackagePercentTimer = null;
            $scope.OpenGenerateTaskPackageDialog = function (taskID) {

                angular.element("#GenerateTaskPackageDialog").modal({ backdrop: 'static', keyboard: false });
                $scope.GenerateTaskPackagePercent = 0;

                $scope.updateGenerateTaskPackagePercent();

                ExamForSchoolAdminService.GenerateTaskPackage(taskID).then(function (response) {

                    if ($scope.updateGenerateTaskPackagePercentTimer != null) {
                        $timeout.cancel($scope.updateGenerateTaskPackagePercentTimer);
                    }

                    $scope.GenerateTaskPackagePercent = 100;

                    angular.element("#GenerateTaskPackageDialog").modal("hide");

                    var taskPackageFilePath = response.data;
                    taskPackageFilePath = taskPackageFilePath.replace(/\"/g, "");

                    if (taskPackageFilePath != undefined) {
                        var href = GLOBAL_API_URL + "api/task/download/" + taskPackageFilePath;
                        if (href != undefined && href != null && href != "") {
                            console.log(href);
                            window.open(href, '_self');
                        }
                    }

                }, function (error) {
                    console.log(error);
                    if ($scope.updateGenerateTaskPackagePercentTimer != null) {
                        $timeout.cancel($scope.updateGenerateTaskPackagePercentTimer);
                    }
                    $scope.GenerateTaskPackagePercent = 0;
                    angular.element("#GenerateTaskPackageDialog").modal("hide");

                    $rootScope.openCommonErrorDialog("错误", "生成任务包文件错误");
                });
            }
        }])
        .controller("AddExamPlanForSchoolAdminCtrl", ['$scope', 'AuthService', 'Constants', 'NgTableParams', '$state', '$stateParams', 'ExamForSchoolAdminService', '$rootScope', '$timeout', function ($scope, AuthService, Constants, NgTableParams, $state, $stateParams, ExamForSchoolAdminService, $rootScope, $timeout) {
            $scope.CurrentStep = 1;
            $scope.CurrentExamPlan = {
            };
            $scope.SelectAllClassTag = false;
            $scope.SelectClassCount = 0;
            $scope.ValidateExamPlanMessage = '';
            $scope.Filter = {
                SelectPaperTemplate: "",
                IsCustomPaper: 0
            }
            function InitDateTimePicker() {
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
            }

            //-----新增考试-------//
            $scope.InitExamPlan = function (d) {
                if (d != undefined) {
                    var newD = {
                    };
                    newD.ExamPlanID = d.ExamPlanID;
                    newD.ExamPlanName = d.ExamPlanName;
                    newD.ExamPlanStartDateTime = DateTimeUtility.format(new Date(d.ExamPlanStartDateTime), 'yyyy-MM-dd');
                    newD.ExamPlanEndDateTime = DateTimeUtility.format(new Date(d.ExamPlanEndDateTime), 'yyyy-MM-dd');
                    newD.Grade = d.Grade;
                    newD.ExamLevel = d.ExamLevel;
                    newD.PaperAssignRule = d.PaperAssignRule;
                    newD.MixAnswerOrder = d.MixAnswerOrder;
                    newD.MixQuestionOrder = d.MixQuestionOrder;
                    return newD;
                } else {
                    return {
                        ExamPlanID: '',
                        ExamPlanName: '',
                        ExamPlanStartDateTime: DateTimeUtility.format(new Date(), 'yyyy-MM-dd'),
                        ExamPlanEndDateTime: DateTimeUtility.format(new Date(), 'yyyy-MM-dd'),
                        Grade: '',
                        ExamLevel: 2,
                        PaperAssignRule: 1,
                        MixAnswerOrder: false,
                        MixQuestionOrder: false
                    }
                }
            }
            $scope.CurrentExamPlan = $scope.InitExamPlan();
            InitDateTimePicker();
            $scope.GoToNextStep = function () {
                if ($scope.CurrentStep == 1) {
                    //如果是第一步
                    //保存ExamPlan基本信息
                    $scope.AddSchoolExamPlan();
                    return;
                }
                if ($scope.CurrentStep == 2) {
                    //如果是第二步
                    //保存班级信息
                    $scope.AddExamPlanClass();
                    return;
                }
            };

            $scope.GoToPreStep = function () {
                $scope.CurrentStep--;
            }

            $scope.FinishAddExamPlan = function () {
                $scope.CurrentExamPlan.ClassList = $scope.SelectedClass;
                $scope.CurrentExamPlan.PaperList = $scope.SelectedPaper;
                ExamForSchoolAdminService.AddSchoolExamPlan($scope.CurrentExamPlan).then(function (result) {
                    if (result.data.Success) {
                        angular.element("#AddExamPlanDialog").modal("hide");
                    }
                });
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

            $scope.AddSchoolExamPlan = function () {
                $scope.CurrentExamPlan.ExamPlanStartDateTime = $("#Add_ExamPlanStartDateTime").val();
                $scope.CurrentExamPlan.ExamPlanEndDateTime = $("#Add_ExamPlanEndDateTime").val();
                if ($scope.ValidateExamPlan($scope.CurrentExamPlan) == false) {
                    return;
                }
                $scope.CurrentStep = 2;
            }
            $scope.SelectedClassList = new NgTableParams({
                count: 10
            }, {
                counts: [10],
                getData: function (params) {
                    var param = {
                        ExamPlanID: $scope.CurrentExamPlanID
                    };
                    param.PostParams = params.parameters();
                    return ExamForSchoolAdminService.GetSelectClassList(param).then(function (results) {
                        return results.data;
                    });
                }
            });
            $scope.SelectedClass = [];
            $scope.SelectAllClassTag = false;
            $scope.SelectAllClass = function (event) {
                event.stopPropagation(); // 阻止事件冒泡
                $scope.SelectAllClassTag = $scope.SelectAllClassTag ? false : true;
                $scope.SelectAll($scope.SelectedClassList.data, $scope.SelectAllClassTag);
                $scope.SelectClassCount = GetSelectedClass($scope.SelectedClassList.data).length;
            }
            function GetSelectedClass(data) {
                $scope.SelectedClass = [];
                if (angular.isArray(data) && data.length > 0) {
                    angular.forEach(data, function (item, i) {
                        if (item.Selected == 1 || item.Selected == "1") {
                            var classItem = {
                                ClassID: item.ClassID,
                                ClassName: item.ClassName
                            };
                            $scope.SelectedClass.push(classItem);
                        }
                    });
                }
                return $scope.SelectedClass;
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
            $scope.ChooseClass = function (chooseClassID) {
                var data = $scope.SelectedClassList.data;
                if (chooseClassID != undefined && chooseClassID != null) {
                    if (angular.isArray(data) && data.length > 0) {
                        for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                            if (data[dataIndex].ClassID == chooseClassID) {
                                if (data[dataIndex].Selected == 1) {
                                    data[dataIndex].Selected = 0;
                                }
                                else {
                                    data[dataIndex].Selected = 1;
                                }
                                break;
                            }
                        }
                    }
                };
                $scope.SelectClassCount = GetSelectedClass(data).length;
            }
            $scope.AddExamPlanClass = function () {
                if ($scope.SelectedClass.length > 0) {
                    $scope.CurrentStep++;
                    $scope.LoadPaperList();
                }
                else {
                    $rootScope.openCommonErrorDialog("错误", "请选择班级");
                }
                
            }

            $scope.SwitchPaperList = function (type) {
                if (type == 0) {
                    $("#paperTemplate").show();
                }
                else {
                    $("#paperTemplate").hide();
                }
                $scope.LoadPaperList(type);
            };
            $scope.PaperList = new NgTableParams({
                count: 5
            }, {
                counts: [5, 10],
                dataset: []
            });
            $scope.LoadPaperList = function (type) {
                if (type != 1) {
                    type = 0;
                }
                $scope.SelectAllPaperTag = false;
                $scope.SelectAllClsTag = false;
                //$scope.Filter.SpecialFlag = $scope.TaskAdd.TaskType;
                $scope.Filter.IsCustomPaper = type;
                $scope.CustomerPaper = (type == 1);
                ExamForSchoolAdminService.GetPaperList($scope.Filter).then(function (result) {
                    var data = result.data;
                    $scope.ListEmpty = (data.length == 0);
                    //设置默认选择的试卷列表
                    $scope.SetDefaultChoosePaper(data, $scope.postPaperList);
                    $scope.PaperList.settings({
                        dataset: data
                    });
                });
            }
            //设置默认选择的试卷列表
            $scope.SetDefaultChoosePaper = function (data, selectList) {
                if (selectList != undefined && selectList != null && selectList.length > 0) {
                    for (var selectIndex = 0; selectIndex < selectList.length; selectIndex++) {
                        var selectPaperID = selectList[selectIndex];
                        if (angular.isArray(data) && data.length > 0) {
                            for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                                if (data[dataIndex].PaperID == selectPaperID) {
                                    data[dataIndex].Selected = 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                $scope.SelectPaperCount = GetSelectedPaper(data).length;
            }

            //试卷模板过滤项
            $scope.PaperFilter = {
                PaperTemplateName: "选择试卷模版",
                PaperTemplateID: "",
                InputPaperTemplateName: ""
            }
            $scope.PaperTemplateList = [];
            $scope.ChoosePaperTemplate = function (pt) {
                $scope.PaperFilter.PaperTemplateName = pt.Name;
                $scope.PaperFilter.PaperTemplateID = pt.ID;

                $scope.Filter.SelectPaperTemplate = pt.ID;
                $scope.LoadPaperList(0);
            }
            //试卷模板过滤项

            $scope.AllPaperTemplateList = [];
            //获取试卷模板
            $scope.GetPaperTemplate = function () {
                ExamForSchoolAdminService.GetPaperTemplateList().then(function (result) {
                    var d = result.data;
                    $scope.AllPaperTemplateList = d;
                    $scope.FilterPaperTemplateList('');
                });
            }

            $scope.FilterPaperTemplateList = function (ptFilter) {
                $scope.PaperTemplateList = [{
                    ID: "", Name: "全部"
                }];
                for (var i = 0; i < $scope.AllPaperTemplateList.length; i++) {
                    var pt = $scope.AllPaperTemplateList[i];
                    if (pt != undefined && pt.PaperTemplateName != undefined && pt.PaperTemplateName.indexOf(ptFilter) != -1) {
                        var findPT = {
                            ID: pt.PaperTemplateID, Name: pt.PaperTemplateName
                        };
                        $scope.PaperTemplateList.push(findPT);
                    }
                }
            }

            $scope.GetPaperTemplate();

            //===========试卷全选


            $scope.SelectAllPaperTag = false;
            $scope.SelectAllPaper = function (event) {
                event.stopPropagation(); // 阻止事件冒泡

                $scope.SelectAllPaperTag = $scope.SelectAllPaperTag ? false : true;

                $scope.SelectAll($scope.PaperList.settings().dataset, $scope.SelectAllPaperTag);
                $scope.SelectPaperCount = GetSelectedPaper($scope.PaperList.settings().dataset).length;
            }


            function GetSelectedPaper(data) {
                $scope.SelectedPaper = [];
                $scope.SelectedTemplate = [];
                if (angular.isArray(data) && data.length > 0) {
                    angular.forEach(data, function (item, i) {
                        if (item.Selected == 1 || item.Selected == "1") {
                            $scope.SelectedPaper.push(item.PaperID);
                            $scope.SelectedTemplate.push(item.PaperTemplateID);
                        }
                    });
                }
                return $scope.SelectedPaper;
            }

            $scope.ChoosePaper = function (choosePaperID) {
                var data = $scope.PaperList.settings().dataset;

                if (choosePaperID != undefined && choosePaperID != null) {

                    if (angular.isArray(data) && data.length > 0) {
                        for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                            if (data[dataIndex].PaperID == choosePaperID) {

                                if (data[dataIndex].Selected == 1) {
                                    data[dataIndex].Selected = 0;
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
            }
            function IsDifTem(array) {
                var first = array[0];
                for (var i = 0; i < array.length; i++) {
                    if (first != array[i])
                        return true;
                }
                return false;
            }
            //-----新增考试 end-------//
        }])
            /*
            * Services
            */
            .service('ExamForSchoolAdminService', function ($http, Constants) {
                var self = this;
                self.GetExamPlanDetailList = function (param) {
                    return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/getexamplandetaillist', param);
                };
                self.GetSelectClassList = function (param) {
                    return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/getschoolclasslist', param);
                };
                self.SaveExamClassList = function (param) {
                    return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/saveexamclasslist', param);
                };
                self.RemoveExamClass = function (param) {
                    return $http.post(GLOBAL_CENTRAL_URL + 'api/examplan/removeexamclass', param);
                };
                self.GenerateTaskPackage = function (taskID) {
                    return $http.get(GLOBAL_API_URL + 'api/task/generateTask/' + taskID);
                };
                self.GetTaskAnswerImportSummaryInfo = function (taskID) {
                    return $http.get(GLOBAL_API_URL + 'api/answer/getTaskAnswerImportSummaryInfo/' + taskID);
                };
                self.UpdateTaskStatus = function (taskID, newTaskStatus) {
                    var param = {
                        TaskID: taskID, TaskStatus: newTaskStatus
                    };
                    return $http.post(GLOBAL_API_URL + "api/task/updateStatus", param);
                }
                self.AddExamPlan = function (param) {
                    return $http.post('/api/examplan/addexamplan', param);
                }
                self.UpdateExamPlan = function (param) {
                    return $http.post('/api/examplan/updateexamplan', param);
                }
                self.DeleteExamPlan = function (examPlanID) {
                    return $http.get('/api/examplan/deleteexamplan/' + examPlanID);
                }
                self.AddSchoolExamPlan = function (param) {
                    return $http.post('/api/examplan/addschoolexamplan', param);
                }
                self.UpdateSchoolExamPlan = function (param) {
                    return $http.post('/api/examplan/updateschoolexamplan', param);
                }
                self.DeleteSchoolExamPlan = function (param) {
                    return $http.post('/api/examplan/deleteschoolexamplan', param);
                }
                self.GetPaperList = function (filter) {
                    return $http.post(GLOBAL_API_URL + 'api/paper/list', filter);
                }
                self.GetPaperTemplateList = function () {
                    return $http.get(GLOBAL_API_URL + 'api/paper/paperTemplateList');
                }

            })
});
