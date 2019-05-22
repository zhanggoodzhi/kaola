define([
    'angular', 'jquery-scrollbar', 'jquery-mousewheel', 'bootstrap-datetimepicker', 'bootstrap-datetimepicker-locales-zh-CN'
], function (angular) {
    'use strict';

    angular
        .module('Dongle', ['ui.router'])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state('dongle', {
                    url: "/dongle",
                    views: {
                        'mainChildView': {
                            templateUrl: "business/dongle/dongle.html",
                            controller: 'DongleCtrl'
                        }
                    }
                });
            }
        ])
        /*
    * Controllers
    */
        .controller('DongleCtrl', [
            '$scope',
            'AuthService',
            'Constants',
            'NgTableParams',
            'DongleService',
            'toaster',
            '$rootScope',
            'AreaService',
            '$timeout',
            function ($scope, AuthService, Constants, NgTableParams, DongleService, toaster, $rootScope, AreaService, $timeout) {
                var authData = AuthService.AuthData();
                $scope.IsAdmin = authData
                    .userRole
                    .indexOf(1) > -1;
                $scope.IsChannel = authData
                    .userRole
                    .indexOf(2) > -1;
                $scope.QueryParams = {
                    Status: '',
                    ChannelBusiness: '',
                    Code: ''
                };

                $scope.StatusList = [
                    {
                        Text: "请选择",
                        Value: "-1"
                    }
                ];
                $scope.ChannelBusinessList = [
                    {
                        BusinessID: '',
                        BusinessName: '请选择'
                    }
                ];

                $scope.Filter = {
                    CurrentStatus: $scope.StatusList[0],
                    CurrentChannelBusiness: $scope.ChannelBusinessList[0]
                };

                DongleService
                    .GetStatusList()
                    .then(function (result) {
                        console.log(result);
                        $scope.StatusList = result.data;
                    });
                DongleService
                    .GetChannelBusinessList()
                    .then(function (result) {
                        console.log(result);
                        if (angular.isArray(result.data) && result.data.length > 0) {
                            angular
                                .forEach(result.data, function (item, i) {
                                    $scope
                                        .ChannelBusinessList
                                        .push(item);
                                });
                        }
                    });

                $scope.SearchDongle = function () {
                    $scope.QueryParams.Status = $scope.Filter.CurrentStatus.Value;
                    $scope.QueryParams.ChannelBusiness = $scope.Filter.CurrentChannelBusiness.BusinessID;
                    console.log($scope.QueryParams);
                    $scope
                        .DongleList
                        .parameters()
                        .page = 1;
                    $scope
                        .DongleList
                        .reload();
                }
                $scope.DongleInstock = {
                    DogCode: "",
                    InstallCode: '',
                    ErrorMsg: ''
                };
                $scope.OpenDongleInstock = function () {
                    $scope.DongleInstock = {
                        DogCode: "",
                        InstallCode: '',
                        ErrorMsg: ''
                    };
                    angular
                        .element('#DongleInstockDialog')
                        .modal('show');
                };

                $scope.Instock = function () {
                    var params = {
                        DogCode: $scope.DongleInstock.DogCode,
                        InstallCode: $scope.DongleInstock.InstallCode
                    };
                    DongleService
                        .DongleInstock(params)
                        .then(function (result) {
                            $scope.SearchDongle();
                            angular
                                .element('#DongleInstockDialog')
                                .modal('hide');
                            toaster.clear("dialogList");
                            toaster.success({body: "添加成功", toasterId: 'dialogList'});
                        }, function (error) {
                            $scope.DongleInstock.ErrorMsg = error.data.Message;
                        });
                }

                $scope.GenerateInstallCode = function () {
                    DongleService
                        .GenerateInstallCode()
                        .then(function (result) {
                            $scope.DongleInstock.InstallCode = result.data.Code;
                        }, function (error) {
                            toaster.clear("dialog2");
                            toaster.error({body: error.data.Message, toasterId: 'dialog2'});
                        });
                }
                $scope.equalHeadHeight = function () {
                    var height = angular
                        .element('.middle-table-wrap thead')
                        .height();
                    angular
                        .element('.left-table-wrap tr')
                        .eq(0)
                        .height(height);
                    angular
                        .element('.right-table-wrap .operation')
                        .height(height - 1);
                }
                window.onresize = function () {
                    $timeout($scope.equalHeadHeight, 10);
                }
                $scope.dongleList = [];
                $scope.DongleList = new NgTableParams({
                    count: 10
                }, {
                    counts: [
                        10, 20, 30, 50
                    ],
                    getData: function (params) {
                        //console.log(params.parameters());
                        $scope.QueryParams.PostParam = params.parameters();
                        return DongleService
                            .GetDongleList($scope.QueryParams)
                            .then(function (results) {
                                //console.log(results);
                                $scope.dongleList = results.data.DongleList;
                                params.total(results.data.Count);
                                $timeout($scope.equalHeadHeight, 10);
                                return results.data.DongleList;
                            });
                    }
                });

                $scope.DongleAllotted = {
                    InstockDongleList: new NgTableParams({
                        count: 10
                    }, {
                        counts: [
                            10, 20, 30, 50
                        ],
                        getData: function () {
                            return [];
                        }
                    }),
                    CurrentChannelBusiness: $scope.ChannelBusinessList[0]
                };

                $scope.Allotted = function () {
                    var params = {
                        InstockDongleList: GetSelectedAppyPackage($scope.DongleAllotted.InstockDongleList.data),
                        BusinessId: $scope.DongleAllotted.CurrentChannelBusiness.BusinessID,
                        Status: 2
                    }
                    DongleService
                        .DongleAllotted(params)
                        .then(function (result) {
                            $scope.SearchDongle();
                            angular
                                .element('#DongleAllottedDialog')
                                .modal('hide');
                            toaster.clear("dialog2");
                            toaster.success({body: "分配成功", toasterId: 'dialog2'});
                        }, function (error) {
                            toaster.clear("dialog2");
                            toaster.error({body: error.data.Message, toasterId: 'dialog2'});
                        });
                }
                $scope.SelectAllDngTag = false;
                $scope.SelectAllReportTag = false;
                $scope.SelectAllDngCount = 0;
                $scope.SelectAllReportCount = 0;
                $scope.OpenDongleAllotted = function (dongle) {
                    $scope.SelectAllDngCount = 0;
                    if (dongle) {
                        dongle.Selected = 0;
                    }

                    $scope.SelectAllDngTag = false;
                    $scope.DongleAllotted = {
                        InstockDongleList: new NgTableParams({
                            count: 10
                        }, {
                            counts: [
                                10, 20, 30, 50
                            ],
                            getData: function (params) {
                                var SelectDogParams = {
                                    Status: 1,
                                    BusinessId: "",
                                    PostParam: ""
                                };
                                SelectDogParams.PostParam = params.parameters();
                                return (dongle == undefined || dongle == null)
                                    ? DongleService
                                        .GetDongleListByStatus(SelectDogParams)
                                        .then(function (results) {
                                            params.total(results.data.Count);
                                            return results.data.DongleList;
                                        })
                                    : [dongle];
                            }
                        }),
                        CurrentChannelBusiness: $scope.ChannelBusinessList[0]
                    };
                    angular
                        .element('#DongleAllottedDialog')
                        .modal('show');
                }

                $scope.DeviceList = new NgTableParams({
                    count: 10
                }, {
                    counts: [
                        10, 20, 30, 50
                    ],
                    getData: function () {
                        var params = {
                            Status: 1,
                            BusinessId: ""
                        }
                        return [];
                    }
                });

                $scope.OpenActivedDeviceSearchDialog = function (dongle) {
                    $scope.DeviceList = new NgTableParams({
                        count: 10
                    }, {
                        counts: [
                            10, 20, 30, 50
                        ],
                        getData: function () {
                            return DongleService
                                .GetDeviceList(dongle.DogCode)
                                .then(function (response) {
                                    return response.data;
                                });
                        }
                    });
                    angular
                        .element("#DongleActivedDeviceSearchDialog")
                        .modal('show');
                }

                $scope.DeviceCancel = function () {}

                //----全选----------------------------

                $scope.SelectAllDng = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllDngTag = $scope.SelectAllDngTag
                        ? false
                        : true;

                    $scope.SelectAllDngCount = $scope.SelectAll($scope.DongleAllotted.InstockDongleList.data, $scope.SelectAllDngTag);
                }

                $scope.SelectAllReport = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllReportTag = $scope.SelectAllReportTag
                        ? false
                        : true;

                    $scope.SelectAllReportCount = $scope.SelectAll($scope.DongleReport.ReportDongleList.data, $scope.SelectAllReportTag);
                }

                $scope.SelectAll = function (data, flag) {
                    var selectCount = 0;
                    if (angular.isArray(data) && data.length > 0) {
                        var newValue = 0;
                        if (flag) {
                            newValue = 1;
                            selectCount = data.length;
                        }
                        for (var i = 0; i < data.length; i++) {
                            data[i].Selected = newValue;
                        }
                    }
                    return selectCount;
                }

                $scope.SelectDng = function (selected) {
                    if (selected == 1) {
                        $scope.SelectAllDngCount--;
                    } else {
                        $scope.SelectAllDngCount++;
                    }
                }

                $scope.SelectReport = function (selected) {
                    if (selected == 1) {
                        $scope.SelectAllReportCount--;
                    } else {
                        $scope.SelectAllReportCount++;
                    }
                }

                //--------地市-----

                $scope.ProvinceList = [];
                $scope.CityList = [];
                $scope.AreaList = [];
                $scope.SchoolList = [];

                $scope.DongleReport = {
                    ReportDongleList: new NgTableParams({
                        count: 10
                    }, {
                        counts: [
                            10, 20, 30, 50
                        ],
                        getData: function () {
                            return [];
                        }
                    }),
                    CurrentChannelBusiness: $scope.ChannelBusinessList[0],
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
                    }
                };

                $scope.OriginalReportDongleList = [];

                $scope.OpenDongleReport = function (dongle) {
                    $scope.SelectAllReportTag = false;
                    $scope.SelectAllReportCount = 0;
                    if (dongle) {
                        dongle.Selected = 0;
                    }

                    AreaService
                        .GetProvinceList()
                        .then(function (result) {
                            $scope.ProvinceList = result.data;
                        });
                    $scope.AllotStep = 1;
                    $scope.DongleReport = {
                        ReportDongleList: new NgTableParams({
                            count: 10
                        }, {
                            counts: [
                                10, 20, 30, 50
                            ],
                            getData: function () {
                                var params = {
                                    Status: 2,
                                    BusinessId: ""
                                }
                                return (dongle == undefined || dongle == null)
                                    ? DongleService
                                        .GetDongleListByStatus(params)
                                        .then(function (results) {
                                            return $scope.OriginalReportDongleList = results.data.DongleList;
                                        })
                                    : [dongle];
                            }
                        }),
                        CurrentChannelBusiness: $scope.ChannelBusinessList[0],
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
                        }
                    };
                    $scope.SchoolList = [];
                    angular
                        .element('#DongleReportDialog')
                        .modal('show');
                }

                function getDongleListByBusiness(businessId) {
                    var businessList = [];
                    if (angular.isArray($scope.OriginalReportDongleList) && $scope.OriginalReportDongleList.length > 0) {
                        angular
                            .forEach($scope.OriginalReportDongleList, function (item, i) {
                                if ((item.BusinessID == businessId) || businessId === '') {
                                    businessList.push(item);
                                }
                            });
                    }
                    return businessList;
                }

                $scope.BusinessChange = function (business) {
                    $scope.DongleReport.CurrentChannelBusiness = business;
                    $scope.DongleReport = {
                        ReportDongleList: new NgTableParams({
                            count: 10
                        }, {
                            counts: [
                                10, 20, 30, 50
                            ],
                            getData: function () {
                                return getDongleListByBusiness(business.BusinessID);
                            }
                        }),
                        CurrentChannelBusiness: business,
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
                        }
                    };
                }

                $scope.ProvinceChange = function (province) {
                    $scope.DongleReport.Province = province;
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
                    $scope.DongleReport.City = city;

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
                    $scope.DongleReport.Area = area;
                    $scope.SchoolQuery.AreaId = area.AreaID;
                }

                $scope.SearchSchoolList = function () {
                    DongleService
                        .GetSchoolList($scope.SchoolQuery)
                        .then(function (result) {
                            $scope.SchoolList = result.data;
                        });
                }

                $scope.AllotStep = 1;
                $scope.NextStep = function () {
                    if ($scope.SelectAllReportCount == 0) {
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
                $scope.Report = function () {
                    var params = {
                        ReportDongleList: GetSelectedAppyPackage($scope.DongleReport.ReportDongleList.data),
                        //BusinessId: $scope.DongleReport.CurrentChannelBusiness.BusinessID,
                        SchoolID: $scope.DongleReport.School.SchoolID,
                        Status: 3
                    }
                    DongleService
                        .DongleReport(params)
                        .then(function (result) {
                            $scope.SearchDongle();
                            angular
                                .element('#DongleReportDialog')
                                .modal('hide');
                            toaster.clear("dialog4");
                            toaster.success({body: "报备成功", toasterId: 'dialog4'});
                        }, function (error) {
                            toaster.clear("dialog4");
                            toaster.error({body: error.data.Message, toasterId: 'dialog4'});
                        });
                }

                $scope.SelectSchool = function (school) {
                    $scope.DongleReport.School = school;
                    angular.forEach($scope.SchoolList, function (data, index, array) {
                        if (data == school) {
                            data.Selected = true;
                        } else {
                            data.Selected = false;
                        }
                    });
                }

                var GetSelectedAppyPackage = function (data) {
                    var applyPackage = [];
                    if (angular.isArray(data) && data.length > 0) {
                        angular
                            .forEach(data, function (item, i) {
                                if (item.Selected == 1) {
                                    applyPackage.push(item);
                                } else {}
                            });
                    }
                    return applyPackage;
                }

                //Stopped
                $scope.OpenStopDongleDialog = function (dongle) {

                    $scope.dongleStop = dongle;
                    $rootScope.openCommonModalDialog("停用加密狗", "你确定要停用该加密狗么？", $scope.Stopped);
                }

                $scope.Stopped = function () {
                    DongleService
                        .DongleStopped($scope.dongleStop.DogCode)
                        .then(function (result) {
                            toaster.clear("dialogList");
                            toaster.success({body: '停用成功', toasterId: 'dialogList'});
                            $scope.SearchDongle();
                        }, function (error) {
                            toaster.clear("dialogList");
                            toaster.error({
                                body: "加密狗停用失败," + error.data.Message,
                                toasterId: 'dialogList'
                            });
                        });
                }

                $scope.DongleSet = {
                    ActivedDeviceCount: 0,
                    MaxAllowActiveDeviceCount: 0,
                    ExpireTime: '',
                    SoftwareVersionUpgradeExpireTime: '',
                    SoftwareVersionSPExpireTime: '',
                    DogCode: '',
                    Comment: '',
                    ErrorMsg: '',
                    ValidateSN: ''
                }

                $scope.OriginalDongleData = {};
                $scope.saveSN = function (dongleSet) {
                    DongleService
                        .DongleSet({
                            DogCode: $scope.DongleSet.DogCode,
                            SettingType: 5,
                            NeedValidateFlag: $scope.DongleSet.ValidateSN === 'true'
                                ? true
                                : false
                        })
                        .then(function (response) {
                            console.log(response.data);
                        }, function (error) {
                            $scope.DongleSet.ErrorMsg = error.data.Message;
                        });
                }
                $scope.OpenSetDongleDialog = function (dongle) {

                    $scope.OriginalDongleData = dongle;

                    $scope.DongleSet = {
                        ActivedDeviceCount: $scope.OriginalDongleData.ActivedDeviceCount,
                        MaxAllowActiveDeviceCount: $scope.OriginalDongleData.MaxAllowActiveDeviceCount,
                        ExpireTime: $scope.OriginalDongleData.ExpireTime,
                        DogCode: $scope.OriginalDongleData.DogCode,
                        SoftwareVersionUpgradeExpireTime: $scope.OriginalDongleData.SoftwareVersionUpgradeExpireTime,
                        SoftwareVersionSPExpireTime: $scope.OriginalDongleData.SoftwareVersionSPExpireTime,
                        Comment: '',
                        ErrorMsg: '',
                        ValidateSN: $scope
                            .OriginalDongleData
                            .ValidateSN
                            .toString()
                    };
                    $scope.DongleSettingType = 0;

                    $("#ExpireTime").datetimepicker({format: "yyyy-mm-dd hh:ii", autoclose: true, todayBtn: true, language: 'zh-CN', pickerPosition: "bottom-left"});
                    $("#SoftwareVersionSPExpireTime").datetimepicker({format: "yyyy-mm-dd hh:ii", autoclose: true, todayBtn: true, language: 'zh-CN', pickerPosition: "bottom-left"});
                    $("#SoftwareVersionUpgradeExpireTime").datetimepicker({format: "yyyy-mm-dd hh:ii", autoclose: true, todayBtn: true, language: 'zh-CN', pickerPosition: "bottom-left"});

                    angular
                        .element("#DongleSetDialog")
                        .modal("show");
                }
                angular
                    .element('#DongleSetDialog')
                    .on('hidden.bs.modal', function () {
                        $scope.SearchDongle();
                    });

                $scope.EditSetting = function (settingType, dongleSet) {
                    $scope.DongleSettingType = settingType;
                    $scope.DongleSet.Comment = "";
                }
                $scope.CancelEditSetting = function (settingType, dongleSet) {
                    $scope.DongleSettingType = 0;

                    $scope.DongleSet = {
                        ActivedDeviceCount: $scope.OriginalDongleData.ActivedDeviceCount,
                        MaxAllowActiveDeviceCount: $scope.OriginalDongleData.MaxAllowActiveDeviceCount,
                        ExpireTime: $scope.OriginalDongleData.ExpireTime,
                        DogCode: $scope.OriginalDongleData.DogCode,
                        SoftwareVersionUpgradeExpireTime: $scope.OriginalDongleData.SoftwareVersionUpgradeExpireTime,
                        SoftwareVersionSPExpireTime: $scope.OriginalDongleData.SoftwareVersionSPExpireTime,
                        Comment: '',
                        ErrorMsg: '',
                        ValidateSN: $scope
                            .OriginalDongleData
                            .ValidateSN
                            .toString()
                    };
                }

                $scope.ViewDongleOperateLogType = 0;
                $scope.ViewDongleOperateLogDogCode = "";
                $scope.ViewSettingLog = function (settingType, dongleSet) {
                    console.log(settingType, dongleSet);
                    $scope.ViewDongleOperateLogType = settingType;
                    $scope.ViewDongleOperateLogDogCode = dongleSet.DogCode;
                    $scope
                        .DongleOperateLog
                        .reload();
                    angular
                        .element("#DongleOperateLogDialog")
                        .modal("show");
                }
                $scope.GetDongleOperateLogTypeHeader = function (settingType) {
                    if (settingType == 1) {
                        return "加密狗过期时间";
                    }
                    if (settingType == 2) {
                        return "软件运维到期时间";
                    }
                    if (settingType == 3) {
                        return "软件升级到期时间";
                    }
                    if (settingType == 4) {
                        return "可激活设备数";
                    }
                }
                $scope.GetDongleOperateLogTypeDialogTitle = function (settingType) {
                    if (settingType == 1) {
                        return "加密狗过期时间修改记录";
                    }
                    if (settingType == 2) {
                        return "软件运维到期时间修改记录";
                    }
                    if (settingType == 3) {
                        return "软件升级到期时间修改记录";
                    }
                    if (settingType == 4) {
                        return "加密狗可激活设备数修改记录";
                    }
                }

                $scope.DongleOperateLog = new NgTableParams({
                    count: 10
                }, {
                    counts: [
                        10, 20, 30, 50
                    ],
                    getData: function (params) {
                        //console.log(params);
                        var logParams = {};
                        logParams.PostParam = params.parameters();
                        logParams.DongleSettingType = $scope.ViewDongleOperateLogType;
                        logParams.DogCode = $scope.ViewDongleOperateLogDogCode;
                        return DongleService
                            .GetDongleOperateLogList(logParams)
                            .then(function (results) {
                                //console.log(results);
                                params.total(results.data.Count);
                                return results.data.DongleOperateLogList;
                            });
                    }
                }),

                $scope.SaveSetting = function (settingType, dongleSet) {
                    var updateSet = {};
                    updateSet.SettingType = settingType;
                    updateSet.DogCode = dongleSet.DogCode;
                    updateSet.Comment = dongleSet.Comment;

                    dongleSet.ExpireTime = $('#ExpireTime').val();
                    dongleSet.SoftwareVersionSPExpireTime = $('#SoftwareVersionSPExpireTime').val();
                    dongleSet.SoftwareVersionUpgradeExpireTime = $('#SoftwareVersionUpgradeExpireTime').val();

                    if (settingType == 1) {
                        if (dongleSet.ExpireTime == undefined || dongleSet.ExpireTime == '') {
                            $scope.DongleSet.ErrorMsg = '加密狗过期时间不能为空';
                            return;
                        }
                        updateSet.Time = dongleSet.ExpireTime;
                    }
                    if (settingType == 2) {
                        if (dongleSet.SoftwareVersionSPExpireTime == undefined || dongleSet.SoftwareVersionSPExpireTime == '') {
                            $scope.DongleSet.ErrorMsg = '软件运维到期时间不能为空';
                            return;
                        }
                        updateSet.Time = dongleSet.SoftwareVersionSPExpireTime;
                    }
                    if (settingType == 3) {
                        if (dongleSet.SoftwareVersionUpgradeExpireTime == undefined || dongleSet.SoftwareVersionUpgradeExpireTime == '') {
                            $scope.DongleSet.ErrorMsg = '软件升级到期时间不能为空';
                            return;
                        }
                        updateSet.Time = dongleSet.SoftwareVersionUpgradeExpireTime;
                    }
                    if (settingType == 4) {
                        var reg = new RegExp("^\\d+$");
                        var result = reg.test(dongleSet.MaxAllowActiveDeviceCount);
                        if (!result) {
                            $scope.DongleSet.ErrorMsg = '最大激活设备数必须是数字(大于等于0)';
                            return;
                        }
                        if (dongleSet.MaxAllowActiveDeviceCount > 1000) {

                            $scope.DongleSet.ErrorMsg = '最大激活设备数不能超过1000';
                            return;
                        }
                        updateSet.Count = dongleSet.MaxAllowActiveDeviceCount;
                    }

                    DongleService
                        .DongleSet(updateSet)
                        .then(function (response) {
                            console.log(response.data);
                            $scope.DongleSettingType = 0;
                            $scope.DongleSet.ErrorMsg = "";
                        }, function (error) {
                            $scope.DongleSet.ErrorMsg = error.data.Message;
                        });
                }

                //Delete
                $scope.OpenDeleteDongleDialog = function (dongle) {

                    var tr = jQuery("#" + dongle.DogCode);
                    tr.addClass("delete-background");
                    $scope.dongleDelete = dongle;
                    $rootScope.openCommonModalDialog("删除加密狗", "你确定要删除该加密狗么？", $scope.Delete, function () {
                        tr.removeClass("delete-background");
                    });
                }

                $scope.Delete = function () {
                    DongleService
                        .DongleDelete($scope.dongleDelete.DogCode)
                        .then(function (result) {
                            toaster.clear("dialogList");
                            toaster.success({body: '删除成功', toasterId: 'dialogList'});
                            $scope.SearchDongle();
                        }, function (error) {
                            toaster.clear("dialogList");
                            toaster.error({
                                body: "加密狗删除失败," + error.data.Message,
                                toasterId: 'dialogList'
                            });
                        });
                }

                //Start
                $scope.OpenStartDongleDialog = function (dongle) {
                    $scope.dongleStart = dongle;
                    $rootScope.openCommonModalDialog("启用加密狗", "你确定要启用该加密狗么？", $scope.Start);
                }

                $scope.Start = function () {
                    DongleService
                        .DongleStart($scope.dongleStart.DogCode)
                        .then(function (result) {
                            angular
                                .element('#DongleActivedDeviceSearchDialog')
                                .modal('hide');
                            toaster.clear("dialogList");
                            toaster.success({body: '启用成功', toasterId: 'dialogList'});
                            $scope.SearchDongle();
                        }, function (error) {
                            toaster.clear("dialogList");
                            toaster.error({
                                body: "加密狗启用失败," + error.data.Message,
                                toasterId: 'dialogList'
                            });
                        });
                }
                //刷新自定义滚动条
                customScrollbarHelper.refreshScrollbar();

                // cancel  加密狗注销 1、在加密狗管理界面，增加加密狗注销功能。 2、已经激活过的加密狗显示注销按钮。
                // 3、点击注销时弹出对话框提醒“注销后，需要重新激活才能使用，您确定要注销吗？” 4、确定注销，将加密后的记录记录删除；加密狗的状态更新,
                // 已激活=>已报备（3）
                $scope.OpenCancelDongleDialog = function (dongle) {
                    $scope.dongleCancel = dongle;
                    $rootScope.openCommonModalDialog("注销加密狗", "注销后，需要重新激活才能使用，您确定要注销吗？", $scope.Cancel);
                };
                $scope.Cancel = function () {
                    var params = {
                        DogCode: $scope.dongleCancel.DogCode,
                        SchoolDeviceID: $scope.dongleCancel.SchoolDeviceID
                    }
                    DongleService
                        .DongleCancel(params)
                        .then(function (result) {

                            toaster.clear("dialog3");
                            toaster.success({body: '注销成功', toasterId: 'dialog3'});
                            $scope
                                .DeviceList
                                .parameters()
                                .page = 1;
                            $scope
                                .DeviceList
                                .reload();
                            $scope.SearchDongle();

                        }, function (error) {
                            toaster.clear("dialog3");
                            toaster.error({
                                body: "加密狗注销失败," + error.data.Message,
                                toasterId: 'dialog3'
                            });
                        });
                }
            }
        ])

        /*
* Services
*/
        .service('DongleService', function ($http, Constants) {
            var serviceBase = Constants.apiServiceBaseUri;
            var self = this;

            self.GetDongleOperateLogList = function (params) {
                return $http.post(serviceBase + 'api/dongle/getDongloOperatLogList', params);
            }

            //Instock
            self.GetStatusList = function () {
                return $http.get(serviceBase + 'api/dongle/statuslist');
            }

            self.GetChannelBusinessList = function () {
                return $http.get(serviceBase + 'api/dongle/channelbusinesslist');
            }

            self.GetDongleList = function (params) {
                return $http.post(serviceBase + 'api/dongle/dongleList', params);
            }

            self.DongleInstock = function (params) {
                return $http.post(serviceBase + 'api/dongle/dongleinstock', params);
            }

            self.GenerateInstallCode = function () {
                return $http.post(serviceBase + 'api/dongle/gernerateinstallcode');
            }

            self.GetDongleListByStatus = function (params) {
                return $http.post(serviceBase + 'api/dongle/instockdonglelist', params);
            }

            //Allotted
            self.DongleAllotted = function (params) {
                return $http.post(serviceBase + 'api/dongle/dongleallotted', params);
            }

            //Report

            self.GetSchoolList = function (param) {
                return $http.post(serviceBase + 'api/dongle/schooList', param);
            }

            self.DongleReport = function (params) {
                return $http.post(serviceBase + 'api/dongle/donglereport', params);
            }

            //Stoped
            self.DongleStopped = function (code) {
                return $http.get(serviceBase + 'api/dongle/donglestopped/' + code);
            }

            //Delete
            self.DongleDelete = function (code) {
                return $http.get(serviceBase + 'api/dongle/dongledelete/' + code);
            }

            //Start
            self.DongleStart = function (code) {
                return $http.get(serviceBase + 'api/dongle/donglestart/' + code);
            }

            //cancel
            self.DongleCancel = function (params) {
                return $http.post(serviceBase + 'api/dongle/donglecancel', params);
            }

            //Set
            self.DongleSet = function (params) {
                return $http.post(serviceBase + 'api/dongle/savedonglesetting', params);
            }

            self.GetDeviceList = function (code) {
                return $http.get(serviceBase + 'api/dongle/getdonglehistory/' + code);
            }

        });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
