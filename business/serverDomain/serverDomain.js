define(['angular', 'echarts', 'bootstrap-datetimepicker'], function (angular, echarts) {
    'use strict';

    angular.module('ServerDomain', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('serverDomainConfig', {
            url: "/serverDomainConfig",
            views: {
                'mainChildView': {
                    templateUrl: "business/serverDomain/serverDomainConfig.html",
                    controller: 'ServerDomainConfigCtrl'
                }
            }
        });
    }])
    /*
    * Controllers
    */
    .controller('ServerDomainConfigCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'ServerDomainConfigCtrlCtrlService', '$rootScope', 'toaster', '$timeout', 'AreaService', function ($scope, AuthService, Constants, NgTableParams, ServerDomainConfigCtrlCtrlService, $rootScope, toaster, $timeout, AreaService) {

        //#region  学校-区域配置
        $scope.RegionNow = {
            ProvinceList: [],
            CityList: [],
            AreaList: [],
            SchoolList: [],
        }
        $scope.QueryParams = {
            SchoolName: '',
            ProvinceName: '',
            CityName: '',
            AreaName: ''
        };
        $scope.CurrentRegion = {
            Province: {
                ProvinceName: "",
            },
            City: {
                CityName: "",
            },
            Area: {
                AreaName: "",
            },
        };
        $scope.RegionQuery = {
            Province: {
                ProvinceName: "",
                ProvinceID: '',
            },
            City: {
                CityName: "",
                CityID: '',
            },
            Area: {
                AreaName: "",
                AreaID: ''
            },
            SchoolName: '',
        }

        $scope.ProvinceChangeForQuery = function (province) {
            $scope.RegionQuery.Province = province;
            $scope.RegionQuery.City = { CityName: "", };
            $scope.RegionQuery.Area = { AreaName: "" };
            if (province.ProvinceID == undefined || province.ProvinceID == '') {
                $scope.RegionQuery.Province = { ProvinceName: "", };
                $scope.RegionNow.CityList = [];
                $scope.RegionNow.AreaList = [];
                return;
            }
            AreaService.GetCityList(province.ProvinceID).then(function (result) {
                $scope.RegionNow.CityList = result.data;
            });
        }
        $scope.CityChangeForQuery = function (city) {

            $scope.RegionQuery.City = city;
            $scope.RegionQuery.Area = { AreaName: "" };
            if (city.CityID == undefined || city.CityID == '') {
                $scope.RegionQuery.City = { CityName: "", };
                $scope.RegionNow.AreaList = [];
                return;
            }

            AreaService.GetAreaList(city.CityID).then(function (result) {
                $scope.RegionNow.AreaList = result.data;
            });
        }
        $scope.AreaChangeForQuery = function (area) {
            if (area.AreaID == undefined || area.AreaID == '') {
                $scope.RegionQuery.Area = { AreaName: "" };
                return;
            }
            $scope.RegionQuery.Area = area;
        }

        $scope.SchoolServerDomainTable = new NgTableParams({ count: 15 }, {
            counts: [15, 30, 50],
            dataset: []
        });
        $scope.RefreshSchoolServerDomainTable = function () {
            var data = {
                ProvinceID: $scope.RegionQuery.Province.ProvinceID,
                CityID: $scope.RegionQuery.City.CityID,
                AreaID: $scope.RegionQuery.Area.AreaID,
                SchoolName: $scope.RegionQuery.SchoolName,
            }
            ServerDomainConfigCtrlCtrlService.GetSchoolServerDomainList(data).then(function (result) {
                var count = result.data.length;
                console.log("SchoolServerDomainTable Count:", count);

                $scope.SchoolServerDomainTable = new NgTableParams({ count: 15 }, {
                    counts: [15, 30, 50],
                    dataset: result.data
                });

            });
        }
        $scope.RefreshSchoolServerDomainTable();


        $scope.RemoveSchoolServerDomainMapping = function (data) {
            $rootScope.openCommonModalDialog("确认", "确认移除该学校的配置?", function (result) {
                ServerDomainConfigCtrlCtrlService.RemoveSchoolServerDomainMapping(data).then(function (result) {
                    $scope.RefreshSchoolServerDomainTable();
                });
            })
        }


        $scope.AllChoosed = false;
        $scope.ChooseAll = function () {
            $scope.AllChoosed = !$scope.AllChoosed;

            var dataset = $scope.SchoolListTable.data;
            if (dataset != undefined) {
                for (var i = 0; i < dataset.length; i++) {
                    dataset[i].Choosed = $scope.AllChoosed;
                }
            }
        }

        $scope.AllMappingChoosed = false;
        $scope.ChooseAllMapping = function () {
            $scope.AllMappingChoosed = !$scope.AllMappingChoosed;

            var dataset = $scope.SchoolServerDomainTable.data;
            if (dataset != undefined) {
                for (var i = 0; i < dataset.length; i++) {
                    dataset[i].Choosed = $scope.AllMappingChoosed;
                }
            }
        }
        $scope.BatchRemoveSchoolServerDomainMapping = function () {
            var dataList = [];
            var dataset = $scope.SchoolServerDomainTable.data;
            if (dataset != undefined) {
                for (var i = 0; i < dataset.length; i++) {
                    if (dataset[i].Choosed) {
                        dataList.push(dataset[i]);
                    }
                }
            }
            if (dataList.length == 0) {
                $rootScope.openCommonInfoDialog("消息", "请选择学校");
                return;
            }
            $rootScope.openCommonModalDialog("确认", "确认移除选中的学校?", function (result) {
                ServerDomainConfigCtrlCtrlService.BatchRemoveSchoolServerDomainMapping(dataList).then(function (result) {
                    $scope.RefreshSchoolServerDomainTable();
                });
            })

        }
        $scope.AddMapping = function () {
            if ($scope.CurrentServerDomain == undefined || $scope.CurrentServerDomain.ServerDomainID == undefined) {
                $rootScope.openCommonWarningDialog("消息", "请选择区域服务器");
                return;
            }
            var requestData = [];

            var dataset = $scope.SchoolListTable.data;
            if (dataset != undefined) {
                for (var i = 0; i < dataset.length; i++) {
                    if (dataset[i].Choosed) {
                        requestData.push({
                            SchoolID: dataset[i].SchoolID,
                            ServerDomainID: $scope.CurrentServerDomain.ServerDomainID
                        });
                    }
                }
            }
            if (requestData.length == 0) {
                $rootScope.openCommonWarningDialog("消息", "请选择学校");
                return;
            }

            ServerDomainConfigCtrlCtrlService.updateSchoolServerDomainMapping(requestData).then(function (result) {
                $scope.Cancel();
                $scope.RefreshSchoolServerDomainTable();
            });
        }

        //#region query school
        $scope.AddSchoolServerDomainMapping = function () {
            // $scope.QueryParams = {
            //     SchoolName: '',
            //     ProvinceName: '',
            //     CityName: '',
            //     AreaName: ''
            // };
            // $scope.CurrentRegion = {
            //     Province: {
            //         ProvinceName: "",
            //     },
            //     City: {
            //         CityName: "",
            //     },
            //     Area: {
            //         AreaName: "",
            //     },
            // }
            angular.element("#AddSchoolServerDomainMappingDialog").modal({ backdrop: 'static', keyboard: false });
        }
        $scope.Cancel = function () {
            angular.element("#AddSchoolServerDomainMappingDialog").modal('hide');
        }

        AreaService.GetProvinceList().then(function (result) {
            $scope.RegionNow.ProvinceList = result.data;
            $scope.CurrentRegion.Province = result.data[0];

        });

        $scope.ProvinceChange = function (province) {
            $scope.CurrentRegion.Province = province;
            $scope.CurrentRegion.City = { CityName: "", };
            $scope.CurrentRegion.Area = { AreaName: "" };
            if (province.ProvinceID == undefined || province.ProvinceID == '') {
                $scope.CurrentRegion.Province = { ProvinceName: "", };
                $scope.RegionNow.CityList = [];
                $scope.RegionNow.AreaList = [];
                return;
            }
            AreaService.GetCityList(province.ProvinceID).then(function (result) {
                $scope.RegionNow.CityList = result.data;
                if (result.data.length > 0) {
                    //$scope.CityChange(result.data[0]);
                }
            });
        }

        $scope.CityChange = function (city) {

            $scope.CurrentRegion.City = city;
            $scope.CurrentRegion.Area = { AreaName: "" };
            if (city.CityID == undefined || city.CityID == '') {
                $scope.CurrentRegion.City = { CityName: "", };
                $scope.RegionNow.AreaList = [];
                return;
            }

            AreaService.GetAreaList(city.CityID).then(function (result) {
                $scope.RegionNow.AreaList = result.data;
                if (result.data.length > 0) {
                    //$scope.AreaChange(result.data[0]);
                }
            });
        }

        $scope.AreaChange = function (area) {
            if (area.AreaID == undefined || area.AreaID == '') {
                $scope.CurrentRegion.Area = { AreaName: "" };
                return;
            }
            $scope.CurrentRegion.Area = area;
        }


        $scope.SchoolListTable = new NgTableParams({ count: 9999 }, {

            getData: function (params) {
                $scope.QueryParams.ProvinceID = '';
                $scope.QueryParams.CityID = '';
                $scope.QueryParams.AreaID = '';
                if ($scope.CurrentRegion.Province != undefined && $scope.CurrentRegion.Province.ProvinceID != undefined) {
                    $scope.QueryParams.ProvinceID = $scope.CurrentRegion.Province.ProvinceID;
                }
                if ($scope.CurrentRegion.City != undefined && $scope.CurrentRegion.City.CityID != undefined) {
                    $scope.QueryParams.CityID = $scope.CurrentRegion.City.CityID;
                }
                if ($scope.CurrentRegion.Area != undefined && $scope.CurrentRegion.Area.AreaID != undefined) {
                    $scope.QueryParams.AreaID = $scope.CurrentRegion.Area.AreaID;
                }
               
                if (($scope.QueryParams.ProvinceID == undefined || $scope.QueryParams.ProvinceID == '')
                    && ($scope.QueryParams.SchoolName == undefined || $scope.QueryParams.SchoolName == '')
                    && ($scope.QueryParams.CityID == undefined || $scope.QueryParams.CityID == '')
                    && ($scope.QueryParams.AreaID == undefined || $scope.QueryParams.AreaID == '')) {
                    return;
                }

                return ServerDomainConfigCtrlCtrlService.SearchSchoolList($scope.QueryParams).then(function (result) {
                    params.total(result.data.Count);
                    return result.data;
                });
            }

        });
        $scope.SearchSchoolList = function () {
            $scope.SchoolListTable.reload();
        }
        //#endregion

        //#endregion


        //#region 服务器列表

        $scope.ServerDomainList = [];

        $scope.ServerDomainTable = new NgTableParams({ count: 10 }, {
            getData: function (params) {
                return ServerDomainConfigCtrlCtrlService.GetServerDomainList().then(function (result) {
                    params.total(result.data.Count);

                    $scope.ServerDomainList = [];
                    for (var i = 0; i < result.data.length; i++) {
                        if (result.data[i].ServerType != 1) {
                            $scope.ServerDomainList.push(result.data[i]);
                        }
                    }
                    return result.data;
                });
            }

        });
        $scope.RefreshServerStatus = function () {
            $scope.ServerDomainTable.reload();
        }

        $scope.CurrentServerDomain = {};
        $scope.ChooseServerDomain = function (s) {
            $scope.CurrentServerDomain = s;
        }

        //UpdateServerDomain
        $scope.CurrentServerDomain = {};
        $scope.UpdateServerDomain = function (data) {
            $scope.CurrentServerDomain = data;
            angular.element("#UpdateServerDomainDialog").modal({ backdrop: 'static', keyboard: false });
        }

        $scope.UpdateServer = function () {

            if ($scope.ValidServerDomain($scope.CurrentServerDomain) == false) {
                return;
            }

            ServerDomainConfigCtrlCtrlService.updateServer($scope.CurrentServerDomain).then(function (result) {
                angular.element("#UpdateServerDomainDialog").modal('hide');
                $scope.ServerDomainTable.reload();
            });
        }

        $scope.ValidServerDomain = function (data) {
            var serverDomain = $scope.CurrentServerDomain.ServerDomain;
            if (serverDomain == undefined || serverDomain == '') {
                $rootScope.openCommonErrorDialog("消息", "请输入名称");
                return false;
            }
            var reg = new RegExp('^[0-9a-zA-Z]*$');
            if (reg.test(serverDomain) == false) {
                $rootScope.openCommonErrorDialog("消息", "名称中不能包含有下划线等特殊字符");
                return false;
            }

            var endwithReg = new RegExp("/$");

            var apiServiceBaseUri = $scope.CurrentServerDomain.apiServiceBaseUri;
            if (apiServiceBaseUri == undefined || apiServiceBaseUri == '') {
                $rootScope.openCommonErrorDialog("消息", "请输入业务API地址");
                return false;
            }
            if (endwithReg.test(apiServiceBaseUri) == false) {
                $rootScope.openCommonErrorDialog("消息", "业务API地址必须以/结尾");
                return false;
            }

            var authServiceBaseUri = $scope.CurrentServerDomain.authServiceBaseUri;
            if (authServiceBaseUri == undefined || authServiceBaseUri == '') {
                $rootScope.openCommonErrorDialog("消息", "请输入中心管理API地址");
                return false;
            }
            if (endwithReg.test(authServiceBaseUri) == false) {
                $rootScope.openCommonErrorDialog("消息", "中心管理API地址必须以/结尾");
                return false;
            }

            var answerBaseUrl = $scope.CurrentServerDomain.answerBaseUrl;
            if (answerBaseUrl == undefined || answerBaseUrl == '') {
                $rootScope.openCommonErrorDialog("消息", "请输入答案音频地址");
                return false;
            }
            if (endwithReg.test(answerBaseUrl) == false) {
                $rootScope.openCommonErrorDialog("消息", "答案音频地址必须以/结尾");
                return false;
            }

            var paperResourceBaseUrl = $scope.CurrentServerDomain.paperResourceBaseUrl;
            if (paperResourceBaseUrl == undefined || paperResourceBaseUrl == '') {
                $rootScope.openCommonErrorDialog("消息", "请输入试卷资源地址");
                return false;
            }
            if (endwithReg.test(paperResourceBaseUrl) == false) {
                $rootScope.openCommonErrorDialog("消息", "试卷资源地址必须以/结尾");
                return false;
            }

            return true;
        }


        //#endregion


        //#region 资源同步

        $scope.SyncDirList = [
          { name: '试卷包(pap/papz)', path: '/web/resources/paps' },
          { name: '评分lm模型', path: '/web/resources/lm' }
        ];

        $scope.SyncFileResp = [];
        $scope.CalculateSyncFileList = function (syncDir) {
            $scope.SyncFileResp = [];
            ServerDomainConfigCtrlCtrlService.CalculateSyncFileList(syncDir).then(function (result) {
                $scope.SyncFileResp = result.data;
                if ($scope.CheckSyncFileResp($scope.SyncFileResp) == false) {
                    return;
                }
            });
        }

        $scope.Sync = function (syncDir, fileList) {
            ServerDomainConfigCtrlCtrlService.CalculateSyncFileList(syncDir).then(function (result) {
                $scope.SyncFileResp = result.data;

                if ($scope.CheckSyncFileResp($scope.SyncFileResp)) {
                    $rootScope.openCommonModalDialog("确认", "确认要开始同步文件", function () {
                        ServerDomainConfigCtrlCtrlService.Sync($scope.SyncFileResp).then(function (result) {
                            console.log("start sync");
                            $scope.GetSyncProgress();
                        });
                    })
                }

            });
        }
        $scope.CheckSyncFileResp = function (fileList) {
            if (fileList == undefined || fileList.length == 0) {
                return false;
            }
            var totalFileCount = 0;
            for (var i = 0; i < fileList.length; i++) {
                var item = fileList[i];
                if (item.Data.FileList != undefined) {
                    totalFileCount += item.Data.FileList.length;
                }
            }
            if (totalFileCount == 0) {
                $rootScope.openCommonInfoDialog("消息", "没有需要同步的文件");
                return false;
            }

            return true;

        }
        $scope.SyncProgressTimer = null;
        $scope.GetSyncProgress = function () {
            ServerDomainConfigCtrlCtrlService.getSyncProgress().then(function (result) {
                $scope.SyncProgress = result.data;
                if ($scope.SyncProgress.Completed == true) {
                    if ($scope.SyncProgressTimer != null) {
                        $timeout.cancel($scope.SyncProgressTimer);
                    }
                } else {
                    $scope.SyncProgressTimer = $timeout($scope.GetSyncProgress, 3000);
                }

                $scope.UpdateSyncProgress($scope.SyncFileResp, $scope.SyncProgress.SyncResult);
            });
        }
        $scope.RefreshSyncProgress = function () {
            ServerDomainConfigCtrlCtrlService.getSyncProgress().then(function (result) {
                $scope.SyncProgress = result.data;
                $scope.UpdateSyncProgress($scope.SyncFileResp, $scope.SyncProgress.SyncResult);
            });
        }


        $scope.UpdateSyncProgress = function (baseData, updateData) {
            for (var uIndex = 0; uIndex < updateData.length; uIndex++) {
                var updateItem = updateData[uIndex].Data;
                var serverDomainID = updateItem.ServerDomainID;
                var updateFileList = updateItem.FileList;


                for (var bIndex = 0; bIndex < baseData.length; bIndex++) {
                    var baseItem = baseData[bIndex].Data;
                    if (serverDomainID == baseItem.ServerDomainID) {
                        for (var ufIndex = 0; ufIndex < updateFileList.length; ufIndex++) {
                            var ufPath = updateFileList[ufIndex].FileRelativePath;
                            for (var bfIndex = 0; bfIndex < baseItem.FileList.length; bfIndex++) {
                                if (baseItem.FileList[bfIndex].FileRelativePath == ufPath) {
                                    baseItem.FileList[bfIndex].SyncStatus = updateFileList[ufIndex].SyncStatus;
                                }
                            }
                        }
                    }
                }
            }
            console.log(baseData);

        }

        $scope.SumFileSize = function (list) {
            var totalFileSize = 0;
            for (var i = 0; i < list.length; i++) {
                totalFileSize += list[i].FileSize;
            }
            return totalFileSize;
        }

        //#endregion

    }])

/*
* Services
*/
    .service('ServerDomainConfigCtrlCtrlService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;


        self.GetServerDomainList = function () {
            return $http.get(serviceBase + 'api/serverDomain/getServerDomainList');
        }
        self.GetSchoolServerDomainList = function (param) {
            return $http.post(serviceBase + 'api/serverDomain/getSchoolServerDomainList', param);
        }

        self.CalculateSyncFileList = function (param) {
            return $http.post(serviceBase + 'api/serverDomain/calculateSyncFileList', param);
        }
        self.Sync = function (param) {
            return $http.post(serviceBase + 'api/serverDomain/sync', param);
        }
        self.getSyncProgress = function (getSyncProgress) {
            return $http.get(serviceBase + 'api/serverDomain/getSyncProgress');
        }
        self.RemoveSchoolServerDomainMapping = function (param) {
            return $http.post(serviceBase + 'api/serverDomain/removeSchoolServerDomainMapping', param);
        }
        self.BatchRemoveSchoolServerDomainMapping = function (param) {
            return $http.post(serviceBase + 'api/serverDomain/batchRemoveSchoolServerDomainMapping', param);
        }

        self.updateSchoolServerDomainMapping = function (param) {
            return $http.post(serviceBase + 'api/serverDomain/updateSchoolServerDomainMapping', param);
        }

        self.SearchSchoolList = function (param) {
            return $http.post(serviceBase + 'api/serverDomain/searchSchoolList', param);
        }

        self.updateServer = function (param) {
            return $http.post(serviceBase + 'api/serverDomain/updateServer', param);
        }


    }).filter('enableFilter', function () {
        //1,启用；0，停用
        return function (enable) {

            return enable == 1 ? '启用' : '停用';
        }
    }).filter('serverTypeFilter', function () {

        return function (type) {

            if (type == 1) {
                return '中心服务器';
            }
            if (type == 2) {
                return '区域服务器';
            }

            return type;
        }
    }).filter('fileSizeFilter', function () {

        return function (size) {

            var sizeKB = Math.ceil(size / 1024);
            return sizeKB + ' KB';
        }
    });


});
