define([
    'angular', 'echarts',
    // ,'bootstrap-datetimepicker'
    'bootstrap-daterangepicker'
], function (angular, echarts) {
    'use strict';
    angular
        .module('DBReport', ['ui.router'])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state('DBReport', {
                    url: "/DBReport",
                    views: {
                        'mainChildView': {
                            templateUrl: "business/DBReport/DBReport.html",
                            controller: 'DBReportCtrl'
                        }
                    }
                });
            }
        ])
        /*
    * Controllers
    */
        .controller('DBReportCtrl', [
            '$scope',
            'AuthService',
            'Constants',
            'NgTableParams',
            'DBReportCtrlService',
            '$rootScope',
            'toaster',
            'DatepickerOption',
            function ($scope, AuthService, Constants, NgTableParams, DBReportCtrlService, $rootScope, toaster, DatepickerOption) {

                $scope.QueryParams = {};
                $scope.ReportName = "";

                // $scope.DateFrom; $scope.DateTo;
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

                // var today = new Date(); $scope.DateTo = formateTime(today); //
                // today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate() + " " +
                // today.getHours() + ":" + today.getMinutes(); $scope.DateFrom =
                // formateTime(today); $("#dtFrom").datetimepicker({format: "yyyy-mm-dd hh:ii",
                // autoclose: true, todayBtn: true, pickerPosition: "bottom-left"});
                // $("#dtTo").datetimepicker({format: "yyyy-mm-dd hh:ii", autoclose: true,
                // todayBtn: true, pickerPosition: "bottom-left"});

                $('#date-range-picker').daterangepicker(DatepickerOption);

                function ShowModel(param) {
                    $("#divHighCPU").hide();
                    $("#divHighIO").hide();
                    $("#divCPUMonitor").hide();
                    $("#divMemoryMonitor").hide();
                    $("#divSQLCacheHitRatioMonitor").hide();
                    $("#divFragmentIndex").hide();
                    $("#divMissingIndex").hide();
                    $("#divUnusedIndex").hide();
                    $("#divTableInfo").hide();
                    $("#" + param).show();
                }

                $scope.HighCPUSQLData = null;
                $scope.SearchHighCPUSQL = function () {
                    $scope.ReportName = "前10个消耗CPU高的SQL";

                    ShowModel("divHighCPU");

                    if ($scope.HighCPUSQLData == null) {
                        $scope.HighCPUSQLData = new NgTableParams({
                            count: 10
                        }, {
                            getData: function (params) {
                                $scope.QueryParams.PostParam = params.parameters();
                                return DBReportCtrlService
                                    .GetHighCPUSQL($('#server').val())
                                    .then(function (results) {
                                        //console.log(results); params.total(results.data.Count);
                                        return results.data.Table;
                                    });
                            }
                        });
                    }

                    $scope
                        .HighCPUSQLData
                        .parameters()
                        .page = 1;
                    $scope
                        .HighCPUSQLData
                        .reload();
                }

                $scope.HighIOSQLData = null;
                $scope.SearchHighIOSQL = function () {
                    $scope.ReportName = "前10个消耗IO高的SQL";

                    ShowModel("divHighIO");

                    if ($scope.HighIOSQLData == null) {
                        $scope.HighIOSQLData = new NgTableParams({
                            count: 10
                        }, {
                            getData: function (params) {
                                console.log('11', params.parameters());
                                $scope.QueryParams.PostParam = params.parameters();
                                return DBReportCtrlService
                                    .GetHighIOSQL($('#server').val())
                                    .then(function (results) {
                                        //console.log(results);
                                        params.total(results.data.Count);
                                        return results.data.Table;
                                    });
                            }
                        });
                    }

                    $scope
                        .HighIOSQLData
                        .parameters()
                        .page = 1;
                    $scope
                        .HighIOSQLData
                        .reload();
                }

                $scope.SearchCPUMonitor = function () {
                    $scope.ReportName = "CPU监控";
                    ShowModel("divCPUMonitor");
                    var param = {
                        dtfrom: $('#date-range-picker')
                            .val()
                            .split(' - ')[0],
                        dtto: $('#date-range-picker')
                            .val()
                            .split(' - ')[1]
                    };
                    return DBReportCtrlService
                        .GetCPUMonitor(param,$('#server').val())
                        .then(function (results) {
                            if (results.data.length == 0) 
                                return;
                            
                            var dataSystem = [];
                            var dataSQLServer = [];
                            angular.forEach(results.data, function (d, key) {
                                dataSystem.push({
                                    value: [d.MonitorTime, d.OtherProcessUtilization]
                                });
                                dataSQLServer.push({
                                    value: [d.MonitorTime, d.SQLProcessUtilization]
                                });
                            });

                            var dom = document.getElementById('chartCpuMonitor');
                            var chart = echarts.init(dom);
                            var option = {
                                title: {
                                    text: 'CPU使用率监控'
                                },
                                tooltip: {
                                    trigger: 'axis',
                                    formatter: function (params) {
                                        return params[0].value[0] + ' System:' + params[0].value[1] + '% SQL: ' + params[1].value[1] + '%';
                                    },
                                    axisPointer: {
                                        animation: false
                                    }
                                },
                                legend: {
                                    x: 'right',
                                    data: ["系统使用", "SQL Server使用"]
                                },
                                xAxis: {
                                    type: 'time',
                                    splitLine: {
                                        show: false
                                    }
                                },
                                yAxis: {
                                    type: 'value',
                                    splitLine: {
                                        show: false
                                    }
                                },
                                series: [
                                    {
                                        type: 'line',
                                        name: '系统使用',
                                        showSymbol: false,
                                        hoverAnimation: false,
                                        data: dataSystem
                                    }, {
                                        type: 'line',
                                        name: 'SQL Server使用',
                                        showSymbol: false,
                                        hoverAnimation: false,
                                        data: dataSQLServer
                                    }
                                ]
                            };

                            chart.setOption(option);
                        });
                }

                $scope.SearchMemoryMonitor = function () {
                    $scope.ReportName = "内存监控";
                    ShowModel("divMemoryMonitor");

                    var param = {
                        dtfrom: $('#date-range-picker')
                            .val()
                            .split(' - ')[0],
                        dtto: $('#date-range-picker')
                            .val()
                            .split(' - ')[1]
                    };

                    return DBReportCtrlService
                        .GetMemoryMonitor(param,$('#server').val())
                        .then(function (results) {
                            if (results.data.length == 0) 
                                return;
                            
                            var dataSystem = [];
                            var dataSQLServerTotal = [];
                            var dataSQLServerTarget = [];
                            angular.forEach(results.data, function (d, key) {
                                dataSystem.push({
                                    value: [d.MonitorTime, d.Used_Memory_MB]
                                });
                                dataSQLServerTotal.push({
                                    value: [d.MonitorTime, d.TotalServerMemory]
                                });
                                dataSQLServerTarget.push({
                                    value: [d.MonitorTime, d.TargetServerMemory]
                                });
                            });

                            var dom = document.getElementById('chartMemoryMonitor');
                            var chart = echarts.init(dom);
                            var option = {
                                title: {
                                    text: '内存监控'
                                },
                                tooltip: {
                                    trigger: 'axis',
                                    formatter: function (params) {
                                        return params[0].value[0] + ' System:' + params[0].value[1] + ' SQL Total: ' + params[1].value[1] + ' SQL Target: ' + params[2].value[1];
                                    },
                                    axisPointer: {
                                        animation: false
                                    }
                                },
                                legend: {
                                    x: 'right',
                                    data: ["系统使用", "SQL Server分配内存", "SQL Server需要内存"]
                                },
                                xAxis: {
                                    type: 'time',
                                    splitLine: {
                                        show: false
                                    }
                                },
                                yAxis: {
                                    type: 'value',
                                    splitLine: {
                                        show: false
                                    }
                                },
                                series: [
                                    {
                                        type: 'line',
                                        name: '系统使用',
                                        showSymbol: false,
                                        hoverAnimation: false,
                                        data: dataSystem
                                    }, {
                                        type: 'line',
                                        name: 'SQL Server分配内存',
                                        showSymbol: false,
                                        hoverAnimation: false,
                                        data: dataSQLServerTotal
                                    }, {
                                        type: 'line',
                                        name: 'SQL Server需要内存',
                                        showSymbol: false,
                                        hoverAnimation: false,
                                        data: dataSQLServerTarget
                                    }
                                ]
                            };

                            chart.setOption(option);
                        });
                }

                $scope.SearchSQLServerHitRatio = function () {
                    $scope.ReportName = "数据库缓存命中率";
                    ShowModel("divSQLCacheHitRatioMonitor");

                    var param = {
                        dtfrom: $('#date-range-picker')
                            .val()
                            .split(' - ')[0],
                        dtto: $('#date-range-picker')
                            .val()
                            .split(' - ')[1]
                    };

                    return DBReportCtrlService
                        .GetSQLServerHitRatio(param,$('#server').val())
                        .then(function (results) {
                            if (results.data.length == 0) 
                                return;
                            
                            var data = [];

                            angular.forEach(results.data, function (d, key) {
                                data.push({
                                    value: [d.MonitorTime, d.Rate]
                                });
                            });

                            var dom = document.getElementById('chartSQLCacheHitRatioMonitor');
                            var chart = echarts.init(dom);
                            var option = {
                                title: {
                                    text: '数据库缓存命中率'
                                },
                                tooltip: {
                                    trigger: 'axis',
                                    formatter: function (params) {
                                        return params[0].value[0] + ' 命中率:' + params[0].value[1] + '%';
                                    },
                                    axisPointer: {
                                        animation: false
                                    }
                                },
                                legend: {
                                    x: 'right',
                                    data: ["数据库缓存命中率"]
                                },
                                xAxis: {
                                    type: 'time',
                                    splitLine: {
                                        show: false
                                    }
                                },
                                yAxis: {
                                    type: 'value',
                                    splitLine: {
                                        show: false
                                    }
                                },
                                series: [
                                    {
                                        type: 'line',
                                        name: '数据库缓存命中率',
                                        showSymbol: false,
                                        hoverAnimation: false,
                                        data: data
                                    }
                                ]
                            };

                            chart.setOption(option);
                        });
                }

                $scope.FragmentIndexData = null;
                $scope.SearchFragmentIndex = function () {
                    $scope.ReportName = "需要重组的索引";

                    ShowModel("divFragmentIndex");

                    if ($scope.FragmentIndexData == null) {
                        $scope.FragmentIndexData = new NgTableParams({
                            count: 10
                        }, {
                            getData: function (params) {
                                $scope.QueryParams.PostParam = params.parameters();
                                return DBReportCtrlService
                                    .GetFragmentIndex($('#server').val())
                                    .then(function (results) {
                                        //console.log(results);
                                        params.total(results.data.Count);
                                        return results.data.Table;
                                    });
                            }
                        });
                    }

                    $scope
                        .FragmentIndexData
                        .parameters()
                        .page = 1;
                    $scope
                        .FragmentIndexData
                        .reload();
                }

                $scope.MissingIndexData = null;
                $scope.SearchMissingIndex = function () {
                    $scope.ReportName = "缺失的索引";

                    ShowModel("divMissingIndex");
                    console.log('111',$('#server').val());
                    if ($scope.MissingIndexData == null) {
                        $scope.MissingIndexData = new NgTableParams({
                            count: 10
                        }, {
                            getData: function (params) {
                                $scope.QueryParams.PostParam = params.parameters();
                                return DBReportCtrlService
                                    .GetMissingIndex($('#server').val())
                                    .then(function (results) {
                                        //console.log(results);
                                        params.total(results.data.Count);
                                        return results.data.Table;
                                    });
                            }
                        });
                    }

                    $scope
                        .MissingIndexData
                        .parameters()
                        .page = 1;
                    $scope
                        .MissingIndexData
                        .reload();
                }

                $scope.UnusedIndexData = null;
                $scope.SearchUnusedIndex = function () {
                    $scope.ReportName = "未使用的索引";

                    ShowModel("divUnusedIndex");

                    if ($scope.UnusedIndexData == null) {
                        $scope.UnusedIndexData = new NgTableParams({
                            count: 10
                        }, {
                            getData: function (params) {
                                $scope.QueryParams.PostParam = params.parameters();
                                return DBReportCtrlService
                                    .GetUnusedIndex($('#server').val())
                                    .then(function (results) {
                                        //console.log(results);
                                        params.total(results.data.Count);
                                        return results.data.Table;
                                    });
                            }
                        });
                    }

                    $scope
                        .UnusedIndexData
                        .parameters()
                        .page = 1;
                    $scope
                        .UnusedIndexData
                        .reload();
                }

                $scope.TableInfoData = null;
                $scope.SearchTableInfo = function () {
                    $scope.ReportName = "表信息";

                    ShowModel("divTableInfo");

                    if ($scope.TableInfoData == null) {
                        $scope.TableInfoData = new NgTableParams({
                            count: 10
                        }, {
                            getData: function (params) {
                                $scope.QueryParams.PostParam = params.parameters();
                                return DBReportCtrlService
                                    .GetTableInfo($('#server').val())
                                    .then(function (results) {
                                        //console.log(results);
                                        params.total(results.data.Count);
                                        return results.data.Table;
                                    });
                            }
                        });
                    }

                    $scope
                        .TableInfoData
                        .parameters()
                        .page = 1;
                    $scope
                        .TableInfoData
                        .reload();
                }
            }
        ])

        /*
    * Services
    */
        .service('DBReportCtrlService', function ($http, Constants) {
            var serviceBase = Constants.apiServiceBaseUri;
            var self = this;

            self.GetHighCPUSQL = function (server) {
                return $http.get(server + 'api/dbreport/GetHighCPUSQL');
            }

            self.GetHighIOSQL = function (server) {
                return $http.get(server + 'api/dbreport/GetHighIOSQL');
            }

            self.GetCPUMonitor = function (param,server) {
                return $http.get(server + 'api/dbreport/GetCPUMonitor?dtfrom=' + param.dtfrom + '&dtto=' + param.dtto);
            }

            self.GetMemoryMonitor = function (param,server) {
                return $http.get(server + 'api/dbreport/GetMemoryMonitor?dtfrom=' + param.dtfrom + '&dtto=' + param.dtto);
            }

            self.GetSQLServerHitRatio = function (param,server) {
                return $http.get(server + 'api/dbreport/GetSQLServerHitRatio?dtfrom=' + param.dtfrom + '&dtto=' + param.dtto);
            }

            self.GetFragmentIndex = function (server) {
                return $http.get(server + 'api/dbreport/GetFragmentIndex');
            }

            self.GetMissingIndex = function (server) {
                return $http.get(server + 'api/dbreport/GetMissingIndex');
            }

            self.GetUnusedIndex = function (server) {
                return $http.get(server + 'api/dbreport/GetUnusedIndex');
            }

            self.GetTableInfo = function (server) {
                return $http.get(server + 'api/dbreport/GetTableInfo');
            }
        });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
