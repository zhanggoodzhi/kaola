define([
    'angular', 'jquery-scrollbar', 'jquery-mousewheel', 'jquery-stickytableheaders'
], function (angular) {
    'use strict';
    angular
        .module('Package', ['ui.router'])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state('package', {
                    url: "/package",
                    views: {
                        'mainChildView': {
                            templateUrl: "business/package/package.html",
                            controller: 'PackageCtrl'
                        }
                    }
                });
            }
        ])
        /*
    * Controllers
    */
        .controller('PackageCtrl', [
            '$scope',
            'AuthService',
            'Constants',
            'NgTableParams',
            '$rootScope',
            'toaster',
            'PackageService',
            'AreaService',
            '$timeout',
            function ($scope, AuthService, Constants, NgTableParams, $rootScope, toaster, PackageService, AreaService, $timeout) {

                $scope.QueryParams = {
                    PackageCode: "",
                    Status: 0,
                    BusinessID: ""
                };
                var authData = AuthService.AuthData();
                $scope.IsAdmin = authData
                    .userRole
                    .indexOf(1) > -1;
                $scope.ContentSerialNumList = new NgTableParams({
                    count: 10
                }, {
                    counts: [
                        10, 20, 30, 50
                    ],
                    getData: function (params) {
                        $scope.QueryParams.PostParam = params.parameters();
                        return PackageService
                            .GetSerialNumList($scope.QueryParams)
                            .then(function (results) {
                                //console.log(results);
                                params.total(results.data.Count);
                                return results.data.SerialNumList;
                            });
                    }
                });

                $scope.SchoolPackageStatusList = [
                    {
                        Value: -1,
                        Text: "请选择"
                    }
                ];
                $scope.ChannelBusinessList = [
                    {
                        BusinessID: "",
                        BusinessName: '请选择'
                    }
                ];

                PackageService
                    .GetChannelBusinessList()
                    .then(function (result) {
                        //console.log(result);
                        if (angular.isArray(result.data) && result.data.length > 0) {
                            angular
                                .forEach(result.data, function (item, i) {
                                    $scope
                                        .ChannelBusinessList
                                        .push(item);
                                });
                        }
                    });
                $scope.ContentProvider = [
                    {
                        ContentProviderName: "请选择",
                        ContentProviderID: ""
                    }
                ];
                PackageService
                    .GetContentProvider()
                    .then(function (result) {
                        //console.log(result);
                        if (angular.isArray(result.data) && result.data.length > 0) {
                            angular
                                .forEach(result.data, function (item, i) {
                                    $scope
                                        .ContentProvider
                                        .push(item);
                                });
                        }
                    });

                PackageService
                    .GetPackageStatusList()
                    .then(function (result) {
                        $scope.SchoolPackageStatusList = result.data;
                    });

                $scope.Choosed = {
                    ChannelBusiness: $scope.ChannelBusinessList[0],
                    SchoolPackageStatus: $scope.SchoolPackageStatusList[0],
                    ContentProvider: $scope.ContentProvider[0]
                };

                $scope.ChannelChange = function (chanel) {
                    $scope.Choosed.ChannelBusiness = chanel;
                    console.log($scope.Choosed.ChannelBusiness);
                }

                $scope.ContentProviderChange = function (contentProvider) {
                    $scope.Choosed.ContentProvider = contentProvider;
                }

                $scope.PackageStatusChange = function (packageStatus) {
                    $scope.Choosed.SchoolPackageStatus = packageStatus;
                }

                $scope.SearchSerialNum = function () {
                    $scope.QueryParams.Status = $scope.Choosed.SchoolPackageStatus.Value;
                    $scope.QueryParams.BusinessID = $scope.Choosed.ChannelBusiness.BusinessID;
                    $scope.QueryParams.ContentProviderId = $scope.Choosed.ContentProvider.ContentProviderID;
                    $scope.QueryParams.IsAdmin = $scope.IsAdmin;
                    console.log($scope.QueryParams);
                    $scope
                        .ContentSerialNumList
                        .parameters()
                        .page = 1;
                    $scope
                        .ContentSerialNumList
                        .reload();
                }

                //----生成序列号

                $scope.CurrentProvider = {
                    ContentProviderID: "",
                    CurrentProviderName: "请选择"
                };

                $scope.ProviderPaperPackageQuery = {
                    ContentProviderID: "",
                    PaperPackageName: ''
                }

                $scope.OpenGenerateDialog = function () {
                    $scope.CurrentProvider = $scope.ContentProvider[0] || {
                        ContentProviderID: ""
                    }
                    $scope.ProviderPaperPackageQuery.ContentProviderID = $scope.CurrentProvider.ContentProviderID;
                    $scope.ProviderPaperPackageList = new NgTableParams({
                        count: 10
                    }, {
                        counts: [
                            10, 20, 30, 50
                        ],
                        getData: function (params) {
                            $scope.ProviderPaperPackageQuery.PostParam = params.parameters();
                            return PackageService
                                .GetProviderPaperPackageList($scope.ProviderPaperPackageQuery)
                                .then(function (results) {
                                    //console.log(results);
                                    params.total(results.data.Count);
                                    $scope.SelectCount = 0;
                                    $scope.SelectAllTag = false;
                                    return results.data.P_PaperPackageList;
                                });
                        }
                    });

                    angular
                        .element("#GenerateDialog")
                        .modal('show');
                }

                $scope.ProviderChange = function (provider) {
                    $scope.SelectAllTag = false;
                    $scope.CurrentProvider = provider;
                    $scope.ProviderPaperPackageQuery.ContentProviderID = provider.ContentProviderID;

                }

                $scope.SearchProviderPaperPackage = function () {
                    $scope
                        .ProviderPaperPackageList
                        .parameters()
                        .page = 1;
                    $scope
                        .ProviderPaperPackageList
                        .reload();
                }

                $scope.SelectAllTag = false;
                $scope.SelectAllItem = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllTag = $scope.SelectAllTag
                        ? false
                        : true;
                    //console.log($scope.ContentSerialNumList);
                    $scope.SelectAll($scope.ProviderPaperPackageList.data, $scope.SelectAllTag);
                }

                $scope.SelectAll = function (data, flag) {
                    var newValue = "0";
                    if (flag) {
                        newValue = "1";
                    }
                    if (angular.isArray(data) && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            data[i].Selected = newValue;
                        }

                    }
                    GetSelected($scope.ProviderPaperPackageList.data);
                }
                $scope.SelectCount = 0;
                $scope.SelectAllTagChange = function (paperPackage) {
                    //event.stopPropagation(); // 阻止事件冒泡
                    paperPackage.Selected = paperPackage.Selected == 1
                        ? 0
                        : 1;
                    if (paperPackage.Selected == 0) {
                        $scope.SelectAllTag = false;
                    }
                    GetSelected($scope.ProviderPaperPackageList.data);
                };

                var GetSelected = function (data) {
                    $scope.SelectedPaperPackage = [];
                    if (angular.isArray(data) && data.length > 0) {
                        angular
                            .forEach(data, function (item, i) {
                                if (item.Selected == 1) {
                                    $scope
                                        .SelectedPaperPackage
                                        .push({ PaperPackageID: item.PaperPackageID, PaperPackageType: item.PaperPackageType, PaperPackageName: item.PaperPackageName });
                                } else { }
                            });
                    }
                    $scope.SelectCount = $scope.SelectedPaperPackage.length;
                }

                $scope.GeneratePackageCode = function () {
                    GetSelected($scope.ProviderPaperPackageList.data);
                    if ($scope.SelectedPaperPackage.length <= 0) {
                        toaster.clear("dialog1");
                        toaster.error({ body: "请选择试卷包", toasterId: 'dialog1' });
                        return;
                    }

                    PackageService
                        .GeneratePackageCode($scope.SelectedPaperPackage)
                        .then(function (result) {
                            angular
                                .element("#GenerateDialog")
                                .modal('hide');
                            toaster.clear("dialog0");
                            toaster.success({ body: "添加成功", toasterId: 'dialog0' });
                            $scope.SearchSerialNum();
                        }, function (result) {
                            toaster.clear("dialog1");
                            toaster.error({ body: "生成失败", toasterId: 'dialog1' });
                        });
                }

                $scope.GenerateSinglePackageCode = function (paperPackage) {
                    $scope.SelectedPaperPackage = [];
                    $scope
                        .SelectedPaperPackage
                        .push({ PaperPackageID: paperPackage.PaperPackageID, PaperPackageType: paperPackage.PaperPackageType, PaperPackageName: paperPackage.PaperPackageName });

                    PackageService
                        .GeneratePackageCode($scope.SelectedPaperPackage)
                        .then(function (result) {
                            angular
                                .element("#GenerateDialog")
                                .modal('hide');
                            toaster.clear("dialog0");
                            toaster.success({ body: "添加成功", toasterId: 'dialog0' });
                            $scope.SearchSerialNum();
                        }, function (result) {
                            toaster.clear("dialog1");
                            toaster.error({ body: "生成失败", toasterId: 'dialog1' });
                        });
                }

                $scope.SendToBusiness = function () {
                    var params = {
                        Provider_PackageListView: GetSelectedAppyPackage($scope.Send.PackageList.data),
                        BusinessId: $scope.Send.CurrentChannelBusiness.BusinessID,
                        SchoolId: ''
                    }
                    PackageService
                        .SendToBusiness(params)
                        .then(function (result) {
                            $scope.SearchSerialNum();
                            angular
                                .element('#SendDialog')
                                .modal('hide');
                            toaster.clear("dialog0");
                            toaster.success({ body: "发货成功", toasterId: 'dialog0' });
                        }, function (error) {
                            toaster.clear("applyDialog1");
                            toaster.error({ body: error.data.Message, toasterId: 'applyDialog1' });
                        });
                }

                //启用
                $scope.OpenStartPackageDialog = function (packageObj) {
                    $scope.packageStart = packageObj;
                    $rootScope.openCommonModalDialog("启用内容序列号", "你确定要启用该内容序列号么？", $scope.Start);
                }

                $scope.Start = function () {
                    PackageService
                        .PackageStart($scope.packageStart.PackageCode)
                        .then(function (result) {
                            toaster.clear("dialog0");
                            toaster.success({ body: '启用成功', toasterId: 'dialog0' });
                            //$scope.SearchSerialNum();
                            $scope
                                .ContentSerialNumList
                                .reload();
                        }, function (error) {
                            toaster.clear("dialog0");
                            toaster.error({
                                body: "内容序列号启用失败," + error.data.Message,
                                toasterId: 'dialog0'
                            });
                        });
                }

                //停用
                $scope.OpenStopPackageDialog = function (packageObj) {
                    $scope.packageStop = packageObj;
                    $rootScope.openCommonModalDialog("停用内容序列号", "你确定要停用该内容序列号么？", $scope.Stop);
                }

                $scope.Stop = function () {
                    PackageService
                        .PackageStop($scope.packageStop.PackageCode)
                        .then(function (result) {
                            toaster.clear("dialog0");
                            toaster.success({ body: '停用成功', toasterId: 'dialog0' });
                            $scope
                                .ContentSerialNumList
                                .reload();
                            //$scope.SearchSerialNum();
                        }, function (error) {
                            toaster.clear("dialog0");
                            toaster.error({
                                body: "内容序列号停用失败," + error.data.Message,
                                toasterId: 'dialog0'
                            });
                        });
                }

                $scope.OpenDeleteDialog = function (packageObj) {
                    var tr = jQuery("#" + packageObj.PackageCode);
                    tr.addClass("delete-background");
                    $scope.packageDelete = packageObj;
                    $rootScope.openCommonModalDialog("删除内容序列号", "你确定要删除该内容序列号么？", $scope.Delete, function () {
                        tr.removeClass("delete-background");
                    });
                }

                $scope.Delete = function () {
                    PackageService
                        .PackageDelete($scope.packageDelete.PackageCode)
                        .then(function (result) {
                            toaster.clear("dialog0");
                            toaster.success({ body: '删除成功', toasterId: 'dialog0' });
                            $scope
                                .ContentSerialNumList
                                .reload();
                            //$scope.SearchSerialNum();
                        }, function (error) {
                            toaster.clear("dialog0");
                            toaster.error({
                                body: "内容序列号停用失败," + error.data.Message,
                                toasterId: 'dialog0'
                            });
                        });
                }

                //发货给渠道商 -Start
                $scope.SendQuery = {
                    ContentProviderID: "",
                    IsForChannelBusiness: true
                }

                $scope.Send = {
                    PackageList: new NgTableParams({
                        count: 9999
                    }, {
                        counts: [],
                        getData: function (params) {
                            $scope.SendQuery.PostParam = params.parameters();
                            return [];
                        }
                    }),
                    CurrentProvider: $scope.ContentProvider[0] || {
                        ContentProviderName: "请选择",
                        ContentProviderID: ""
                    },
                    CurrentChannelBusiness: $scope.ChannelBusinessList[0] || {
                        BusinessName: "请选择",
                        BusinessID: ""
                    }
                };

                var GetSelectedAppyPackage = function (data) {
                    var applyPackage = [];
                    if (angular.isArray(data) && data.length > 0) {
                        angular
                            .forEach(data, function (item, i) {
                                if (item.Selected == 1) {
                                    applyPackage.push(item);
                                } else { }
                            });
                    }
                    return applyPackage;
                }

                $scope.SendProviderChange = function (provider) {
                    $scope.SelectAllPackageTag = false;
                    $scope.SelectAllPackageListCount = 0;
                    $scope.Send.CurrentProvider = provider;
                    $scope.SendQuery.ContentProviderID = provider.ContentProviderID;
                    $scope
                        .Send
                        .PackageList
                        .parameters()
                        .page = 1;
                    $scope.Send.PackageList = new NgTableParams({
                        count: 9999
                    }, {
                        counts: [],
                        getData: function (params) {
                            $scope.SendQuery.PostParam = params.parameters();
                            return PackageService
                                .GetPackageListRes($scope.SendQuery)
                                .then(function (results) {
                                    console.log(results);
                                    params.total(results.data.Count);
                                    return results.data.Provider_PackageListViewList;
                                });
                        }
                    });
                }

                $scope.OpenSendDialog = function (packageObj) {

                    $scope.SelectAllPackageTag = false;
                    $scope.SelectAllPackageListCount = 0;
                    if (packageObj) {
                        packageObj.Selected = 0;
                    }
                    $scope.Send = {
                        PackageList: new NgTableParams({
                            count: 10
                        }, {
                            counts: [20],
                            getData: function (params) {
                                $scope.SendQuery.PostParam = params.parameters();
                                return (packageObj == undefined || packageObj == null)
                                    ? PackageService
                                        .GetPackageListRes($scope.SendQuery)
                                        .then(function (results) {
                                            //console.log(results);
                                            params.total(results.data.Count);
                                            return results.data.Provider_PackageListViewList;
                                        })
                                    : [packageObj];
                            }
                        }),
                        CurrentProvider: $scope.ContentProvider[0],
                        CurrentChannelBusiness: $scope.ChannelBusinessList[0] || {
                            BusinessName: "请选择",
                            BusinessID: ""
                        }
                    };
                    angular
                        .element("#SendDialog")
                        .modal('show');
                }

                $scope.SelectAllPackageTag = false;
                $scope.SelectAllPackageListCount = 0;
                $scope.SelectAllPackage = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllPackageTag = $scope.SelectAllPackageTag
                        ? false
                        : true;

                    $scope.SelectAllPackageListCount = $scope.SelectAllClacCount($scope.Send.PackageList.data, $scope.SelectAllPackageTag);
                }

                $scope.SelectAllClacCount = function (data, flag) {
                    var selectCount = 0;
                    if (angular.isArray(data) && data.length > 0) {
                        var newValue = 0;
                        if (flag) {
                            newValue = 1;
                            selectCount = data.length;
                        }
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].Selected != newValue) {
                                data[i].Selected = newValue;
                            }
                        }
                    }
                    return selectCount;
                }

                $scope.SelectPackage = function (packageObj) {
                    packageObj.Selected = packageObj.Selected == 1
                        ? 0
                        : 1;
                    if (packageObj.Selected == 0) {
                        $scope.SelectAllPackageListCount--;
                        $scope.SelectAllPackageTag = false;
                    } else {
                        $scope.SelectAllPackageListCount++;
                    }
                }

                $scope.KeyupSearchSerialNum = function (e) {
                    var keycode = window.event
                        ? e.keyCode
                        : e.which;
                    if (keycode == 13) {
                        $scope.SearchSerialNum();
                    }
                }

                //#region 分配到学校 -Start
                $scope.AllotStep = 1; //1-选择内容序列号；2-选择学校
                $scope.Allot = {
                    Province: {
                        ProvinceID: "",
                        ProvinceName: ""
                    },
                    City: {
                        CityID: "",
                        CityName: ""
                    },
                    Area: {
                        AreaID: "",
                        AreaName: ""
                    },
                    School: {
                        SchoolId: "",
                        SchoolName: ""
                    },
                    PackageList: new NgTableParams({
                        count: 9999
                    }, {
                        counts: [],
                        getData: function (params) {
                            $scope.AllotQuery.PostParam = params.parameters();
                            return [];
                        }
                    })
                };
                $scope.AllotQuery = {
                    IsForSchool: true
                }

                $scope.ProvinceList = [];
                $scope.CityList = [];
                $scope.AreaList = [];
                $scope.SchoolList = [];

                $scope.OpenAllotDialog = function (packageObj) {
                    $scope.SelectAllotAllTag = false;
                    $scope.AllotStep = 1;
                    $scope.AllotErrorMsg = "";
                    $scope.SelectAllotPackageCount = 0;
                    if (packageObj) {
                        packageObj.Selected = 0;
                    }

                    console.log("ProvinceName:" + $scope.Allot.Province.ProvinceName);
                    AreaService
                        .GetProvinceList()
                        .then(function (result) {
                            $scope.ProvinceList = result.data;
                        });
                    $scope.Allot.PackageList = new NgTableParams({
                        count: 9999
                    }, {
                        counts: [],
                        getData: function (params) {
                            $scope.AllotQuery.PostParam = params.parameters();
                            return (packageObj == undefined || packageObj == null)
                                ? PackageService
                                    .GetPackageListRes($scope.AllotQuery)
                                    .then(function (results) {
                                        //console.log(results);
                                        params.total(results.data.Count);
                                        return results.data.Provider_PackageListViewList;
                                    })
                                : [packageObj];
                        }
                    });
                    angular
                        .element("#AllotDialog")
                        .modal('show');
                }

                $scope.NextStep = function () {
                    if ($scope.SelectAllotPackageCount == 0) {
                        $scope.AllotErrorMsg = "请选择内容序列号";
                        return;
                    }
                    $scope.AllotStep++;
                    $scope.AllotErrorMsg = "";
                    //刷新自定义滚动条
                    customScrollbarHelper.refreshScrollbar();
                }
                $scope.PreStep = function () {
                    $scope.AllotStep--;
                }

                $scope.SelectAllotAllTag = false;
                $scope.SelectAllotPackageCount = 0;
                $scope.SelectAllotAllPackage = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllotAllTag = $scope.SelectAllotAllTag
                        ? false
                        : true;

                    $scope.SelectAllotPackageCount = $scope.SelectAllClacCount($scope.Allot.PackageList.data, $scope.SelectAllotAllTag);
                }

                $scope.SelectAllotPackage = function (packageObj) {
                    packageObj.Selected = packageObj.Selected == 1
                        ? 0
                        : 1;
                    if (packageObj.Selected == 0) {
                        $scope.SelectAllotPackageCount--;
                        $scope.SelectAllotAllTag = false;
                    } else {
                        $scope.SelectAllotPackageCount++;
                    }
                }

                $scope.ProvinceChange = function (province) {
                    $scope.Allot.Province = province;
                    AreaService
                        .GetCityList(province.ProvinceID)
                        .then(function (result) {
                            $scope.CityList = result.data;
                            if (result.data.length > 0) {
                                $scope.CityChange(result.data[0]);
                            }
                        });
                }

                $scope.CityChange = function (city) {
                    $scope.Allot.City = city;

                    AreaService
                        .GetAreaList(city.CityID)
                        .then(function (result) {
                            $scope.AreaList = result.data;
                            if (result.data.length > 0) {
                                $scope.AreaChange(result.data[0]);
                            }
                        });
                }

                $scope.SchoolQuery = {
                    CityId: 0,
                    AreaId: 0,
                    SchoolName: ''
                }

                $scope.AreaChange = function (area) {
                    $scope.Allot.Area = area;
                    $scope.SchoolQuery.AreaId = area.AreaID;
                }
                $scope.SchoolList = [];
                $scope.SearchSchoolList = function () {
                    PackageService
                        .GetSchoolList($scope.SchoolQuery)
                        .then(function (result) {
                            $scope.SchoolList = result.data;
                            if ($scope.SchoolList != null && $scope.SchoolList != undefined && angular.isArray($scope.SchoolList)) {
                                angular
                                    .forEach($scope.SchoolList, function (data, index, array) {
                                        data.Selected = false;
                                    });
                            }
                        });
                }
                $scope.SelectedSchool = {};
                $scope.SelectSchool = function (school) {
                    $scope.SelectedSchool = school;
                    angular.forEach($scope.SchoolList, function (data, index, array) {
                        if (data == school) {
                            data.Selected = true;
                        } else {
                            data.Selected = false;
                        }
                    });
                }
                $scope.AllotToSchool = function () {
                    var params = {
                        Provider_PackageListView: GetSelectedAppyPackage($scope.Allot.PackageList.data),
                        SchoolID: $scope.SelectedSchool.SchoolID
                    }
                    PackageService
                        .AllotToSchool(params)
                        .then(function (result) {
                            $scope.SearchSerialNum();
                            angular
                                .element('#AllotDialog')
                                .modal('hide');
                            toaster.clear("dialog0");
                            toaster.success({ body: "分配成功", toasterId: 'dialog0' });
                        }, function (error) {
                            $scope.AllotErrorMsg = error.data.Message;
                        });
                }


                //#endregion  


                //#region 分配到考试机构
                $scope.AssignToExamOrgStep = 1; //1-选择内容序列号；2-选择考试机构
                $scope.AssignToExamOrg = {
                    Province: {
                        ProvinceID: "",
                        ProvinceName: ""
                    },
                    City: {
                        CityID: "",
                        CityName: ""
                    },
                    Area: {
                        AreaID: "",
                        AreaName: ""
                    },
                    ExamOrg: {
                        ExamOrgID: "",
                        ExamOrgIDName: ""
                    },
                    PackageList: new NgTableParams({
                        count: 9999
                    }, {
                        counts: [],
                        getData: function (params) {
                            $scope.AssignToExamOrgQuery.PostParam = params.parameters();
                            return [];
                        }
                    })
                };
                $scope.AssignToExamOrgQuery = {
                    IsForExamOrg: true,
                    ChannelBusinessID: '',
                    ChannelBusinessName: ''
                }

                $scope.ProvinceListForExamOrg = [];
                $scope.CityListForExamOrg = [];
                $scope.AreaListForExamOrg = [];
                $scope.ExamOrgList = [];
                $scope.SelectAllToExamOrgTag = false;
                $scope.SelectAssignToExamOrgPackageCount = 0;

                $scope.OpenAssignToExamOrgDialog = function (packageObj) {
                    $scope.SelectAllToExamOrgTag = false;
                    $scope.AssignToExamOrgStep = 1;
                    $scope.AssignToExamOrgErrorMsg = "";
                    $scope.SelectAssignToExamOrgPackageCount = 0;
                    if (packageObj) {
                        packageObj.Selected = 0;
                    }

                    console.log("ProvinceName:" + $scope.AssignToExamOrg.Province.ProvinceName);
                    AreaService
                        .GetProvinceList()
                        .then(function (result) {
                            $scope.ProvinceListForExamOrg = result.data;
                        });
                    $scope.AssignToExamOrg.PackageList = new NgTableParams({
                        count: 9999
                    }, {
                        counts: [],
                        getData: function (params) {
                            $scope.AssignToExamOrgQuery.PostParam = params.parameters();
                            return (packageObj == undefined || packageObj == null)
                                ? PackageService
                                    .GetPackageListForExamOrg($scope.AssignToExamOrgQuery)
                                    .then(function (results) {
                                        //console.log(results);
                                        params.total(results.data.Count);
                                        return results.data.Provider_PackageListViewList;
                                    })
                                : [packageObj];
                        }
                    });
                    angular
                        .element("#AssignToExamOrgDialog")
                        .modal('show');
                }
                $scope.NextStepForExamOrg = function () {
                    if ($scope.SelectAssignToExamOrgPackageCount == 0) {
                        $scope.AssignToExamOrgErrorMsg = "请选择内容序列号";
                        return;
                    }
                    $scope.AssignToExamOrgStep++;
                    $scope.SearchExamOrgList();
                    $scope.AssignToExamOrgErrorMsg = "";
                    //刷新自定义滚动条
                    customScrollbarHelper.refreshScrollbar();
                }
                $scope.PreStepForExamOrg = function () {
                    $scope.AssignToExamOrgStep--;
                }

                $scope.SelectAllPackageToExamOrg = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllToExamOrgTag = $scope.SelectAllToExamOrgTag
                        ? false
                        : true;

                    $scope.SelectAssignToExamOrgPackageCount = $scope.SelectAllClacCount($scope.AssignToExamOrg.PackageList.data, $scope.SelectAllToExamOrgTag);
                }

                $scope.SelectPackageToExamOrg = function (packageObj) {
                    packageObj.Selected = packageObj.Selected == 1
                        ? 0
                        : 1;
                    if (packageObj.Selected == 0) {
                        $scope.SelectAssignToExamOrgPackageCount--;
                        $scope.SelectAllToExamOrgTag = false;
                    } else {
                        $scope.SelectAssignToExamOrgPackageCount++;
                        if ($scope.SelectAssignToExamOrgPackageCount == $scope.AssignToExamOrg.PackageList.data.length)
                        {
                            $scope.SelectAllToExamOrgTag = true;
                        }
                    }
                }

                $scope.ProvinceChangeForExamOrg = function (province) {
                    var currentID = $scope.AssignToExamOrg.Province.ProvinceID;
                    var newID = province.ProvinceID;
                    $scope.AssignToExamOrg.Province = province;

                    $scope.ExamOrgQuery.ProvinceID = newID;
                    if (currentID != newID) {
                        $scope.ExamOrgQuery.CityID = '';
                        $scope.ExamOrgQuery.AreaID = '';
                        $scope.AssignToExamOrg.City = { CityName: '' };
                        $scope.AssignToExamOrg.Area = { AreaName: '' };
                        AreaService
                            .GetCityList(newID)
                            .then(function (result) {
                                $scope.CityListForExamOrg = result.data;

                            });

                        $scope.SearchExamOrgList();
                    }
                }

                $scope.CityChangeForExamOrg = function (city) {
                    var currentID = $scope.AssignToExamOrg.City.CityID;
                    var newID = city.CityID;
                    $scope.AssignToExamOrg.City = city;
                    $scope.ExamOrgQuery.CityID = newID;
                    if (currentID != newID) {
                        $scope.ExamOrgQuery.AreaID = '';
                        $scope.AssignToExamOrg.Area = { AreaName: '' };
                        AreaService
                            .GetAreaList(newID)
                            .then(function (result) {
                                $scope.AreaListForExamOrg = result.data;

                            });
                        $scope.SearchExamOrgList();
                    }
                }
                $scope.AreaChangeForExamOrg = function (area) {

                    var currentID = $scope.AssignToExamOrg.Area.AreaID;
                    var newID = area.AreaID;
                    $scope.AssignToExamOrg.Area = area;
                    $scope.ExamOrgQuery.AreaID = newID;
                    if (currentID != newID) {
                        $scope.SearchExamOrgList();
                    }
                }

                $scope.ExamOrgQuery = {
                    ProvinceID: '',
                    CityID: '',
                    AreaID: '',
                    ExamOrgName: '',
                    IsInitEmpty: true
                }
                $scope.ExamOrgList = [];
                $scope.SearchExamOrgList = function () {
                    PackageService
                        .GetExamOrgList($scope.ExamOrgQuery)
                        .then(function (result) {
                            $scope.ExamOrgList = result.data.ExamOrgList;
                            if ($scope.ExamOrgList != null && $scope.ExamOrgList != undefined && angular.isArray($scope.ExamOrgList)) {
                                angular
                                    .forEach($scope.ExamOrgList, function (data, index, array) {
                                        data.Selected = false;
                                    });
                            }
                        });
                }
                $scope.SelectedExamOrg = {};
                $scope.SelectExamOrg = function (g) {
                    $scope.SelectedExamOrg = g;
                    angular.forEach($scope.ExamOrgList, function (data, index, array) {
                        if (data == g) {
                            data.Selected = true;
                        } else {
                            data.Selected = false;
                        }
                    });
                }
                $scope.AssignPackageToExamOrg = function () {
                    var params = {
                        Provider_PackageListView: GetSelectedAppyPackage($scope.AssignToExamOrg.PackageList.data),
                        ExamOrgID: $scope.SelectedExamOrg.ExamOrgID
                    }
                    PackageService
                        .AssignPackageToExamOrg(params)
                        .then(function (result) {
                            $scope.SearchSerialNum();
                            angular
                                .element('#AssignToExamOrgDialog')
                                .modal('hide');
                            toaster.clear("dialog0");
                            if (params.ExamOrgID != '' && params.ExamOrgID !=undefined) {
                                toaster.success({ body: "分配成功", toasterId: 'dialog0' });
                            }
                        }, function (error) {
                            $scope.AssignToExamOrgErrorMsg = error.data.Message;
                        });
                }


                $scope.ChannelChangeForExamOrg = function (c) {
                    $scope.AssignToExamOrgQuery.ChannelBusinessID = c.BusinessID;
                    $scope.AssignToExamOrgQuery.ChannelBusinessName = c.BusinessName;
                    $scope.AssignToExamOrg.PackageList.reload();
                }
                //#endregion  

                //刷新自定义滚动条
                customScrollbarHelper.refreshScrollbar();

            }
           
        ])

        /*
* Services
*/
        .service('PackageService', function ($http, Constants) {
            var serviceBase = Constants.apiServiceBaseUri;
            var self = this;

            self.GetSerialNumList = function (param) {
                return $http.post(serviceBase + 'api/business/serialNumList', param);
            }

            self.GetPackageStatusList = function () {
                return $http.post(serviceBase + 'api/business/getpackagestatuslist');
            }

            self.GetChannelBusinessList = function () {
                return $http.get(serviceBase + 'api/account/channelBusiness');
            }

            self.GetContentProvider = function () {
                return $http.get(serviceBase + 'api/account/contentProvider');
            }

            self.GetProviderPaperPackageList = function (param) {
                return $http.post(serviceBase + 'api/business/providerPaperPackage', param);
            }

            self.GetPackageListRes = function (param) {
                return $http.post(serviceBase + 'api/business/getPackageListRes', param);
            }

            self.GeneratePackageCode = function (param) {
                return $http.post(serviceBase + 'api/business/generatePackageCode', { PPItemList: param });
            }

            self.GetSchoolList = function (params) {
                return $http.post(serviceBase + 'api/dongle/schooList', params);
            }

            self.SendToBusiness = function (params) {
                return $http.post(serviceBase + 'api/business/packagelistapplytobusiness', params);
            }

            self.AllotToSchool = function (params) {
                return $http.post(serviceBase + 'api/business/packagelistapplytoschool', params);
            }

            self.PackageStart = function (code) {
                return $http.get(serviceBase + 'api/business/packageStart/' + code);
            }

            self.PackageStop = function (code) {
                return $http.get(serviceBase + 'api/business/packageStop/' + code);
            }

            self.PackageDelete = function (code) {
                return $http.get(serviceBase + 'api/business/deletepackagelist/' + code);
            }

            //#region 考试机构
            self.GetPackageListForExamOrg = function (param) {
                return $http.post(serviceBase + 'api/business/getPackageListRes', param);
            }
            self.GetExamOrgList = function (param) {
                return $http.post(serviceBase + 'api/examOrg/getExamOrgList', param);
            }
            self.AssignPackageToExamOrg = function (param) {
                return $http.post(serviceBase + 'api/business/assignPackageToExamOrg', param);
            }
            
            //#endregion
        })

        /*
    * Directives
    */
        .directive('fixedTableHeaders', [
            '$timeout',
            function ($timeout) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attrs) {
                        $timeout(function () {
                            element.stickyTableHeaders({ scrollableArea: $('#scrollable-area'), "fixedOffset": -90 });
                        });
                    }
                }
            }
        ]);
    /*
    * Filters
    */
});
