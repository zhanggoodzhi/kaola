define(['angular', 'echarts', 'html2canvas', 'ng-table', 'ngToaster'], function (angular, echarts, html2canvas) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app')
        .controller('StudentReportCtrl', ['$scope', 'NgTableParams', 'AuthService', '$state', 'ReportService', '$stateParams', 'toaster', function ($scope, NgTableParams, AuthService, $state, ReportService, $stateParams, toaster) {

            console.log("enter StudentReportCtrl");

            //特殊处理左侧菜单选中状态,延时设置active class, 覆盖 ui-sref-active设置的值
            setTimeout(function () {
                angular.element("#slidemenu-li-state-teacherreport").addClass('active');
            }, 100);
            //

            $scope.AuthService = AuthService;

            $scope.ShowBdClassView = 0;
            $scope.ShowStudentReportView = 0;

            //处理传递过来的参数
            $scope.CurrentClassID = $stateParams.classID;
            console.log("ClassID:" + $scope.CurrentClassID);
            $scope.CurrentStudentNumber = $stateParams.studentNumber;
            console.log("StudentNumber:" + $scope.CurrentStudentNumber);
            $scope.From = $stateParams.from;
            console.log("From:" + $scope.From);


            //检查是否需要显示 [提示绑定班级]
            if ($scope.CurrentClassID != undefined && $scope.CurrentClassID != "" && $scope.CurrentStudentNumber != undefined && $scope.CurrentStudentNumber != "") {
                //教师从班级学生管理页面跳转到 查看学生成绩报告的列表
                $scope.ShowBdClassView = 0;
                $scope.ShowStudentReportView = 1;

            } else {

                ReportService.GetStudentClass().then(function (result) {

                    console.log(result);
                    if (angular.isArray(result.data) && result.data.length > 0) {
                        $scope.ShowBdClassView = 0;
                        $scope.ShowStudentReportView = 1;
                    } else {
                        $scope.ShowBdClassView = 1;
                        $scope.ShowStudentReportView = 0;
                    }
                });
            }

            $scope.ToBindClass = function () {
                $state.go('personal', { childview: 'bindclass' });
            }


            //绑定班级
            $scope.BindJudge = function () {
                $scope.BindClassParam = {
                    ClassNumber: '',
                    StudentNumber: '',
                    StudentName: AuthService.AuthData().nickName,
                };
                angular.element('#StudentDialog').modal('show');
            };



            $scope.BindClass = function () {
                ReportService.bindClass($scope.BindClassParam).then(function (bindresult) {
                    //$scope.LoadStuClsList();
                    angular.element('#StudentDialog').modal('hide');
                    //toaster.success({ body: bindresult.data });
                    $scope.ToBindClass();
                }, function (error) {
                    toaster.error({ body: error.data.Message, toasterId: 'dialog1' });
                });
            };



            //检查是否需要显示 [提示绑定班级]

            $scope.QueryParams = {
                PostParams: [],
                TaskName: '',
            };


            $scope.TaskScoreListData = [];

            $scope.TaskScoreList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 50, 100],
                getData: function (params) {
                    if ($scope.CurrentClassID != undefined && $scope.CurrentClassID != "" && $scope.CurrentStudentNumber != undefined && $scope.CurrentStudentNumber != "") {
                        $scope.QueryParams.StudentNumber = $scope.CurrentStudentNumber;
                        $scope.QueryParams.ClassID = $scope.CurrentClassID;
                    } else {
                        $scope.QueryParams.StudentID = AuthService.AuthData().userID;
                    }
                    $scope.QueryParams.PostParams = params.parameters();
                    //console.log(params.parameters());
                    return ReportService.GetReport_TaskListForStudent($scope.QueryParams).then(function (results) {

                        params.total(results.data.Count);
                        $scope.TaskScoreListData = results.data.TaskStudentListData;
                        //console.log($scope.TaskScoreListData);
                        return results.data.TaskStudentListData;
                    });
                }
            });


            $scope.QueryTaskScoreList = function () {
                $scope.TaskScoreList.reload();
            };

            $scope.TaskScoreList.reload();

        }])

    .controller('StudentReportTaskDetailCtrl', ['$scope', 'AuthService', '$state', 'ReportService', 'NgTableParams', '$stateParams', '$timeout', function ($scope, AuthService, $state, ReportService, NgTableParams, $stateParams, $timeout) {

        $scope.StudentTaskData = [];

        $scope.ListeningAreaData = [];
        $scope.SpeakingAreaData = [];
        $scope.taskID = $stateParams.taskID;
        $scope.studentNumber = $stateParams.studentNumber;
        $scope.from = $stateParams.from;
        $scope.classID = $stateParams.classID;

        $scope.LoadStudentTaskData = function (taskID, studentNumber) {
            var queryParam = { TaskID: taskID, StudentNumber: studentNumber };
            ReportService.GetReport_TaskListForStudent(queryParam).then(function (result) {
                $scope.StudentTaskData = result.data.TaskStudentListData[0];
            });
        }
        $scope.LoadStudentAreaData = function (taskID, studentNumber) {
            var queryParam = { TaskID: taskID, StudentNumber: studentNumber };
            ReportService.GetReport_TaskAreaDataForStudent(queryParam).then(function (result) {
                $scope.ListeningAreaData = result.data.ListeningAreaData;
                $scope.SpeakingAreaData = result.data.SpeakingAreaData;
                console.log("ListeningAreaData", $scope.ListeningAreaData);
                console.log("SpeakingAreaData", $scope.SpeakingAreaData);
            });
        }

        $scope.ShowTaskDetailReportForStudent = function (taskID, studentNumber) {
            $scope.LoadStudentTaskData(taskID, studentNumber);
            $scope.LoadStudentAreaData(taskID, studentNumber);
            $scope.LoadTaskPaperAnalysisData(taskID, studentNumber, $scope.CurrentPaperID);

        }


        $scope.ReturnTaskListReportForStudent = function () {
            $state.go('studentreport', {
                taskID: $scope.taskID,
                studentNumber: $scope.studentNumber,
                classID: $scope.classID,
                from: $scope.from
            });
        }

        $scope.LoadTaskPaperAnalysisData = function (taskID, studentID, paperID) {
            $timeout(function () {
                $scope.AnalysisBarChart = $scope.InitAnalysisBarChart('analysis_barChart');
                $scope.AnalysisRadarChart = $scope.InitAnalysisRadarChart('analysis_radarChart');

                ReportService.GetTaskPaperAnalysisDataForStudent(taskID, studentID, paperID).then(function (result) {

                    $scope.AnalysisBarChart.hideLoading();
                    $scope.AnalysisRadarChart.hideLoading();

                    $scope.TaskPapers = result.data.TaskPapers;

                    //$scope.TaskPapers.push({ PaperID: "eba55c8beac1474b87ec3b50c0b5544d", PaperName: "Test达睿思口语考试模拟" });
                    //$scope.TaskPapers.push({ PaperID: "ba804b91ca0446a39419c9a454f9b6f4", PaperName: "Test达睿思口语考试模拟-完整题型Demo3" });

                    $scope.PaperAnalysisData = result.data.PaperAnalysisData;

                    if ($scope.TaskPapers.length > 0) {
                        var searchPaperID = paperID;
                        if (searchPaperID == undefined || searchPaperID == '') {
                            searchPaperID = $scope.TaskPapers[0].PaperID;
                        }
                        $scope.ChangePaperAnalysisData(searchPaperID);
                    }

                }, function (error) {
                    $scope.AnalysisBarChart.hideLoading();
                    $scope.AnalysisRadarChart.hideLoading();
                    $scope.SetLoadChartDataError('analysis_barChart');
                    $scope.SetLoadChartDataError('analysis_radarChart');
                })
            }, 1000);

        }
        $scope.ChoosedCurrentTaskPaper = [];
        $scope.ChangePaperAnalysisData = function (paperID) {
            var searchPaperID = paperID;

            $scope.ChoosedCurrentTaskPaper = [];
            for (var i = 0; i < $scope.TaskPapers.length; i++) {
                var p = $scope.TaskPapers[i];
                if (p.PaperID == searchPaperID) {
                    $scope.ChoosedCurrentTaskPaper = p;
                    break;
                }
            }
            console.log("ChoosedCurrentTaskPaper", $scope.ChoosedCurrentTaskPaper);

            $scope.CurrentPaperAnalysisData = [];
            for (var dIndex = 0; dIndex < $scope.PaperAnalysisData.length; dIndex++) {
                var d = $scope.PaperAnalysisData[dIndex];
                if (d.PaperDetail.PaperID == searchPaperID) {
                    $scope.CurrentPaperAnalysisData = d;
                    break;
                }
            }
            console.log("CurrentPaperAnalysisData", $scope.CurrentPaperAnalysisData);

            //知识点柱状图
            $scope.UpdateAnalysisBarChartData($scope.AnalysisBarChart, $scope.CurrentPaperAnalysisData.TaskKnowledgePointScore);

            //考察能力雷达图
            $scope.UpdateAnalysisRadarChartData($scope.AnalysisRadarChart, $scope.CurrentPaperAnalysisData.TaskStudyAbilityScore);
        }

     
        console.log("TaskID:" + $scope.taskID);
        console.log("StudentNumber:" + $scope.studentNumber);
        console.log("From:" + $scope.from);
        console.log("ClassID:" + $scope.classID);

        $scope.InitAnalysisBarChart = function (chartID) {
            var chartDom = document.getElementById(chartID);
            if (angular.isObject(chartDom)) {

                var chartInstance = echarts.init(chartDom);
                var option = {
                    title: [{
                        text: 'Funding by Campaigns',
                        left: '30%'
                    }],
                    color: ['#B8E4EF'],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: [],
                            axisTick: {
                                alignWithLabel: true
                            },
                            axisLabel: {
                                rotate: 90,
                                interval: 0
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '掌握度',
                            type: 'bar',
                            barWidth: '30%',
                            data: []
                        }
                    ]
                };
                chartInstance.setOption(option);

                chartInstance.showLoading();
                return chartInstance;
            }
            else {
                console.log("can not found dom:", chartID);
                return null;
            }
        }
        $scope.InitAnalysisRadarChart = function (chartID) {
            var chartDom = document.getElementById(chartID);
            if (angular.isObject(chartDom)) {

                var chartInstance = echarts.init(chartDom);
                var option = {
                    radar: [
                        {

                            radius: 120,
                            startAngle: 90,
                            splitNumber: 4,
                            shape: 'circle',
                            name: {
                                formatter: '【{value}】',
                                textStyle: {
                                    color: '#72ACD1'
                                }
                            },
                            splitArea: {
                                areaStyle: {
                                    color: ['rgba(114, 172, 209, 0.2)',
                                    'rgba(114, 172, 209, 0.4)', 'rgba(114, 172, 209, 0.6)',
                                    'rgba(114, 172, 209, 0.8)', 'rgba(114, 172, 209, 1)'],
                                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                                    shadowBlur: 10
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }
                            },
                            splitLine: {
                                lineStyle: {
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }
                            }
                        },
                        {
                            indicator: [
                                { text: '暂无统计项', max: 100 }                              
                            ],

                            radius: 120
                        }
                    ],
                    series: [

                        {
                            name: '成绩单',
                            type: 'radar',
                            radarIndex: 1,
                            data: [
                                {
                                    value: [],
                                    name: '',
                                    label: {
                                        normal: {
                                            show: true,
                                            formatter: function (params) {
                                                return params.value;
                                            }
                                        }
                                    }
                                }                                
                            ]
                        }
                    ]
                }
                chartInstance.setOption(option);

                chartInstance.showLoading();
                return chartInstance;
            }
            else {
                console.log("can not found dom:", chartID);
                return null;
            }
        }
        $scope.UpdateAnalysisBarChartData = function (barChart, knowledgePointData) {

            var xAixsData = [];
            var seriesData = [];

            var topN = 10;

            for (var i = 0; i < knowledgePointData.length; i++) {
                xAixsData.push(knowledgePointData[i].KnowledgePointDesc);
                seriesData.push(knowledgePointData[i].KnowledgePointScore);
                if (i >= topN) {
                    break;
                }
            }

            var option = {
                xAxis: [{
                    data: xAixsData
                }],
                series: [{
                    data: seriesData
                }]
            }
            barChart.setOption(option);

        }
        $scope.UpdateAnalysisRadarChartData = function (radarChart, data) {
          
            var optionData = [];
            var seriesData = [];

            var topN = 10;

            for (var i = 0; i < data.length; i++) {
                var obj = {
                    text: data[i].AbilityName,
                    max: 100
                }
                optionData.push(obj);
                seriesData.push(data[i].AvgGrasping);
                if (i >= topN) {
                    break;
                }
            }

            var option = {
                radar: [
                    {

                        radius: 120,
                        startAngle: 90,
                        splitNumber: 4,
                        shape: 'circle',
                        name: {
                            formatter: '【{value}】',
                            textStyle: {
                                color: '#72ACD1'
                            }
                        },
                        splitArea: {
                            areaStyle: {
                                color: ['rgba(114, 172, 209, 0.2)',
                                'rgba(114, 172, 209, 0.4)', 'rgba(114, 172, 209, 0.6)',
                                'rgba(114, 172, 209, 0.8)', 'rgba(114, 172, 209, 1)'],
                                shadowColor: 'rgba(0, 0, 0, 0.3)',
                                shadowBlur: 10
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        }
                    },
                    {
                        indicator: optionData,

                        radius: 120
                    }
                ],
                series: [

                    {
                        name: '成绩单',
                        type: 'radar',
                        radarIndex: 1,
                        data: [
                            {
                                value: seriesData,
                                name: '',
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: function (params) {
                                            return params.value;
                                        }
                                    }
                                }
                            },
                        ]
                    }
                ]
            }
            radarChart.setOption(option);
        }
        //End Paper Analysis
   

        if (angular.isString($scope.taskID) && $scope.taskID.length > 0
            && angular.isString($scope.studentNumber) && $scope.studentNumber.length > 0) {
            $scope.ShowTaskDetailReportForStudent($scope.taskID, $scope.studentNumber);

        }

        angular.element("#btn_ReturnTaskListReportForStudent").hide();

    }])

    .controller('TeacherReportCtrl', ['$scope', 'AuthService', '$state', 'ReportService', 'NgTableParams', '$stateParams', function ($scope, AuthService, $state, ReportService, NgTableParams, $stateParams) {

        $scope.AuthService = AuthService;

        $scope.QueryParams = {
            PostParams: [],
            TaskName: "",
            TeacherID: "",
            ClassID: ""
        };

        //处理传递过来的参数
        $scope.CurrentClassID = $stateParams.classID;
        console.log("ClassID:" + $scope.ClassID);
        $scope.From = $stateParams.from;
        console.log("From:" + $scope.From);

        if (angular.isString($scope.CurrentClassID) && $scope.CurrentClassID.length > 0) {
            $scope.QueryParams.ClassID = $scope.CurrentClassID;
        }

        $scope.ReportList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 50, 100],
            getData: function (params) {
              
                $scope.QueryParams.PostParams = params.parameters();
                //console.log(params.parameters());
                return ReportService.GetReport_TaskListForTeacher($scope.QueryParams).then(function (result) {
                    //console.log(result);
                    params.total(result.data.Count);
                    //console.log(result.data.Count);
                    return result.data.TaskListData;
                });
            }

        });

        $scope.QuerySearch = function () {
            $scope.ReportList.parameters().page = 1;
            $scope.ReportList.reload();
        }

        $scope.ViewTaskDetailReport = function (taskID) {
            $state.go('teacherreportdetail', { taskID: taskID, classID: $scope.CurrentClassID });
        }

    }])

    .controller('TeacherReportTaskDetailCtrl', ['$scope', 'AuthService', '$state', 'ReportService', 'NgTableParams', '$stateParams', '$timeout', function ($scope, AuthService, $state, ReportService, NgTableParams, $stateParams, $timeout) {

        //特殊处理左侧菜单选中状态,延时设置active class, 覆盖 ui-sref-active设置的值
        setTimeout(function () {
            angular.element("#slidemenu-li-state-teacherreport").addClass('active');
        }, 100);
        //

        $scope.TaskData = [];
        $scope.TaskStudentData = [];

        $scope.CurrentTaskID = "";
        $scope.CurrentClassID = "";
        $scope.CurrentPaperID = "";
        $scope.QueryParam = { StudentFilter: "" };

        $scope.ShowTaskDetailReport = function (taskID, classID) {

            $scope.CurrentClassID = classID;
            $scope.CurrentTaskID = taskID;

            $scope.LoadTaskData($scope.CurrentTaskID, $scope.CurrentClassID);

            $scope.LoadTaskStudentData($scope.CurrentTaskID, $scope.CurrentClassID, $scope.QueryParam.StudentFilter);

            $scope.LoadTaskSummaryData($scope.CurrentTaskID, $scope.CurrentClassID);

            $scope.LoadTaskPaperAnalysisData($scope.CurrentTaskID, $scope.CurrentClassID, $scope.CurrentPaperID);

        }
        $scope.LoadTaskData = function (taskID, classID) {
            var queryParam = { TaskID: taskID, ClassID: classID };
            ReportService.GetReport_TaskListForTeacher(queryParam).then(function (result) {
                if (result.data != undefined && result.data != null) {
                    $scope.TaskData = result.data.TaskListData[0];
                }
            });
        }

        $scope.TaskStudentReportList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 50, 100],
            dataset: $scope.TaskStudentData,
        });

        $scope.LoadTaskStudentData = function (taskID, classID, studentFilter) {
            var queryParam = { TaskID: taskID, ClassID: classID, StudentFilter: studentFilter };
            ReportService.GetReport_TaskStudentForTeacher(queryParam).then(function (result) {
                if (result.data != undefined && result.data != null) {
                    $scope.TaskStudentData = result.data;
                    $scope.TaskStudentReportList.settings({
                        dataset: $scope.TaskStudentData
                    });
                }
            });
        }


        $scope.AllChart = null;
        $scope.ListeningChart = null;
        $scope.SpeakingChart = null;
        $scope.LoadTaskSummaryData = function (taskID, classID) {

            $timeout(function () {
                $scope.AllChart = $scope.InitChart('allChart', '总成绩分布图');
                $scope.ListeningChart = $scope.InitChart('listeningChart', '听力成绩分布图');
                $scope.SpeakingChart = $scope.InitChart('speakingChart', '口语成绩分布图');

                var queryParam = { TaskID: $scope.CurrentTaskID, ClassID: $scope.CurrentClassID };
                ReportService.GetReport_TaskSummaryForTeacher(queryParam).then(function (result) {

                    console.log(result.data);

                    $scope.AllChart.hideLoading();
                    $scope.ListeningChart.hideLoading();
                    $scope.SpeakingChart.hideLoading();

                    if (result.data != undefined && result.data != null) {
                        $scope.UpdateChartData($scope.AllChart, result.data.AllData);
                        $scope.UpdateChartData($scope.ListeningChart, result.data.ListeningData);
                        $scope.UpdateChartData($scope.SpeakingChart, result.data.SpeakingData);
                    }
                }, function (err) {
                    $scope.AllChart.hideLoading();
                    $scope.ListeningChart.hideLoading();
                    $scope.SpeakingChart.hideLoading();
                    $scope.SetLoadChartDataError('allChart');
                    $scope.SetLoadChartDataError('listeningChart');
                    $scope.SetLoadChartDataError('speakingChart');
                });

            }, 1000);
        }
        $scope.InitChart = function (chartID, chartTitle) {
            var chartDom = document.getElementById(chartID);
            if (angular.isObject(chartDom)) {
                var chartInstance = $scope.InitChartOption(chartDom, chartTitle);
                chartInstance.showLoading();
                return chartInstance;
            }
            else {
                console.log("can not found dom: ", chartID);
                return null;
            }
        }
        $scope.SetLoadChartDataError = function (chartID) {
            var chartDom = document.getElementById(chartID);
            if (angular.isObject(chartDom)) {
                chartDom.style.color = 'red';
                chartDom.innerText = "获取数据失败";
            }
            else {
                console.log("can not found dom: ", chartID);
                return;
            }
        }

        $scope.UpdateChartData = function (chart, data) {
            if (data.AvgScore != undefined && data.MaxScore != undefined && data.MinScore != undefined && data.StudentCountOverAvgScore != undefined) {

                //console.log(data.StudentCountOverAvgScore)
                chart.setOption({
                    title: [{}, {}, {}, {},
                        {
                            text: data.MaxScore + ""
                        }, {},
                       {
                           text: data.MinScore + ""
                       }, {},
                       {
                           text: data.AvgScore + ""
                       }, {},
                       {
                           text: data.StudentCountOverAvgScore + ""
                       }]
                })
            }
            if (data.ScorePercentList != undefined && data.ScorePercentList.length > 0) {
                var xAixsData = [];
                var legendData = [];
                var lineSeriesData = [];
                var barSeriesData = [];
                var pieSeriesData = [];

                var maxStudentCount = 0;
                for (var i = 0; i < data.ScorePercentList.length; i++) {
                    var d = data.ScorePercentList[i];
                    xAixsData.push(d.xAixs);
                    legendData.push(d.Desc);
                    var studentCount = d.StudentCount;
                    lineSeriesData.push(studentCount);
                    barSeriesData.push(studentCount);
                    pieSeriesData.push({
                        value: studentCount, name: d.Desc
                    });

                    if (maxStudentCount < studentCount) {
                        maxStudentCount = studentCount;
                    }
                }
                //console.log("xAixsData", xAixsData);
                //console.log("legendData", legendData);
                //console.log("lineSeriesData", lineSeriesData);
                //console.log("barSeriesData", barSeriesData);
                //console.log("pieSeriesData", pieSeriesData);

                var maxRange = Math.ceil(maxStudentCount * 2 / 10) * 10;

                chart.setOption({
                    xAxis: [{
                        data: xAixsData
                    }],
                    yAxis: [{
                        max: maxRange
                    }],
                    legend: {
                        data: legendData
                    },
                    series: [
                        {
                            data: lineSeriesData
                        },
                        {
                            data: barSeriesData
                        },
                        {
                            data: pieSeriesData
                        }]
                });
            }
        }

        $scope.InitChartOption = function (dom, chartTitle) {
            var chart = echarts.init(dom);

            var option = {
                backgroundColor: '#E9F0F2',
                title: [{
                    text: chartTitle,//总成绩分布图
                    left: '40%'
                },
                {
                    text: '(人数)',
                    left: 10,
                    top: 20,
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 16
                    }
                }, {
                    text: '分数',
                    left: 10,
                    bottom: 10,
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 16
                    }
                },
                {
                    text: '最高分:',
                    left: 30,
                    top: 50,
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 14
                    }
                },
                {
                    text: '',
                    left: 90,
                    top: 50,
                    textStyle: {
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#379bcd'
                    }
                },
                {
                    text: '最低分:',
                    left: 200,
                    top: 50,
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 14
                    }
                },
                {
                    text: '',
                    left: 260,
                    top: 50,
                    textStyle: {
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#379bcd'
                    }
                }
                ,
                {
                    text: '平均分:',
                    left: 350,
                    top: 50,
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 14
                    }
                },
                {
                    text: '',
                    left: 410,
                    top: 50,
                    textStyle: {
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#379bcd'
                    }
                },
                {
                    text: '已达平均分:',
                    left: 470,
                    top: 50,
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 14
                    }
                },
                {
                    text: '',
                    left: 560,
                    top: 50,
                    textStyle: {
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#F59608'
                    }
                },
                {
                    text: '人',
                    left: 580,
                    top: 50,
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 14
                    }
                }
                ],

                tooltip: [{
                    trigger: 'item',
                    formatter: function (params) {
                        if (params.percent) {
                            return params.name;
                        }
                        else {
                            return params.name + '分 : ' + params.value + '人';
                        }
                    }
                }
                ],
                toolbox: {
                    show: false,
                    feature: {
                        mark: { show: true },
                        dataView: { show: true, readOnly: false },
                        saveAsImage: { show: true }
                    }
                },
                xAxis: [{
                    gridIndex: 0,
                    type: 'category',
                    boundaryGap: false,
                    data: []
                }],
                yAxis: [{
                    gridIndex: 0,
                    type: 'value',
                    axisLabel: {
                        formatter: '{value}'
                    },
                    max: 10
                }],
                grid: [
                    {
                        x: '5%',
                        y: '35%',
                        width: '90%',
                        height: '50%',
                        show: false
                    },
                    {
                        x: '8%',
                        y: '10%',
                        width: '80%',
                        height: '20%',
                        show: false
                    }
                ],

                visualMap: [{
                    show: false,
                    dimension: 0,
                    pieces: [{
                        gt: -1,
                        color: '#7E6896'
                    }],
                    seriesIndex: 0

                },
                    {
                        show: false,
                        dimension: 0,
                        pieces: [{
                            gt: -1,
                            color: '#89A550'
                        }],
                        seriesIndex: 1
                    }
                ],
                legend: {
                    orient: 'horizontal',
                    align: 'left',
                    top: '100',
                    left: '250',
                    data: [],
                    formatter: '{name}'

                },
                series: [
                        {
                            xAxisIndex: 0,
                            yAxisIndex: 0,
                            name: '曲线图',
                            type: 'line',
                            smooth: true,
                            data: [0]
                        },
                        {
                            xAxisIndex: 0,
                            yAxisIndex: 0,
                            name: '柱状图',
                            type: 'bar',
                            smooth: true,
                            barWidth: 20,
                            data: []
                        },
                        {
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            name: '饼图',
                            type: 'pie',
                            radius: '30%',
                            center: ['150', '150'],
                            data: [

                            ],
                            label: {
                                normal: {
                                    show: false,
                                    formatter: '{b}'
                                },
                                emphasis: {
                                    show: false
                                }
                            },
                            lableLine: {
                                normal: {
                                    show: false
                                },
                                emphasis: {
                                    show: false
                                }
                            }
                        }
                ]
            };


            chart.setOption(option);

            return chart;
        }


        $scope.QuerySearchStudent = function () {
            console.log("StudentFilter:" + $scope.QueryParam.StudentFilter);
            $scope.LoadTaskStudentData($scope.CurrentTaskID, $scope.CurrentClassID, $scope.QueryParam.StudentFilter);
        }


        $scope.ReturnTaskListReport = function () {
            $state.go('teacherreport', { taskID: $scope.CurrentTaskID, classID: $scope.CurrentClassID });
        }

        //Start Paper Analysis
        $scope.ChoosedCurrentTaskPaper = {};
        $scope.TaskPapers = [];
        $scope.PaperAnalysisData = [];

        $scope.AnalysisBarChart = null;
        $scope.AnalysisRadarChart = null;
        $scope.LoadTaskPaperAnalysisData = function (taskID, classID, paperID) {
            $timeout(function () {
                $scope.AnalysisBarChart = $scope.InitAnalysisBarChart('analysis_barChart');
                $scope.AnalysisRadarChart = $scope.InitAnalysisRadarChart('analysis_radarChart');

                ReportService.GetTaskPaperAnalysisDataForTeacher(taskID, classID, paperID).then(function (result) {

                    $scope.AnalysisBarChart.hideLoading();
                    $scope.AnalysisRadarChart.hideLoading();

                    $scope.TaskPapers = result.data.TaskPapers;

                    //$scope.TaskPapers.push({ PaperID: "eba55c8beac1474b87ec3b50c0b5544d", PaperName: "Test达睿思口语考试模拟" });
                    //$scope.TaskPapers.push({ PaperID: "ba804b91ca0446a39419c9a454f9b6f4", PaperName: "Test达睿思口语考试模拟-完整题型Demo3" });

                    $scope.PaperAnalysisData = result.data.PaperAnalysisData;

                    if ($scope.TaskPapers.length > 0) {
                        var searchPaperID = paperID;
                        if (searchPaperID == undefined || searchPaperID == '') {
                            searchPaperID = $scope.TaskPapers[0].PaperID;
                        }
                        $scope.ChangePaperAnalysisData(searchPaperID);
                    }

                }, function (error) {
                    $scope.AnalysisBarChart.hideLoading();
                    $scope.AnalysisRadarChart.hideLoading();
                    $scope.SetLoadChartDataError('analysis_barChart');
                    $scope.SetLoadChartDataError('analysis_radarChart');
                })
            }, 1000);

        }
        $scope.ChangePaperAnalysisData = function (paperID) {
            var searchPaperID = paperID;

            $scope.ChoosedCurrentTaskPaper = [];
            for (var i = 0; i < $scope.TaskPapers.length; i++) {
                var p = $scope.TaskPapers[i];
                if (p.PaperID == searchPaperID) {
                    $scope.ChoosedCurrentTaskPaper = p;
                    break;
                }
            }
            console.log("ChoosedCurrentTaskPaper", $scope.ChoosedCurrentTaskPaper);

            $scope.CurrentPaperAnalysisData = [];
            for (var dIndex = 0; dIndex < $scope.PaperAnalysisData.length; dIndex++) {
                var d = $scope.PaperAnalysisData[dIndex];
                if (d.PaperDetail.PaperID == searchPaperID) {
                    $scope.CurrentPaperAnalysisData = d;
                    break;
                }
            }
            console.log("CurrentPaperAnalysisData", $scope.CurrentPaperAnalysisData);

            //知识点柱状图
            $scope.UpdateAnalysisBarChartData($scope.AnalysisBarChart, $scope.CurrentPaperAnalysisData.TaskKnowledgePointScore);

            //考察能力雷达图
            $scope.UpdateAnalysisRadarChartData($scope.AnalysisRadarChart, $scope.CurrentPaperAnalysisData.TaskStudyAbilityScore);
        }

        $scope.InitAnalysisBarChart = function (chartID) {
            var chartDom = document.getElementById(chartID);
            if (angular.isObject(chartDom)) {

                var chartInstance = echarts.init(chartDom);
                var option = {
                    title: [{
                        text: 'Funding by Campaigns',
                        left: '30%'
                    }],
                    color: ['#B8E4EF'],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: [],
                            axisTick: {
                                alignWithLabel: true
                            },
                            axisLabel: {
                                rotate: 90,
                                interval: 0
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '掌握度',
                            type: 'bar',
                            barWidth: '30%',
                            data: []
                        }
                    ]
                };
                chartInstance.setOption(option);

                chartInstance.showLoading();
                return chartInstance;
            }
            else {
                console.log("can not found dom:", chartID);
                return null;
            }
        }
        $scope.InitAnalysisRadarChart = function (chartID) {
            var chartDom = document.getElementById(chartID);
            if (angular.isObject(chartDom)) {

                var chartInstance = echarts.init(chartDom);
                var option = {
                    radar: [
                        {

                            radius: 120,
                            startAngle: 90,
                            splitNumber: 4,
                            shape: 'circle',
                            name: {
                                formatter: '【{value}】',
                                textStyle: {
                                    color: '#72ACD1'
                                }
                            },
                            splitArea: {
                                areaStyle: {
                                    color: ['rgba(114, 172, 209, 0.2)',
                                    'rgba(114, 172, 209, 0.4)', 'rgba(114, 172, 209, 0.6)',
                                    'rgba(114, 172, 209, 0.8)', 'rgba(114, 172, 209, 1)'],
                                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                                    shadowBlur: 10
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }
                            },
                            splitLine: {
                                lineStyle: {
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }
                            }
                        },
                        {
                            indicator: [
                                { text: '暂无统计项', max: 100 }                                
                            ],

                            radius: 120
                        }
                    ],
                    series: [

                        {
                            name: '成绩单',
                            type: 'radar',
                            radarIndex: 1,
                            data: [
                                {
                                    value: [],
                                    name: '',
                                    label: {
                                        normal: {
                                            show: true,
                                            formatter: function (params) {
                                                return params.value;
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
                chartInstance.setOption(option);

                chartInstance.showLoading();
                return chartInstance;
            }
            else {
                console.log("can not found dom:", chartID);
                return null;
            }
        }
        $scope.UpdateAnalysisBarChartData = function (barChart, knowledgePointData) {

            var xAixsData = [];
            var seriesData = [];

            var topN = 10;

            for (var i = 0; i < knowledgePointData.length; i++) {
                xAixsData.push(knowledgePointData[i].KnowledgePointDesc);
                seriesData.push(knowledgePointData[i].KnowledgePointScore);
                if (i >= topN) {
                    break;
                }
            }

            var option = {
                xAxis: [{
                    data: xAixsData
                }],
                series: [{
                    data: seriesData
                }]
            }
            barChart.setOption(option);

        }
        $scope.UpdateAnalysisRadarChartData = function (radarChart, data) {
           
            var optionData = [];
            var seriesData = [];

            var topN = 10;

            for (var i = 0; i < data.length; i++) {
                var obj = {
                    text: data[i].AbilityName,
                    max: 100
                }
                optionData.push(obj);
                seriesData.push(data[i].AvgGrasping);
                if (i >= topN) {
                    break;
                }
            }

            var option = {
                radar: [
                    {

                        radius: 120,
                        startAngle: 90,
                        splitNumber: 4,
                        shape: 'circle',
                        name: {
                            formatter: '【{value}】',
                            textStyle: {
                                color: '#72ACD1'
                            }
                        },
                        splitArea: {
                            areaStyle: {
                                color: ['rgba(114, 172, 209, 0.2)',
                                'rgba(114, 172, 209, 0.4)', 'rgba(114, 172, 209, 0.6)',
                                'rgba(114, 172, 209, 0.8)', 'rgba(114, 172, 209, 1)'],
                                shadowColor: 'rgba(0, 0, 0, 0.3)',
                                shadowBlur: 10
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        }
                    },
                    {
                        indicator: optionData,

                        radius: 120
                    }
                ],
                series: [

                    {
                        name: '成绩单',
                        type: 'radar',
                        radarIndex: 1,
                        data: [
                            {
                                value: seriesData,
                                name: '',
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: function (params) {
                                            return params.value;
                                        }
                                    }
                                }
                            },                           
                        ]
                    }
                ]
            }
            radarChart.setOption(option);
        }
        //End Paper Analysis

        //处理传递过来的参数
        var taskID = $stateParams.taskID;
        var classID = $stateParams.classID;
        if (angular.isString(taskID) && taskID.length > 0) {
            console.log("TaskID:" + taskID);
            console.log("ClassID:" + classID);
            if (classID == undefined) {
                classID = "";
            }
            $scope.ShowTaskDetailReport(taskID, classID);
        }



        //Start Export Report

        $scope.IgnoreAnalysisReport = true;

        $scope.ExportData = {
            TaskID: "",
            ClassID: "",
            StudentNumber: "",
            SummaryReportDataForTeacher: "",  //统计分析
            AnalysisReportAreaDataList: [], //卷面分析(教师)
            AnalysisReportDataForStudent: "", //卷面分析(学生)
        }

        $scope.CanvasConvertOption = {
            allowTaint: false,
            useCORS: false,
            logging: false,
            letterRendering: false,
            timeout: 5000,
            async: false,
            strict: true,
            javascriptEnabled: true,
            removeContainer: true,
        }

        $scope.ExportTaskReport = function () {

            //angular.element("#ExportingDialog").modal("show"); //不需要显示界面

            $scope.ReportDownloadKey = ''; //报告下载路径

            $scope.CancelExportFlag = false;
            $scope.CurrentAreaIndex = 0;
            $scope.AllAreaConvertedComplete = false;

            $scope.ExportData = {
                TaskID: "",
                ClassID: "",
                StudentNumber: "",
                SummaryReportDataForTeacher: "",  //统计分析
                AnalysisReportAreaDataList: [], //卷面分析(教师)
                AnalysisReportDataForStudent: "", //卷面分析(学生)
            }

            //1.summary_report_teacher

            //激活页面元素
            $(".reportContentTabHeader").removeClass("active");
            $("#li_summary_report_teacher").addClass("active");
            $(".tab-pane").removeClass("active");
            $("#summary_report_teacher").addClass("active");
            html2canvas(document.getElementById("summary_report_teacher"), $scope.CanvasConvertOption).then(function (summaryCanvas) {
                $scope.ExportData.SummaryReportDataForTeacher = summaryCanvas.toDataURL();
                //document.getElementById("testCanvasTab").appendChild(summaryCanvas);

                //2.analysis_report_teacher

                if ($scope.IgnoreAnalysisReport == true) {

                    //上传数据到服务端
                    $scope.ExportData.TaskID = $scope.CurrentTaskID;
                    $scope.ExportData.ClassID = $scope.CurrentClassID;
                    $scope.ExportData.StudentNumber = "";

                    console.log("ExportData ", $scope.ExportData);
                    ReportService.ExportReport($scope.ExportData).then(function (result) {
                        console.log("result ", result);
                        $scope.ReportDownloadKey = result.data.data;

                        var href = "/api/report/download/" + $scope.ReportDownloadKey;
                        if (href != undefined && href != null && href != "") {
                            window.open(href, '_self');
                        }

                    });

                }
                else {
                    //analysis_page

                    //激活页面元素
                    $(".reportContentTabHeader").removeClass("active");
                    $("#li_analysis_report_teacher").addClass("active");
                    $(".tab-pane").removeClass("active");
                    $("#analysis_report_teacher").addClass("active");
                    $("#canvas-div").html("");

                    html2canvas(document.getElementById("analysis_report_teacher"), $scope.CanvasConvertOption).then(function (analysisHeaderCanvas) {
                        $scope.ExportData.AnalysisReportAreaDataList.push(
                             {
                                 AreaIndex: -1,
                                 AreaData: analysisHeaderCanvas.toDataURL()
                             });
                        document.getElementById("canvas-div").appendChild(analysisHeaderCanvas);

                        if ($scope.CancelExportFlag == true) {
                            return;
                        }

                        //上传数据到服务端
                        $scope.ExportData.TaskID = $scope.CurrentTaskID;
                        $scope.ExportData.ClassID = $scope.CurrentClassID;
                        $scope.ExportData.StudentNumber = "";

                        console.log("ExportData ", $scope.ExportData);
                        ReportService.ExportReport($scope.ExportData).then(function (result) {
                            console.log("result ", result);
                            $scope.ReportDownloadKey = result.data.data;

                            var href = "/api/report/download/" + $scope.ReportDownloadKey;
                            if (href != undefined && href != null && href != "") {
                                window.open(href, '_self');
                            }

                            //angular.element("#ExportingDialog").modal("hide");
                        });
                    })
                }
            })
        }

        //End Export Report



    }])
        /*
        * Services
        */
    .service('ReportService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;

        self.ExportReport = function (exportData) {
            return $http.post(serviceBase + 'api/report/report_ExportReportForTeacher', exportData);
        }

        self.GetTaskPaperAnalysisDataForTeacher = function (taskID, classID, paperID) {
            return $http.post(serviceBase + 'api/report/report_TaskPaperAnalysisDataForTeacher', { TaskID: taskID, ClassID: classID, PaperID: paperID });
        }
       
        self.GetTaskPaperAnalysisDataForStudent = function (taskID, studentId, paperID) {
            return $http.post(serviceBase + 'api/report/report_TaskPaperAnalysisDataForStudent', { TaskID: taskID, StudentID: studentId, PaperID: paperID });
        }

        self.GetStudentClass = function () {
            return $http.get(serviceBase + 'api/account/stuClass');
        }

        self.GetReport_TaskListForStudent = function (queryParams) {
            return $http.post(serviceBase + 'api/report/report_TaskListForStudent', queryParams);
        }

        self.GetReport_TaskListForTeacher = function (queryParams) {
            return $http.post(serviceBase + 'api/report/report_TaskListForTeacher', queryParams);
        }
        self.GetReport_TaskStudentForTeacher = function (queryParams) {
            return $http.post(serviceBase + 'api/report/report_TaskStudentForTeacher', queryParams);
        }
        self.GetReport_TaskSummaryForTeacher = function (queryParams) {
            return $http.post(serviceBase + 'api/report/report_TaskSummaryForTeacher', queryParams);
        }
        self.GetReport_TaskAreaDataForStudent = function (queryParams) {
            return $http.post(serviceBase + 'api/report/report_TaskAreaDataForStudent', queryParams);
        }


        self.bindClass = function (bindclassnfo) {
            return $http.post(serviceBase + 'api/account/bindclass', bindclassnfo);
        }

    })
    /*
    * Directives
    */
    /*
* Directives
*/
.directive('teacherPaperAnalysis', ['$log', '$state', 'Audio', function ($log, $state, Audio) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            padata: '=padata'
        },
        link: function (scope, element, attrs) {
            scope.PlayPaperAudio = function (audio) {
                Audio.play(scope.padata.PaperDetail.ResourcePath + audio);
            };

            scope.PlayAnswerAudio = function (answer) {
                Audio.play("/web/answers/" + answer.BatchID + "/" + answer.StudentID + "/" + answer.AnswerContent);
            };

            scope.GetAreaScore = function (areaID) {
                var areaData = scope.padata.TaskAreas;
                console.log("areaID:" + areaID);
                if (areaData != undefined && areaData != null && areaData.length > 0) {
                    for (var i = 0; i < areaData.length; i++) {
                        if (areaData[i].AreaID == areaID) {
                            var areaScore = areaData[i].AreaScore;

                            return "(计" + areaScore + "分)";
                        }
                    }
                }
                return "";

            }

            scope.GetContentAnswerPercent = function (contentID) {
                var optionData = scope.padata.TaskContentOptionPercent;
                if (optionData != undefined && optionData != null && optionData.length > 0) {
                    for (var i = 0; i < optionData.length; i++) {
                        if (optionData[i].ContentID == contentID) {
                            var percent = optionData[i].AnswerRightPercent;
                            return percent + "%";
                        }
                    }
                }
                return "0%";
            }

          
            scope.GetContentAnswer = function (contentID) {
                var optionData = scope.padata.TaskContentOptionPercent;
                if (optionData != undefined && optionData != null && optionData.length > 0) {
                    for (var i = 0; i < optionData.length; i++) {
                        if (optionData[i].ContentID == contentID) {
                            var answerIndex = optionData[i].AnswerIndex;
                            var answer = "";
                            //console.log("contentID:" + contentID + ",answerIndex:" + answerIndex); 
                            if (answerIndex == 1) {
                                answer = "A";
                            }
                            if (answerIndex == 2) {
                                answer = "B";
                            }
                            if (answerIndex == 3) {
                                answer = "C";
                            }
                            if (answerIndex == 4) {
                                answer = "D";
                            }
                            if (answerIndex == 5) {
                                answer = "E";
                            }
                            if (answerIndex == 6) {
                                answer = "F";
                            }

                            return answer;
                        }
                    }

                }
                return -1;
            }

            

            scope.GetContentOptionPercent = function (contentID, optionID) {
                var optionData = scope.padata.TaskContentOptionPercent;
                if (optionData != undefined && optionData != null && optionData.length > 0) {
                    for (var i = 0; i < optionData.length; i++) {
                        if (optionData[i].ContentID == contentID && optionData[i].OptionID == optionID) {
                            var percent = optionData[i].ChoosePercent;
                            return percent;
                        }
                    }
                }
                return 0;
            }

            scope.GetContentScoreData = function (contentID, type) {
                var result = {};

                if (type == 1) {
                    var scoreData = scope.padata.TaskContentScore;
                    result = {
                        TypeName: '统计',
                        MaxScore: 0,
                        MinScore: 0,
                        AvgScore: 0,
                    }
                    if (scoreData != undefined && scoreData != null && scoreData.length > 0) {
                        for (var i = 0; i < scoreData.length; i++) {
                            if (scoreData[i].ContentID == contentID) {

                                result = {
                                    TypeName: '统计',
                                    MaxScore: scoreData[i].MaxScore,
                                    MinScore: scoreData[i].MinScore,
                                    AvgScore: scoreData[i].AvgScore,
                                }
                                break;

                            }
                        }
                    }

                }
                if (type == 2) {
                    var scoreData = scope.padata.TaskContentFluencyScore;
                    result = {
                        TypeName: '流利度',
                        MaxScore: 0,
                        MinScore: 0,
                        AvgScore: 0,
                    }
                    if (scoreData != undefined && scoreData != null && scoreData.length > 0) {
                        for (var i = 0; i < scoreData.length; i++) {
                            if (scoreData[i].ContentID == contentID) {

                                result = {
                                    TypeName: '流利度',
                                    MaxScore: scoreData[i].MaxScore,
                                    MinScore: scoreData[i].MinScore,
                                    AvgScore: scoreData[i].AvgScore,
                                }
                                break;

                            }
                        }
                    }
                }
                if (type == 3) {
                    var scoreData = scope.padata.TaskContentIntegrityScore;
                    result = {
                        TypeName: '完整度',
                        MaxScore: 0,
                        MinScore: 0,
                        AvgScore: 0,
                    }
                    if (scoreData != undefined && scoreData != null && scoreData.length > 0) {
                        for (var i = 0; i < scoreData.length; i++) {
                            if (scoreData[i].ContentID == contentID) {

                                result = {
                                    TypeName: '完整度',
                                    MaxScore: scoreData[i].MaxScore,
                                    MinScore: scoreData[i].MinScore,
                                    AvgScore: scoreData[i].AvgScore,
                                }
                                break;

                            }
                        }
                    }
                }
                return result;
            }


            scope.TaskAnswerMarkResult = function (contentID,prompt) {
                var result = [];
                var data = scope.padata.MarkResultScoreDetailExtModelList
                if (data != undefined && data != null && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].ContentID == contentID) {
                            result.push(data[i]);
                        }
                    }
                }
                else {
                    result.push({
                        ContentID : contentID,
                        text: prompt,
                        start: '',
                        end: '',
                        score:0
                    });
                }
                return result;
            }

            scope.IsSelectTypeArea = function (areaType) {
                var speakingAreaType = [3, 7, 10, 6, 8, 11, 12, 9, 13, 14, 15];
                for (var i = 0; i < speakingAreaType.length; i++) {
                    if (speakingAreaType[i] == areaType) {
                        return false;
                    }
                }
                return true;
            }

        },
        templateUrl: '/web/kaola/report/directive_teacher_paper_analysis.html'
    }
}])
.directive('studentPaperAnalysis', ['$log', '$state', 'Audio', function ($log, $state, Audio) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            padata: '=padata'
        },
        link: function (scope, element, attrs) {
            scope.PlayPaperAudio = function (audio) {
                Audio.play(scope.padata.PaperDetail.ResourcePath + audio);
            };

            scope.PlayAnswerAudio = function (answer) {
                Audio.play("/web/answers/" + answer.BatchID + "/" + answer.StudentID + "/" + answer.AnswerContent);
            };

            scope.GetAreaScore = function (areaID) {
                var areaData = scope.padata.TaskAreas;
                if (areaData != undefined && areaData != null && areaData.length > 0) {
                    for (var i = 0; i < areaData.length; i++) {
                        if (areaData[i].AreaID == areaID) {
                            var areaScore = areaData[i].AreaScore;

                            return "(计" + areaScore + "分)";
                        }
                    }
                }
                return "";
            }

            scope.GetContentAnswerPercent = function (contentID) {
                var optionData = scope.padata.TaskContentOptionPercent;
                if (optionData != undefined && optionData != null && optionData.length > 0) {
                    for (var i = 0; i < optionData.length; i++) {
                        if (optionData[i].ContentID == contentID) {
                            var percent = optionData[i].AnswerRightPercent;
                            return percent + "%";
                        }
                    }
                }
                return -1;
            }

            scope.TaskAnswerMarkResult = function (contentID, prompt) {
                var result = [];
                var data = scope.padata.MarkResultScoreDetailExtModelList
                if (data != undefined && data != null && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].ContentID == contentID) {
                            result.push(data[i]);
                        }
                    }
                }
                else {
                    result.push({
                        ContentID: contentID,
                        text: prompt,
                        start: '',
                        end: '',
                        score: 0
                    });
                }
                return result;
            }

            scope.GetContentTrueAnswer = function (content) {                
                if (content.Options == null || content.Options.length == 0) {
                    return "-1"
                }
                if (content.Answers == undefined || content.Answers == null || content.Answers.length == 0) {
                    return "-1";
                }
                var optionID = content.Answers[0].Content;
                if (optionID == null || optionID == '') {
                    return "-1";
                }
                var answer = "无";                
                for (var i = 0; i < content.Options.length; i++) {
                    if (content.Options[i].OptionID == optionID) {
                        var answerIndex = content.Options[i].Index;

                        //console.log("contentID:" + contentID + ",answerIndex:" + answerIndex); 
                        if (answerIndex == 1) {
                            answer = "A";
                        }
                        if (answerIndex == 2) {
                            answer = "B";
                        }
                        if (answerIndex == 3) {
                            answer = "C";
                        }
                        if (answerIndex == 4) {
                            answer = "D";
                        }
                        if (answerIndex == 5) {
                            answer = "E";
                        }
                        if (answerIndex == 6) {
                            answer = "F";
                        }

                        return answer;
                    }
                }
                return answer;
            }


            scope.GetContentAnswer = function (contentID, index) {                
                var optionData = scope.padata.TaskStudentContentScore;
                if (optionData != undefined && optionData != null && optionData.length > 0) {
                    for (var i = 0; i < optionData.length; i++) {
                        if (optionData[i].ContentID != contentID) {
                            continue;
                        }                        
                        if (optionData[i].StudentAnswerOptionIndex != index) {
                            return 0;
                        }
                        if(optionData[i].IsRight){
                            return 1;
                        }
                        return 2;
                    }

                }
                return 0;
            }

            scope.GetContentOptionPercent = function (contentID, optionID) {
                var optionData = scope.padata.TaskContentOptionPercent;
                if (optionData != undefined && optionData != null && optionData.length > 0) {
                    for (var i = 0; i < optionData.length; i++) {
                        if (optionData[i].ContentID == contentID && optionData[i].OptionID == optionID) {
                            var percent = optionData[i].ChoosePercent;
                            return percent;
                        }
                    }
                }
                return 0;
            }

            scope.GetContentScoreData = function (contentID, type) {
                var result = {};

                if (type == 1) {
                    var scoreData = scope.padata.TaskContentScore;
                    result = {
                        TypeName: '统计',
                        MaxScore: 0,
                        MinScore: 0,
                        AvgScore: 0,
                    }
                    if (scoreData != undefined && scoreData != null && scoreData.length > 0) {
                        for (var i = 0; i < scoreData.length; i++) {
                            if (scoreData[i].ContentID == contentID) {

                                result = {
                                    TypeName: '统计',
                                    MaxScore: scoreData[i].MaxScore,
                                    MinScore: scoreData[i].MinScore,
                                    AvgScore: scoreData[i].AvgScore,
                                }
                                break;

                            }
                        }
                    }
                    
                }
                if (type == 2) {
                    var scoreData = scope.padata.TaskContentFluencyScore;
                    result = {
                        TypeName: '流利度',
                        MaxScore: 0,
                        MinScore: 0,
                        AvgScore: 0,
                    }
                    if (scoreData != undefined && scoreData != null && scoreData.length > 0) {
                        for (var i = 0; i < scoreData.length; i++) {
                            if (scoreData[i].ContentID == contentID) {

                                result = {
                                    TypeName: '流利度',
                                    MaxScore: scoreData[i].MaxScore,
                                    MinScore: scoreData[i].MinScore,
                                    AvgScore: scoreData[i].AvgScore,
                                }
                                break;

                            }
                        }
                    }
                }
                if (type == 3) {
                    var scoreData = scope.padata.TaskContentIntegrityScore;
                    result = {
                        TypeName: '完整度',
                        MaxScore: 0,
                        MinScore: 0,
                        AvgScore: 0,
                    }
                    if (scoreData != undefined && scoreData != null && scoreData.length > 0) {
                        for (var i = 0; i < scoreData.length; i++) {
                            if (scoreData[i].ContentID == contentID) {

                                result = {
                                    TypeName: '完整度',
                                    MaxScore: scoreData[i].MaxScore,
                                    MinScore: scoreData[i].MinScore,
                                    AvgScore: scoreData[i].AvgScore,
                                }
                                break;

                            }
                        }
                    }
                }


                return result;

            }

            scope.IsSelectTypeArea = function (areaType) {
                var speakingAreaType = [3, 7, 10, 6, 8, 11, 12, 9, 13, 14, 15];
                for (var i = 0; i < speakingAreaType.length; i++) {
                    if (speakingAreaType[i] == areaType) {
                        return false;
                    }
                }
                return true;
            }

        },
        templateUrl: '/web/kaola/report/directive_student_paper_analysis.html'
    }
}])
    /*
    * Filters
    */
});