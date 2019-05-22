define(['angular', 'angucomplete'], function (angular) {
    'use strict';

    angular.module('ExamOrg', ['ui.router'])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state('examOrg', {
                    url: "/examOrg",
                    views: {
                        'mainChildView': {
                            templateUrl: "business/examOrg/examOrg.html",
                            controller: 'ExamOrgCtrl'
                        }
                    }
                });
            }
        ])
        /*
         * Controllers
         */
        .controller('ExamOrgCtrl', [
            '$scope', 'AuthService', 'Constants', 'NgTableParams', 'ExamOrgService', '$rootScope', '$state', 'AreaService', '$timeout',
            function ($scope, AuthService, Constants, NgTableParams, ExamOrgService, $rootScope, $state, AreaService, $timeout) {

                //#region 列表查询

                $scope.QueryParams = {
                    TablePostParams: {},
                    ExamOrgName: '',
                    ProvinceName: '',
                    CityName: '',
                    AreaName: '',
                    isInitEmpty: false
                };

                $scope.ExamOrgTable = new NgTableParams({
                    count: 10
                }, {
                    counts: [10, 20, 30, 50],
                    getData: function (params) {
                        //console.log(params.parameters());
                        $scope.QueryParams.TablePostParams = params.parameters();
                        return ExamOrgService.GetExamOrgList($scope.QueryParams).then(function (results) {
                            //console.log(results);
                            params.total(results.data.Count);
                            return results.data.ExamOrgList;
                        });
                    }
                });
                $scope.SearchExamOrg = function () {
                    $scope.QueryParams.ProvinceName = $scope.CurrentRegion.Province.ProvinceName || "";
                    $scope.QueryParams.CityName = $scope.CurrentRegion.City.CityName || "";
                    $scope.QueryParams.AreaName = $scope.CurrentRegion.Area.AreaName || "";
                    if ($scope.QueryParams.ProvinceName == "省" || $scope.QueryParams.ProvinceName == "请选择") {
                        $scope.QueryParams.ProvinceName = "";
                    }
                    if ($scope.QueryParams.CityName == "省" || $scope.QueryParams.CityName == "请选择") {
                        $scope.QueryParams.CityName = "";
                    }
                    if ($scope.QueryParams.AreaName == "区" || $scope.QueryParams.AreaName == "请选择") {
                        $scope.QueryParams.AreaName = "";
                    }
                    console.log($scope.QueryParams);
                    $scope.ExamOrgTable.parameters().page = 1;
                    $scope.ExamOrgTable.reload();
                }

                $scope.KeyupSearch = function (e) {
                    var keycode = window.event ? e.keyCode : e.which;
                    if (keycode == 13) {
                        $scope.SearchExamOrg();
                    }
                };


                $scope.ClearQueryParam = function () {

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
                    }
                    $scope.QueryParams.ExamOrgName = "";
                }
                //#endregion

                $scope.InitExamOrg = function (d) {
                    if (d == undefined || d == null) {
                        return {
                            ProvinceID: '',
                            ProvinceName: '',
                            CityID: '',
                            CityName: '',
                            AreaIDList: [],
                            AreaNameList: [],
                            ExamOrgName: '',
                            ExamOrgID: ''
                        };
                    } else {
                        var newD = {};
                        newD.ProvinceID = d.ProvinceID;
                        newD.ProvinceName = d.ProvinceName;
                        newD.CityID = d.CityID;
                        newD.CityName = d.CityName;
                        newD.ExamOrgName = d.ExamOrgName;
                        newD.ExamOrgID = d.ExamOrgID;

                        if (d.AreaIDs != undefined) {
                            newD.AreaIDList = d.AreaIDs.split(',');
                        }
                        if (d.AreaNames != undefined) {
                            newD.AreaNameList = d.AreaNames.split(',');
                        }
                        return newD;
                    }
                }
                $scope.CurrentExamOrg = $scope.InitExamOrg();

                //#region 添加考试机构

                $scope.OpenAddExamOrgDialog = function () {
                    $scope.CurrentExamOrg = $scope.InitExamOrg();
                    $scope.ProvinceForEdit = [];
                    $scope.CityForEdit = [];
                    $scope.AreaForEdit = [];
                    $scope.LoadProvinceForEdit();
                    $scope.ChooseTab('province');
                    angular.element('#EditExamOrgDialog').modal('show');
                }

                $scope.UpdateExamOrg = function () {
                    if ($scope.ValidateExamOrg($scope.CurrentExamOrg) == false) {
                        return;
                    }

                    ExamOrgService.UpdateExamOrg($scope.CurrentExamOrg).then(function (result) {
                        if (result.data.Success) {
                            angular.element('#EditExamOrgDialog').modal('hide');
                            $scope.ExamOrgTable.reload();
                        } else {
                            //error
                            $rootScope.openCommonErrorDialog('错误', result.data.State);
                        }
                    }, function (error) {
                        console.log(error);
                    });

                }
                $scope.ValidateExamOrg = function (d) {
                    //validate
                    if (d.ProvinceID === undefined || d.ProvinceID === '') {
                        $rootScope.openCommonErrorDialog('错误', '请选择所在省份！');
                        return false;
                    }
                    if (d.CityID === undefined || d.CityID === '') {
                        $rootScope.openCommonErrorDialog('错误', '请选择所在城市！');
                        return false;
                    }

                    if (d.AreaIDList.length == 0) {
                        $rootScope.openCommonErrorDialog('错误', '请选择所在区域！');
                        return false;
                    }
                    if (d.ExamOrgName === undefined || d.ExamOrgName === '') {
                        $rootScope.openCommonErrorDialog('错误', '考试机构名称不能为空！');
                        return false;
                    }
                    return true;
                }
                //#endregion

                //#region 修改考试机构
                $scope.OpenUpdateExamOrgDialog = function (d) {
                    $scope.CurrentExamOrg = $scope.InitExamOrg(d);
                    console.log($scope.CurrentExamOrg);
                    $scope.LoadProvinceForEdit();
                    $scope.LoadCityForEdit({ ProvinceID: d.ProvinceID });
                    $scope.LoadAreaForEdit({ CityID: d.CityID });

                    $scope.ChooseTab('province');
                    angular.element('#EditExamOrgDialog').modal('show');

                }
                //#endregion

                //#region 删除考试机构
                $scope.DeleteExamOrg = function (d) {

                    $rootScope.openCommonModalDialog("确认", "确认删除该考试机构?", function (result) {
                        ExamOrgService.DeleteExamOrg(d).then(function (result) {
                            if (result.data.Success) {
                                $scope.ExamOrgTable.parameters().page = 1;
                                $scope.ExamOrgTable.reload();
                            } else {
                                //error
                                $rootScope.openCommonErrorDialog('错误', '删除考试机构失败,' + result.data.State);
                            }
                        })
                    })
                }
                //#endregion


                //#region ----省市区的联动查询-----

                $scope.Region = {
                    ProvinceList: [],
                    CityList: [],
                    AreaList: [],
                }

                $scope.RegionNow = {
                    ProvinceList: [],
                    CityList: [],
                    AreaList: [],
                }

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
                }

                AreaService.GetProvinceList().then(function (result) {
                    //console.log(result);
                    $scope.Region.ProvinceList = result.data;
                    $scope.RegionNow.ProvinceList = result.data;
                    $scope.CurrentRegion.Province = result.data[0];

                });

                $scope.ProvinceChange = function (province) {
                    $scope.CurrentRegion.Province = province;
                    $scope.CurrentRegion.City = {
                        CityName: "",
                    };
                    $scope.CurrentRegion.Area = {
                        AreaName: ""
                    };
                    if (province.ProvinceID == undefined || province.ProvinceID == '') {
                        $scope.CurrentRegion.Province = {
                            ProvinceName: "省",
                        };
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
                    $scope.SearchExamOrg();
                }

                $scope.CityChange = function (city) {

                    $scope.CurrentRegion.City = city;
                    $scope.CurrentRegion.Area = {
                        AreaName: ""
                    };
                    if (city.CityID == undefined || city.CityID == '') {
                        $scope.CurrentRegion.City = {
                            CityName: "",
                        };
                        $scope.RegionNow.AreaList = [];
                        return;
                    }

                    AreaService.GetAreaList(city.CityID).then(function (result) {
                        $scope.RegionNow.AreaList = result.data;
                        if (result.data.length > 0) {
                            //$scope.AreaChange(result.data[0]);
                        }
                    });
                    $scope.SearchExamOrg();
                }

                $scope.AreaChange = function (area) {
                    if (area.AreaID == undefined || area.AreaID == '') {
                        $scope.CurrentRegion.Area = {
                            AreaName: ""
                        };
                        return;
                    }
                    $scope.CurrentRegion.Area = area;
                    $scope.SearchExamOrg();
                }
                //#endregion


                //#region ----考试机构编辑界面的省市区的联动-----

                $scope.ActiveTab = '';
                $scope.GetChoosedDistrictInfo = function () {
                    var districtInfo = '';
                    if ($scope.CurrentExamOrg.ProvinceName) {
                        districtInfo = $scope.CurrentExamOrg.ProvinceName;
                    }
                    if ($scope.CurrentExamOrg.CityName) {
                        districtInfo += '-' + $scope.CurrentExamOrg.CityName;
                    }

                    if ($scope.CurrentExamOrg.AreaNameList && $scope.CurrentExamOrg.AreaNameList.length > 0) {
                        var areaName = '';
                        for (var i = 0; i < $scope.CurrentExamOrg.AreaNameList.length; i++) {
                            areaName += (areaName == '' ? '' : ',') + $scope.CurrentExamOrg.AreaNameList[i];
                        }
                        districtInfo += '-' + areaName;
                    }
                    return districtInfo;
                }

                $scope.ChooseTab = function (tab) {
                    $scope.ActiveTab = tab;
                }
                $scope.ChooseProvince = function (p) {
                    var currentID = $scope.CurrentExamOrg.ProvinceID;
                    if (currentID != p.ProvinceID) {
                        //clear
                        $scope.CurrentExamOrg.CityID = '';
                        $scope.CurrentExamOrg.CityName = '';
                        $scope.CurrentExamOrg.AreaIDList = [];
                        $scope.CurrentExamOrg.AreaNameList = [];
                    }
                    $scope.CurrentExamOrg.ProvinceID = p.ProvinceID;
                    $scope.CurrentExamOrg.ProvinceName = p.ProvinceName;
                    $scope.LoadCityForEdit(p);
                    $scope.ChooseTab('city');
                }
                $scope.ChooseCity = function (c) {
                    var currentID = $scope.CurrentExamOrg.CityID;
                    if (currentID != c.CityID) {
                        //clear 
                        $scope.CurrentExamOrg.AreaIDList = [];
                        $scope.CurrentExamOrg.AreaNameList = [];
                    }
                    $scope.CurrentExamOrg.CityID = c.CityID;
                    $scope.CurrentExamOrg.CityName = c.CityName;
                    $scope.LoadAreaForEdit(c);
                    $scope.ChooseTab('area');
                }
                $scope.ChooseArea = function (a) {
                    var findAreaIndex = -1;

                    for (var i = 0; i < $scope.CurrentExamOrg.AreaIDList.length; i++) {
                        if ($scope.CurrentExamOrg.AreaIDList[i] == a.AreaID) {
                            findAreaIndex = i;
                            break;
                        }
                    }

                    if (findAreaIndex > -1) {
                        //splice
                        $scope.CurrentExamOrg.AreaIDList.splice(findAreaIndex, 1);
                        $scope.CurrentExamOrg.AreaNameList.splice(findAreaIndex, 1);
                    } else {
                        //add
                        $scope.CurrentExamOrg.AreaIDList.push(a.AreaID);
                        $scope.CurrentExamOrg.AreaNameList.push(a.AreaName);
                    }
                }
                $scope.IsChoosedProvince = function (p) {
                    return p.ProvinceID == $scope.CurrentExamOrg.ProvinceID;
                }
                $scope.IsChoosedCity = function (c) {
                    return c.CityID == $scope.CurrentExamOrg.CityID;
                }
                $scope.IsChoosedArea = function (a) {

                    for (var i = 0; i < $scope.CurrentExamOrg.AreaIDList.length; i++) {
                        if ($scope.CurrentExamOrg.AreaIDList[i] == a.AreaID) {

                            return true;
                        }
                    }
                    return false;
                }

                $scope.ProvinceForEdit = [];
                $scope.CityForEdit = [];
                $scope.AreaForEdit = [];
                $scope.LoadProvinceForEdit = function (p) {
                    AreaService.GetProvinceList().then(function (result) {
                        $scope.ProvinceForEdit = result.data;
                        if ($scope.ProvinceForEdit.length > 0 && $scope.ProvinceForEdit[0].ProvinceID == '') {
                            $scope.ProvinceForEdit.splice(0, 1);
                        }
                    });
                }
                $scope.LoadCityForEdit = function (p) {
                    AreaService.GetCityList(p.ProvinceID).then(function (result) {
                        $scope.CityForEdit = result.data;
                        if ($scope.CityForEdit.length > 0 && $scope.CityForEdit[0].CityID == '') {
                            $scope.CityForEdit.splice(0, 1);
                        }
                    });
                }
                $scope.LoadAreaForEdit = function (c) {
                    AreaService.GetAreaList(c.CityID).then(function (result) {
                        $scope.AreaForEdit = result.data;
                        if ($scope.AreaForEdit.length > 0 && $scope.AreaForEdit[0].AreaID == '') {
                            $scope.AreaForEdit.splice(0, 1);
                        }
                    });
                }
                //#endregion


                //#region 机构管理员查询
                $scope.QueryExamOrgManagerParams = { ExamOrgID: '' }
                $scope.ExamOrgManagerTable = new NgTableParams({
                    count: 9999
                }, {
                    counts: [],
                    getData: function (params) {
                        return ExamOrgService.GetExamOrgManagerList($scope.QueryExamOrgManagerParams).then(function (results) {
                            params.total(results.data.Count);
                            return results.data.ExamOrgManagerList;
                        });
                    }
                });

                $scope.ViewExamOrgManager = function (d) {
                    $scope.QueryExamOrgManagerParams.ExamOrgID = d.ExamOrgID;

                    if (d.ExamOrgManagerCount > 0) {
                        angular.element('#ViewExamOrgManagerDialog').modal('show');
                        $scope.ExamOrgManagerTable.reload();
                    } else {
                        $scope.OpenAddExamOrgManagerDialog();
                    }
                }

                //机构管理员编辑
                $scope.InitExamOrgManager = function (d) {
                    if (d == undefined || d == null) {
                        return {
                            OriginalPassword: '',
                            PhoneNumber: '',
                            Email: '',
                            AccountUserID: '',
                            ExamOrgID: ''
                        };
                    } else {
                        var newD = {};
                        newD.OriginalPassword = d.OriginalPassword;
                        newD.PhoneNumber = d.PhoneNumber;
                        newD.Email = d.Email;
                        newD.AccountUserID = d.AccountUserID;
                        newD.ExamOrgID = d.ExamOrgID;

                        return d;
                    }
                }
                $scope.CurrentExamOrgManager = $scope.InitExamOrgManager();
                $scope.OpenAddExamOrgManagerDialog = function () {
                    $scope.CurrentExamOrgManager = $scope.InitExamOrgManager();
                    $scope.CurrentExamOrgManager.ExamOrgID = $scope.QueryExamOrgManagerParams.ExamOrgID;
                    console.log("Add,", $scope.CurrentExamOrgManager);
                    angular.element('#EditExamOrgManagerDialog').modal('show');
                }

                $scope.OpenUpdateExamOrgManagerDialog = function (d) {
                    $scope.CurrentExamOrgManager = $scope.InitExamOrgManager(d);
                    console.log("Update,", $scope.CurrentExamOrgManager);
                    angular.element('#EditExamOrgManagerDialog').modal('show');
                }

                $scope.UpdateExamOrgManager = function () {

                    if ($scope.ValidateExamOrgManager($scope.CurrentExamOrgManager) == false) {
                        return;
                    }
                    ExamOrgService.UpdateExamOrgManager($scope.CurrentExamOrgManager).then(function (result) {
                        if (result.data.Success) {
                            angular.element('#EditExamOrgManagerDialog').modal('hide');
                            $scope.ExamOrgManagerTable.reload();
                        } else {
                            //error
                            $rootScope.openCommonErrorDialog('错误', '保存考试机构管理员失败,' + result.data.State);
                        }
                    }, function (error) {
                        console.log(error);
                    });
                }

                $scope.ValidateExamOrgManager = function (d) {
                    if (d.Email == undefined) {
                        $rootScope.openCommonErrorDialog('错误', '请输入正确的邮箱格式');
                        return false;
                    } 

                    if (d.Email == '' && d.PhoneNumber == '') {
                        $rootScope.openCommonErrorDialog('错误', '登录邮箱和登录手机号必须填一个');
                        return false;
                    }

                    if (d.PhoneNumber != undefined && d.PhoneNumber != '') {
                        var reg = /^0?1[3|4|5|8|7][0-9]\d{8}$/;
                        var valid = reg.test(d.PhoneNumber);
                        if (valid == false) {
                            $rootScope.openCommonErrorDialog('错误', '请输入正确的手机号码');
                            return false;
                        }
                    }
                    if (d.OriginalPassword == undefined || d.OriginalPassword == '') {
                        $rootScope.openCommonErrorDialog('错误', '请填写登录密码');
                        return false;
                    }

                    if (d.OriginalPassword.length < 6 || d.OriginalPassword.length > 20) {
                        $rootScope.openCommonErrorDialog('错误', '登录密码长度必须在6~20个字符之间');
                        return false;
                    }


                    return true;
                }

                $scope.DeleteExamOrgManager = function (d) {
                    $rootScope.openCommonModalDialog("确认", "确认删除该考试机构?", function (result) {
                        ExamOrgService.DeleteExamOrgManager(d).then(function (result) {
                            if (result.data.Success) {
                                $scope.ExamOrgManagerTable.reload();
                            } else {
                                //error
                                $rootScope.openCommonErrorDialog('错误', '删除机构管理员失败,' + result.data.State);
                            }
                        })
                    })
                }
                //#endregion


                angular.element('#EditExamOrgManagerDialog').on('hidden.bs.modal', function () {
                    $scope.ExamOrgManagerTable.reload();
                    $scope.ExamOrgTable.reload();
                });
                angular.element('#ViewExamOrgManagerDialog').on('hidden.bs.modal', function () {
                    $scope.ExamOrgTable.reload();
                });

                $scope.ViewExam = function (d) {
                    //给data赋值
                    $state.go('examManageForManager', {
                        data: {
                            'examOrgID': d.ExamOrgID,
                            'examOrgName': d.ExamOrgName,
                            'backState': 'examOrg'
                        }
                    });
                }

                //刷新自定义滚动条
                customScrollbarHelper.refreshScrollbar();

            }
        ])

/*
 * Services
 */
        .service('ExamOrgService', function ($http, Constants) {
            var serviceBase = Constants.apiServiceBaseUri;
            var self = this;

            self.GetExamOrgList = function (params) {
                return $http.post(serviceBase + 'api/examOrg/getExamOrgList', params);
            };

            self.UpdateExamOrg = function (params) {
                return $http.post(serviceBase + 'api/examOrg/update', params);
            }
            self.DeleteExamOrg = function (params) {
                return $http.post(serviceBase + 'api/examOrg/delete', params);
            }

            //#region 机构管理员 
            self.GetExamOrgManagerList = function (params) {
                return $http.post(serviceBase + 'api/examOrg/getExamOrgManagerList', params);
            }
            self.DeleteExamOrgManager = function (params) {
                return $http.post(serviceBase + 'api/examOrg/deleteExamOrgManager', params);
            }
            self.UpdateExamOrgManager = function (params) {
                return $http.post(serviceBase + 'api/examOrg/updateExamOrgManager', params);
            }
            //#endregion
            //#region 省市区
            self.GetProvinceList = function () {
                return $http.get(serviceBase + 'api/business/proviceList');
            }

            self.GetCityList = function (provinceID) {
                var provinceid = provinceID || "";
                return $http.post(serviceBase + 'api/business/cityList', {
                    ProvinceID: provinceid
                });
            }

            self.GetAreaList = function (cityID) {
                var cityid = cityID || "";
                return $http.post(serviceBase + 'api/business/areaList', {
                    CityID: cityid
                });
            }


            //#endregion


        });

    /*
     * Directives
     */

    /*
     * Filters
     */
});