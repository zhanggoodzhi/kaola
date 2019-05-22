define(['angular', 'jquery-scrollbar', 'jquery-mousewheel'], function (angular) {
    'use strict';
    angular.module('Version', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('version', {
            url: "/version",
            views: {
                'mainChildView': {
                    templateUrl: "business/version/version.html",
                    controller: 'VersionCtrl'
                }
            }

        });
    }])
    /*
    * Controllers
    */
    .controller('VersionCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'VersionService', '$rootScope', '$state', 'toaster', function ($scope, AuthService, Constants, NgTableParams, VersionService, $rootScope, $state, toaster) {
        $scope.AuthData = AuthService.AuthData();
        $scope.IsVersionAdmin = ($.inArray(5, AuthService.AuthData().userRole) != -1);
        $scope.CustomerChange = function (customer) {
            if ($scope.CustomerList != null && $scope.CustomerList.length > 0 && angular.isArray($scope.CustomerList)) {
                angular.forEach($scope.CustomerList, function (data, index, array) {
                    data.Active = false;
                });
                $scope.CustomerActive = customer;
                $scope.CustomerActive.Active = true;
                $scope.GetVersionList();
            }
        }
        $scope.CustomerList = [];
        $scope.CustomerActive = {
            CustomerID: '',
            CustomerName: ''
        };
        $scope.ShowID = function (version) {
            console.log("versionCode:" + version.VersionCode);
            console.log("versionId:" + version.VersionID);
        }
        $scope.GetCustomerList = function () {
            VersionService.GetCustomerList().then(function (response) {
                $scope.CustomerList = response.data;
                var customer = $scope.CustomerActive != null && $scope.CustomerActive.CustomerID != '' ? $scope.CustomerActive : $scope.CustomerList[0];
                $scope.CustomerChange(customer);
            });
        }
        $scope.GetCustomerList();

        $scope.VersionList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 30, 50],
            getData: function (params) {
                return [];
            }
        });

        $scope.GetVersionList = function () {
            $scope.VersionList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    var request = {
                        PostParam: params.parameters(),
                        CustomerID: $scope.CustomerActive.CustomerID
                    }
                    return VersionService.GetVersionList(request).then(function (results) {
                        params.total(results.data.Count);
                        return results.data.VersionList;
                    });
                }
            });

        }

        $scope.VersionDetailList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 30, 50],
            getData: function (params) {
                return [];
            }
        });
        $scope.VersionSelect = {
            VersionID: '',
            VersionCode: '',
            IsMandatory: false,
            UpdateInfo: '',
            SoftwareUrl: '',
            ReleaseTime: '',
            InstallCount: 0,
            CustomerID: $scope.CustomerActive.CustomerID,
            CustomerName: $scope.CustomerActive.CustomerName,
        };
        $scope.OpenVersionDetailDialog = function (version) {
            $scope.VersionSelect = version;
            $scope.VersionDetailList = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    var request = {
                        PostParam: params.parameters(),
                        VersionID: version.VersionID
                    }
                    return VersionService.GetVersionDetail(request).then(function (results) {
                        params.total(results.data.Count);
                        return results.data.VersionDetailList;
                    });
                }
            });
            angular.element("#VersionDetailDialog").modal("show");
        }
        $scope.LastVersion = "";
        $scope.GetLastVersion = function () {
            VersionService.GetLastVersion($scope.VersionSelect.VersionCode).then(function (results) {
                if (results.data != "null") {
                    $scope.LastVersion = results.data.replace(/\"/g, "");
                }
                else {
                    $scope.LastVersion = '';
                }
            });
        }
        $scope.OpenVersionUpdateDialog = function (version) {
            $scope.VersionSelect = angular.copy(version);
            $scope.GetLastVersion();
            angular.element("#VersionUpdateDialog").modal("show");
        }

        $scope.IsShowExplain = false;
        $scope.OpenAddVersionDialog = function () {
            $scope.VersionSelect = {
                VersionID: '',
                VersionCode: '',
                MainCode: '',
                MinorCode: '',
                IsMandatory: false,
                UpdateInfo: '',
                SoftwareUrl: '',
                ReleaseTime: '',
                InstallCount: 0,
                PatchUrl: "",
                CustomerID: $scope.CustomerActive.CustomerID,
                CustomerName: $scope.CustomerActive.CustomerName,
            };
            $scope.GetLastVersion();
            angular.element("#VersionUpdateDialog").modal("show");
        }

        $scope.SetPath = function () {
            
            var path = "/web/resources/patches/";
            var versionCode = "V" + $scope.VersionSelect.MainCode + "." + $scope.VersionSelect.MinorCode;
            var fullPath = path + versionCode;
            $scope.VersionSelect.SoftwareUrl = fullPath;
            $scope.VersionSelect.PatchUrl = fullPath;
            $scope.VersionSelect.VersionCode = versionCode;
            //$("#dik_SoftwareUrl").val(fullPath);
            //$("#dik_PatchUrl").val(fullPath);
            console.log("SetPath", $scope.VersionSelect);
        }
        $scope.VersionSave = function () {

            if ($scope.ValidateVersionParameter($scope.VersionSelect) == false) { return; }

            if ($scope.VersionSelect.VersionID != null && $scope.VersionSelect.VersionID != '') {
                VersionService.UpdateVersion($scope.VersionSelect).then(function () {
                    toaster.clear("dialogList");
                    toaster.success({ body: '修改成功', toasterId: 'dialogList' });
                    $scope.GetVersionList();
                    angular.element("#VersionUpdateDialog").modal("hide");                 
                }, function (error) {
                    toaster.clear("dialogList");
                    toaster.error({ body: "版本修改失败," + error.data.Message, toasterId: 'dialogList' });
                });
            }
            else {
                VersionService.AddVersion($scope.VersionSelect).then(function () {
                    toaster.clear("dialogList");
                    toaster.success({ body: '新增成功', toasterId: 'dialogList' });
                    angular.element("#VersionUpdateDialog").modal("hide");
                    $scope.GetVersionList();
                }, function (error) {
                    toaster.clear("dialogList");
                    toaster.error({ body: "版本新增失败," + error.data.Message, toasterId: 'dialogList' });
                });
            }

        }
        $scope.ValidateVersionParameter = function (vdata) {
            if (vdata.MainCode == undefined || vdata.MainCode.length == 0
                || vdata.MinorCode == undefined || vdata.MinorCode.length == 0) {
                $rootScope.openCommonErrorDialog("错误", "升级版本号不能为空");
                return false;
            }
            if (vdata.InnerVersionCode == undefined || vdata.InnerVersionCode.length == 0) {
                $rootScope.openCommonErrorDialog("错误", "内部版本号不能为空");
                return false;
            }
            if (vdata.InnerVersionCode.length > 20) {
                $rootScope.openCommonErrorDialog("错误", "内部版本号长度不能超过20个字符");
                return false;
            }
            if (vdata.UpdateInfo != undefined && vdata.UpdateInfo.length > 500) {
                $rootScope.openCommonErrorDialog("错误", "更新提示不能超过500个字符");
                return false;
            }
            if (vdata.SoftwareUrl == undefined || vdata.SoftwareUrl.length == 0) {
                $rootScope.openCommonErrorDialog("错误", "软件下载地址不能为空");
                return false;
            }
            if (vdata.PatchUrl == undefined || vdata.PatchUrl.length == 0) {
                $rootScope.openCommonErrorDialog("错误", "补丁下载地址不能为空");
                return false;
            }
            return true;
        }
        $scope.GotoPatchUrl = function (version) {
            $state.go('patchversion', { versionid: version.VersionID });
        }
        $scope.OpenVersionDeleteDialog = function (version) {
            var tr = jQuery("#" + version.VersionID);
            tr.addClass("delete-background");
            $scope.VersionSelect = version;
            $rootScope.openCommonModalDialog("删除版本", "你确定要删除该版本么？", $scope.VersionDelete, function () {
                tr.removeClass("delete-background");
            });
        }

        $scope.VersionDelete = function () {
            VersionService.DeleteVersion($scope.VersionSelect.VersionID)
                .then(function (result) {
                    toaster.clear("dialogList");
                    toaster.success({ body: '删除成功', toasterId: 'dialogList' });
                    $scope.VersionList.reload();
                }, function (error) {
                    toaster.clear("dialogList");
                    toaster.error({ body: "版本删除失败," + error.data.Message, toasterId: 'dialogList' });
                });
        }

        $scope.ManageCustomerList = [];
        $scope.CustomerManageErrorMsg = '';
        $scope.OpenCustomerManageDialog = function () {
            VersionService.GetCustomerList().then(function (response) {
                if (response.data != null) {
                    $scope.ManageCustomerList = response.data;
                    angular.forEach($scope.ManageCustomerList, function (data, index, array) {
                        data.isAdded = true;
                        data.isEdit = false;
                    });
                }
            });
            //刷新自定义滚动条
            customScrollbarHelper.refreshScrollbar();
            angular.element("#CustomerManageDialog").modal("show");

        }

        $scope.AddCustomer = function () {
            var customer = {
                CustomerID: '',
                CustomerName: '',
                isAdded: false,
                isEdit: false,
            }
            $scope.ManageCustomerList.push(customer);
            //刷新自定义滚动条
            customScrollbarHelper.refreshScrollbar();
        }

        $scope.CustomerEdit = function (customer) {
            customer.isEdit = true;
        }

        $scope.CustomerFocus = function (customer) {
            if (customer.isAdded == false) {
                customer.isEdit = true;
            }

        }

        $scope.RemoveCustomer = function (customer) {
            var index = $scope.ManageCustomerList.indexOf(customer);
            if (index > -1) {
                $scope.ManageCustomerList.splice(index, 1);
            }
            //刷新自定义滚动条
            customScrollbarHelper.refreshScrollbar();
        }

        $scope.CancelCustomer = function (customer) {
            customer.isEdit = false;
        }

        $scope.DeleteCustomer = function (customer) {
            $scope.RemoveCustomer(customer);
            VersionService.DeleteCustomer(customer.CustomerID).then(function (response) {
                toaster.clear("dialogList");
                toaster.success({ body: '删除成功', toasterId: 'dialogList' });
                $scope.GetCustomerList();
            }, function (error) {
                $scope.CustomerManageErrorMsg = error.data.Message;
            })
        }

        $scope.SaveCustomer = function (customer) {
            if (customer.CustomerID == null || customer.CustomerID == '') {
                VersionService.AddCustomer(customer).then(function (response) {
                    toaster.clear("dialogList");
                    toaster.success({ body: '保存成功', toasterId: 'dialogList' });
                    customer.isEdit = false;
                    customer.isAdded = true;
                    $scope.GetCustomerList();
                }, function (error) {
                    $scope.CustomerManageErrorMsg = error.data.Message;
                })
            }
            else {
                VersionService.UpdateCustomer(customer).then(function (response) {
                    toaster.clear("dialogList");
                    toaster.success({ body: '保存成功', toasterId: 'dialogList' });
                    customer.isEdit = false;
                    customer.isAdded = true;
                    $scope.GetCustomerList();
                }, function (error) {
                    $scope.CustomerManageErrorMsg = error.data.Message;
                })
            }

        }

    }])

    /*
    * Services
    */
    .service('VersionService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;

        self.GetCustomerList = function (param) {
            return $http.get(serviceBase + 'api/version/getcustomerlist ');
        }
        self.GetVersionList = function (param) {
            return $http.post(serviceBase + 'api/version/getappversion ', param);
        }

        self.GetVersionDetail = function (param) {
            return $http.post(serviceBase + 'api/version/GetVersionDetail ', param);
        }
        self.UpdateVersion = function (param) {
            return $http.post(serviceBase + 'api/version/updateversion ', param);
        }

        self.AddVersion = function (param) {
            return $http.post(serviceBase + 'api/version/addversion ', param);
        }

        self.DeleteVersion = function (versionID) {
            return $http.get(serviceBase + 'api/version/deleteappversion/' + versionID);
        }

        self.DeleteCustomer = function (customerID) {
            return $http.get(serviceBase + 'api/version/deletecustomer/' + customerID);
        }

        self.UpdateCustomer = function (param) {
            return $http.post(serviceBase + 'api/version/updatecustomer', param);
        }

        self.AddCustomer = function (param) {
            return $http.post(serviceBase + 'api/version/addcustomer', param);
        }

        self.GetLastVersion = function (versionCode) {
            return $http.get(serviceBase + 'api/version/getlastversion?versioncode=' + versionCode)
        }

    });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
