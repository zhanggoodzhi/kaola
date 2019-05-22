define(['angular', 'echarts', 'bootstrap-datetimepicker'], function (angular, echarts) {
    'use strict';

    angular.module('configCenter', ['ui.router'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('configCenter', {
                url: "/configCenter",
                views: {
                    'mainChildView': {
                        templateUrl: "business/configCenter/configCenter.html",
                        controller: 'configCenterCtrl'
                    }
                }
            });
        }])
        /*
        * Controllers
        */
        .controller('configCenterCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'configCenterCtrlService', '$rootScope', 'toaster', '$timeout', 'AreaService', function ($scope, AuthService, Constants, NgTableParams, configCenterCtrlService, $rootScope, toaster, $timeout, AreaService) {

            $scope.upgradeConfigTable = new NgTableParams({ count: 10 }, {
                dataset: []
            });
            $scope.RefreshUpgradeTable = function () {
                configCenterCtrlService.GetUpgradeList().then(function (result) {
                    console.log(result);
                    $scope.upgradeConfigTable.settings({ dataset: result.data });
                });
            }
            $scope.RefreshUpgradeTable();
            $scope.gradeDescription = [];
            configCenterCtrlService.getUpgradeDesciption().then(function (result) {
                $scope.gradeDescription = result.data;
            });
            $scope.addUpgrade = function () {
                console.log('添加');
                angular.element('#AddUpgradeDialog').modal('show');

            }
            $scope.delUpgrade = function (data) {
                $rootScope.openCommonModalDialog("确认", "确认删除吗?", function (result) {
                    configCenterCtrlService.delUpgrade(data).then(function (result) {
                        if (result.data.Success) {
                            $scope.RefreshUpgradeTable();
                            toaster.success({ body: "删除成功", toasterId: 'upgradeToast' });
                        } else {
                            toaster.error({ body: "删除失败", toasterId: 'upgradeToast' });
                        }
                    });
                })
            }
            $scope.upgradeSendData = {
                VersionID: '',
                DogCode: ''
            };
            $('#AddUpgradeDialog').on('hidden.bs.modal', function (e) {
                $scope.upgradeSendData = {
                    VersionID: '',
                    DogCode: ''
                };
            })
            $scope.saveUpgrade = function () {
                if ($scope.upgradeSendData.DogCode === '') {
                    toaster.error({ body: "请输入加密狗设备序列号", toasterId: 'upgradeToastDialog' });
                    return;
                }
                if ($scope.upgradeSendData.VersionID === '') {
                    toaster.error({ body: "请选择软件版本", toasterId: 'upgradeToastDialog' });
                    return;
                }
                configCenterCtrlService.saveUpgrade($scope.upgradeSendData).then(function (result) {
                    if (result.data.Success) {
                        $scope.RefreshUpgradeTable();
                        toaster.success({ body: "添加成功", toasterId: 'upgradeToast' });
                        angular.element('#AddUpgradeDialog').modal('hide');
                    } else {
                        toaster.error({ body: "添加失败", toasterId: 'upgradeToastDialog' });
                    }
                });
            }

            //功能模块

            $scope.moduleConfigTable = new NgTableParams({ count: 10 }, {
                dataset: []
            });
            $scope.RefreshModuleTable = function () {
                configCenterCtrlService.GetModuleList().then(function (result) {
                    console.log(result);
                    $scope.moduleConfigTable.settings({ count: 1, dataset: result.data });
                });
            }
            $scope.RefreshModuleTable();
            $scope.moduleDescription = [];
            configCenterCtrlService.getModuleDesciption().then(function (result) {
                $scope.moduleDescription = result.data;
            });
            $scope.GetModuleDescription = function (md) {
                if ($scope.moduleDescription != undefined && $scope.moduleDescription.length > 0)
                {
                    for (var i = 0; i < $scope.moduleDescription.length; i++) {
                        if ($scope.moduleDescription[i].ModuleName == md) {
                            return $scope.moduleDescription[i].ModuleDescription;
                        }
                    }
                }
                return md;
            }
            $scope.addModule = function () {
                console.log('添加');
                angular.element('#AddModuleDialog').modal('show');

            }
            $scope.delModule = function (data) {
                $rootScope.openCommonModalDialog("确认", "确认删除吗?", function (result) {
                    configCenterCtrlService.delModule(data).then(function (result) {
                        if (result.data.Success) {
                            $scope.RefreshModuleTable();
                            toaster.success({ body: "删除成功", toasterId: 'moduleToast' });
                        } else {
                            toaster.error({ body: "删除失败", toasterId: 'moduleToast' });
                        }
                    });
                })
            }
            $scope.moduleSendData = {
                SchoolID: '',
                ModuleName: ''
            };
            $('#AddModuleDialog').on('hidden.bs.modal', function (e) {
                $scope.moduleSendData = {
                    SchoolID: '',
                    ModuleName: ''
                };
            })
            $scope.saveModule = function () {
                if ($scope.moduleSendData.SchoolID === '') {
                    toaster.error({ body: "请输入学校编号", toasterId: 'moduleToastDialog' });
                    return;
                }
                if ($scope.moduleSendData.ModuleName === '') {
                    toaster.error({ body: "请选择功能模块", toasterId: 'moduleToastDialog' });
                    return;
                }
                configCenterCtrlService.saveModule($scope.moduleSendData).then(function (result) {
                    if (result.data.Success) {
                        $scope.RefreshModuleTable();
                        toaster.success({ body: "添加成功", toasterId: 'moduleToast' });
                        angular.element('#AddModuleDialog').modal('hide');
                    } else {
                        toaster.error({ body: "添加失败", toasterId: 'moduleToastDialog' });
                    }
                });
            }
        }])

        /*
        * Services
        */
        .service('configCenterCtrlService', function ($http, Constants) {
            var serviceBase = Constants.apiServiceBaseUri;
            var self = this;

            self.GetUpgradeList = function () {
                return $http.get(serviceBase + 'api/configCenter/getVersionUpdateDongleList');
            }
            self.getUpgradeDesciption = function () {
                return $http.get(serviceBase + 'api/configCenter/getVersionList');
            }

            self.delUpgrade = function (param) {
                return $http.post(serviceBase + 'api/configCenter/removeVersionUpdateDongle', param);
            }
            self.saveUpgrade = function (param) {
                return $http.post(serviceBase + 'api/configCenter/addVersionUpdateDongle', param);
            }
            // 功能模块
            self.GetModuleList = function () {
                return $http.get(serviceBase + 'api/configCenter/getSchoolModuleConfigList');
            }
            self.getModuleDesciption = function () {
                return $http.get(serviceBase + 'api/configCenter/getModuleList');
            }

            self.delModule = function (param) {
                return $http.post(serviceBase + 'api/configCenter/removeSchoolModuleConfig', param);
            }
            self.saveModule = function (param) {
                return $http.post(serviceBase + 'api/configCenter/addSchoolModuleConfig', param);
            }
        })

});
