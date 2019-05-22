define(['angular', 'echarts', 'ng-table', 'ngToaster',
    //  'jquery-stickytableheaders',
    '/web/components/directives/questionDetail/teacher-report/teacher-questionDetail.js', 'jquery-scrollbar', 'jquery-mousewheel'], function (angular, echarts) {
        'use strict';
        /*
        * Controllers
        */
        angular.module('app')

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

            .controller('TeacherReportTaskDetailCtrl', ['$scope', '$rootScope', 'AuthService', '$state', 'ReportService', 'NgTableParams', '$stateParams', '$timeout', 'Constants', 'CommonBusinessService', 'Audio', 'SlideMenuService', function ($scope, $rootScope, AuthService, $state, ReportService, NgTableParams, $stateParams, $timeout, Constants, CommonBusinessService, Audio, SlideMenuService) {

                $scope.Constants = {
                    apiServiceBaseUri: GLOBAL_API_URL,
                    authServiceBaseUri: GLOBAL_CENTRAL_URL,
                    answerBaseUrl: GLOBAL_ANSWER_URL,
                    paperResourceBaseUrl: GLOBAL_PAPER_RESOURCE_URL
                };

                SlideMenuService.SetActiveSideMenu('teacherreport');

                $scope.TaskData = [];
                $scope.TaskStudentData = [];

                $scope.CurrentTaskID = "";
                $scope.CurrentClassID = "";
                $scope.CurrentPaperID = "";
                $scope.CurrentClassName = "全部";
                $scope.CurrentPaperName = "全部";
                $scope.QueryParam = { StudentFilter: "" };

                $scope.ChangeClass = function (c) {
                    $scope.CurrentClassID = c.ClassID;
                    $scope.CurrentClassName = c.ClassName;
                    $scope.ShowTaskDetailReport($scope.CurrentTaskID, $scope.CurrentClassID, $scope.CurrentPaperID);
                }
                $scope.ChangePaper = function (p) {
                    $scope.CurrentPaperID = p.PaperID;
                    $scope.CurrentPaperName = p.PaperName;
                    $scope.ShowTaskDetailReport($scope.CurrentTaskID, $scope.CurrentClassID, $scope.CurrentPaperID);
                }

                $scope.ShowTaskDetailReport = function (taskID, classID, paperID) {
                    if (taskID == undefined) {
                        taskID = "";
                    }
                    if (classID == undefined) {
                        classID = "";
                    }
                    if (paperID == undefined) {
                        paperID = "";
                    }
                    $scope.CurrentClassID = classID;
                    $scope.CurrentTaskID = taskID;
                    $scope.CurrentPaperID = paperID;

                    $scope.LoadTaskData($scope.CurrentTaskID, $scope.CurrentClassID, $scope.CurrentPaperID);

                    $scope.LoadTaskStudentData($scope.CurrentTaskID, $scope.CurrentClassID, $scope.QueryParam.StudentFilter, $scope.CurrentPaperID);

                    $scope.LoadTaskSummaryData($scope.CurrentTaskID, $scope.CurrentClassID);

                }
                $scope.LoadTaskData = function (taskID, classID, paperID) {
                    var queryParam = { TaskID: taskID, ClassID: classID, PaperID: paperID };
                    ReportService.GetReport_TaskListForTeacher(queryParam).then(function (result) {
                        if (result.data != undefined && result.data != null) {
                            $scope.TaskData = result.data.TaskListData[0];

                            var analysisPaperID = $scope.GetAnalysisPaperID();
                            //console.log("analysisPaperID:", analysisPaperID);
                            if (analysisPaperID != undefined && analysisPaperID != "") {
                                $scope.LoadTaskPaperAnalysisData($scope.CurrentTaskID, $scope.CurrentClassID, analysisPaperID);
                            } else {
                                $scope.PaperAnalysisData = [];
                            }
                        }
                    });
                }
                $scope.GetAnalysisPaperID = function () {
                    var analysisPaperID = $scope.CurrentPaperID;
                    if (analysisPaperID == undefined || analysisPaperID == "") {
                        //get first paper id
                        if ($scope.TaskData != null && $scope.TaskData != undefined && $scope.TaskData.AllPapers != undefined && $scope.TaskData.AllPapers.length > 0) {
                            for (var i = 0; i < $scope.TaskData.AllPapers.length; i++) {
                                var item = $scope.TaskData.AllPapers[i];
                                if (item.PaperID != undefined && item.PaperID != "") {
                                    analysisPaperID = item.PaperID;
                                    break;
                                }
                            }
                        }
                    }
                    return analysisPaperID;
                }
                $scope.cols = [];
                $scope.detailCols = [
                    { field: "StudentNumber", title: "学号", show: true },
                    { field: "StudentName", title: "姓名", show: true },
                    { field: "Score", title: "得分", show: true },
                    { field: "IntegrityScore", title: "完整度", show: true },
                    { field: "PronounceScore", title: "准确度", show: true },
                    { field: "FluencyScore", title: "流利度", show: true },
                    { field: "ReadTextScoreDetail", title: "考生答案", show: true },
                    { field: "Answer", title: "操作", show: true },
                ];
                $scope.TaskStudentReportList = new NgTableParams({ count: 10 }, {
                    counts: [50, 100],
                    dataset: $scope.TaskStudentData,
                });
                setTimeout(function () {
                    angular.element('.h-custom-scrollbar').mCustomScrollbar({
                        horizontalScroll: true,
                        theme: 'dark-thick',
                        mouseWheel: {
                            enable: true
                        }
                    });
                    angular.element('.v-custom-scrollbar').mCustomScrollbar({
                        theme: 'dark-thick',
                        mouseWheel: {
                            enable: true
                        }
                    });
                }, 0);
                $scope.turnDefautPaper = function () {
                    if ($scope.CurrentPaperID === '') {
                        $scope.CurrentPaperName = $scope.TaskData.AllPapers[1].PaperName;
                    }
                }
                $scope.turnAll = function () {
                    if ($scope.CurrentPaperID === '') {
                        $scope.CurrentPaperName = '全部';
                    }
                }
                $scope.LoadTaskStudentData = function (taskID, classID, studentFilter, paperID) {
                    var queryParam = { TaskID: taskID, ClassID: classID, StudentFilter: studentFilter, PaperID: paperID };
                    ReportService.GetReport_TaskStudentForTeacher(queryParam).then(function (result) {
                        if (result.data != undefined && result.data != null && result.data.length) {
                            $scope.TaskStudentData = result.data;
                            var detail = [];
                            result.data[0].ScoreDetail.forEach(function (v, i) {
                                detail.push({
                                    field: 'ScoreDetail',
                                    index: i,
                                    title: v.AreaTypeDescription,
                                    show: true,
                                    class: v.AreaTypeDescription.length > 9 ? 'long' : 'detail',
                                    sortable: 'ScoreDetail[' + i + '].Score'
                                });
                            });
                            $scope.cols = [
                                { field: "StudentSex", title: "性别", show: true },
                                { field: "ClassName", title: "班级", show: true },
                                { field: "PaperName", title: "试卷名称", show: true },
                                { field: "Score", title: "总成绩", show: true, sortable: 'Score' },
                            ].concat(detail);
                            $scope.TaskStudentReportList.settings({
                                dataset: $scope.TaskStudentData
                            });
                        }
                    });
                }
                // 给长标题加上title
                $timeout(function () {
                    $('.middle-table-wrap .long').each(function (i, e) {
                        $(e).attr('title', $(e).find('span').text());
                    });
                }, 200);
                $scope.QuerySearchStudent = function () {
                    console.log("StudentFilter:" + $scope.QueryParam.StudentFilter);
                    $scope.LoadTaskStudentData($scope.CurrentTaskID, $scope.CurrentClassID, $scope.QueryParam.StudentFilter);
                }


                //TaskSummaryData 

                $scope.AllChart = null;
                $scope.ListeningChart = null;
                $scope.SpeakingChart = null;

                $scope.chartData = null;
                $scope.LoadTaskSummaryData = function (taskID, classID) {

                    $timeout(function () {
                        // $scope.AllChart = $scope.InitChart('allChart', '总成绩分布图');
                        // $scope.ListeningChart = $scope.InitChart('listeningChart', '听力成绩分布图');
                        // $scope.SpeakingChart = $scope.InitChart('speakingChart', '口语成绩分布图');

                        var queryParam = {
                            TaskID: $scope.CurrentTaskID,
                            ClassID: $scope.CurrentClassID,
                            PaperID: $scope.CurrentPaperID
                        };
                        ReportService.GetReport_TaskSummaryForTeacher(queryParam).then(function (result) {
                            $scope.chartData = result.data;
                            if (!result.data.AllData) {
                                return;
                            }
                            // $scope.chartData = {
                            //     allChart: {
                            //         allScore: 30,
                            //         avgScore: 27,
                            //         max: 28,
                            //         min: 16,
                            //         allScorePeople: 2,
                            //         scorePercent: '29%',
                            //         series: [
                            //             { name: '0-1', value: 33 },
                            //             { name: '1-2', value: 31 },
                            //             { name: '2-3', value: 23 },
                            //             { name: '3-4', value: 13 },
                            //             { name: '4-5', value: 15 }
                            //         ]
                            //     },
                            //     ScoreDetail: [{
                            //         title: '单词音标认读',
                            //         allScore: 30,
                            //         avgScore: 24,
                            //         max: 28,
                            //         min: 16,
                            //         allScorePeople: 2,
                            //         scorePercent: '29%',
                            //         series: [
                            //             { name: '0-1', value: 33 },
                            //             { name: '1-2', value: 31 },
                            //             { name: '2-3', value: 23 },
                            //             { name: '3-4', value: 13 },
                            //             { name: '4-5', value: 15 }
                            //         ]
                            //     }, {
                            //         title: '师生对话',
                            //         allScore: 60,
                            //         avgScore: 49,
                            //         max: 99,
                            //         min: 9,
                            //         allScorePeople: 7,
                            //         scorePercent: '60%',
                            //         series: [
                            //             { name: '0-1', value: 33 },
                            //             { name: '1-2', value: 31 },
                            //             { name: '2-3', value: 23 },
                            //             { name: '3-4', value: 13 },
                            //             { name: '4-5', value: 15 }
                            //         ]
                            //     }]
                            // }
                            $timeout(function () {
                                $scope.InitBarChart();
                                if ($scope.chartData.AreaSummaryDataList) {
                                    $scope.chartData.AreaSummaryDataList.forEach(function (v, i) {
                                        $scope.InitPieChart(i);
                                    });
                                }
                            }, 0);

                            // $scope.AllChart.hideLoading();
                            // $scope.ListeningChart.hideLoading();
                            // $scope.SpeakingChart.hideLoading();

                            // if (result.data != undefined && result.data != null) {
                            //     $scope.UpdateChartData($scope.AllChart, result.data.AllData, 'allChart');
                            //     $scope.UpdateChartData($scope.ListeningChart, result.data.ListeningData, 'listeningChart');
                            //     $scope.UpdateChartData($scope.SpeakingChart, result.data.SpeakingData, 'speakingChart');

                            //     console.log($scope.AllChart.getOption());
                            // }
                        }, function (err) {
                            // $scope.AllChart.hideLoading();
                            // $scope.ListeningChart.hideLoading();
                            // $scope.SpeakingChart.hideLoading();
                            // $scope.SetLoadChartDataError('allChart');
                            // $scope.SetLoadChartDataError('listeningChart');
                            // $scope.SetLoadChartDataError('speakingChart');
                        });
                    }, 0);
                }
                $scope.getSections = function (series) {
                    var ydata = [];
                    series.forEach(function (v) {
                        ydata.push(v.name);
                    });
                    return ydata;
                }
                $scope.getCircleSections = function (series) {
                    var ydata = [];
                    series.forEach(function (v) {
                        ydata.push({
                            name: v.name,
                            icon: 'circle'
                        });
                    });
                    return ydata;
                }
                $scope.formatBackEndSeries = function (series) {
                    var newData = [];
                    series.forEach(function (v) {
                        newData.push({
                            name: v.xAixs,
                            value: v.StudentCount
                        });
                    });
                    return newData;
                }
                $scope.formatBackEndDetailSeries = function (series) {
                    var newData = [];
                    series.forEach(function (v) {
                        newData.push({
                            name: $scope.formatScoreDisplayText(v.ScoreDisplayText),
                            value: v.Count,
                            selected: v.IfTrue,
                        });
                    });
                    return newData;
                }
                $scope.formatScoreDisplayText = function (s) {
                    if (s == '4') { return '优' }
                    if (s == '3') { return '良' }
                    if (s == '2') { return '中' }
                    if (s == '1') { return '差' }
                    return s;
                }
                $scope.InitBarChart = function () {
                    var chartDom = document.getElementById('allChart1');
                    var instance = echarts.init(chartDom);
                    var formatData = $scope.formatBackEndSeries($scope.chartData.AllData.ScorePercentList);
                    var option = {
                        color: ['#62bbf5'],
                        tooltip: {
                            trigger: 'axis',
                            formatter: '在 {b} 分数段<br/>有 {c} 人',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        xAxis: {
                            name: '(人数)',
                            type: 'value',
                            axisLine: {
                                show: true,
                                lineStyle: {
                                    color: '#555'
                                }
                            },
                            splitLine: {
                                show: false
                            }
                        },
                        yAxis: {
                            name: '(分数段)',
                            type: 'category',
                            axisLine: {
                                show: true,
                                lineStyle: {
                                    color: '#555'
                                }
                            },
                            splitLine: {
                                show: true
                            },
                            data: $scope.getSections(formatData)
                        },
                        series: [
                            {
                                type: 'bar',
                                barWidth: '60%',
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'right',
                                    }
                                },
                                data: formatData
                            }
                        ]
                    };
                    instance.setOption(option);
                    return instance;
                }
                $scope.InitPieChart = function (index) {
                    var chartDom = document.getElementById('score-detail' + index);
                    var instance = echarts.init(chartDom);
                    var formatData = $scope.formatBackEndSeries($scope.chartData.AreaSummaryDataList[index].ScorePercentList);
                    var sections = $scope.getSections(formatData);
                    var series = formatData;

                    var option = {
                        color: ['#98ccfe', '#ff9a66', '#9966ff', '#ff679a', '#ffcc66', '#70E0A9'],

                        tooltip: {
                            trigger: 'item',
                            formatter: "{b} : {d}%"
                        },
                        legend: {
                            orient: 'vertical',
                            itemWidth: 12,
                            itemHeight: 12,
                            left: 30,
                            top: '15%',
                            data: sections
                        },
                        series: [
                            {
                                type: 'pie',
                                radius: ['35%', '60%'],
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: '{black|{b} : }{c}人',
                                        rich: {
                                            black: {
                                                color: '#333'
                                            }
                                        }
                                    },
                                },
                                labelLine: {
                                    normal: {
                                        show: true,
                                        lineStyle: {
                                            color: '#acacac'
                                        }
                                    }
                                },
                                data: series
                            }
                        ]
                    };

                    instance.setOption(option);
                    return instance;
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
                //测试
                // setTimeout(function () {
                //     $('#li_summary_report_teacher a').click();
                // }, 0);
                // setTimeout(function () {
                //     $('#li_analysis_report_teacher a').click();
                // }, 0);
                $scope.SetLoadChartDataError = function (chartID, errorText) {
                    var chartDom = document.getElementById(chartID);
                    if (angular.isObject(chartDom)) {
                        chartDom.style.color = 'red';
                        if (errorText != undefined && errorText.length > 0) {
                            chartDom.innerText = errorText;
                        }
                        else {
                            chartDom.innerText = "获取数据失败";
                        }
                    }
                    else {
                        console.log("can not found dom: ", chartID);
                        return;
                    }
                }

                $scope.UpdateChartData = function (chart, data, chartID) {

                    //没有数据时, 隐藏相关的图表
                    var containerDOMID = chartID + "_container";
                    if (data == undefined || data == null) {
                        angular.element('#' + containerDOMID)[0].style.display = 'none';
                        return;
                    }
                    else {
                        angular.element('#' + containerDOMID)[0].style.display = 'inherit';
                    }

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

                    var legendDataCount = 0;
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
                            var studentCount = d.StudentCount;
                            lineSeriesData.push(studentCount);
                            barSeriesData.push(studentCount);

                            if (studentCount != undefined && studentCount >= 0) {
                                pieSeriesData.push({
                                    extData: d, value: studentCount, name: d.Desc
                                });
                                if ($scope.BroswerVerion > 8) {
                                    legendData.push({ value: d, name: d.Desc });
                                }

                            }


                            if (maxStudentCount < studentCount) {
                                maxStudentCount = studentCount;
                            }
                        }
                        //console.log("xAixsData", xAixsData);
                        //console.log("legendData", legendData);
                        //console.log("lineSeriesData", lineSeriesData);
                        //console.log("barSeriesData", barSeriesData);
                        //console.log("pieSeriesData", pieSeriesData);

                        legendDataCount = legendData.length;

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
                                }
                            ]
                        });
                    }

                    //因为legend数据是不确定, 固定的图表高度无法显示全部内容, 因此这里会重新计算高度, 并调用chart.resize()调整图表
                    if (chartID != undefined) {
                        var containerBaseHeight = 400;
                        var addHeight = (Math.ceil(legendDataCount / 4) - 1) * 30;

                        var newContainerHeight = containerBaseHeight + addHeight;
                        angular.element('#' + chartID)[0].style.height = newContainerHeight + 'px';

                        chart.resize();
                    }
                }

                $scope.InitChartOption = function (dom, chartTitle) {
                    var chart = echarts.init(dom);

                    var option = {
                        backgroundColor: '#ffffff',
                        title: [{
                            text: chartTitle,//"总成绩分布图",
                            top: 30,
                            left: '40%',
                            textStyle: {
                                fontWeight: 'bold',
                                fontSize: 16
                            }
                        },
                        {
                            text: '(人数)',
                            left: '20',
                            top: '50',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 14
                            }
                        }, {
                            text: '(分数)',
                            right: 0,
                            top: '330',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 14
                            }
                        },
                        {
                            text: '最高分:',
                            left: '70',
                            top: '100',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 14,
                                color: '#555555'
                            }
                        },
                        {
                            text: '',
                            left: '120',
                            top: '98',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 18,
                                color: '#0093dc'
                            }
                        },
                        {
                            text: '最低分:',
                            left: '190',
                            top: '100',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 14,
                                color: '#555555'
                            }
                        },
                        {
                            text: '',
                            left: '240',
                            top: '98',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 18,
                                color: '#0093dc'
                            }
                        }
                            ,
                        {
                            text: '平均分:',
                            left: '310',
                            top: '100',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 14,
                                color: '#555555'
                            }
                        },
                        {
                            text: '',
                            left: '360',
                            top: '98',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 18,
                                color: '#0093dc'
                            }
                        },
                        {
                            text: '已达平均分:',
                            left: '430',
                            top: '100',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 14,
                                color: '#555555'
                            }
                        },
                        {
                            text: '',
                            left: '510',
                            top: '98',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 18,
                                color: '#ff7800'
                            }
                        },
                        {
                            text: '人',
                            left: '530',
                            top: '100',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 14,
                                color: '#555555'
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
                                y: '90',
                                width: '88%',
                                height: '260',
                                show: false
                            }
                        ],

                        visualMap: [
                        ],
                        legend: {
                            name: '分布人数饼图',
                            show: true,
                            selectedMode: false,
                            orient: 'horizontal',
                            align: 'left',
                            top: '375',
                            left: '3%',
                            data: [],
                            formatter: function (name) {
                                return name;
                            },
                            itemWidth: 12,
                            itemHeight: 12,
                            itemGap: 20
                        },
                        series: [
                            {
                                xAxisIndex: 0,
                                yAxisIndex: 0,
                                name: '曲线图',
                                type: 'line',
                                smooth: true,
                                data: [],
                                tooltip: {
                                    backgroundColor: '#ABABAB'
                                },
                                lineStyle: {
                                    normal: {
                                        color: '#FF0000'
                                    }
                                },
                                symbolSize: [10, 10],
                                symbolOffset: [0, 0]
                            },
                            {
                                xAxisIndex: 0,
                                yAxisIndex: 0,
                                name: '柱状图',
                                type: 'bar',
                                smooth: true,
                                barWidth: 10,
                                data: [],
                                tooltip: {
                                    backgroundColor: '#ABABAB'
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#27B784',
                                        barBorderRadius: [10, 10, 10, 10]
                                    }
                                }

                            },
                            {
                                xAxisIndex: 1,
                                yAxisIndex: 1,
                                name: '分布人数饼图',
                                type: 'pie',
                                radius: '45',
                                center: ['87%', '130'],
                                data: [],
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'outside',
                                        formatter: function (p) {
                                            var d = p.data;
                                            if (d != undefined && d.extData != undefined) {

                                                return d.extData.xAixs;
                                            }
                                            return d.name;
                                        }
                                    },
                                    emphasis: {
                                        show: true
                                    }
                                },
                                tooltip: {
                                    formatter: '{c}人, 约{d}%',

                                }
                            }

                        ]
                    };

                    chart.setOption(option);

                    return chart;
                }
                //TaskSummaryData
                $scope.formatColorText = function (arr) {
                    var html = '';
                    arr.forEach(function (v) {
                        if (v.ScoreLevel == 1) {
                            html += '<span class="red">' + v.CharText + '</span>';
                        }
                        if (v.ScoreLevel == 2) {
                            html += '<span class="blue">' + v.CharText + '</span>';
                        }
                        if (v.ScoreLevel == 3) {
                            html += '<span class="yellow">' + v.CharText + '</span>';
                        }
                        if (v.ScoreLevel == 4) {
                            html += '<span class="green">' + v.CharText + '</span>';
                        }
                        if (v.ScoreLevel == -1) {
                            html += '<span>' + v.CharText + '</span>';
                        }
                    });
                    return html;
                }
                $scope.getRangePercent = function (content, type) {
                    var greenCount = 0;
                    var yellowCount = 0;
                    var blueCount = 0;
                    var redCount = 0;
                    if (!content) return 0;
                    content.forEach(function (v) {
                        if (v.ScoreLevel == 1) {
                            redCount++;
                        }
                        if (v.ScoreLevel == 2) {
                            blueCount++;
                        }
                        if (v.ScoreLevel == 3) {
                            yellowCount++;
                        }
                        if (v.ScoreLevel == 4) {
                            greenCount++;
                        }
                    });
                    var allCount = greenCount + yellowCount + blueCount + redCount;
                    switch (type) {
                        case 'green': return { width: greenCount / allCount * 100 + '%' };
                        case 'yellow': return { width: yellowCount / allCount * 100 + '%' };
                        case 'blue': return { width: blueCount / allCount * 100 + '%' };
                        case 'red': return { width: redCount / allCount * 100 + '%' };
                    }
                }
                $scope.showChild = function ($event, item) {
                    var el = angular.element($event.target);
                    var parentEl = el.closest('tr');
                    var tableEl = el.closest('table');
                    var text = item.ReadTextScoreDetail ? $scope.formatColorText(item.ReadTextScoreDetail) : $scope.detailData.OriginalContentText;
                    $timeout(function () {
                        if (parentEl.next().attr('class') === 'child-tr') {
                            tableEl.find('.child-tr').remove();
                            return;
                        }
                        tableEl.find('.child-tr').remove();
                        if (!text && text !== 0) {
                            text = '--'
                        }
                        parentEl.after($('<tr class="child-tr"><td colspan="8">' + text + '</td><tr>'));
                    })
                }
                $scope.ReturnTaskListReport = function () {
                    $state.go('teacherreport', { taskID: $scope.CurrentTaskID, classID: $scope.CurrentClassID });
                }

                //TaskPaperAnalysisData
                $scope.ChoosedCurrentTaskPaper = {};
                $scope.TaskPapers = [];
                $scope.PaperAnalysisData = null;

                $scope.EnableKnowledgePointAnalysisBarChart = false;

                $scope.KnowledgePointAnalysisBarChart = null;

                $scope.LoadTaskPaperAnalysisData = function (taskID, classID, paperID) {
                    $timeout(function () {

                        if ($scope.EnableKnowledgePointAnalysisBarChart) {
                            $scope.KnowledgePointAnalysisBarChart = $scope.InitKnowledgePointAnalysisBarChart('knowledgePoint_analysis_barChart');
                        }

                        ReportService.GetTaskPaperAnalysisDataForTeacher(taskID, classID, paperID).then(function (result) {

                            var d = result.data;
                            $scope.AddExtField(d.ListeningAreaData);
                            $scope.AddExtField(d.SpeakingAreaData);
                            $scope.PaperAnalysisData = d;

                            console.log("PaperAnalysisData", $scope.PaperAnalysisData);

                            if ($scope.EnableKnowledgePointAnalysisBarChart) {
                                $scope.KnowledgePointAnalysisBarChart.hideLoading();
                                //知识点柱状图
                                $scope.UpdateKnowledgePointAnalysisBarChartData($scope.KnowledgePointAnalysisBarChart, $scope.PaperAnalysisData.TaskKnowledgePointScore);
                            }
                        }, function (error) {
                            if ($scope.EnableKnowledgePointAnalysisBarChart) {
                                $scope.KnowledgePointAnalysisBarChart.hideLoading();
                                $scope.SetLoadChartDataError('analysis_barChart');
                            }
                        })
                    }, 1000);
                }

                $scope.InitKnowledgePointAnalysisBarChart = function (chartID) {
                    var chartDom = document.getElementById(chartID);
                    if (angular.isObject(chartDom)) {

                        var chartInstance = echarts.init(chartDom);
                        var option = {
                            title: [{
                                text: '',
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
                $scope.UpdateKnowledgePointAnalysisBarChartData = function (barChart, knowledgePointData) {

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

                $scope.ExportData = {
                    TaskID: "",
                    ClassID: "",
                    StudentNumber: "",
                }

                $scope.DownloadReport = function () {

                    $scope.ReportDownloadKey = ''; //报告下载路径

                    $scope.ExportData.TaskID = $scope.CurrentTaskID;
                    $scope.ExportData.ClassID = $scope.CurrentClassID;
                    $scope.ExportData.StudentNumber = "";

                    console.log("DownloadReport ", $scope.ExportData);
                    angular.element('#ExportingDialog').modal({ backdrop: 'static', keyboard: false });
                    ReportService.ExportReport($scope.ExportData).then(function (result) {
                        console.log("DownloadReport result ", result);
                        $scope.ReportDownloadKey = result.data.data;
                        angular.element('#ExportingDialog').modal("hide");
                        var href = GLOBAL_API_URL + "api/report/download/" + $scope.ReportDownloadKey;
                        if (href != undefined && href != null && href != "") {
                            window.open(href, '_self');
                        }
                    });
                }
                $scope.DownloadStudentListReport = function () {

                    $scope.StudentListReportDownloadKey = ''; //报告下载路径

                    $scope.ExportData.TaskID = $scope.CurrentTaskID;
                    $scope.ExportData.ClassID = $scope.CurrentClassID;
                    $scope.ExportData.StudentNumber = "";

                    console.log("DownloadStudentListReport ", $scope.ExportData);
                    angular.element('#ExportingDialog').modal({ backdrop: 'static', keyboard: false });
                    ReportService.ExportStudentListExcel($scope.ExportData).then(function (result) {
                        console.log("DownloadStudentListReport result ", result);
                        $scope.StudentListReportDownloadKey = result.data.data;
                        angular.element('#ExportingDialog').modal("hide");
                        var href = GLOBAL_API_URL + "api/report/download/" + $scope.StudentListReportDownloadKey;
                        if (href != undefined && href != null && href != "") {
                            window.open(href, '_self');
                        }
                    });
                }
                //End Export Report 


                //得分详情
                $scope.AreaAnalysisChart = null;
                $scope.ContentAnalysisChart_All = null;
                $scope.ContentAnalysisChart_Integrity = null;
                $scope.ContentAnalysisChart_Fluency = null;
                $scope.ContentAnalysisChart_Pronounce = null;

                $scope.ViewAreaScoreDetail = function (la, $event) {
                    //console.log(la);
                    $event.stopPropagation();

                    angular.element("#areaAnalysisChartDialog").modal({ backdrop: 'static', keyboard: false });
                    $timeout(function () {
                        if ($scope.AreaAnalysisChart == null) {
                            $scope.AreaAnalysisChart = $scope.InitAnalysisChart('AreaAnalysisChart', '总成绩分布图');
                        }
                        $scope.UpdateAreaAnalysisChartData($scope.AreaAnalysisChart, "AreaAnalysisChart", la, 1, false);
                    }, 0);
                }
                $scope.analysisSimpleChart = null;
                $scope.initAnalysisSimpleChart = function (data) {
                    var formatData = $scope.formatBackEndDetailSeries(data.ScoreScattergramList[0].ScoreDetailList);
                    if (!$scope.analysisSimpleChart) {
                        $scope.analysisSimpleChart = echarts.init(document.getElementById('analysis-simple-piechart'));
                    }
                    var color = data.ContentAnalysisType === 0 ?
                        ['#98ccfe', '#ff9a66', '#9966ff', '#ff679a', '#ffcc66', '#70E0A9']
                        :
                        ['#3398cc', '#ffcc66', '#66cdcc'];
                    console.log(color);
                    var option;
                    if (data.ContentAnalysisType === 0) {
                        option = {
                            color: color,
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b}<br/>{c}人 ({d}%)"
                            },
                            legend: {
                                orient: 'vertical',
                                itemWidth: 12,
                                itemHeight: 12,
                                left: 10,
                                top: '5%',
                                data: $scope.getSections(formatData)
                            },
                            series: [
                                {
                                    center: ['55%', '50%'],
                                    type: 'pie',
                                    radius: ['20%', '35%'],
                                    label: {
                                        normal: {
                                            show: true,
                                            formatter: '\n{s|{c}人}\n{black|{b}}\n',
                                            rich: {
                                                s: {
                                                    fontSize: 14
                                                },
                                                black: {
                                                    fontSize: 12,
                                                    height: 15,
                                                    color: '#333',
                                                    align: 'center'
                                                }
                                            }
                                        },
                                    },
                                    data: formatData
                                }
                            ]
                        };
                    }
                    else if (data.ContentAnalysisType === 1) {
                        var formatData = $scope.formatBackEndDetailSeries(data.ScoreScattergramList[0].ScoreDetailList);
                        option = {
                            color: color,
                            tooltip: {
                                trigger: 'item',
                                formatter: function (params) {
                                    var desc = "错";
                                    if (params.data.selected) {
                                        desc = "对";
                                    }
                                    return '答' + desc + '人数 : ' + params.value + '<br/>占比 : ' + params.percent + '%';
                                },
                            },
                            legend: {
                                orient: 'vertical',
                                itemWidth: 12,
                                itemHeight: 12,
                                left: 15,
                                top: 15,
                                data: $scope.getSections(formatData)
                            },
                            series: [
                                {
                                    type: 'pie',
                                    radius: ['0%', '35%'],
                                    label: {
                                        normal: {
                                            show: true,
                                            formatter: function (params) {
                                                if (params.data.selected) {
                                                    return '\n{s|对} \n{gray|答对人数 : ' + params.value + '}\n'
                                                } else {
                                                    return '\n{s|错} \n{gray|答错人数 : ' + params.value + '}\n'
                                                }
                                            },
                                            rich: {
                                                s: {
                                                    fontSize: 16,
                                                },
                                                gray: {
                                                    color: '#333',
                                                    align: 'left',
                                                    height: 20
                                                }
                                            }
                                        },
                                    },
                                    selectedOffset: 3,
                                    data: formatData
                                }
                            ]
                        };
                    } else if (data.ContentAnalysisType === 2) {
                        var formatData = $scope.formatBackEndDetailSeries(data.ScoreScattergramList[0].ScoreDetailList);
                        console.log(123, formatData);
                        option = {
                            color: color,
                            tooltip: {
                                trigger: 'item',
                                formatter: function (params) {
                                    var desc = "错";
                                    if (params.data.selected) {
                                        desc = "对";
                                    }
                                    return '答' + desc + '人数 : ' + params.value + '<br/>占比 : ' + params.percent + '%';
                                },
                            },
                            legend: {
                                orient: 'vertical',
                                itemWidth: 12,
                                itemHeight: 12,
                                left: 30,
                                top: 15,
                                data: $scope.getSections(formatData)
                            },
                            series: [
                                {
                                    type: 'pie',
                                    radius: ['0%', '35%'],
                                    label: {
                                        normal: {
                                            show: true,
                                            formatter: function (params) {
                                                if (params.data.selected) {
                                                    return '\n{black|选项 }{s|' + params.data.name + ' ( 对 )}\n{gray|选择人数 : ' + params.value + '}\n'
                                                } else {
                                                    return '\n{black|选项 }{s|' + params.data.name + ' ( 错 )}\n{gray|选择人数 : ' + params.value + '}\n'
                                                }
                                            },
                                            rich: {
                                                s: {
                                                    fontSize: 16,
                                                },
                                                gray: {
                                                    color: '#333',
                                                    align: 'left'
                                                },
                                                black: {
                                                    color: 'black',
                                                    fontWeight: 'bold',
                                                    fontSize: 16,
                                                    height: 22
                                                }
                                            }
                                        },
                                    },
                                    selectedOffset: 3,
                                    data: formatData
                                }
                            ]
                        };
                    }
                    $scope.analysisSimpleChart.setOption(option);
                }
                $scope.initAnalysisComplexChart = function (chartData) {
                    chartData.ScoreScattergramList.forEach(function (v) {
                        var el = document.getElementById('analysis-complex-piechart' + v.ScoreScattergramType);
                        var chart = echarts.init(el);
                        var option;
                        var formatData = $scope.formatBackEndDetailSeries(v.ScoreDetailList);
                        if (v.ScoreScattergramType == 1) {
                            option = {
                                color: ['#98ccfe', '#ff9a66', '#9966ff', '#ff679a', '#ffcc66', '#70E0A9'],
                                tooltip: {
                                    trigger: 'item',
                                    formatter: "{b}<br/>{c}人 ({d}%)"
                                },
                                legend: {
                                    itemGap: 4,
                                    orient: 'vertical',
                                    itemWidth: 6,
                                    itemHeight: 6,
                                    left: 20,
                                    top: 'center',
                                    data: $scope.getCircleSections(formatData)
                                },
                                series: [
                                    {
                                        type: 'pie',
                                        radius: ['35%', '60%'],
                                        center: ['70%', '50%'],
                                        label: {
                                            show: false
                                        },
                                        data: formatData
                                    }
                                ]
                            };
                        } else {
                            option = {
                                color: ['#66cc9a', '#ffcc66', '#99cdff', '#ff9899'],
                                tooltip: {
                                    trigger: 'item',
                                    formatter: "\n{b}<br/>{c}人 ({d}%)\n"
                                },
                                legend: {
                                    itemGap: 4,
                                    orient: 'vertical',
                                    itemWidth: 6,
                                    itemHeight: 6,
                                    left: 40,
                                    top: 'center',
                                    data: $scope.getCircleSections(formatData)
                                },
                                series: [
                                    {
                                        type: 'pie',
                                        radius: ['35%', '60%'],
                                        center: ['60%', '50%'],
                                        label: {
                                            show: false
                                        },
                                        data: formatData
                                    }
                                ]
                            };
                        }
                        chart.setOption(option);
                    });
                };
                // 滚动插件有个坑，标签页切换的时候会往右滑一点，下面代码重置滚动位置
                $scope.refreshScrollBar = function () {
                    $timeout(function () {
                        $('.custom-scrollbar').find('.mCSB_container').css('left', 0);
                        $('.custom-scrollbar').mCustomScrollbar("update");
                    }, 0);
                }
                $scope.analysisSimpleTable = new NgTableParams({ count: 999 }, {
                    dataset: []
                });
                $scope.analysisComplexTable = new NgTableParams({ count: 999 }, {
                    dataset: []
                });
                function safeApply(scope, fn) {
                    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
                }
                $scope.GetFixedAudioPath = function (path) {
                    if ($scope.Constants.answerBaseUrl != "/") {
                        if (path.indexOf($scope.Constants.answerBaseUrl) < 0) {
                            path = $scope.Constants.answerBaseUrl + path;
                        }
                    }
                    return path;
                }
                $scope.PlayAudio = function (itemID, audioPath) {
                    if ($scope.IsAudioPlaying(itemID)) {
                        Audio.stop();
                        $rootScope.AudioPlayingItemID = '';
                    } else {
                        var fixedAudioPath = $scope.GetFixedAudioPath(audioPath);
                        Audio.play(fixedAudioPath, function () {
                            safeApply($scope, function () {
                                $rootScope.AudioPlayingItemID = '';
                            });
                        });
                        $rootScope.AudioPlayingItemID = itemID;
                    }
                };
                $scope.recursePlay = function (audioPathArr) {
                    if (!audioPathArr.length) {
                        safeApply($scope, function () {
                            $rootScope.AudioPlayingItemID = '';
                        });
                    } else {
                        var fixedAudioPath = $scope.GetFixedAudioPath(audioPathArr[0]);
                        Audio.play(fixedAudioPath, function () {
                            audioPathArr.splice(0, 1);
                            $scope.recursePlay(audioPathArr);
                        });
                    }
                }
                $scope.PlayMultiAudio = function (itemID, audioPath) {
                    var audioPathArr = audioPath.split(';')
                    if ($scope.IsAudioPlaying(itemID)) {
                        Audio.stop();
                        $rootScope.AudioPlayingItemID = '';
                    } else {
                        $scope.recursePlay(audioPathArr);
                        $rootScope.AudioPlayingItemID = itemID;
                    }
                };
                $scope.IsAudioPlaying = function (itemID) {
                    return itemID == $rootScope.AudioPlayingItemID;
                }
                $scope.detailData = null;
                $('#simple-chart-dialog').on('hidden.bs.modal', function (e) {
                    Audio.stop();
                    $rootScope.AudioPlayingItemID = '';
                });
                $('#complex-chart-dialog').on('hidden.bs.modal', function (e) {
                    Audio.stop();
                    $rootScope.AudioPlayingItemID = '';
                });
                $scope.$on("TeacherReport_ViewContentScoreDetail", function (source, data) {
                    // angular.element("#contentAnalysisChartDialog").modal({ backdrop: 'static', keyboard: false });
                    $scope.detailData = data;
                    // 无数据情况
                    // if(!data.ScoreScattergramList.length){
                    //     return;
                    // }
                    if (data.ContentAnalysisType !== 3) {
                        angular.element("#simple-chart-dialog").modal({ backdrop: 'static', keyboard: false });
                        $scope.initAnalysisSimpleChart(data);
                        $scope.analysisSimpleTable.settings({
                            dataset: data.StudentAnswerDataList
                        });
                    } else {
                        angular.element("#complex-chart-dialog").modal({ backdrop: 'static', keyboard: false });
                        $timeout(function () {
                            $scope.initAnalysisComplexChart(data);

                            var showReadTextScoreDetail = true;
                            var showIntegrityScore = true;
                            var showFluencyScore = true;
                            //#region 根据题型显示/隐藏 列
                            //单词音标认读: 只显示 准确度, 隐藏其他
                            //其他题型: 全部显示                           
                            var areaType = data.AreaType;
                            if (areaType == 24) {
                                showReadTextScoreDetail = false;
                                showIntegrityScore = false;
                                showFluencyScore = false;
                            }
                            console.log('动态', data.StudentAnswerDataList);
                            $scope.detailCols.forEach(function (v) {
                                if (v.field == 'ReadTextScoreDetail') {
                                    v.show = showReadTextScoreDetail;
                                }
                                if (v.field == 'IntegrityScore') {
                                    v.show = showIntegrityScore;
                                }
                                if (v.field == 'FluencyScore') {
                                    v.show = showFluencyScore;
                                }
                            });

                            //#endregion



                            $scope.analysisComplexTable.settings({
                                dataset: data.StudentAnswerDataList
                            });
                        });
                    }
                    // $timeout(function () {
                    //     $scope.totalChartCount = 4;
                    //     $scope.integrityVisiable = true;
                    //     $scope.pronounceVisiable = true;
                    //     $scope.fluencyVisiable = true;
                    //     $scope.SetCharVisiable('ContentAnalysisChart_Integrity', $scope.integrityVisiable);
                    //     $scope.SetCharVisiable('ContentAnalysisChart_Pronounce', $scope.pronounceVisiable);
                    //     $scope.SetCharVisiable('ContentAnalysisChart_Fluency', $scope.fluencyVisiable);

                    //     if ($scope.ContentAnalysisChart_All == null) {
                    //         $scope.ContentAnalysisChart_All = $scope.InitAnalysisChart('ContentAnalysisChart_All', '总成绩分布图');
                    //     }
                    //     if ($scope.ContentAnalysisChart_Integrity == null) {
                    //         $scope.ContentAnalysisChart_Integrity = $scope.InitAnalysisChart('ContentAnalysisChart_Integrity', '完整度成绩分布图');
                    //     }
                    //     if ($scope.ContentAnalysisChart_Pronounce == null) {
                    //         $scope.ContentAnalysisChart_Pronounce = $scope.InitAnalysisChart('ContentAnalysisChart_Pronounce', '准确度成绩分布图');
                    //     }
                    //     if ($scope.ContentAnalysisChart_Fluency == null) {
                    //         $scope.ContentAnalysisChart_Fluency = $scope.InitAnalysisChart('ContentAnalysisChart_Fluency', '流利度成绩分布图');
                    //     }

                    //     $scope.UpdateContentAnalysisChartData($scope.ContentAnalysisChart_All, "ContentAnalysisChart_All", data, 1, false);
                    //     $scope.UpdateContentAnalysisChartData($scope.ContentAnalysisChart_Integrity, "ContentAnalysisChart_Integrity", data, 2, false);
                    //     $scope.UpdateContentAnalysisChartData($scope.ContentAnalysisChart_Pronounce, "ContentAnalysisChart_Pronounce", data, 3, false);
                    //     $scope.UpdateContentAnalysisChartData($scope.ContentAnalysisChart_Fluency, "ContentAnalysisChart_Fluency", data, 4, false);

                    //     $scope.AdjustLayoutForContentAnalysisChart();

                    // }, 0);
                })
                $scope.SetCharVisiable = function (chartID, visiableFlag) {
                    //没有数据时, 隐藏相关的图表
                    var containerDOMID = chartID + "_container";
                    if (visiableFlag == false) {
                        angular.element('#' + containerDOMID)[0].style.display = 'none';
                    }
                    else {
                        angular.element('#' + containerDOMID)[0].style.display = 'inherit';
                    }
                }
                $scope.totalChartCount = 4;
                $scope.integrityVisiable = true;
                $scope.pronounceVisiable = true;
                $scope.fluencyVisiable = true;
                $scope.AdjustLayoutForContentAnalysisChart = function () {
                    //init
                    angular.element('#contentAnalysisChartDialog_modal-body')[0].style.height = '600px';
                    angular.element('#contentAnalysisChartDialog_modal-content')[0].style.width = '950px';
                    angular.element('#contentAnalysisChart_spliter')[0].style.display = 'none';

                    $scope.SetCharVisiable('ContentAnalysisChart_Integrity', $scope.integrityVisiable);
                    $scope.SetCharVisiable('ContentAnalysisChart_Pronounce', $scope.pronounceVisiable);
                    $scope.SetCharVisiable('ContentAnalysisChart_Fluency', $scope.fluencyVisiable);

                    if ($scope.totalChartCount <= 2) {
                        //adjust height
                        angular.element('#contentAnalysisChartDialog_modal-body')[0].style.height = '320px';
                    }
                    if ($scope.totalChartCount <= 1) {
                        //adjust  width 
                        angular.element('#contentAnalysisChartDialog_modal-content')[0].style.width = '451px';
                    }

                    if ($scope.totalChartCount == 3) {
                        //draw row spliter
                        angular.element('#contentAnalysisChart_spliter')[0].style.display = 'inherit';
                    }
                    if ($scope.totalChartCount == 4) {
                        //draw row spliter
                        angular.element('#contentAnalysisChart_spliter')[0].style.display = 'inherit';
                        // draw border-left for last chart(Fluency Chart) 
                        angular.element('#ContentAnalysisChart_Fluency_container')[0].style.borderLeft = 'solid 1px #dbdbdb';
                    }
                }
                $scope.InitAnalysisChart = function (chartID, chartTitle) {
                    var chartDom = document.getElementById(chartID);
                    if (angular.isObject(chartDom)) {
                        var chartInstance = $scope.InitAnalysisChartOption(chartDom, chartTitle);
                        return chartInstance;
                    }
                    else {
                        console.log("can not found dom: ", chartID);
                        return null;
                    }
                }
                $scope.InitAnalysisChartOption = function (dom, chartTitle) {
                    var chart = echarts.init(dom);
                    var option = {};

                    //IE8下legend样式错乱,隐藏legend
                    if ($scope.BroswerVerion <= 8) {
                        option = {
                            title: {
                                text: chartTitle,
                                textStyle: {
                                    fontSize: 16
                                },
                                x: '42%'
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c} 人 (占比{d}%)"
                            },
                            legend: {
                                show: false
                            },
                            series: [
                                {
                                    name: chartTitle,
                                    animation: false,
                                    type: 'pie',
                                    radius: '55%',
                                    center: ['55%', '55%'],
                                    data: [],
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        };
                    } else {
                        option = {
                            title: {
                                text: chartTitle,
                                textStyle: {
                                    fontSize: 16
                                },
                                x: '50%'
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c} 人 (占比{d}%)"
                            },
                            legend: {
                                orient: 'vertical',
                                left: 'left',
                                data: ['0.0~1.0分', '1.0~2.0分', '2.0~3.0分', '3.0~4.0分']
                            },
                            series: [
                                {
                                    name: chartTitle,
                                    animation: false,
                                    type: 'pie',
                                    radius: '55%',
                                    center: ['65%', '65%'],
                                    data: [
                                        { value: 1, name: '0.0~1.0分' },
                                        { value: 2, name: '1.0~2.0分' },
                                        { value: 3, name: '2.0~3.0分' },
                                        { value: 4, name: '3.0~4.0分' }
                                    ],
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        };
                    }

                    chart.setOption(option);

                    return chart;
                }

                $scope.UpdateAreaAnalysisChartData = function (chart, chartID, data, dataType, hideZero) {
                    var legendData = [];
                    var pieSeriesData = [];

                    if (data != undefined && data.AreaAnalysisData != undefined && data.AreaAnalysisData.ScoreScattergramList != undefined) {
                        for (var i = 0; i < data.AreaAnalysisData.ScoreScattergramList.length; i++) {
                            var item = data.AreaAnalysisData.ScoreScattergramList[i];
                            //ScoreScattergramType
                            /// 总成绩
                            // All = 1,
                            /// 完整度
                            //Integrity = 2,
                            /// 准确度
                            // Pronounce = 3,
                            /// 流利度
                            // Fluency = 4
                            if (item.ScoreScattergramType == dataType) {
                                var ScoreDetailList = item.ScoreDetailList;
                                if (ScoreDetailList != undefined && ScoreDetailList.length > 0) {
                                    for (var dIndex = 0; dIndex < ScoreDetailList.length; dIndex++) {
                                        var dItem = ScoreDetailList[dIndex];


                                        if (hideZero == true && dItem.Count <= 0) continue;

                                        legendData.push(dItem.ScoreDisplayText);
                                        pieSeriesData.push({
                                            value: dItem.Count,
                                            name: dItem.ScoreDisplayText
                                        })
                                    }
                                }
                            }
                        }
                    }

                    $scope.SetAnalysisChartData(chart, legendData, pieSeriesData);

                    if (legendData == undefined || legendData.length == 0) {
                        //$scope.SetLoadChartDataError(chartID, "暂无数据");
                    }
                }

                $scope.BroswerVerion = getIEVersion();

                $scope.SetAnalysisChartData = function (chart, legendData, pieSeriesData) {
                    chart.setOption({
                        legend: {
                            data: legendData
                        },
                        series: [
                            {
                                data: pieSeriesData
                            }]
                    });

                }

                $scope.UpdateContentAnalysisChartData = function (chart, chartID, data, dataType, hideZero) {
                    var legendData = [];
                    var pieSeriesData = [];

                    if (data != undefined && data.ContentAnalysisData != undefined && data.ContentAnalysisData.ScoreScattergramList != undefined) {
                        for (var i = 0; i < data.ContentAnalysisData.ScoreScattergramList.length; i++) {
                            var item = data.ContentAnalysisData.ScoreScattergramList[i];

                            if (item.ScoreScattergramType == dataType) {
                                var ScoreDetailList = item.ScoreDetailList;
                                if (ScoreDetailList != undefined && ScoreDetailList.length > 0) {
                                    for (var dIndex = 0; dIndex < ScoreDetailList.length; dIndex++) {
                                        var dItem = ScoreDetailList[dIndex];


                                        if (hideZero == true && dItem.Count <= 0) continue;

                                        if (dataType == 2 || dataType == 3 || dataType == 4) {
                                            //完整度=2. 准确度=3. 流利度=4
                                            dItem.ConvertedScoreDisplayText = $scope.ConvertedScoreDisplayText(dItem.ScoreDisplayText);
                                            legendData.push(dItem.ConvertedScoreDisplayText);
                                            var itemColor = $scope.GetItemColorByScoreDisplayText(dItem.ScoreDisplayText);
                                            pieSeriesData.push({
                                                value: dItem.Count,
                                                name: dItem.ConvertedScoreDisplayText,
                                                itemStyle: {
                                                    normal: {
                                                        color: itemColor
                                                    },
                                                    emphasis: {
                                                        color: itemColor
                                                    }
                                                }
                                            })
                                        }
                                        else {
                                            legendData.push(dItem.ScoreDisplayText);
                                            pieSeriesData.push({
                                                value: dItem.Count,
                                                name: dItem.ScoreDisplayText
                                            })
                                        }


                                    }
                                }
                            }
                        }
                    }
                    $scope.SetAnalysisChartData(chart, legendData, pieSeriesData);

                    if (pieSeriesData == undefined || pieSeriesData.length == 0) {
                        // 没有数据的图表不显示
                        if (dataType == 2) {
                            $scope.integrityVisiable = false;
                        }
                        if (dataType == 3) {
                            $scope.pronounceVisiable = false;
                        }
                        if (dataType == 4) {
                            $scope.fluencyVisiable = false;
                        }
                        $scope.totalChartCount = $scope.totalChartCount - 1;
                    }
                }

                $scope.ConvertedScoreDisplayText = function (text) {
                    if (text == 1 || text == "1") {
                        return "差";
                    }
                    if (text == 2 || text == "2") {
                        return "中";
                    }
                    if (text == 3 || text == "3") {
                        return "良";
                    }
                    if (text == 4 || text == "4") {
                        return "优";
                    }
                    return "未知";
                }
                $scope.GetItemColorByScoreDisplayText = function (text) {
                    if (text == 1 || text == "1") {
                        return "#ff0000";
                    }
                    if (text == 2 || text == "2") {
                        return "#487dad";
                    }
                    if (text == 3 || text == "3") {
                        return "#ff8a00";
                    }
                    if (text == 4 || text == "4") {
                        return "#14b403";
                    }
                    return "未知";
                }

                //miscellaneous methods
                //展开/收缩
                $scope.collapseToggle = function (d) {
                    if (d.CollapseState != undefined) {
                        d.CollapseState = d.CollapseState == 0 ? 1 : 0;
                    }
                }
                $scope.AddExtField = function (data) {
                    if (data == undefined || data.length == 0) {
                        return;
                    }
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].CollapseState == undefined) {
                            data[i].CollapseState = 0;
                        }
                    }
                    //console.log(data);
                }
                $scope.GetRefText = function () {
                    return $rootScope.RefText;
                };

                $scope.GetPart1ContentCount = function (sa) {
                    if (sa.AreaContentCount != undefined) {
                        return sa.AreaContentCount - 1;
                    }
                    return 0;
                }
                $scope.GetPart1ContentScore = function (sa) {
                    if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                        var contentData = sa.QuestionData[0].ContentData;
                        if (contentData != undefined && contentData.length > 0) {
                            return contentData[0].PaperContent.Score;
                        }
                    }
                }
                $scope.GetPart2ContentScore = function (sa) {
                    if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                        var contentData = sa.QuestionData[0].ContentData;
                        if (contentData != undefined && contentData.length > 0) {
                            return contentData[contentData.length - 1].PaperContent.Score;
                        }
                    }
                }
                $scope.GetPart1TotalScoreFor26 = function (sa) {
                    if (sa.AreaType != 26) {
                        return 0;
                    }
                    var totalScore = 0;
                    if (sa.QuestionData != undefined) {
                        for (var i = 0; i < sa.QuestionData.length; i++) {
                            if (sa.QuestionData[i].Idx == 1) {
                                var q = sa.QuestionData[i];
                                //console.log(q);
                                if (q != undefined && q.ContentData != undefined) {
                                    for (var ci = 0; ci < q.ContentData.length; ci++) {
                                        totalScore += q.ContentData[ci].PaperContent.Score;
                                    }
                                }
                            }
                        }
                    }
                    return totalScore;
                }
                $scope.GetPart2TotalScoreFor26 = function (sa) {
                    if (sa.AreaType != 26) {
                        return 0;
                    }
                    var totalScore = 0;
                    if (sa.QuestionData != undefined) {
                        for (var i = 0; i < sa.QuestionData.length; i++) {
                            if (sa.QuestionData[i].Idx != 1) {
                                var q = sa.QuestionData[i];
                                //console.log(q);
                                if (q != undefined && q.ContentData != undefined) {
                                    for (var ci = 0; ci < q.ContentData.length; ci++) {
                                        totalScore += q.ContentData[ci].PaperContent.Score;
                                    }
                                }
                            }
                        }
                    }
                    return totalScore;
                }
                $scope.GetAreaTitle = function (sa) {
                    var data = {};
                    data.IsCustomPaper = $scope.PaperAnalysisData.IsCustomPaper;
                    data.AreaTitle = sa.AreaTitle;
                    data.ContentCount = sa.AreaContentCount;
                    data.AreaScore = roundMin0Max2Filter(sa.PaperAreaScore);
                    data.AvgContentScore = roundMin0Max2Filter(data.AreaScore / data.ContentCount);
                    data.QuestionCount = sa.QuestionData.length;
                    data.AvgQuestionScore = roundMin0Max2Filter(data.AreaScore / data.QuestionCount)
                    data.AreaTitle = sa.AreaTitle;
                    data.AreaType = sa.AreaType;
                    data.Part1ContentCount = $scope.GetPart1ContentCount(sa);
                    data.Part1ContentScore = $scope.GetPart1ContentScore(sa);
                    data.Part2ContentScore = $scope.GetPart2ContentScore(sa);

                    data.Part1TotalScoreFor26 = $scope.GetPart1TotalScoreFor26(sa);
                    data.Part2TotalScoreFor26 = $scope.GetPart2TotalScoreFor26(sa);

                    //console.log(data);
                    return CommonBusinessService.GetAreaTitle(data);
                }

            }])
            /*
            * Services
            */
            .service('ReportService', function ($http, Constants) {
                var self = this;

                self.ExportReport = function (exportData) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_ExportReportForTeacher_Offline', exportData);
                }
                self.ExportStudentListExcel = function (exportData) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_ExportReportForTeacher_ExportStudentListExcel', exportData);
                }

                self.GetTaskPaperAnalysisDataForTeacher = function (taskID, classID, paperID) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_TaskPaperAnalysisDataForTeacher', { TaskID: taskID, ClassID: classID, PaperID: paperID });
                }

                self.GetTaskPaperAnalysisDataForStudent = function (taskID, studentId, paperID) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_TaskPaperAnalysisDataForStudent', { TaskID: taskID, StudentID: studentId, PaperID: paperID });
                }

                self.GetStudentClass = function () {
                    return $http.get(GLOBAL_API_URL + 'api/account/stuClass');
                }

                self.GetReport_TaskListForStudent = function (queryParams) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_TaskListForStudent', queryParams);
                }

                self.GetReport_TaskListForTeacher = function (queryParams) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_TaskListForTeacher', queryParams);
                }
                self.GetReport_TaskStudentForTeacher = function (queryParams) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_TaskStudentForTeacher', queryParams);
                }
                self.GetReport_TaskSummaryForTeacher = function (queryParams) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_TaskSummaryForTeacher', queryParams);
                }
                self.GetReport_TaskAreaDataForStudent = function (queryParams) {
                    return $http.post(GLOBAL_API_URL + 'api/report/report_TaskAreaDataForStudent', queryParams);
                }
            })
            // .directive('fixedTableHeaders', [
            //     '$timeout',
            //     function ($timeout) {
            //         return {
            //             restrict: 'A',
            //             link: function (scope, element, attrs) {
            //                 $timeout(function () {
            //                     element.stickyTableHeaders({ scrollableArea: $('#scrollable-area') });
            //                 }, 0);
            //             }
            //         }
            //     }
            // ]);
            .filter('filterChartType', function () {
                return function (type) {
                    var text;
                    switch (type) {
                        case 1: text = '总成绩分布图'; break;
                        case 2: text = '完整度成绩分布图'; break;
                        case 3: text = '准确度成绩分布图'; break;
                        case 4: text = '流利度成绩分布图'; break;
                    }
                    return text;
                }
            })
            .filter('filterPaperName', function () {
                return function (name) {
                    var newName = name;
                    if (newName.length > 13) {
                        newName = newName.slice(0, 5) + ' ... ' + newName.slice(newName.length - 5, newName.length);
                    }
                    return newName;
                }
            });

    });