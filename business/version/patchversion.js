define(['angular', 'jquery-scrollbar', 'jquery-mousewheel'], function (angular) {
    'use strict'
    angular.module('PatchVersion', ['ui.router'])
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('patchversion', {
            url: "/patchversion/:versionid",
            views: {
                'mainChildView': {
                    templateUrl: "business/version/patchversion.html",
                    controller: "PatchVersionCtrl"
                }
            }
        })
    }])
    /*
     * Controllers
     */
    .controller('PatchVersionCtrl', ['$state', '$scope', 'AuthService', 'Constants', 'NgTableParams', 'PatchVersionService', '$rootScope', '$stateParams', 'toaster', function ($state, $scope, AuthService, Constants, NgTableParams, PatchVersionService, $rootScope, $stateParams, toaster) {
        $scope.AuthService = AuthService;
        $scope.AuthData = AuthService.AuthData();
        $scope.IsVersionAdmin = ($.inArray(5, AuthService.AuthData().userRole) != -1);
        $scope.currentVersionId = "";

        $scope.currentVersion = {
            VersionID: "",
            VersionCode: "",
            InnerVersionCode: "",
        }
        $scope.Goback = function () {
            $state.go('version');
        }
        $scope.PatchSelect = {
            VersionSPId: '',
            VersionId: $scope.currentVersionId,
            VersionSPCode: '',
            InternalBuild: '',
            InternalDev: '',
            IsMandatory: false,
            UpdateInfo: '',
            SoftwareUrl: '',
            ReleaseTime: '',
            InstallCount: 0,
            PatchUrl: "",
        };
        $scope.LastPatch = "";
        $scope.LastBuild = "";
        $scope.GetLastPatch = function () {
            PatchVersionService.GetLastPatch($scope.PatchSelect.InternalBuild, $scope.PatchSelect.VersionId).then(function (results) {
                if (results.data.InternalBuild != null && results.data.VersionSPCode != null) {
                    $scope.LastBuild = $scope.currentVersion.VersionCode + "." + results.data.InternalBuild;
                    $scope.LastPatch = $scope.currentVersion.VersionCode + "." + results.data.VersionSPCode;
                }
                else {
                    $scope.LastPatch = '';
                    $scope.LastBuild = '';
                }
            });
        }
        $scope.GetCurrentVersion = function () {
            $scope.currentVersionId = $stateParams.versionid;
            PatchVersionService.GetCurrentVersion($scope.currentVersionId).then(function (result) {
                $scope.currentVersion.VersionID = result.data.VersionID;
                $scope.currentVersion.VersionCode = result.data.VersionCode;
                $scope.currentVersion.InnerVersionCode = result.data.InnerVersionCode;
            });
            $scope.GetPatchList();
        }
        $scope.GetPatchList = function () {
            $scope.PatchVersionList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    var request = {
                        PostParam: params.parameters(),
                        VersionID: $stateParams.versionid
                    }
                    return PatchVersionService.GetPatchVersionList(request).then(function (results) {
                        params.total(results.data.count);
                        return results.data.PatchVersionList;
                    })
                }
            })
        }

        $scope.GetCurrentVersion();
        $scope.OpenAddPatchVersionDialog = function () {
            $scope.PatchSelect = {
                VersionSPId: '',
                VersionId: $scope.currentVersionId,
                VersionSPCode: '',
                InternalBuild: '',
                InternalDev: '',
                IsMandatory: false,
                UpdateInfo: '',
                SoftwareUrl: '',
                ReleaseTime: '',
                InstallCount: 0,
                PatchUrl: ""
            };
            $scope.GetLastPatch();
            angular.element("#PatchVersionUpdateDialog").modal("show");
        }
        $scope.OpenUpdatePatchDialog = function (patch) {
            $scope.PatchSelect = angular.copy(patch);
            $scope.GetLastPatch();
            angular.element("#PatchVersionUpdateDialog").modal("show");
        }

        $scope.OpenDeletePatchDialog = function (patch) {
            var tr = jQuery("#" + patch.VersionSPID);
            tr.addClass("delete-background");
            $scope.PatchSelect = patch;
            $rootScope.openCommonModalDialog("删除版本", "你确定要删除该版本么？", $scope.DeletePatch, function () {
                tr.removeClass("delete-background");
            });
        }
        $scope.OpenVersionDetailDialog = function (patch) {
            $scope.PatchSelect = patch;
            $scope.VersionDetailList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    var request = {
                        PostParam: params.parameters(),
                        VersionID: patch.VersionSPId
                    }
                    return PatchVersionService.GetVersionDetail(request).then(function (results) {
                        params.total(results.data.Count);
                        return results.data.VersionDetailList;
                    });
                }
            });
            angular.element("#VersionDetailDialog").modal("show");
        }
        $scope.SetPath = function () {
            $scope.PatchSelect.SoftwareUrl = "/web/resources/patches/" + $scope.currentVersion.VersionCode + "." + $scope.PatchSelect.InternalBuild;
            $scope.PatchSelect.PatchUrl = "/web/resources/patches/" + $scope.currentVersion.VersionCode + "." + $scope.PatchSelect.InternalBuild;
        }
        $scope.DeletePatch = function () {
            PatchVersionService.DeletePatch($scope.PatchSelect.VersionSPId)
                .then(function (result) {
                    toaster.clear("dialogList");
                    toaster.success({ body: '删除成功', toasterId: 'dialogList' });
                    $scope.PatchVersionList.reload();
                }, function (error) {
                    toaster.clear("dialogList");
                    toaster.error({ body: "版本删除失败," + error.data.Message, toasterId: 'dialogList' });
                });
        }
        $scope.PatchSave = function () {
            if ($scope.ValidatePatchParameter($scope.PatchSelect) == false) {
                return;
            }

            if ($scope.PatchSelect.VersionSPId != null && $scope.PatchSelect.VersionSPId != '') {
                PatchVersionService.UpdatePatch($scope.PatchSelect).then(function () {
                    toaster.clear("dialogList");
                    toaster.success({ body: '修改成功', toasterId: 'dialogList' });
                    $scope.PatchVersionList.parameters().page = 1;
                    angular.element("#PatchVersionUpdateDialog").modal("hide");
                    $scope.PatchVersionList.reload();
                }, function (error) {
                    toaster.clear("dialogList");
                    toaster.error({ body: "版本修改失败," + error.data.Message, toasterId: 'dialogList' });
                });
            }
            else {
                PatchVersionService.AddPatch($scope.PatchSelect).then(function () {
                    toaster.clear("dialogList");
                    toaster.success({ body: '新增成功', toasterId: 'dialogList' });
                    angular.element("#PatchVersionUpdateDialog").modal("hide");
                    $scope.PatchVersionList.reload();
                }, function (error) {
                    toaster.clear("dialogList");
                    toaster.error({ body: "版本新增失败," + error.data.Message, toasterId: 'dialogList' });
                });
            }
        }
        $scope.ValidatePatchParameter = function (pdata) {
            if (pdata.InternalBuild == undefined || pdata.InternalBuild.length == 0) {
                $rootScope.openCommonErrorDialog("错误", "补丁版本号不能为空");
                return false;
            }
            if (pdata.InternalBuild.length > 10) {
                $rootScope.openCommonErrorDialog("错误", "补丁版本号长度不能超过10个字符");
                return false;
            }
            if (pdata.VersionSPCode == undefined || pdata.VersionSPCode.length == 0) {
                $rootScope.openCommonErrorDialog("错误", "对外版本号不能为空");
                return false;
            }
            if (pdata.VersionSPCode.length > 10) {
                $rootScope.openCommonErrorDialog("错误", "对外版本号长度不能超过10个字符");
                return false;
            }

            if (pdata.InternalDev == undefined || pdata.InternalDev.length == 0) {
                $rootScope.openCommonErrorDialog("错误", "开发版本号不能为空");
                return false;
            }
            if (pdata.InternalDev.length > 20) {
                $rootScope.openCommonErrorDialog("错误", "开发版本号长度不能超过20个字符");
                return false;
            }

            if (pdata.UpdateInfo != undefined && pdata.UpdateInfo.length > 500) {
                $rootScope.openCommonErrorDialog("错误", "更新提示不能超过500个字符");
                return false;
            }

            return true;
        }
    }])
    /*
    *Services
    */
    .service('PatchVersionService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;
        self.GetCurrentVersion = function (versionId) {
            return $http.get(serviceBase + 'api/version/getcurrentversion/' + versionId);
        }
        self.GetPatchVersionList = function (param) {
            return $http.post(serviceBase + 'api/version/getpatchversionlist', param);
        }
        self.AddPatch = function (patch) {
            return $http.post(serviceBase + 'api/version/addpatch', patch);
        }
        self.UpdatePatch = function (patch) {
            return $http.post(serviceBase + 'api/version/updatepatch', patch);
        }
        self.DeletePatch = function (versionSPId) {
            return $http.get(serviceBase + 'api/version/deletepatch/' + versionSPId);
        }
        self.GetVersionDetail = function (param) {
            return $http.post(serviceBase + 'api/version/getspdetail/', param);
        }
        self.GetLastPatch = function (internalbuild, versionid) {
            return $http.get(serviceBase + 'api/version/getlastpatch?internalbuild=' + internalbuild + '&versionid=' + versionid)
        }

    });
    /*
    * Directives
    */

    /*
    * Filters
    */
});