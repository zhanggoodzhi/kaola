define(['angular', 'jquery-date-range-picker', 'ng-file-upload-all', 'FileAPI', 'uploadifyjs', 'ng-table', 'ngToaster', '/web/components/directives/answerDetail/answerDetail.js'], function (angular) {
    'use strict';

    angular.module('app')
        .controller('TaskCtrl',
        ['$scope', '$log', 'AuthService', 'Constants', 'TaskService', 'NgTableParams', '$rootScope', '$state', 'toaster', '$stateParams', 'Upload', '$timeout', 'Audio', 'ShowService',
        function ($scope, $log, AuthService, Constants, TaskService, NgTableParams, $rootScope, $state, toaster, $stateParams, Upload, $timeout, Audio, ShowService) {

            $scope.Constants = {
                apiServiceBaseUri: GLOBAL_API_URL,
                authServiceBaseUri: GLOBAL_CENTRAL_URL,
                answerBaseUrl: GLOBAL_ANSWER_URL,
                paperResourceBaseUrl: GLOBAL_PAPER_RESOURCE_URL
            };

            $scope.hasData = true;

            $scope.TaskStatus = [
                { Name: "所有", Value: -1 },
                { Name: "未开始", Value: 0 },
                { Name: "进行中", Value: 1 },
                { Name: "评分中", Value: 4 },
                { Name: "已完成", Value: 5 }
            ];
            $scope.TaskType = [
                { Name: "所有", Value: -1 },
                { Name: "考试", Value: 1 },
                { Name: "练习", Value: 2 }
            ];

            $scope.Filter = {
                CurrentTaskStatus: $scope.TaskStatus[0],
                CurrentTaskType: $scope.TaskType[0],
                CurrentCls: { ClassID: null, ClassName: "所有" }
            };

            $scope.ClassList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                dataset: []
            });


            $scope.AllClass = [];
            $scope.LoadClsList = function () {
                TaskService.GetTeacherClsList().then(function (result) {
                    //$scope.Filter.CurrentCls = result.data[0];
                    result.data.splice(0, 0, { ClassID: -1, ClassName: "所有" });
                    $scope.AllClass = result.data;
                    $scope.ClassList.settings({
                        dataset: result.data
                    });
                });
            }
            $scope.LoadClsList();

            $scope.FilterChange = function (key, value) {
                if (key == "TaskStatus") {
                    $scope.Filter.CurrentTaskStatus = value;
                }
                if (key == "TaskType") {
                    $scope.Filter.CurrentTaskType = value;
                }
                if (key == "Class") {
                    $scope.Filter.CurrentCls = value;
                }

                $scope.SearchTask();
            }

            $scope.ClsChange = function () {
                console.log($scope.Filter.CurrentCls);
            }

            $scope.QueryParams = {
                TaskName: '',
                StartTime: "",
                EndTime: "",
                ClassID: '',
                StatusList: [],
                TaskTypeList: []
            };

            ///--------定时刷新任务列表
            $scope.RefreshTaskDataIntervalTime = 30000;
            $scope.NeedRefreshTaskDataInterval = true;
            $scope.QueryTaskDataIntervalInstance = null;

            $scope.StartTaskDataIntervalInstance = function () {
                //是否需要定时刷新
                if ($scope.NeedRefreshTaskDataInterval == false) {
                    return;
                }

                //10秒刷新
                $scope.QueryTaskDataIntervalInstance = $timeout(function () {
                    $scope.TaskList.reload();
                }, $scope.RefreshTaskDataIntervalTime);
            }
            $scope.$on('$destroy', function () {
                if ($scope.QueryTaskDataIntervalInstance) {
                    $timeout.cancel($scope.QueryTaskDataIntervalInstance);
                }
            });
            ///--------

            $scope.TaskData = [];
            $scope.TaskList = new NgTableParams({ count: 20 }, {
                counts: [20, 30, 50],
                getData: function (params) {

                    console.log("TaskList reload", new Date());

                    $scope.QueryParams.PostParams = params.parameters();
                    //console.log(params.parameters());
                    return TaskService.GetTaskList($scope.QueryParams).then(function (results) {
                        //console.log(results);
                        params.total(results.data.Count);
                        $scope.TaskData = results.data;

                        $scope.UpdateFieldForMarkProcess();

                        //console.log($scope.TaskData.TaskDetailList);

                        $scope.StartTaskDataIntervalInstance();

                        if ($scope.TaskData.TaskDetailList.length > 0) {
                            $scope.hasData = true;
                        }
                        else {
                            $scope.hasData = false;
                        }

                        return $scope.TaskData.TaskDetailList;;
                    });
                }

            });
            ///----更新评分进度相关的数据: 是否显示成绩发布按钮, 机器评分的预计剩余时间, 机器评分是否结束

            var dateFormat = function (d, fmt) {
                var o = {
                    "M+": d.getMonth() + 1, //月份 
                    "d+": d.getDate(), //日 
                    "h+": d.getHours(), //小时 
                    "m+": d.getMinutes(), //分 
                    "s+": d.getSeconds(), //秒 
                    "q+": Math.floor((d.getMonth() + 3) / 3), //季度 
                    "S": d.getMilliseconds() //毫秒 
                };
                if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            }

            $scope.UpdateFieldForMarkProcess = function () {

                $scope.NeedRefreshTaskDataInterval = false;//默认不定时刷新任务, 直到在任务列表中发现有机评未完成的任务

                var data = $scope.TaskData;
                if (data != undefined && data.TaskAnswerTimeRespList != undefined && data.TaskAnswerTimeRespList.length > 0) {

                    var tableData = $scope.TaskData.TaskDetailList;
                    for (var tableRowIndex = 0; tableRowIndex < tableData.length; tableRowIndex++) {
                        var rowData = tableData[tableRowIndex];
                        rowData["HideReleaseButton"] = true;
                        rowData["AMSFinished"] = false;
                        rowData["AMSLeftCount"] = "";
                        rowData["TeacherLeftCount"] = "";
                        //console.log(rowData);

                        for (var i = 0; i < data.TaskAnswerTimeRespList.length; i++) {
                            var d = data.TaskAnswerTimeRespList[i];

                            if (d.TaskID == rowData.TaskID) {

                                //机器评分与教师人工评分有任意一个完成后, 都可以显示成绩发布按钮,
                                //两项都没有完成,则隐藏成绩发布按钮
                                //console.log(d);
                                if (d.UnMarkedCount == 0 || d.AMSUnMarkedCount == 0) {
                                    rowData["HideReleaseButton"] = false;
                                }

                                //机评是否结束
                                if (d.AMSUnMarkedCount == 0) {
                                    rowData["AMSFinished"] = true;
                                }

                                //机评预计完成的时间点
                                if (d.AMSUnMarkedCount > 0) {

                                    $scope.NeedRefreshTaskDataInterval = true;//发现存在机评未完成的任务, 需要定时刷新任务列表数据          
                                    var time = rowData["AMSPredictFinishTimeMillisecond"];
                                    //console.log(time);
                                    var dateTime = new Date(time);
                                    //console.log(dateTime);
                                    var formatDateTimeStr = dateFormat(dateTime, "MM/dd hh:mm");//预计完成的时间点
                                    rowData["AMSPredictFinishTime"] = formatDateTimeStr;
                                    //console.log(formatDateTimeStr);
                                }

                                //评分进度的描述信息
                                var amsResult = "";

                                if (d.AMSUnMarkedCount == 0) {
                                    amsResult = "机评已完成";
                                }
                                else {
                                    amsResult = "机评任务" + d.AMSUnMarkedCount;
                                }


                                var teacherResult = "";
                                if (d.UnMarkedCount == 0) {
                                    teacherResult = "人工评分已完成";
                                }
                                else {
                                    teacherResult = "人工评分任务" + d.UnMarkedCount;
                                }

                                rowData["AMSLeftCount"] = amsResult;
                                rowData["TeacherLeftCount"] = teacherResult;
                                break;
                            }
                        }
                    }


                }

            }
            ///----判断是否需要显示成绩发布按钮

            function formatDate(d, fmt) {
                var o = {
                    "M+": d.getMonth() + 1,                 //月份   
                    "d+": d.getDate(),                    //日   
                    "h+": d.getHours(),                   //小时   
                    "m+": d.getMinutes(),                 //分   
                    "s+": d.getSeconds(),                 //秒   
                    "q+": Math.floor((d.getMonth() + 3) / 3), //季度   
                    "S": d.getMilliseconds()             //毫秒   
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            }

            function getPreMonth(date) {
                var arr = date.split('-');
                var year = arr[0]; //获取当前日期的年份
                var month = arr[1]; //获取当前日期的月份
                var day = arr[2]; //获取当前日期的日
                var days = new Date(year, month, 0);
                days = days.getDate(); //获取当前日期中月的天数
                var year2 = year;
                var month2 = parseInt(month) - 1;
                if (month2 == 0) {
                    year2 = parseInt(year2) - 1;
                    month2 = 12;
                }
                var day2 = day;
                var days2 = new Date(year2, month2, 0);
                days2 = days2.getDate();
                if (day2 > days2) {
                    day2 = days2;
                }
                if (month2 < 10) {
                    month2 = '0' + month2;
                }
                var t2 = year2 + '-' + month2 + '-' + day2;
                return t2;
            }


            var task_TimeArrange = angular.element('#task_TimeArrange');
            //console.log(task_TimeArrange);
            var today = new Date();
            var todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            //console.log(todayStr);
            var preday = getPreMonth(todayStr);
            task_TimeArrange.val(preday + ' 至 ' + todayStr);
            $scope.QueryParams.StartTime = preday + " 00:00:00";
            $scope.QueryParams.EndTime = todayStr + " 23:59:59";


            task_TimeArrange.dateRangePicker({
                'autoClose': true,
                'separator': '至',
                'showTopbar': true,
                'shortcuts': '操作',
                'showShortcuts': true,
                //'selectForward': true,
                defaultTime: preday,
                defaultEndTime: today,
                'customShortcuts':
                            [
                                //if return an array of two dates, it will select the date range between the two dates
                                {
                                    name: '清空',
                                    dates: function () {
                                        angular.element('#task_TimeArrange').data('dateRangePicker').clear();
                                        var start = new Date('1900-01-01');
                                        var end = new Date('1900-01-01');
                                        $scope.QueryParams.StartTime = start;
                                        $scope.QueryParams.EndTime = end;
                                        //return [start, end];
                                    }
                                }
                            ]
            }).bind('datepicker-change', function (event, obj) {
                /* This event will be triggered when second date is selected */
                console.log('change', obj);
                $scope.QueryParams.StartTime = formatDate(obj.date1, "yyyy-MM-dd") + " 00:00:00";
                $scope.QueryParams.EndTime = formatDate(obj.date2, "yyyy-MM-dd") + " 23:59:59";
                $scope.SearchTask();
            }).bind('datepicker-closed', function () {
                /* This event will be triggered after date range picker close animation */
                console.log('after close');
            });

            $scope.ResetQueryFilter = function () {
                $scope.Filter.CurrentTaskStatus = $scope.TaskStatus[0];
                $scope.Filter.CurrentTaskType = $scope.TaskType[0];
                $scope.Filter.CurrentCls = { ClassID: null, ClassName: "所有" };
                task_TimeArrange.val(preday + ' 至 ' + todayStr);
                $scope.QueryParams.TaskName = "";
            }

            $scope.SearchTask = function () {

                if ($scope.Filter.CurrentCls.ClassID == undefined || $scope.Filter.CurrentCls.ClassID == null || $scope.Filter.CurrentCls.ClassID == -1) {
                    $scope.QueryParams.ClassID = "";
                }
                else {
                    $scope.QueryParams.ClassID = $scope.Filter.CurrentCls.ClassID;
                }                //Status
                if ($scope.Filter.CurrentTaskStatus.Value == -1) {
                    $scope.QueryParams.StatusList = [];
                } else if ($scope.Filter.CurrentTaskStatus.Value == 0) {
                    $scope.QueryParams.StatusList = [0];
                } else if ($scope.Filter.CurrentTaskStatus.Value == 1) {
                    $scope.QueryParams.StatusList = [1, 2, 3];
                } else if ($scope.Filter.CurrentTaskStatus.Value == 4) {
                    $scope.QueryParams.StatusList = [4];
                } else if ($scope.Filter.CurrentTaskStatus.Value == 5) {
                    $scope.QueryParams.StatusList = [5];
                }

                //TaskType
                if ($scope.Filter.CurrentTaskType.Value == -1) {
                    $scope.QueryParams.TaskTypeList = [1, 2];
                } else if ($scope.Filter.CurrentTaskType.Value == 1) {
                    $scope.QueryParams.TaskTypeList = [1];
                } else if ($scope.Filter.CurrentTaskType.Value == 2) {
                    $scope.QueryParams.TaskTypeList = [2];
                }

                console.log($scope.QueryParams);
                $scope.TaskList.parameters().page = 1;
                $scope.TaskList.reload();

            };



            $scope.OpenAddTaskDialog = function () {
                $state.go('task.createtask', { data: { 'dialogElement': 'AddTaskDialog' } });

                angular.element('#AddTaskDialog').modal({ backdrop: 'static', keyboard: false });

            }

            angular.element('#AddTaskDialog').on('hidden.bs.modal', function () {
                if (ShowService.IsHiddin) {
                    console.log("AddTaskDialog dismiss and go back to state [task]");
                    $state.go('task');

                    $scope.ResetQueryFilter();

                    $scope.SearchTask();
                }
                ShowService.IsHiddin = true;
            });


            //#region 删除任务

            $scope.OpeDeleteTaskDialog = function (task) {
                $scope.ChoosedTask = task;
                $rootScope.openCommonModalDialog("删除任务", "你确定要删除该任务么？", $scope.DeleteTask);
            }



            $scope.DeleteTask = function () {
                TaskService.DeleteTask($scope.ChoosedTask.TaskID).then(function (result) {

                    var dt = $scope.TaskList.data;
                    if (dt != undefined && dt.length > 0) {
                        for (var i = 0; i < dt.length; i++) {
                            if (dt[i].TaskID == $scope.ChoosedTask.TaskID) {
                                dt.splice(i, 1);
                                break;
                            }
                        }
                    }

                    $scope.TaskList.reload();
                    //toaster.success({ body: "删除成功" });

                }, function (error) {
                    //toaster.error({ body: error.data.Message });
                });
            }
            //#endregion 


            //#region 修改任务-----
            $scope.ChoosedTask = {
                TaskID: '',
                TaskType: '',
                TaskName: ''
            };
            $scope.OpenUpdateTaskDialog = function (task) {
                $scope.ChoosedTask.TaskID = task.TaskID;
                $scope.ChoosedTask.TaskType = task.TaskType;
                $scope.ChoosedTask.TaskName = task.TaskName;


                angular.element('#UpdateTaskDialog').modal({ backdrop: 'static', keyboard: false });

            }


            $scope.UpdateTask = function () {
                console.log($scope.ChoosedTask);

                if ($scope.ChoosedTask.TaskName.length < 3 || $scope.ChoosedTask.TaskName.length > 30) {
                    $rootScope.openCommonWarningDialog("警告", "任务名必须是3~30位的中英文或数字", null);
                    return false;
                }

                TaskService.UpdateTask($scope.ChoosedTask).then(function (result) {

                    var dt = $scope.TaskList.data;
                    if (dt != undefined && dt.length > 0) {
                        for (var i = 0; i < dt.length; i++) {
                            if (dt[i].TaskID == $scope.ChoosedTask.TaskID) {
                                dt[i].TaskType = parseInt($scope.ChoosedTask.TaskType);
                                dt[i].TaskName = $scope.ChoosedTask.TaskName;

                                break;
                            }
                        }
                    }

                    $scope.TaskList.reload();
                    angular.element('#UpdateTaskDialog').modal('hide');
                    toaster.success({ body: "修改成功" });



                }, function (result) {
                    console.log(result);
                    toaster.error({ body: result.data.Message, toasterId: 'dialog1' });
                });
            }
            //#endregion 

            //#region Start 导入答卷包

            $scope.ImportSepMessage = "";

            $scope.SelectedSepFile = [{ name: '' }];

            $scope.ClearSepFiles = function () {
                $scope.SelectedSepFile = [{ name: '' }];
            }

            $scope.CurrentImportTaskID = '';
            $scope.SetCurrentImportTaskID = function (taskID) {
                console.log("$scope.CurrentImportTaskID :" + taskID);
                $scope.CurrentImportTaskID = taskID;
            }
            $scope.OpenImportSepProgressDialog = function () {
                $scope.ImportPercent = 0;
                $scope.ImportSepMessage = "";
                $scope.ImportSepInfoMessage = "";
                angular.element('#ImportSepProgressDialog').modal({ backdrop: 'static' });
                angular.element('#ImportSummaryInfoDialog').modal('hide');
            }

            $scope.CloseImportSepProgressDialog = function () {
                angular.element('#ImportSepProgressDialog').modal('hide');
                $scope.TaskList.reload();
            }

            $scope.ImportSummaryData = {
                TaskID: '',
                CurrentImportStudentCount: 5,
                TotalStudentCount: 30,
                ExamStudentCount: 25,
                TotalImportStudentCount: 20,
                LackStudentList: []
            }
            $scope.LackStudentTable = new NgTableParams({ count: 9999 }, {
                counts: [],
                dataset: []
            });

            $scope.ShowImportSummaryInfoDialog = function (data) {
                angular.element('#ImportSummaryInfoDialog').modal({ backdrop: 'static', keyboard: false });
                if (data != undefined) {
                    $scope.ImportSummaryData = data;
                    $scope.LackStudentTable.settings({
                        dataset: $scope.ImportSummaryData.LackStudentList
                    });
                    //为上传控件加载uploadify对象
                    $("#importAnswerPackageFlash").uploadify(
                      {
                          formData: {
                              TaskID: $scope.CurrentImportTaskID
                          },
                          height: 20,
                          width: 100,
                          swf: "/web/lib/uploadify/uploadify.swf",
                          uploader: GLOBAL_API_URL + "api/answer/upload",
                          buttonText: "继续上传答卷包",
                          buttonClass: "fileuploadAnswerflash",
                          onUploadStart: function (file) {
                              //检查是否已经有在上传中的任务, 如果存在则取消任务
                              if ($scope.UploadInstance != undefined) {
                                  $scope.UploadInstance.abort();
                              }
                              $scope.OpenImportSepProgressDialog();
                              $scope.ImportSepMessage = "";
                              $scope.ImportSepInfoMessage = "";
                              $scope.ImportPercent = 0;
                          },
                          onUploadProgress: function (file, bytesUploaded, bytesTotal, totalBytesUploaded, totalBytesTotal) {
                              $scope.ImportSepInfoMessage = "正在上传答卷包";
                              $scope.ImportPercent = parseInt(100.0 * totalBytesUploaded / totalBytesTotal);
                              //console.log('上传进度: ' + $scope.ImportPercent);
                              if ($scope.ImportPercent == 100) {
                                  $scope.ImportSepInfoMessage = "正在解析答卷包";
                              }
                          },
                          onUploadSuccess: function (file, data, response) {
                              var result = eval('(' + data + ')');
                              if (result.CurrentImportStudentCount != undefined) {
                                  //import success
                                  $scope.CloseImportSepProgressDialog();
                                  $scope.ShowImportSummaryInfoDialog(result);
                                  $scope.TaskList.reload();
                              }
                              else {
                                  //$rootScope.openCommonErrorDialog("错误", "导入答卷包错误," + result.error, null);
                                  $scope.ImportSepMessage = "导入答卷包错误," + result.error;
                                  $scope.ImportSepInfoMessage = "";
                              }
                          },
                          onUploadError: function () {
                              if (result != undefined && result.Message != undefined) {
                                  $scope.ImportSepMessage = result.Message;
                              }
                              else {
                                  $scope.ImportSepMessage = "上传遇到异常";
                              }
                              $scope.ImportSepInfoMessage = "";
                          }
                      });
                }
            }
            $scope.IEVersion = getIEVersion();
            $scope.PerformFileClick = function (taskID) {
                $scope.SetCurrentImportTaskID(taskID);

                angular.element("#af_" + taskID).click();

            }
            $scope.importFiles = function (event) {
                var id = event.srcElement.id;
                var ifId = id.replace("af_", "if_");
                document.forms[ifId].submit();
            }


            $scope.UploadInstance = null;
            $scope.ImportPercent = 0;
            $scope.ImportSepInfoMessage = "";
            //$scope.FileSelect = function ($files)
            //{
            //    for (var i = 0; i < $files.length; i++) {
            //        var file = $files[i];
            //    }
            //};

            $scope.UploadFiles = function ($files, taskID) {
                if (taskID != undefined) {
                    $scope.SetCurrentImportTaskID(taskID);
                }
                var files = $files;
                //检查是否已经有在上传中的任务, 如果存在则取消任务
                if ($scope.UploadInstance != undefined) {
                    $scope.UploadInstance.abort();
                    console.log("取消之前的上传任务");
                }
                $scope.OpenImportSepProgressDialog();

                $scope.ImportSepMessage = "";
                $scope.ImportSepInfoMessage = "";
                if (files == undefined || files.length == 0 || files[0].name == "") {
                    $scope.ImportSepMessage = "请选择答卷包";
                    return;
                }
                console.log("files:", files);

                $scope.ImportPercent = 0;

                $scope.UploadInstance = Upload.upload({
                    url: GLOBAL_API_URL + 'api/answer/upload',
                    data: { file: files, TaskID: $scope.CurrentImportTaskID },
                }).progress(function (evt) {
                    $scope.ImportSepInfoMessage = "正在上传答卷包";
                    $scope.ImportPercent = parseInt(100.0 * evt.loaded / evt.total);
                    //console.log('上传进度: ' + $scope.ImportPercent);
                    if ($scope.ImportPercent == 100) {
                        $scope.ImportSepInfoMessage = "正在解析答卷包";
                    }
                }).success(function (result, status, headers, config) {
                    console.log('上传结果:', result);
                    if (result.CurrentImportStudentCount != undefined) {
                        //import success
                        $scope.CloseImportSepProgressDialog();
                        $scope.ShowImportSummaryInfoDialog(result);
                        $scope.TaskList.reload();
                    }
                    else {
                        //$rootScope.openCommonErrorDialog("错误", "导入答卷包错误," + result.error, null);
                        $scope.ImportSepMessage = "导入答卷包错误," + result.error;
                        $scope.ImportSepInfoMessage = "";
                    }

                }).error(function (result, status, headers, config) {
                    console.log('上传遇到异常:', result, status, headers, config);
                    if (result != undefined && result.Message != undefined) {
                        $scope.ImportSepMessage = result.Message;
                    }
                    else {
                        $scope.ImportSepMessage = "上传遇到异常";
                    }
                    $scope.ImportSepInfoMessage = "";

                });
            };

            //#endregion End 导入答卷包



            //#region 自评----

            $scope.OpenMarkDialog = function (taskID) {

                $scope.TaskAnswerQueryParam = {
                    TaskID: taskID,
                    AreaType: 0,
                    AreaTitle: "",
                };
                $scope.TaskAnswerFilter = {
                    FilterStr: "",
                    TaskID: "",
                };
                //console.log($scope.currContent);
                $scope.MarkedScore.Score = "";
                $scope.LoadTaskAnswerGroup();
                $scope.currContent = null;
                $scope.currentContentAnswers = null;
                angular.element('#MarkDialog').modal({ backdrop: 'static', keyboard: false });

            }


            $scope.currContent = null;     //当前题目信息        
            $scope.currentContentAnswers = null;//当前题目的参考答案

            $scope.MarkedScore = {
                Score: "",
            };

            $scope.TaskAnswerQueryParam = {
                TaskID: "",
                AreaType: 0,
                AreaTitle: "",
            };

            $scope.TaskAnswerData = {};

            $scope.GroupType = 0;

            $scope.ChangeGroupType = function (groupType) {
                //$scope.GroupType = $scope.GroupType == 0 ? 1 : 0;
                $scope.GroupType = groupType;
                $scope.currContent = null;
                $scope.ReFreshTaskAnswer();
            }

            $scope.ValidateScore = function (scoreText) {
                var result = TaskService.ValidateScore(scoreText, $scope.currContent.Score);
                $scope.scoreValidateMessage = result.message;
                return result.validate;
            }


            $scope.LoadTaskAnswerGroup = function (content) {
                if ($scope.GroupType == 0) {
                    $scope.LoadTaskAnswerGroupByArea(content);
                } else if ($scope.GroupType == 1) {
                    $scope.LoadTaskAnswerGroupByStu(content);
                }
            }
            $scope.LoadTaskAnswerGroupByArea = function (content) {
                $scope.MarkedScore.Score = "";
                TaskService.getTaskAnswerGroupByArea($scope.TaskAnswerQueryParam).then(function (result) {
                    //console.log(result);
                    $scope.TaskAnswerData = result.data;
                });
            }

            $scope.LoadTaskAnswerGroupByStu = function (content) {
                $scope.MarkedScore.Score = "";
                TaskService.getTaskAnswerGroupByStu($scope.TaskAnswerQueryParam).then(function (result) {
                    //console.log(result);
                    $scope.TaskAnswerData = result.data;
                });
            }

            $scope.InitDataFinished = function () {
                console.log("InitDataFinished");
                var rowNumber = 0;
                console.log("Pick First");
                $scope.GoToNext(0, $scope.GroupType, rowNumber);
            }

            $scope.GetCurrentContent = function (answer) {
                console.log(answer);
                var areaType = answer.AreaType;
                var questionID = answer.QuestionID;
                var contentID = answer.ContentID;

                var currentContent = null;
                if ($scope.TaskAnswerData != undefined && $scope.TaskAnswerData.TaskAnswerPaperDetailList != undefined) {
                    for (var i = 0; i < $scope.TaskAnswerData.TaskAnswerPaperDetailList.length; i++) {
                        var d = $scope.TaskAnswerData.TaskAnswerPaperDetailList[i];
                        if (areaType == 16) {
                            if (d.QuestionID == questionID) {
                                d.ContentAudio = d.QuestionAudio;
                                d.ContentText = d.QuestionText;
                                currentContent = d;
                                break;
                            }
                        }
                        else {
                            if (d.ContentID == contentID) {
                                currentContent = d;
                                break;
                            }
                        }
                    }
                }
                if (currentContent != null && currentContent != undefined) {
                    currentContent.AudioPath = answer.AnswerContent;
                    currentContent.Score = answer.Score;
                    currentContent.IsAMSMarked = answer.IsAMSMarked;
                    currentContent.AMSScore = answer.AMSScore;
                    currentContent.RowNumber = answer.RowNumber;
                    currentContent.AnswerID = answer.AnswerID;

                }
                return currentContent;
            }
            $scope.ShowAnswerDetail = function (answer) {

                //Audio.pause();
                $rootScope.$broadcast('StopAudiowavePlay');
                $scope.currContent = $scope.GetCurrentContent(answer);

                if ($scope.currContent != null && $scope.currContent != undefined) {
                    $scope.currentContentAnswers = $scope.currContent.AnswerModels;
                }
                console.log("current content: ", $scope.currContent);
                console.log("current contentAnswers: ", $scope.currentContentAnswers);

                $scope.scoreValidateMessage = "";
                if (answer.IsMarked == true) {
                    $scope.MarkedScore.Score = answer.MarkScore;
                }
                else {
                    $scope.MarkedScore.Score = "";
                }

                $('.answer-li').removeClass('answer-active');
                if ($scope.GroupType == 0) {
                    $('#collapse' + answer.AreaType + '_' + answer.AreaID).collapse('show');
                    var QuestionContentIndex = 'Q' + answer.QuestionIndex + 'C' + answer.ContentIndex;
                    $('#collapse' + answer.AreaType + '_' + answer.AreaID + QuestionContentIndex).collapse('show');
                    var li = '#li' + answer.AreaType + '_' + answer.AreaID + QuestionContentIndex + answer.StudentNumber + '_' + answer.ContentID;
                    //console.log("li ", li);
                    $(li).addClass("answer-active");
                }

                if ($scope.GroupType == 1) {
                    $('#collapse' + answer.StudentNumber).collapse('show');
                    $('#collapse' + answer.StudentNumber + answer.AreaType + '_' + answer.AreaID).collapse('show');
                    var QuestionContentIndex = 'Q' + answer.QuestionIndex + 'C' + answer.ContentIndex;
                    var li = '#li' + answer.StudentNumber + answer.AreaType + '_' + answer.AreaID + QuestionContentIndex + '_' + answer.ContentID;
                    //console.log("li ", li);
                    $(li).addClass("answer-active");
                }


                //是否显示[完成]按钮
                $scope.ShowCompleteButton = false;
                var currentRowNumber = answer.RowNumber;
                var totalRowNumber = $scope.TaskAnswerData.OriginaTaskAnswerList.length;
                if (totalRowNumber > 0 && totalRowNumber == (currentRowNumber + 1)) {
                    $scope.ShowCompleteButton = true;
                }

            }

            //是否显示[完成]按钮
            $scope.ShowCompleteButton = false;

            //刷新评分，不重新定位
            $scope.ReFreshTaskAnswer = function () {
                $scope.MarkedScore.Score = "";
                $scope.scoreValidateMessage = "";
                $scope.LoadTaskAnswerGroup();
            }


            //确认&下一题
            $scope.SaveAndNextMark = function (goToNextFlag) {

                Audio.pause();

                if (!$scope.ValidateScore($scope.MarkedScore.Score)) {
                    return;
                }
                var score = parseFloat($scope.MarkedScore.Score);
                TaskService.DoScore($scope.currContent.AnswerID, score).then(function (results) {
                    console.log("Mark Score success for " + $scope.currContent.AnswerID + " ,score:" + score);
                    $scope.currContent.MarkScore = score;
                    $scope.currContent.IsMarked = true;


                    $scope.UpdateMarkedCount($scope.currContent.AnswerID, true, score);

                    if (goToNextFlag == true) {
                        $scope.GoToNext(1, $scope.GroupType, $scope.currContent.RowNumber);
                    }
                    else {
                        console.log("Mark Completd");
                        angular.element('#MarkDialog').modal('hide');
                    }

                }, function (error) {
                    $scope.scoreValidateMessage = (error.data.ExceptionMessage || error.data.Message) + ".评分失败！";
                    $scope.ReFreshTaskAnswer();
                });

            };

            $scope.GoToNext = function (addFlag, groupType, rowNumber) {
                if (groupType == 0) //搜索题型
                {
                    var pickArea = "";
                    var pickQC = "";
                    var pickAnswerRowNumber = -1;

                    var stopLoop = false;

                    for (var answerIndex = 0 ; answerIndex < $scope.TaskAnswerData.OriginaTaskAnswerList.length; answerIndex++) {

                        var answer = $scope.TaskAnswerData.OriginaTaskAnswerList[answerIndex];
                        if (answer.RowNumber != rowNumber) {
                            continue;
                        }
                        //找到当前记录的位置,判断是否是最后一条
                        if (addFlag > 0 && rowNumber == $scope.TaskAnswerData.OriginaTaskAnswerList.length - 1) {
                            console.log("Reach the end");
                            $rootScope.openCommonInfoDialog("消息", "已经是最后一题", null);
                            return;
                        }

                        pickAnswerRowNumber = parseInt(rowNumber) + addFlag;
                        var answer = $scope.TaskAnswerData.OriginaTaskAnswerList[pickAnswerRowNumber];
                        pickArea = answer.AreaType;
                        pickQC = "Q" + answer.QuestionIndex + "C" + answer.ContentIndex;

                        break;
                    }

                    if (pickAnswerRowNumber != -1) {
                        for (var areaIndex = 0 ; areaIndex < $scope.TaskAnswerData.TaskAnswerAreaGroupList.length; areaIndex++) {
                            if (stopLoop == true) {
                                break;
                            }

                            var area = $scope.TaskAnswerData.TaskAnswerAreaGroupList[areaIndex];
                            if (area.AreaType != pickArea) {
                                continue;
                            }

                            for (var qcIndex = 0 ; qcIndex < area.TaskAnswerContentList.length; qcIndex++) {
                                if (stopLoop == true) {
                                    break;
                                }

                                var qc = area.TaskAnswerContentList[qcIndex];
                                if (qc.QuestionContentIndex != pickQC) {
                                    continue;
                                }

                                for (var aIndex = 0 ; aIndex < qc.TaskAnswerList.length; aIndex++) {

                                    var answer = qc.TaskAnswerList[aIndex];
                                    if (answer.RowNumber != pickAnswerRowNumber) {
                                        continue;
                                    }

                                    //console.log(answer);
                                    $scope.ShowAnswerDetail(answer);
                                    break;
                                }
                            }
                        }

                    }
                }
                if (groupType == 1) //搜索学生
                {
                    var pickStudentNumber = "";
                    var pickArea = "";
                    var pickQC = "";
                    var pickAnswerRowNumber = -1;

                    var stopLoop = false;

                    for (var answerIndex = 0 ; answerIndex < $scope.TaskAnswerData.OriginaTaskAnswerList.length; answerIndex++) {

                        var answer = $scope.TaskAnswerData.OriginaTaskAnswerList[answerIndex];
                        if (answer.RowNumber != rowNumber) {
                            continue;
                        }
                        //找到当前记录的位置,判断是否是最后一条
                        if (addFlag > 0 && rowNumber == $scope.TaskAnswerData.OriginaTaskAnswerList.length - 1) {
                            console.log("Reach the end");
                            $rootScope.openCommonInfoDialog("消息", "已经是最后一题", null);
                            return;
                        }

                        pickAnswerRowNumber = parseInt(rowNumber) + addFlag;
                        var answer = $scope.TaskAnswerData.OriginaTaskAnswerList[pickAnswerRowNumber];
                        pickArea = answer.AreaType;
                        pickStudentNumber = answer.StudentNumber;
                        pickQC = "Q" + answer.QuestionIndex + "C" + answer.ContentIndex;

                        break;
                    }

                    if (pickAnswerRowNumber != -1) {
                        for (var stuIndex = 0 ; stuIndex < $scope.TaskAnswerData.TaskAnswerStudentGroupList.length; stuIndex++) {
                            if (stopLoop == true) {
                                break;
                            }

                            var stu = $scope.TaskAnswerData.TaskAnswerStudentGroupList[stuIndex];
                            if (stu.StudentNumber != pickStudentNumber) {
                                continue;
                            }

                            for (var areaIndex = 0 ; areaIndex < stu.TaskAnswerStudentAreaList.length; areaIndex++) {
                                if (stopLoop == true) {
                                    break;
                                }

                                var area = stu.TaskAnswerStudentAreaList[areaIndex];
                                if (area.AreaType != pickArea) {
                                    continue;
                                }

                                for (var aIndex = 0 ; aIndex < area.TaskAnswerList.length; aIndex++) {

                                    var answer = area.TaskAnswerList[aIndex];
                                    if (answer.RowNumber != pickAnswerRowNumber) {
                                        continue;
                                    }

                                    //console.log(answer);
                                    $scope.ShowAnswerDetail(answer);
                                    break;
                                }
                            }
                        }

                    }

                }

            }

            $scope.PreTaskAnswer = function () {

                Audio.pause();

                if ($scope.currContent.RowNumber == 0) {
                    console.log("Reach the First");
                    $rootScope.openCommonInfoDialog("消息", "已经是第一题", null);
                    return;
                }
                $scope.GoToNext(-1, $scope.GroupType, $scope.currContent.RowNumber);
            }

            $scope.TaskAnswerFilter = {
                FilterStr: "",
            };
            $scope.SearchTaskAnswer = function () {

                if ($scope.TaskAnswerFilter.FilterStr == undefined || $scope.TaskAnswerFilter.FilterStr == "") {
                    return;
                }

                var findStudent = false;
                for (var stuIndex = 0 ; stuIndex < $scope.TaskAnswerData.TaskAnswerStudentGroupList.length; stuIndex++) {

                    var stu = $scope.TaskAnswerData.TaskAnswerStudentGroupList[stuIndex];
                    if (stu.StudentName == $scope.TaskAnswerFilter.FilterStr) {

                        findStudent = true;
                        //console.log('#collapse' + stu.StudentNumber);
                        $('#collapse' + stu.StudentNumber).collapse({ backdrop: 'static', keyboard: false });

                        break;
                    }
                }
                if (findStudent == false) {
                    $rootScope.openCommonInfoDialog("消息", "没有找到匹配的学生");
                }
            }

            $scope.UpdateMarkedCount = function (scoredAnswerID, isMarked, markScore) {
                // console.log("TaskAnswerStudentGroupList", $scope.TaskAnswerData.TaskAnswerStudentGroupList);
                var stuData = $scope.TaskAnswerData.TaskAnswerStudentGroupList;
                if (stuData != undefined && stuData.length > 0) {



                    var findArea = false;
                    var findStudent = false;

                    for (var stuIndex = 0; stuIndex < stuData.length; stuIndex++) {
                        var studentMarkedCount = 0;

                        var sItem = stuData[stuIndex];
                        var saData = sItem.TaskAnswerStudentAreaList;
                        if (saData != undefined && saData.length > 0) {
                            for (var saIndex = 0; saIndex < saData.length; saIndex++) {
                                var studentAreaMarkedCount = 0;
                                var saItem = saData[saIndex];

                                var answerData = saItem.TaskAnswerList;
                                if (answerData != undefined && answerData.length > 0) {
                                    for (var aswIndex = 0; aswIndex < answerData.length; aswIndex++) {
                                        var aswItem = answerData[aswIndex];

                                        if (aswItem.AnswerID == scoredAnswerID) {

                                            if (isMarked != undefined && isMarked == true && markScore != undefined) {
                                                aswItem.IsMarked = isMarked;
                                                aswItem.MarkScore = markScore;
                                            }

                                            findStudent = true;
                                        }

                                        if (aswItem.IsMarked) {
                                            studentAreaMarkedCount++;
                                            studentMarkedCount++;
                                        }
                                    }
                                }
                                saItem.MarkedCount = studentAreaMarkedCount;
                            }
                        }
                        if (findStudent) {
                            sItem.MarkedCount = studentMarkedCount;
                            break;
                        }
                    }

                    var totalStuMarkedCount = 0;

                    if (findStudent) {

                        for (var stuIndex = 0; stuIndex < stuData.length; stuIndex++) {

                            var saFinishedCount = 0;

                            var sItem = stuData[stuIndex];
                            var saData = sItem.TaskAnswerStudentAreaList;
                            if (saData != undefined && saData.length > 0) {
                                for (var saIndex = 0; saIndex < saData.length; saIndex++) {
                                    var saItem = saData[saIndex];
                                    saFinishedCount = saFinishedCount + saItem.MarkedCount;
                                }
                            }
                            sItem.MarkedCount = saFinishedCount;
                            if (sItem.MarkedCount > sItem.TotalCount) {
                                sItem.MarkedCount = sItem.TotalCount;
                            }
                            if (sItem.MarkedCount == sItem.TotalCount) {
                                totalStuMarkedCount = totalStuMarkedCount + 1;
                            }
                        }
                    }

                    $scope.TaskAnswerData.MarkedCount = totalStuMarkedCount;

                }

                // console.log("TaskAnswerAreaGroupList", $scope.TaskAnswerData.TaskAnswerAreaGroupList);
                var areaData = $scope.TaskAnswerData.TaskAnswerAreaGroupList;
                if (areaData != undefined && areaData.length > 0) {

                    var markedCount = 0;

                    for (var areaIndex = 0; areaIndex < areaData.length; areaIndex++) {

                        var areaMarkedCount = 0;

                        var aItem = areaData[areaIndex];
                        var acData = aItem.TaskAnswerContentList;
                        if (acData != undefined && acData.length > 0) {
                            for (var acIndex = 0; acIndex < acData.length; acIndex++) {
                                var acItem = acData[acIndex];

                                var answerData = acItem.TaskAnswerList;

                                var acMarkedCount = 0;

                                if (answerData != undefined && answerData.length > 0) {
                                    for (var aswIndex = 0; aswIndex < answerData.length; aswIndex++) {
                                        var aswItem = answerData[aswIndex];

                                        if (aswItem.AnswerID == scoredAnswerID) {
                                            if (isMarked != undefined && isMarked == true && markScore != undefined) {
                                                aswItem.IsMarked = isMarked;
                                                aswItem.MarkScore = markScore;
                                            }
                                        }

                                        if (aswItem.IsMarked == true) {
                                            markedCount++;
                                            acMarkedCount++;
                                            areaMarkedCount++;
                                        }
                                    }
                                }
                                acItem.MarkedCount = acMarkedCount;
                            }
                        }
                        aItem.MarkedCount = areaMarkedCount;
                    }
                    $scope.TaskAnswerData.MarkedCount = markedCount;
                }

            }

            $('#MarkDialog').on('hide.bs.modal', function () {
                var version = getIEVersion();
                if (version <= 8) {
                    $rootScope.$broadcast('StopAudioPlay');
                }
                else {
                    $rootScope.$broadcast('StopAudiowavePlay');
                }
                $rootScope.$broadcast('StopVideoPlay');
            })

            //#endregion -------------自评----

            $scope.ReleaseParam = {
                TaskID: "",
            };
            $scope.OpenReleaseDialog = function (taskID) {
                $scope.ReleaseParam.TaskID = taskID;
                $rootScope.openCommonModalDialog("成绩发布", "你确定要发布成绩么？", $scope.AchievementRelease);
            }

            ////------------- 发布成绩
            $scope.AchievementRelease = function () {
                console.log($scope.ReleaseParam.TaskID);
                TaskService.AchievementRelease($scope.ReleaseParam.TaskID).then(function (result) {
                    if (result.data.errorno == 0) {
                        toaster.success({ body: "成绩发布成功" });
                    }
                    else {
                        toaster.error({ body: "成绩发布失败," + result.data.error });
                    }

                    $scope.TaskList.reload();
                });
            }

            ////------------- 发布成绩

            ////------------- 开始机器评分
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
                TaskService.GetTaskAnswerImportSummaryInfo($scope.StartMarkTaskID).then(function (result) {
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
                TaskService.UpdateTaskStatus($scope.StartMarkTaskID, newTaskStatus).then(function (result) {
                    $scope.TaskList.reload();
                    angular.element('#TaskAnswerImportSummaryInfoDialog').modal('hide');
                });
            }
            ////------------- 开始机器评分

            ////--任务答卷包统计信息
            $scope.TaskAnswerImportSummaryData = [];
            $scope.TaskAnswerLackStudentTable = new NgTableParams({ count: 9999 }, {
                counts: [],
                dataset: []
            });

            ////--任务答卷包统计信息



            /////----------下载任务包-----
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

                TaskService.GenerateTaskPackage(taskID).then(function (response) {

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

            /////----------下载任务包-----

        }])

    .controller('CreateTaskCtrl', ['$scope', 'AuthService', 'Constants', 'TaskService', 'NgTableParams', '$rootScope', '$state', '$stateParams', 'ShowService', function ($scope, AuthService, Constants, TaskService, NgTableParams, $rootScope, $state, $stateParams, ShowService) {

        $scope.MaxStudentCountPerExam = 999;//原先有限制:目前一场考试最多支持500个学生, 根据bug#7575限制为999

        $scope.SelectClassCount = 0;
        $scope.SelectPaperCount = 0;

        $scope.MaxClassCount = 99999;
        $scope.MaxPaperCount = 99999;

        $scope.CurrentStep = 1;

        $scope.TaskAdd = {
            TaskType: 0,
            TaskName: '',
        };
        $scope.Validate = function (validateKey) {
            if (validateKey == 'task') {
                if ($scope.TaskAdd.TaskType != 1 && $scope.TaskAdd.TaskType != 2) {
                    $rootScope.openCommonWarningDialog("警告", "请选择任务类型", null);
                    return false;
                }
                if ($scope.TaskAdd.TaskName == undefined || $scope.TaskAdd.TaskName == '') {
                    $rootScope.openCommonWarningDialog("警告", "请填写任务名称", null);
                    return false;
                }
                if ($scope.TaskAdd.TaskName.length < 3 || $scope.TaskAdd.TaskName.length > 30) {
                    $rootScope.openCommonWarningDialog("警告", "任务名必须是3~30位的中英文或数字", null);
                    return false;
                }
            }

            GetSelectedCls($scope.ClassList.settings().dataset);
            if (validateKey == 'class') {

                if ($scope.SelectedCls.length <= 0) {
                    $rootScope.openCommonWarningDialog("警告", "请选择班级", null);
                    return false;
                }
                if ($scope.SelectedCls.length > $scope.MaxClassCount) {
                    $rootScope.openCommonWarningDialog("警告", "最多选择" + $scope.MaxClassCount + "个班级", null);
                    return false;
                }
            }
            GetSelectedPaper($scope.PaperList.settings().dataset);
            if (validateKey == 'paper') {

                if ($scope.SelectedPaper.length <= 0) {
                    $rootScope.openCommonWarningDialog("警告", "请选择试卷", null);
                    return false;
                }

                if ($scope.SelectedPaper.length > $scope.MaxPaperCount) {

                    $rootScope.openCommonWarningDialog("警告", "最多选择" + $scope.MaxPaperCount + "套试卷", null);
                    return false;
                }
            }

            return true;
        }

        $scope.TempStep = 1;
        $scope.NextStepToTask = function (nextStep, validateKey) {
            if ($scope.Validate(validateKey) == false) {
                return;
            }

            $scope.TempStep = nextStep;
            if (validateKey == 'paper') {
                var isDifTem = IsDifTem($scope.SelectedTemplate);

                if (isDifTem) {
                    $rootScope.openCommonErrorDialog("错误", "您选择的" + $scope.SelectedPaper.length + "套试卷，模板不统一,请检查!", null);
                    return;
                }
                else {
                    $scope.SetCurrentStep();
                }
            }
            else if (validateKey === 'class') {
                if (!CheckStuNum()) {
                    $rootScope.openCommonErrorDialog("错误", "您期望创建" + $scope.StuTotalNum + "人的考试任务，本系统暂不支持，请确认后重试", null);
                    return;
                }
                $scope.StuRepeatList = new NgTableParams({ count: 10 },
                {
                    counts: [10, 20, 30, 50],
                    getData: function (params) {
                        return TaskService.GetRepeatStuList($scope.SelectedCls)
                            .then(function (results) {
                                if (results.data != null && results.data.length > 0) {
                                    angular.element('#AllotStuDialog').modal({ backdrop: 'static', keyboard: false });
                                } else {
                                    $scope.SetCurrentStep();
                                }
                                return results.data;
                            });
                    }
                });

            }
            else {
                $scope.SetCurrentStep();
            }
        }

        angular.element('#AllotStuDialog').on('hidden.bs.modal', function () {
            ShowService.IsHiddin = false;
            //angular.element('#AllotStuDialog').modal('hide');
        });

        $scope.SetCurrentStep = function () {
            $scope.CurrentStep = $scope.TempStep;
            console.log('CurrentStep:', $scope.CurrentStep);
            if ($scope.TaskAdd.TaskType == 0) {
                $scope.TaskAdd.TaskType = 1;
                console.log('set step:', $scope.TaskAdd);
            }

            if ($scope.CurrentStep == '3' && $state.current.name == 'paper.createtask') {
                // var loadCustomPaper = $scope.CustomerPaper ? 1 : 0;
                // return $scope.LoadPaperList(loadCustomPaper);
                $scope.LoadClsList();
            }
        }

        if ($scope.CurrentStep == '1' && $scope.TaskAdd.TaskType == 0 && $state.current.name != 'paper.createtask') {
            $scope.TaskAdd.TaskType = 1;
            console.log('init:', $scope.TaskAdd);
        }

        $scope.NextStepToClass = function (nextStep, validateKey) {

            if ($scope.Validate(validateKey) == false) {
                return;
            }

            $scope.TempStep = nextStep;
            if (validateKey == 'paper') {
                var isDifTem = IsDifTem($scope.SelectedTemplate);

                if (isDifTem) {
                    $rootScope.openCommonErrorDialog("错误", "您选择的" + $scope.SelectedPaper.length + "套试卷，模板不统一,请检查!", null);
                    return;
                }
                else {
                    $scope.SetCurrentStep();
                }
            }
            else if (validateKey === 'class') {
                if (!CheckStuNum()) {
                    $rootScope.openCommonErrorDialog("错误", "您期望创建" + $scope.StuTotalNum + "人的考试任务，本系统暂不支持，请确认后重试", null);
                    return;
                }
                $scope.StuRepeatList = new NgTableParams({ count: 10 },
                {
                    counts: [10, 20, 30, 50],
                    getData: function () {
                        return TaskService.GetRepeatStuList($scope.SelectedCls)
                            .then(function (results) {
                                if (results.data != null && results.data.length > 0) {
                                    angular.element('#AllotStuDialog').modal({ backdrop: 'static', keyboard: false });
                                } else {
                                    $scope.SetCurrentStep();
                                }
                                return results.data;
                            });
                    }
                });

            }
            else {
                $scope.SetCurrentStep();
            }
        }
        $scope.NextStepToPaper = function (nextStep, validateKey) {
            $scope.TempStep = nextStep;

            if ($scope.Validate(validateKey) == false) {
                return;
            }

            else if (validateKey === 'class') {
                if (!CheckStuNum()) {
                    $rootScope.openCommonErrorDialog("错误", "您期望创建" + $scope.StuTotalNum + "人的考试任务，本系统暂不支持(最多" + $scope.MaxStudentCountPerExam + "人)，请确认后重试", null);
                    return;
                }
                $scope.StuRepeatList = new NgTableParams({ count: 10 },
                {
                    counts: [10, 20, 30, 50],
                    getData: function () {
                        return TaskService.GetRepeatStuList($scope.SelectedCls)
                            .then(function (results) {
                                if (results.data != null && results.data.length > 0) {
                                    angular.element('#AllotStuDialog').modal({ backdrop: 'static', keyboard: false });
                                } else {
                                    $scope.SetCurrentStep();
                                }
                                return results.data;
                            });
                    }
                });



            } else {
                $scope.SetCurrentStep();
            }

        }

        //检查学生总人数
        function CheckStuNum() {
            $scope.StuTotalNum = 0;
            if (angular.isArray($scope.SelectedClsOjb) && $scope.SelectedClsOjb.length > 0) {
                angular.forEach($scope.SelectedClsOjb, function (item, i) {
                    $scope.StuTotalNum += item.StudentCount;
                });
            }
            if ($scope.StuTotalNum > $scope.MaxStudentCountPerExam) {
                return false;
            }
            return true;
        }

        $scope.AllotStudent = function (key) {
            if (key === 'paper') {
                $scope.CreateTask();
            }
            ShowService.IsHiddin = false;
            angular.element('#AllotStuDialog').modal('hide');
            $scope.SetCurrentStep();
        }


        $scope.AddTask = function (validateKey) {

            if ($scope.Validate(validateKey) == false) {
                return;
            }
            if (validateKey === 'paper') {
                var isDifTem = IsDifTem($scope.SelectedTemplate);

                if (isDifTem) {
                    $rootScope.openCommonErrorDialog("错误", "您选择的" + $scope.SelectedPaper.length + "套试卷，模板不统一,请检查!", null);
                    return;
                }
                else {
                    $scope.CreateTask();
                }
            }
            else if (validateKey === 'class') {
                if (!CheckStuNum()) {
                    $rootScope.openCommonErrorDialog("错误", "您期望创建" + $scope.StuTotalNum + "人的考试任务，本系统暂不支持(最多" + $scope.MaxStudentCountPerExam + "人)，请确认后重试", null);
                    return;
                }
                $scope.StuRepeatList = new NgTableParams({ count: 10 },
                {
                    counts: [10, 20, 30, 50],
                    getData: function (params) {
                        return TaskService.GetRepeatStuList($scope.SelectedCls)
                            .then(function (results) {
                                params.total(9999999);
                                if (results.data != null && results.data.length > 0) {
                                    angular.element('#AllotStuDialog').modal({ backdrop: 'static', keyboard: false });
                                }
                                else {
                                    $scope.CreateTask();
                                }
                                return results.data;
                            });
                    }
                });
            }
            else {
                $scope.CreateTask();
            }
        }

        //----获取班级
        $scope.ClassList = new NgTableParams({ count: 999 }, {
            counts: [],
            dataset: [],
        });

        $scope.AllClass = [];
        $scope.LoadClsList = function () {
            TaskService.GetTeacherClsList().then(function (result) {
                $scope.Filter.CurrentCls = result.data[0];
                $scope.AllClass = result.data;

                var data = result.data;
                //设置默认选择的班级列表
                $scope.SetDefaultChooseClass(data, $scope.postClassList);

                $scope.ClassList.settings({
                    dataset: data
                });


            });
        }
        $scope.LoadClsList();

        //设置默认选择的班级列表
        $scope.SetDefaultChooseClass = function (data, selectList) {
            if (selectList != undefined && selectList != null && selectList.length > 0) {
                for (var selectIndex = 0; selectIndex < selectList.length; selectIndex++) {
                    var selectClassID = selectList[selectIndex];

                    if (angular.isArray(data) && data.length > 0) {
                        for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                            if (data[dataIndex].ClassID == selectClassID) {
                                data[dataIndex].Selected = 1;
                                break;
                            }
                        }
                    }
                }
            }
            $scope.SelectClassCount = GetSelectedCls(data).length;
        }



        //----全选----------------------------
        $scope.SelectAllClsTag = false;
        $scope.SelectAllClass = function (event) {
            event.stopPropagation(); // 阻止事件冒泡

            $scope.SelectAllClsTag = $scope.SelectAllClsTag ? false : true;

            $scope.SelectAll($scope.ClassList.settings().dataset, $scope.SelectAllClsTag);
            $scope.SelectClassCount = GetSelectedCls($scope.ClassList.settings().dataset).length;

        }

        $scope.SelectAll = function (data, flag) {
            var newValue = "0";
            if (flag) {
                newValue = "1";
            }
            var message = '';
            if (angular.isArray(data) && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].StudentCount == 0 && flag) {
                        //message += (data[i].ClassName + "没有考生信息；");
                        data[i].Selected = 0;
                        continue;
                    }
                    data[i].Selected = newValue;
                }
            }
            //if (message != '') {
            //    $rootScope.openCommonErrorDialog("错误", message, null);
            //}
        }

        function GetSelectedCls(data) {
            $scope.SelectedCls = [];
            $scope.SelectedClsOjb = [];
            if (angular.isArray(data) && data.length > 0) {
                angular.forEach(data, function (item, i) {
                    if (item.Selected == 1 || item.Selected == "1") {
                        $scope.SelectedCls.push(item.ClassID);
                        $scope.SelectedClsOjb.push(item);
                    }
                });
            }
            return $scope.SelectedCls;
        }



        $scope.ChooseClass = function (chooseClassID) {
            var data = $scope.ClassList.data;

            if (chooseClassID != undefined && chooseClassID != null) {

                if (angular.isArray(data) && data.length > 0) {
                    for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                        if (data[dataIndex].ClassID == chooseClassID) {

                            if (data[dataIndex].Selected == 1) {
                                data[dataIndex].Selected = 0;
                            }
                            else {
                                if (data[dataIndex].StudentCount == 0) {
                                    data[dataIndex].Selected = 0;
                                    //$rootScope.openCommonErrorDialog("错误", data[dataIndex].ClassName + "没有考生信息!", null);                                    
                                }
                                else {
                                    data[dataIndex].Selected = 1;
                                }
                            }
                            break;
                        }
                    }
                }
            }

            $scope.SelectClassCount = GetSelectedCls(data).length;
        }



        $scope.CustomerPaper = false;
        $scope.ListEmpty = false;
        $scope.Filter = {
            SelectDistrict: "",
            SelectGrade: "",
            SelectYear: "",
            SelectBook: "",
            SelectKnowledgePoint: "",
            SelectCapability: "",
            SelectDifficulty: "",
            PaperName: "",
            SelectPaperTemplate: "",
            IsCustomPaper: 0
        }
        //------获取试卷 ------------------------------
        $scope.SwitchPaperList = function (type) {
            if (type == 0) {
                $("#paperTemplate").show();
            }
            else {
                $("#paperTemplate").hide();
            }
            $scope.LoadPaperList(type);
        };
        $scope.PaperList = new NgTableParams({ count: 5 }, {
            counts: [5, 10],
            dataset: []
        });
        $scope.LoadPaperList = function (type) {
            if (type != 1) {
                type = 0;
            }
            $scope.SelectAllPaperTag = false;
            $scope.SelectAllClsTag = false;
            $scope.Filter.SpecialFlag = $scope.TaskAdd.TaskType;
            $scope.Filter.IsCustomPaper = type;
            $scope.CustomerPaper = (type == 1);
            TaskService.GetPaperList($scope.Filter).then(function (result) {
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

        $scope.GotoPaperManger = function () {
            angular.element('#AddTaskDialog').modal("hide");
            $state.go('paper');
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
            TaskService.GetPaperTemplateList().then(function (result) {
                var d = result.data;
                $scope.AllPaperTemplateList = d;
                $scope.FilterPaperTemplateList('');
            });
        }

        $scope.FilterPaperTemplateList = function (ptFilter) {
            $scope.PaperTemplateList = [{ ID: "", Name: "全部" }];
            for (var i = 0; i < $scope.AllPaperTemplateList.length; i++) {
                var pt = $scope.AllPaperTemplateList[i];
                if (pt != undefined && pt.PaperTemplateName != undefined && pt.PaperTemplateName.indexOf(ptFilter) != -1) {
                    var findPT = { ID: pt.PaperTemplateID, Name: pt.PaperTemplateName };
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




        //处理传递的参数
        $scope.fromState = "";
        $scope.postClassList = [];
        $scope.postPaperList = [];
        var paramsData = $state.params.data;
        console.log("state params: ", paramsData);
        if (paramsData != undefined) {
            var selectClassList = paramsData.ClassList;
            var selectPaperList = paramsData.PaperList;
            var isCustomPaper = paramsData.IsCustomPaper;
            var fromState = paramsData.FromState;

            $scope.CustomerPaper = isCustomPaper != undefined ? isCustomPaper : false;

            if (selectClassList != undefined && selectClassList != null) {
                console.log("selectClassList: ", selectClassList);
                $scope.postClassList = selectClassList;
            }
            if (selectPaperList != undefined && selectPaperList != null) {
                console.log("selectPaperList: ", selectPaperList);
                $scope.postPaperList = selectPaperList;
            }

            if (fromState != undefined && fromState != null) {
                console.log("fromState: ", fromState);
                $scope.fromState = fromState;
            }


            var loadCustomPaper = $scope.CustomerPaper ? 1 : 0;
            $scope.LoadPaperList(loadCustomPaper);
        }


        $scope.CreateTask = function () {

            console.log("selectedClass", $scope.SelectedCls);
            console.log("selectedPaper", $scope.SelectedPaper);

            var specialStudentList = [];
            if ($scope.StuRepeatList.data != undefined && $scope.StuRepeatList.data.length > 0) {
                for (var i = 0; i < $scope.StuRepeatList.data.length; i++) {
                    var element = $scope.StuRepeatList.data[i];
                    if (element.SelectedClass != undefined) {
                        specialStudentList.push({
                            StudentNumber: element.StudentNumber,
                            ClassID: element.SelectedClass.ClassID
                        })
                    }
                }
            }

            TaskService.CreateTask({
                TaskName: $scope.TaskAdd.TaskName,
                TaskType: $scope.TaskAdd.TaskType,
                Classes: $scope.SelectedCls,
                Papers: $scope.SelectedPaper,
                SpecialStudentModels: specialStudentList

            }).then(function () {
                var data = $state.params.data;
                console.log(data);
                if (data != undefined) {
                    var dialogElement = data.dialogElement;
                    if (dialogElement != undefined && dialogElement != "") {
                        angular.element('#' + dialogElement).modal('hide');
                        $scope.$emit('createTaskFinished', '');
                    }
                }
            }, function (error) {
                $rootScope.openCommonErrorDialog("创建任务失败", error.data.Message);
            });
        }


        $scope.CancelChooseStudentClass = function () {
            ShowService.IsHiddin = false;
            angular.element('#AllotStuDialog').modal('hide');
        }

    }])
    /*
    * Services
    */
    .service('TaskService', function ($http, Constants) {
        var self = this;

        self.GenerateTaskPackage = function (taskID) {
            return $http.get(GLOBAL_API_URL + 'api/task/generateTask/' + taskID);
        };
        self.GetTaskAnswerImportSummaryInfo = function (taskID) {
            return $http.get(GLOBAL_API_URL + 'api/answer/getTaskAnswerImportSummaryInfo/' + taskID);
        };

        self.UpdateTaskStatus = function (taskID, newTaskStatus) {
            var param = { TaskID: taskID, TaskStatus: newTaskStatus };
            return $http.post(GLOBAL_API_URL + "api/task/updateStatus", param);
        }

        self.GetTaskList = function (queryParam) {
            return $http.post(GLOBAL_API_URL + "api/task/list/detailbypage", queryParam);
        }


        self.GetTeacherClsList = function () {
            return $http.get(GLOBAL_API_URL + 'api/teacher/teacherclsList');
        };

        self.GetPaperList = function (filter) {
            return $http.post(GLOBAL_API_URL + 'api/paper/list', filter);
        }

        self.GetPaperTemplateList = function () {
            return $http.get(GLOBAL_API_URL + 'api/paper/paperTemplateList');
        }

        self.CreateTask = function (task) {
            return $http.post(GLOBAL_API_URL + 'api/task/create', task);
        }

        self.GetRepeatStuList = function (cls) {
            return $http.post(GLOBAL_API_URL + 'api/task/getRepeatStuList', cls);
        }

        self.DeleteTask = function (taskID) {
            return $http.get(GLOBAL_API_URL + 'api/task/delete/' + taskID);
        }

        self.UpdateTask = function (task) {
            return $http.post(GLOBAL_API_URL + 'api/task/updatetask', { TaskID: task.TaskID, TaskName: task.TaskName, TaskType: task.TaskType });
        }

        self.getTaskAnswerGroupByArea = function (queryParam) {
            return $http.post(GLOBAL_API_URL + 'api/mark/taskAnswerGroupByArea', queryParam);
        }

        self.getTaskAnswerGroupByStu = function (queryParam) {
            return $http.post(GLOBAL_API_URL + 'api/mark/taskAnswerGroupByStudent', queryParam);
        }


        self.DoScore = function (answerID, score) {
            return $http.post(GLOBAL_API_URL + 'api/mark/score', { AnswerID: answerID, Score: score });
        }

        self.AchievementRelease = function (taskID) {
            return $http.get(GLOBAL_API_URL + 'api/task/achievementRelease/' + taskID);
        }

        self.GetTaskAnswerMarkTime = function (taskID) {
            return $http.get(GLOBAL_API_URL + 'api/answer/getTaskAnswerMarkTime/' + taskID);
        }

        this.ValidateScore = function (scoreText, maxScore) {
            var scoreValidateMessage = "";
            var validate = true;

            if (scoreText === "") {
                scoreValidateMessage = "请给出分数";
                validate = false;
            } else if (isNaN(scoreText)) {
                scoreValidateMessage = "请给出有效的分数";
                validate = false;
            } else {
                var score = parseFloat(scoreText);
                if (score < 0) {
                    scoreValidateMessage = "请给出有效的分数,分数不能是负数";
                    validate = false;
                } else if (score > maxScore) {
                    scoreValidateMessage = '总分：' + maxScore + '分， 你给出的分数: ' + score + ' , 已超出，请重新打分';
                    validate = false;
                }
                else {
                    var errorMsg = '请保留一位小数';
                    var regPattern = /^\d+(?:\.\d{1})?$/;
                    if (maxScore == 0.75) {
                        regPattern = /^\d+(?:\.\d{1,2})?$/;
                        errorMsg = '请保留最多两位小数';
                    }
                    if (!regPattern.test(score)) {
                        scoreValidateMessage = errorMsg;
                        validate = false;
                    }
                }
            }

            return { validate: validate, message: scoreValidateMessage };

        }
    })

});
