define([
    'angular', 'echarts',
    // 'bootstrap-datetimepicker',
    'bootstrap-daterangepicker'
], function (angular, echarts) {
    'use strict';
    angular
        .module('DataReport', ['ui.router'])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state('DataReport', {
                    url: "/DataReport",
                    views: {
                        'mainChildView': {
                            templateUrl: "business/DataReport/DataReport.html",
                            controller: 'DataReportCtrl'
                        }
                    }
                });
            }
        ])
        /*
    * Controllers
    */
        .controller('DataReportCtrl', [
            '$scope',
            'AuthService',
            'Constants',
            'NgTableParams',
            'DataReportCtrlService',
            '$rootScope',
            'toaster',
            'DatepickerOption',
            function ($scope, AuthService, Constants, NgTableParams, DataReportCtrlService, $rootScope, toaster, DatepickerOption) {

                $scope.QueryParams = {};
                $scope.ReportName = "";
                $scope.DateFrom;
                $scope.DateTo;
                $scope.servers = Constants.servers;
                function formateTime(day) {
                    var Year = 0;
                    var Month = 0;
                    var Day = 0;
                    var Hour = 0;
                    var Minute = 0;
                    var Second = 0;
                    var CurrentDate = "";
                    Year = day.getFullYear();
                    Month = day.getMonth() + 1;
                    Day = day.getDate();
                    Hour = day.getHours();
                    Minute = day.getMinutes();
                    Second = day.getSeconds();
                    CurrentDate += Year + "-";
                    if (Month >= 10) {
                        CurrentDate += Month + "-";
                    } else {
                        CurrentDate += "0" + Month + "-";
                    }
                    if (Day >= 10) {
                        CurrentDate += Day;
                    } else {
                        CurrentDate += "0" + Day;
                    }
                    CurrentDate += " ";
                    if (Hour >= 10) {
                        CurrentDate += Hour + ":";
                    } else {
                        CurrentDate += "0" + Hour + ":";
                    }
                    if (Minute >= 10) {
                        CurrentDate += Minute;
                    } else {
                        CurrentDate += "0" + Minute;
                    }

                    return CurrentDate;
                }

                var today = new Date();

                // $scope.DateTo = formateTime(today);// today.getFullYear() + "-" +
                // today.getMonth() + "-" + today.getDate() + " " + today.getHours() + ":" +
                // today.getMinutes(); $scope.DateFrom = formateTime(today);
                // $("#dtFrom").datetimepicker({     format: "yyyy-mm-dd hh:ii",     autoclose:
                // true,     todayBtn: true,     pickerPosition: "bottom-left" });
                // $("#dtTo").datetimepicker({     format: "yyyy-mm-dd hh:ii",     autoclose:
                // true,     todayBtn: true,     pickerPosition: "bottom-left" });
                $('#date-range-picker').daterangepicker(DatepickerOption);
                function ShowModel(param) {
                    $("#divUserInfo").hide();
                    $("#divPaperInfo").hide();
                    $("#divTaskInfo").hide();
                    $("#divDongleInfo").hide();
                    $("#divTeacherTaskInfo").hide();

                    $("#" + param).show();
                }

                $scope.UserInfoData = null;
                $scope.UserSummary = null;
                $scope.SearchUserInfo = function () {
                    $scope.ReportName = "用户统计";

                    ShowModel("divUserInfo");

                    var data;
                    var param = {
                        dtfrom: $('#date-range-picker')
                            .val()
                            .split(' - ')[0],
                        dtto: $('#date-range-picker')
                            .val()
                            .split(' - ')[1]
                    };

                    return DataReportCtrlService
                        .GetUserInfo(param, $('#server').val())
                        .then(function (results) {
                            if (results.data.length == 0) 
                                return;
                            
                            data = results.data;

                            $scope.UserInfoData = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return data.Table1;
                                }
                            });
                            $scope
                                .UserInfoData
                                .parameters()
                                .page = 1;
                            $scope
                                .UserInfoData
                                .reload();

                            $scope.UserSummary = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return data.Table2;
                                }
                            });
                            $scope
                                .UserSummary
                                .parameters()
                                .page = 1;
                            $scope
                                .UserSummary
                                .reload();

                            var timeData = [];
                            var newtUser = [];
                            var newSchool = [];
                            var newTeacher = [];
                            var newStduent = [];

                            angular.forEach(data.Table1, function (d, key) {
                                timeData.push(d.StatisticDate);
                                newtUser.push(d.TotalNewUserCount);
                                newSchool.push(d.NewSchoolAdminCount);
                                newTeacher.push(d.NewTeacherCount);
                                newStduent.push(d.NewStudentCount);
                            });

                            var dom = document.getElementById('chartUserInfo');
                            var chart = echarts.init(dom);
                            var option = {
                                title: {
                                    text: '用户信息'
                                },
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: ["新增用户", "新增学校管理员", "新增教师", "新增学生"]
                                },
                                toolbox: {
                                    show: true,
                                    feature: {
                                        // mark: { show: true }, dataView: { show: true, readOnly: false }, magicType: {
                                        // show: true, type: ['bar'] }, restore: { show: true }, saveAsImage: { show:
                                        // true }
                                    }
                                },
                                calculable: true,

                                xAxis: {
                                    type: 'category',
                                    data: timeData,
                                    axisLabel: {
                                        interval: 0,
                                        rotate: 45, //倾斜度 -90 至 90 默认为0
                                        margin: 2,
                                        textStyle: {
                                            fontWeight: "bolder",
                                            color: "#000000"
                                        }

                                    }
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: [
                                    {
                                        type: 'bar',
                                        name: '新增用户',
                                        data: newtUser
                                    }, {
                                        type: 'bar',
                                        name: '新增学校管理员',
                                        data: newSchool
                                    }, {
                                        type: 'bar',
                                        name: '新增教师',
                                        data: newTeacher
                                    }, {
                                        type: 'bar',
                                        name: '新增学生',
                                        data: newStduent
                                    }
                                ]
                            };

                            chart.setOption(option);
                        });
                }

                $scope.PaperInfoData = null;
                $scope.PaperSummary = null;
                $scope.SearchPaperInfo = function () {
                    $scope.ReportName = "试卷统计";

                    ShowModel("divPaperInfo");

                    var data;
                    var param = {
                        dtfrom: $('#date-range-picker')
                            .val()
                            .split(' - ')[0],
                        dtto: $('#date-range-picker')
                            .val()
                            .split(' - ')[1]
                    };
                    return DataReportCtrlService
                        .GetPaperInfo(param, $('#server').val())
                        .then(function (results) {
                            if (results.data.length == 0) 
                                return;
                            
                            data = results.data;

                            $scope.PaperInfoData = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return data.Table1;
                                }
                            });
                            $scope
                                .PaperInfoData
                                .parameters()
                                .page = 1;
                            $scope
                                .PaperInfoData
                                .reload();

                            $scope.PaperSummary = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return data.Table2;
                                }
                            });
                            $scope
                                .PaperSummary
                                .parameters()
                                .page = 1;
                            $scope
                                .PaperSummary
                                .reload();

                            var timeData = [];
                            var newtPaper = [];
                            var newPackage = [];
                            var newPackageCode = [];
                            var activePackageCode = [];

                            angular.forEach(data.Table1, function (d, key) {
                                timeData.push(d.StatisticDate);
                                newtPaper.push(d.NewPaperCount);
                                newPackage.push(d.NewPaperPackageCount);
                                newPackageCode.push(d.NewPaperPackageContentIDCount);
                                activePackageCode.push(d.ActivePaperPackageCount);
                            });

                            var dom = document.getElementById('chartPaperInfo');
                            var chart = echarts.init(dom);
                            var option = {
                                title: {
                                    text: '试卷信息'
                                },
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: ["新增试卷", "新增试卷包", "新增内容序列号", "激活的内容序列号"]
                                },
                                toolbox: {
                                    show: true,
                                    feature: {
                                        // mark: { show: true }, dataView: { show: true, readOnly: false }, magicType: {
                                        // show: true, type: ['bar'] }, restore: { show: true }, saveAsImage: { show:
                                        // true }
                                    }
                                },
                                calculable: true,

                                xAxis: {
                                    type: 'category',
                                    data: timeData,
                                    axisLabel: {
                                        interval: 0,
                                        rotate: 45, //倾斜度 -90 至 90 默认为0
                                        margin: 2,
                                        textStyle: {
                                            fontWeight: "bolder",
                                            color: "#000000"
                                        }

                                    }
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: [
                                    {
                                        type: 'bar',
                                        name: '新增试卷',
                                        data: newtPaper
                                    }, {
                                        type: 'bar',
                                        name: '新增试卷包',
                                        data: newPackage
                                    }, {
                                        type: 'bar',
                                        name: '新增内容序列号',
                                        data: newPackageCode
                                    }, {
                                        type: 'bar',
                                        name: '激活的内容序列号',
                                        data: activePackageCode
                                    }
                                ]
                            };

                            chart.setOption(option);
                        });
                }

                $scope.TaskInfoData = null;
                $scope.TaskSummary = null;
                $scope.SearchTaskInfo = function () {
                    $scope.ReportName = "任务统计";
                    ShowModel("divTaskInfo");

                    var data;
                    var param = {
                        dtfrom: $('#date-range-picker')
                            .val()
                            .split(' - ')[0],
                        dtto: $('#date-range-picker')
                            .val()
                            .split(' - ')[1]
                    };
                    return DataReportCtrlService
                        .GetTaskInfo(param, $('#server').val())
                        .then(function (results) {
                            if (results.data.length == 0) 
                                return;
                            
                            data = results.data;

                            $scope.TaskInfoData = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return data.Table1;
                                }
                            });
                            $scope
                                .TaskInfoData
                                .parameters()
                                .page = 1;
                            $scope
                                .TaskInfoData
                                .reload();

                            $scope.TaskSummary = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return data.Table2;
                                }
                            });
                            $scope
                                .TaskSummary
                                .parameters()
                                .page = 1;
                            $scope
                                .TaskSummary
                                .reload();
                                
                            var timeData = [];
                            var newtTask = [];
                            var uploadAudio = [];
                            var markedAudio = [];

                            angular.forEach(data.Table1, function (d, key) {
                                timeData.push(d.StatisticDate);
                                newtTask.push(d.NewTaskCount);
                                uploadAudio.push(d.SepAnswerCount);
                                markedAudio.push(d.SepAnswerAMSMarkCount);
                            });

                            var dom = document.getElementById('chartTaskInfo');
                            var chart = echarts.init(dom);
                            var option = {
                                title: {
                                    text: '任务信息'
                                },
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: ["新建任务", "上传音频数量", "机器评分数量"]
                                },
                                toolbox: {
                                    show: true,
                                    feature: {
                                        // mark: { show: true }, dataView: { show: true, readOnly: false }, magicType: {
                                        // show: true, type: ['bar'] }, restore: { show: true }, saveAsImage: { show:
                                        // true }
                                    }
                                },
                                calculable: true,

                                xAxis: {
                                    type: 'category',
                                    data: timeData,
                                    axisLabel: {
                                        interval: 0,
                                        rotate: 45, //倾斜度 -90 至 90 默认为0
                                        margin: 2,
                                        textStyle: {
                                            fontWeight: "bolder",
                                            color: "#000000"
                                        }

                                    }
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: [
                                    {
                                        type: 'bar',
                                        name: '新建任务',
                                        data: newtTask
                                    }, {
                                        type: 'bar',
                                        name: '上传音频数量',
                                        data: uploadAudio
                                    }, {
                                        type: 'bar',
                                        name: '机器评分数量',
                                        data: markedAudio
                                    }
                                ]
                            };

                            chart.setOption(option);
                        });
                }

                $scope.DongleInfoData = null;
                $scope.DongleSummary = null;
                $scope.SearchDongleInfo = function () {
                    $scope.ReportName = "加密狗统计";
                    ShowModel("divDongleInfo");

                    var param = {
                        dtfrom: $('#date-range-picker')
                            .val()
                            .split(' - ')[0],
                        dtto: $('#date-range-picker')
                            .val()
                            .split(' - ')[1]
                    };
                    var data;
                    return DataReportCtrlService
                        .GetDongleInfo(param, $('#server').val())
                        .then(function (results) {
                            if (results.data.length == 0) 
                                return;
                            
                            data = results.data;

                            $scope.DongleInfoData = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return data.Table1;
                                }
                            });
                            $scope
                                .DongleInfoData
                                .parameters()
                                .page = 1;
                            $scope
                                .DongleInfoData
                                .reload();

                            $scope.DongleSummary = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return data.Table2;
                                }
                            });
                            $scope
                                .DongleSummary
                                .parameters()
                                .page = 1;
                            $scope
                                .DongleSummary
                                .reload();

                            var timeData = [];
                            var newtDongle = [];
                            var activitetDongle = [];

                            angular.forEach(data.Table1, function (d, key) {
                                timeData.push(d.StatisticDate);
                                newtDongle.push(d.NewDongleCount);
                                activitetDongle.push(d.NewActiveDongleCount);
                            });

                            var dom = document.getElementById('chartDongleInfo');
                            var chart = echarts.init(dom);
                            var option = {
                                title: {
                                    text: '加密狗信息'
                                },
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: ["新增加密狗", "激活加密狗"]
                                },
                                toolbox: {
                                    show: true,
                                    feature: {
                                        // mark: { show: true }, dataView: { show: true, readOnly: false }, magicType: {
                                        // show: true, type: ['bar'] }, restore: { show: true }, saveAsImage: { show:
                                        // true }
                                    }
                                },
                                calculable: true,

                                xAxis: {
                                    type: 'category',
                                    data: timeData,
                                    axisLabel: {
                                        interval: 0,
                                        rotate: 45, //倾斜度 -90 至 90 默认为0
                                        margin: 2,
                                        textStyle: {
                                            fontWeight: "bolder",
                                            color: "#000000"
                                        }

                                    }
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: [
                                    {
                                        type: 'bar',
                                        name: '新增加密狗',
                                        data: newtDongle
                                    }, {
                                        type: 'bar',
                                        name: '激活加密狗',
                                        data: activitetDongle
                                    }
                                ]
                            };

                            chart.setOption(option);
                        });
                }

                $scope.TeacherTaskInfoData = null;
                $scope.TeacherTaskInfoData_Data = [];
                $scope.SearchTeacherTask = function () {
                    $scope.ReportName = "教师创建任务统计";
                    ShowModel("divTeacherTaskInfo");

                    var param = {
                        dtfrom: $('#date-range-picker')
                            .val()
                            .split(' - ')[0],
                        dtto: $('#date-range-picker')
                            .val()
                            .split(' - ')[1],
                        city: "北京"
                    };
                   
                    return DataReportCtrlService
                        .GetTeacherTaskInfo(param, $('#server').val())
                        .then(function (results) {
                            if (results.data.length == 0) 
                                return;
                            
                            $scope.TeacherTaskInfoData_Data = results.data;

                            $scope.TeacherTaskInfoData = new NgTableParams({
                                count: 10
                            }, {
                                getData: function (params) {
                                    return $scope.TeacherTaskInfoData_Data.Table2;
                                }
                            });
                            $scope
                                .TeacherTaskInfoData
                                .parameters()
                                .page = 1;
                            $scope
                                .TeacherTaskInfoData
                                .reload();
                        });
                }
            }
        ])

        /*
* Services
*/
        .service('DataReportCtrlService', function ($http, Constants) {
            var serviceBase = Constants.apiServiceBaseUri;
            var self = this;

            self.GetUserInfo = function (param, server) {
                return $http.get(server + 'api/DataReport/GetUserInfo?dtfrom=' + param.dtfrom + '&dtto=' + param.dtto);
            }
            self.GetPaperInfo = function (param, server) {
                return $http.get(server + 'api/DataReport/GetPaperInfo?dtfrom=' + param.dtfrom + '&dtto=' + param.dtto);
            }
            self.GetTaskInfo = function (param, server) {
                return $http.get(server + 'api/DataReport/GetTaskInfo?dtfrom=' + param.dtfrom + '&dtto=' + param.dtto);
            }
            self.GetDongleInfo = function (param, server) {
                return $http.get(server + 'api/DataReport/GetDongleInfo?dtfrom=' + param.dtfrom + '&dtto=' + param.dtto);
            }
            self.GetTeacherTaskInfo = function (param, server) {
                 return $http.post(server + 'api/DataReport/GetTeacherTaskInfo',{
                     dtfrom:param.dtfrom,
                     dtto:param.dtto,
                     city: param.city,
                     TableParam: {
                         page: 1,
                         count:200
                     }
                 });
                //return $http.get(server + 'api/DataReport/GetTeacherTaskInfo?dtfrom=' + param.dtfrom + '&dtto=' + param.dtto + '&city=' + param.city);
            }
        });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
