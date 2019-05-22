define(['angular', 'jquery-scrollbar', 'jquery-mousewheel', 'angular-touch', 'angucomplete'], function (angular) {
    'use strict';

    angular.module('School', ['ui.router'])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state('school', {
                    url: "/school",
                    views: {
                        'mainChildView': {
                            templateUrl: "business/school/school.html",
                            controller: 'SchoolCtrl'
                        }
                    }
                });
            }
        ])
        /*
         * Controllers
         */
        .controller('SchoolCtrl', [
            '$scope', 'AuthService', 'Constants', 'NgTableParams', 'SchoolService', '$rootScope', 'toaster', 'AreaService', '$timeout', 'Upload',
            function ($scope, AuthService, Constants, NgTableParams, SchoolService, $rootScope, toaster, AreaService, $timeout, Upload) {
                $(".eye-icon").click(function () {
                    var pwdName = $(this).attr("for");
                    if ($(this).attr("checked")) {
                        $(this).attr("checked", false);
                        $(this).attr("src", "http://cdn.uukaola.com/web/img/login/eyeselected.png");
                        angular.element("[name=" + pwdName + "Show]").show();
                        angular.element("[name=" + pwdName + "]").hide();
                    } else {
                        $(this).attr("checked", true);
                        $(this).attr("src", "http://cdn.uukaola.com/web/img/login/eyeunselect.png");
                        angular.element("[name=" + pwdName + "Show").hide();
                        angular.element("[name=" + pwdName).show();
                    }
                });
                $("[name=ma_Pwd]").change(function () {
                    if (!angular.element("[name=ma_Pwd]").hidden) {
                        angular.element("[name=ma_PwdShow]").val(angular.element("[name=ma_Pwd]").val());
                    }
                });
                $("[name=ma_PwdShow]").change(function () {
                    if (!angular.element("[name=ma_PwdShow]").hidden) {
                        angular.element("[name=ma_Pwd]").val(angular.element("[name=ma_PwdShow]").val());
                        $scope.ManagerParam.PassWord = angular.element("[name=ma_PwdShow]").val();
                    }
                });

                //支持的评分精度列表 0.1,0.5,1
                $scope.SupportMarkPrecision = [0.1, 0.5, 1]

                $scope.SelectedSchool = {};
                $scope.QueryParams = {
                    PostParam: {},
                    SchoolName: '',
                    ProvinceName: '',
                    CityName: '',
                    AreaName: ''
                };

                $scope.SchoolDataList = [];
                $scope.SchoolList = new NgTableParams({
                    count: 10
                }, {
                    counts: [10, 20, 30, 50],
                    getData: function (params) {
                        //console.log(params.parameters());
                        $scope.QueryParams.PostParam = params.parameters();
                        return SchoolService.GetSchoolList($scope.QueryParams).then(function (results) {
                            //console.log(results);
                            params.total(results.data.Count);
                            $scope.SchoolDataList = results.data.SchoolList;

                            $timeout($scope.RefreshStyle, 10);

                            return results.data.SchoolList;
                        });
                    }
                });

                $scope.IsSmallScreen = false;
                $scope.CheckScreen = function () {
                    // if (screen.width > 1024) {
                    if (window.innerWidth > 1024) {
                        $scope.IsSmallScreen = false;
                    } else {
                        $scope.IsSmallScreen = true;
                    }
                }

                $scope.RefreshStyleTimer = null;
                window.onresize = function () {
                    $scope.RefreshStyleTimer = $timeout($scope.RefreshStyle, 10);
                }
                $scope.$on("$destroy",
                        function (event) {

                            if ($scope.RefreshStyleTimer) {
                                $timeout.cancel($scope.RefreshStyleTimer);
                            }
                            window.onresize = "";
                            console.log('cancel window.onresize function after destory');
                        }
                    );


                $scope.RefreshStyle = function () {
                    console.log('RefreshStyle')
                    $scope.CheckScreen();
                    if ($scope.IsSmallScreen == true) {
                        const leftWidth = angular.element('.table-left').width();
                        console.log(leftWidth);
                        angular.element('.custom-scrollbar').css('width', 'calc(100% - 170px - ' + leftWidth + 'px)');
                    } else {
                        angular.element('.custom-scrollbar').css('width', 'calc(50% - 170px)');
                    }
                    // var maxHeight = 0;

                    // maxHeight = 0;
                    // $(".equal-row div").each(function (index, element) {
                    //     var elementHeight = $(element).height();
                    //     console.log(elementHeight);
                    //     if (maxHeight < elementHeight) {
                    //         maxHeight = elementHeight;
                    //     }
                    // });
                    // maxHeight++;
                    // $(".equal-row div").each(function (index, element) {
                    //     $(element).css("height", maxHeight + "px");
                    // });

                    // $(".table tbody tr").each(function (index, element) {
                    //     $(element).css("height", maxHeight + "px");
                    // })
                    // if ($scope.IsSmallScreen == true) {
                    //     $("#scrollblock").css("width", "226px");
                    //     $("#containerblock").css("width", "300px");
                    //     $("#mCSB_1_container").css("width", "300px");
                    //     $("#dogHead").css("width", "82px");
                    //     $("#packageHead").css("width", "82px");
                    //     $("#paperHead").css("width", "62px");
                    //     $("#versionHead").css("width", "62px");

                    // }
                    // else {
                    //     $("#scrollblock").css("width", "39.9%");
                    //     $("#containerblock").css("width", "100%");
                    //     $("#mCSB_1_container").css("width", "100%");
                    //     $("#dogRow").css("width", "30%");
                    //     $("#packageRow").css("width", "30%");
                    //     $("#paperRow").css("width", "20%");
                    //     $("#versionRow").css("width", "20%");
                    // }

                    //刷新自定义滚动条
                }
                // customScrollbarHelper.refreshHorizontalScrollbar();
                setTimeout(function () {
                    $('.custom-scrollbar').mCustomScrollbar({
                        horizontalScroll: true,
                    });
                }, 0);

                $scope.QueryParamsByAdd = {
                    ProvinceName: "",
                    CityName: "",
                    AreaName: "",
                    SearchStr: ""
                }
                $scope.Url = Constants.apiServiceBaseUri + 'api/business/schoolListByRegion';

                var MakeAddQueryParam = function () {
                    //构件查询学校条件
                    $scope.QueryParamsByAdd.ProvinceName = $scope.CurrentRegionAdd.Province.ProvinceName;
                    $scope.QueryParamsByAdd.CityName = $scope.CurrentRegionAdd.City.CityName;
                    $scope.QueryParamsByAdd.AreaName = $scope.CurrentRegionAdd.Area.AreaName;
                    //$scope.QueryParamsByAdd.SchoolName = angular.element("#exSchool_value").val() || "";
                }

                $scope.SearchSchool = function () {
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
                    $scope.SchoolList.parameters().page = 1;
                    $scope.SchoolList.reload();
                }

                $scope.KeyupSearch = function (e) {
                    var keycode = window.event ? e.keyCode : e.which;
                    if (keycode == 13) {
                        $scope.SearchSchool();
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
                    $scope.QueryParams.SchoolName = "";
                    $scope.RegionNow.CityList = [];
                    $scope.RegionNow.AreaList = [];
                }


                $scope.ChoosedSchool = {};

                $scope.OpeDeleteSchoolDialog = function (school) {
                    var tr = jQuery("#" + school.SchoolID);
                    tr.addClass("delete-background");
                    $scope.ChoosedSchool = school;
                    $rootScope.openCommonModalDialog('删除', '您确定要删除该学校吗？', $scope.DelSchool, function () {
                        tr.removeClass("delete-background");
                    });
                }

                $scope.DelSchool = function () {
                    SchoolService.DelSchool($scope.ChoosedSchool.SchoolID).then(function (result) {
                        toaster.clear("dialog1");
                        toaster.success({
                            body: "删除成功",
                            toasterId: 'dialog1'
                        });
                        $scope.SchoolList.parameters().page = 1;
                        $scope.SchoolList.reload();
                    }, function (result) {
                        console.log(result);
                        toaster.clear("dialog1");
                        toaster.error({
                            body: result.data.Message,
                            toasterId: 'dialog1'
                        });
                    });

                    $scope.SearchSchool();
                }
                $scope.DataTransfer = {
                    Province: {
                        ProvinceID: "",
                        ProvinceName: "",
                    },
                    City: {
                        CityID: '',
                        CityName: "",
                    },
                    Area: {
                        AreaID: '',
                        AreaName: "",
                    },
                    School: {
                        title: "",
                    }
                }

                $scope.ProvinceChangeTransfer = function (province) {
                    $scope.DataTransfer.Province = province;
                    $scope.DataTransfer.City = {
                        CityID: '',
                        CityName: "",
                    };
                    $scope.DataTransfer.Area = {
                        AreaID: '',
                        AreaName: ""
                    };

                    if (province.ProvinceID == undefined || province.ProvinceID == '') {
                        $scope.DataTransfer.Province = {
                            ProvinceID: "",
                            ProvinceName: "请选择",
                        };
                        $scope.RegionNow.CityList = [];
                        $scope.RegionNow.AreaList = [];

                        return;
                    }

                    AreaService.GetCityList(province.ProvinceID).then(function (result) {
                        $scope.RegionNow.CityList = result.data;
                        if (result.data.length > 0) {
                            //$scope.CityChangeAdd(result.data[0]);
                        }
                    });
                }

                $scope.CityChangeTransfer = function (city) {
                    $scope.DataTransfer.City = city;
                    $scope.DataTransfer.Area = {
                        AreaName: ""
                    };

                    if (city.CityID == undefined || city.CityID == '') {
                        $scope.DataTransfer.City = {
                            CityID: "",
                            CityName: "",
                        };
                        $scope.RegionNow.AreaList = [];
                        return;
                    }
                    AreaService.GetAreaList(city.CityID).then(function (result) {
                        $scope.RegionNow.AreaList = result.data;
                        if (result.data.length > 0) {
                            //$scope.AreaChangeAdd(result.data[0]);
                        }
                    });


                }

                $scope.AreaChangeTransfer = function (area) {
                    //if (area.AreaID == undefined || area.AreaID == '') {
                    //    $scope.DataTransfer.Area = { AreaID:"",AreaName: "" };
                    //    return;
                    //}
                    $scope.DataTransfer.Area = area;
                    var param = {
                        CityId: $scope.DataTransfer.City.CityID,
                        AreaId: $scope.DataTransfer.Area.AreaID,
                    }
                    SchoolService.GetSchoolListNew(param).then(function (result) {
                        $scope.RegionNow.SchoolList = result.data;
                        //if (result.data.length > 0) {
                        //    $scope.SchoolChangeTransfer(result.data[0]);
                        //}
                    });
                }

                //$scope.SchoolChangeTransfer = function (school) {
                //    $scope.DataTransfer.School = school;
                //}
                $scope.OpenDataTransferDialog = function (school) {
                    $scope.DataTransfer = {
                        Province: {
                            ProvinceID: "",
                            ProvinceName: "",
                        },
                        City: {
                            CityID: '',
                            CityName: "",
                        },
                        Area: {
                            AreaID: '',
                            AreaName: "",
                        },
                        School: {
                            title: "",
                        },
                        FromSchool: {
                            SchoolID: school.SchoolID,
                            SchoolName: school.SchoolName,
                        }
                    }
                    angular.element("#DataTransferDialog").modal('show');
                }

                $scope.DoDataTransfer = function () {
                    var params = {
                        FromSchoolId: $scope.DataTransfer.FromSchool.SchoolID,
                        ToSchoolName: $scope.DataTransfer.School.title,
                        ToSchoolProvice: $scope.DataTransfer.Province.ProvinceID,
                        ToSchoolCity: $scope.DataTransfer.City.CityID,
                        ToSchoolArea: $scope.DataTransfer.Area.AreaID,
                    }
                    SchoolService.DataTransfer(params).then(function (response) {
                        angular.element("#DataTransferDialog").modal('hide');
                        $scope.SchoolList.parameters().page = 1;
                        $scope.SchoolList.reload();
                        toaster.clear("dialog1");
                        toaster.success({
                            body: "数据转移成功",
                            toasterId: 'dialog1'
                        });

                        $scope.SchoolList.parameters().page = 1;
                        $scope.SchoolList.reload();
                    }, function (error) {
                        toaster.clear("dialog1");
                        toaster.error({
                            body: error.data.Message,
                            toasterId: 'dialog1'
                        });
                    });
                }

                //--------地市-----

                $scope.Region = {
                    ProvinceList: [],
                    CityList: [],
                    AreaList: [],
                    SchoolList: [],
                }

                $scope.RegionNow = {
                    ProvinceList: [],
                    CityList: [],
                    AreaList: [],
                    SchoolList: [],
                }

                var regionConstruct = function (region) {
                    this.Region = {
                        ProvinceList: region.ProvinceList,
                        //CityList: region.CityList,
                        //AreaList: region.AreaList,
                        CityList: [],
                        AreaList: [],
                    }
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
                    console.log(result);
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
                }

                $scope.AreaChange = function (area) {
                    if (area.AreaID == undefined || area.AreaID == '') {
                        $scope.CurrentRegion.Area = {
                            AreaName: ""
                        };
                        return;
                    }
                    $scope.CurrentRegion.Area = area;
                }

                //------新增学校信息

                $scope.CurrentRegionAdd = {
                    Province: {
                        ProvinceID: "",
                        ProvinceName: "",
                    },
                    City: {
                        CityID: "",
                        CityName: "",
                    },
                    Area: {
                        AreaID: "",
                        AreaName: "",
                    },
                }

                $scope.ProvinceChangeAdd = function (province) {
                    $scope.CurrentRegionAdd.Province = province;
                    $scope.CurrentRegionAdd.City = {
                        CityID: "",
                        CityName: "",
                    };
                    $scope.CurrentRegionAdd.Area = {
                        AreaID: "",
                        AreaName: ""
                    };

                    if (province.ProvinceID == undefined || province.ProvinceID == '') {
                        $scope.CurrentRegionAdd.Province = {
                            ProvinceName: "",
                        };
                        $scope.RegionNow.CityList = [];
                        $scope.RegionNow.AreaList = [];
                        MakeAddQueryParam();
                        return;
                    }
                    MakeAddQueryParam();

                    AreaService.GetCityList(province.ProvinceID).then(function (result) {
                        $scope.RegionNow.CityList = result.data;
                        if (result.data.length > 0) {
                            //$scope.CityChangeAdd(result.data[0]);
                        }
                    });
                }

                $scope.CityChangeAdd = function (city) {
                    $scope.CurrentRegionAdd.City = city;
                    $scope.CurrentRegionAdd.Area = {
                        AreaID: "",
                        AreaName: ""
                    };

                    if (city.CityID == undefined || city.CityID == '') {
                        $scope.CurrentRegionAdd.City = {
                            CityID: "",
                            CityName: "",
                        };
                        $scope.RegionNow.AreaList = [];
                        MakeAddQueryParam();
                        return;
                    }
                    MakeAddQueryParam();
                    AreaService.GetAreaList(city.CityID).then(function (result) {
                        $scope.RegionNow.AreaList = result.data;
                        if (result.data.length > 0) {
                            //$scope.AreaChangeAdd(result.data[0]);
                        }
                    });


                }

                $scope.AreaChangeAdd = function (area) {
                    if (area.AreaID == undefined || area.AreaID == '') {
                        $scope.CurrentRegionAdd.Area = {
                            AreaID: "",
                            AreaName: ""
                        };
                        MakeAddQueryParam();
                        return;
                    }
                    $scope.CurrentRegionAdd.Area = area;
                    MakeAddQueryParam();
                    var param = {
                        CityId: $scope.CurrentRegionAdd.City.CityID,
                        AreaId: $scope.CurrentRegionAdd.Area.AreaID,
                    }
                    SchoolService.GetSchoolListNew(param).then(function (result) {
                        $scope.RegionNow.SchoolList = result.data;
                        //if (result.data.length > 0) {
                        //    $scope.SchoolChangeTransfer(result.data[0]);
                        //}
                    });
                }

                $scope.SchoolChangeAdd = function (school) {
                    $scope.DataTransfer.School = school;
                }


                $scope.OpenAddSchoolDialog = function () {
                    $scope.SelectedSchool = {};

                    $scope.QueryParamsByAdd = {
                        ProvinceName: "",
                        CityName: "",
                        AreaName: "",
                        SearchStr: ""
                    }

                    $scope.SchoolParam = {
                        SchoolID: "",
                        SchoolName: "",
                        Province: "",
                        City: "",
                        Area: "",
                        MarkPrecision: 0.5,
                        RangeInZone: ""
                    }

                    $scope.CurrentRegionAdd = {
                        Province: {
                            ProvinceID: "",
                            ProvinceName: "",
                        },
                        City: {
                            CityID: "",
                            CityName: "",
                        },
                        Area: {
                            AreaID: "",
                            AreaName: "",
                        },
                    }
                    $scope.SchoolAddChoose = {
                        title: "",
                    };
                    $scope.RegionNow = new regionConstruct($scope.Region).Region;
                    console.log($scope.RegionNow);
                    angular.element('#AddSchoolDialog').modal('show');
                }


                $scope.SchoolParam = {
                    SchoolID: "",
                    SchoolName: "",
                    Province: "",
                    City: "",
                    Area: "",
                    MarkPrecision: 0.5,
                    RangeInZone: ""
                }
                $scope.SchoolAddChoose = {
                    title: "",
                };
                $scope.SchoolAdd = function () {
                    $scope.SchoolParam.Province = $scope.CurrentRegionAdd.Province.ProvinceID || "";
                    $scope.SchoolParam.City = $scope.CurrentRegionAdd.City.CityID || "";
                    $scope.SchoolParam.Area = $scope.CurrentRegionAdd.Area.AreaID || "";
                    $scope.SchoolParam.SchoolName = $scope.SchoolAddChoose.title;
                    $scope.SchoolParam.SchoolID = $scope.SchoolAddChoose.originalObject != undefined && $scope.SchoolAddChoose.originalObject != null ? $scope.SchoolAddChoose.originalObject.SchoolID : "";
                    SchoolService.SchoolAdd($scope.SchoolParam).then(function () {
                        $scope.SearchSchool();
                        angular.element('#AddSchoolDialog').modal('hide');
                        toaster.clear("dialog1");
                        toaster.success({
                            body: "添加成功",
                            toasterId: 'dialog1'
                        });
                    }, function (result) {
                        toaster.clear("dialog3");
                        toaster.error({
                            body: result.data.Message,
                            toasterId: 'dialog3'
                        });
                    });
                }

                //帮助方法
                var GetProvinceByID = function (provinceID) {
                    var provice = {
                        ProvinceName: ""
                    };
                    if (angular.isArray($scope.RegionNow.ProvinceList) && $scope.RegionNow.ProvinceList.length > 0) {
                        angular.forEach($scope.RegionNow.ProvinceList, function (item, i) {
                            if (item.ProvinceID == provinceID) {
                                provice = item;
                            }
                        });
                    }
                    return provice;
                }

                var GetCityByID = function (cityID) {
                    var city = {
                        CityName: ""
                    };
                    if (angular.isArray($scope.RegionNow.CityList) && $scope.RegionNow.CityList.length > 0) {
                        angular.forEach($scope.RegionNow.CityList, function (item, i) {
                            if (item.CityID == cityID) {
                                //$scope.CurrentRegionAdd.City = item;
                                city = item;
                            }
                        });
                    }
                    return city;
                }

                var GetAreaID = function (areaID) {
                    var area = {
                        AreaName: ""
                    };
                    if (angular.isArray($scope.RegionNow.AreaList) && $scope.RegionNow.AreaList.length > 0) {
                        angular.forEach($scope.RegionNow.AreaList, function (item, i) {
                            if (item.AreaID == areaID) {
                                //$scope.CurrentRegionAdd.Province = item;
                                area = item;
                            }
                        });
                    }
                    return area;
                }

                //-------修改学校--
                $scope.OpenUpdateSchoolDialog = function (school) {
                    console.log(school);
                    $scope.RegionNow = new regionConstruct($scope.Region).Region;

                    $scope.SchoolParam.SchoolID = school.SchoolID;
                    $scope.SchoolParam.SchoolName = school.SchoolName;
                    $scope.SchoolParam.MarkPrecision = school.MarkPrecision;
                    $scope.SchoolParam.RangeInZone = school.RangeInZone == 0 ? "" : school.RangeInZone;

                    $scope.CurrentRegionAdd.Province = GetProvinceByID(school.ProvinceID);

                    AreaService.GetCityList(school.ProvinceID).then(function (result) {
                        $scope.RegionNow.CityList = result.data;
                        if (result.data.length > 0) {
                            $scope.CurrentRegionAdd.City = GetCityByID(school.CityID);

                            AreaService.GetAreaList(school.CityID).then(function (arearesult) {
                                $scope.RegionNow.AreaList = arearesult.data;
                                $scope.CurrentRegionAdd.Area = GetAreaID(school.AreaID);
                                var param = {
                                    CityId: $scope.CurrentRegionAdd.City.CityID,
                                    AreaId: $scope.CurrentRegionAdd.Area.AreaID,
                                }
                                SchoolService.GetSchoolListNew(param).then(function (result) {
                                    $scope.RegionNow.SchoolList = result.data;
                                });
                            });
                        }
                    });
                    console.log($scope.CurrentRegionAdd);

                    angular.element('#UpdateSchoolDialog').modal('show');
                }

                $scope.SchoolUpdate = function () {
                   
                    $scope.SchoolParam.Province = $scope.CurrentRegionAdd.Province.ProvinceID || "";
                    $scope.SchoolParam.City = $scope.CurrentRegionAdd.City.CityID || "";
                    $scope.SchoolParam.Area = $scope.CurrentRegionAdd.Area.AreaID || "";
                    $scope.SchoolParam.SchoolName = $scope.SchoolParam.SchoolName || "";

                    SchoolService.SchoolUpdate($scope.SchoolParam).then(function () {
                        $scope.SearchSchool();
                        angular.element('#UpdateSchoolDialog').modal('hide');
                        toaster.clear("dialog1");
                        toaster.success({
                            body: "修改成功",
                            toasterId: 'dialog1'
                        });
                    }, function (result) {
                        toaster.clear("dialog2");
                        toaster.error({
                            body: result.data.Message,
                            toasterId: 'dialog2'
                        });
                    });
                }


                //---管理员窗口

                $scope.ManagerParam = {
                    Email: "",
                    PassWord: "",
                    PackageCode: "",
                };

                $scope.OpenManagerAddDialog = function (school) {
                    school.IsReset = false;
                    $scope.OpenManagerSetDialog(school);
                }

                $scope.OpenManagerSetDialog = function (school) {
                    toaster.clear("dialog5");
                    toaster.clear('dialog1');
                    $("#showpwd_ma_Pwd").attr("checked", 'false');
                    $("#showpwd_ma_Pwd").attr("src", "http://cdn.uukaola.com/web/img/login/eyeunselect.png");
                    angular.element("[name='ma_Pwd'").show();
                    angular.element("[name='ma_PwdShow'").hide();
                    angular.element("[name='ma_Pwd'").val("");
                    angular.element("[name='ma_PwdShow'").val("");
                    $scope.ManagerParam = {
                        SchoolID: school.SchoolID,
                        Email: "",
                        PassWord: "",
                        PackageCode: "",
                        IsReset: school.IsReset,
                    };

                    $scope.ErrorFor = {
                        EmailError: 0,
                        PwdError: 0,
                        ContentSNum: 0,
                    };

                    SchoolService.GetActivePLCodeBySchoolID(school.SchoolID).then(function (result) {
                        console.log(result);
                        $scope.ManagerParam.PackageCode = result.data.PackageCode;
                    });

                    angular.element('#ManagerSetDialog').modal('show');
                }

                $scope.ErrorFor = {
                    EmailError: 0,
                    PwdError: 0,
                    ContentSNum: 0,
                };

                $scope.SchoolManagerAdd = function () {            
                    console.log($scope.ManagerParam);
                    toaster.clear("dialog5");
                    toaster.clear('dialog1');
                    SchoolService.ManagerSet($scope.ManagerParam).then(function (result) {
                        console.log(result);
                        if (result.data.errorno == 0) {
                            $scope.ErrorFor = {
                                EmailError: 1,
                                PwdError: 0,
                                ContentSNum: 0,
                            };
                            $scope.SearchSchool();
                            angular.element('#ManagerSetDialog').modal('hide');
                            toaster.success({
                                body: "设置成功",
                                toasterId: 'dialog1'
                            });
                        } else {
                            switch (result.data.errorno) {
                                case 2:
                                    $scope.ErrorFor = {
                                        EmailError: 1,
                                        PwdError: 0,
                                        ContentSNum: 0,
                                    };
                                    break;
                                case 3:
                                    $scope.ErrorFor = {
                                        EmailError: 0,
                                        PwdError: 1,
                                        ContentSNum: 0,
                                    };
                                    break;
                                case 4:
                                    $scope.ErrorFor = {
                                        EmailError: 0,
                                        PwdError: 0,
                                        ContentSNum: 1,
                                    };
                                    break;

                                default:
                                    $scope.ErrorFor = {
                                        EmailError: 0,
                                        PwdError: 0,
                                        ContentSNum: 0,
                                    };
                                    break;
                            }

                            toaster.error({
                                body: result.data.error,
                                toasterId: 'dialog5'
                            });
                        }
                    }, function (result) {
                        toaster.error({
                            body: result.data.Message,
                            toasterId: 'dialog5'
                        });
                    });

                }

                $scope.ChoosedSchool = {};

                $scope.ManagerResetParam = {
                    PassWord: "",
                };
                $scope.OpenManagerDialog = function (school) {
                    console.log(school);
                    $scope.ManagerResetParam = {
                        PassWord: "",
                    };
                    $scope.ChoosedSchool = school;

                    $scope.IsShowPwd = false;
                    $scope.PwdMsg = '';
                    angular.element('#ManagerReSetDialog').modal('show');
                }

                $scope.ResetManage = function () {
                    angular.element('#ManagerReSetDialog').modal('hide');
                    $scope.ChoosedSchool.IsReset = true;
                    $scope.OpenManagerSetDialog($scope.ChoosedSchool);
                }

                $scope.IsShowPwd = false;
                $scope.ShowPwd = function () {
                    $scope.IsShowPwd = true;
                }
                $scope.NotUpdaePwd = function () {
                    $scope.ManagerResetParam.PassWord = '';
                    $scope.PwdMsg = '';
                    $scope.IsShowPwd = false;
                }

                $scope.ResetPwd = function () {
                    var userID = $scope.ChoosedSchool.UserID;
                    var pwd = $scope.ManagerResetParam.PassWord;
                    SchoolService.ResetPwd(userID, pwd).then(function (result) {
                        toaster.clear('dialog6');
                        toaster.success({
                            body: "密码重置成功",
                            toasterId: 'dialog6'
                        });
                    }, function (error) {
                        toaster.clear('dialog6');
                        toaster.error({
                            body: error.data.Message,
                            toasterId: 'dialog6'
                        });
                    });
                }


                //-----查看

                var LoadContenPackage = function () {
                    $scope.ContentPackageList = new NgTableParams({
                        count: 10
                    }, {
                        counts: [10, 20, 30, 50],
                        getData: function (params) {
                            //console.log(params.parameters());
                            $scope.DetailQuery.ContentPackageReq.PostParam = params.parameters();
                            return SchoolService.GetContentPackageList($scope.DetailQuery.ContentPackageReq).then(function (results) {
                                //console.log(results);
                                params.total(results.data.Count);
                                return results.data.ContentPackageList;
                            });
                        }
                    });

                }

                var LoadSchoolDog = function () {
                    $scope.SchoolDogList = new NgTableParams({
                        count: 10
                    }, {
                        counts: [10, 20, 30, 50],
                        getData: function (params) {
                            //console.log(params.parameters());
                            $scope.DetailQuery.SchoolDogReq.PostParam = params.parameters();
                            return SchoolService.GetSchoolDongleList($scope.DetailQuery.SchoolDogReq).then(function (results) {
                                //console.log(results);
                                params.total(results.data.Count);
                                return results.data.SchoolDongleList;
                            });
                        }
                    });

                }

                var LoadSchoolPaper = function () {
                    $scope.SchoolPaperList = new NgTableParams({
                        count: 10
                    }, {
                        counts: [10, 20, 30, 50],
                        getData: function (params) {
                            //console.log(params.parameters());
                            $scope.DetailQuery.SchoolPaperReq.PostParam = params.parameters();
                            return SchoolService.GetSchoolPaperleList($scope.DetailQuery.SchoolPaperReq).then(function (results) {
                                //console.log(results);
                                params.total(results.data.Count);
                                return results.data.SchoolPaperList;
                            });
                        }
                    });

                }


                $scope.DetailQuery = {
                    ContentPackageReq: {
                        SchoolID: "",
                    },
                    SchoolDogReq: {
                        SchoolID: "",
                    },
                    SchoolPaperReq: {
                        SchoolID: "",
                    }

                }


                $scope.ActiveChannelName = "";
                $scope.OpenSchoolDetailDialog = function (school) {
                    $scope.CurrentTabIndex = 1;
                    $scope.ActiveChannelName = "";
                    console.log(school);
                    $scope.ChoosedSchool = school;
                    $scope.DetailQuery.ContentPackageReq.SchoolID = school.SchoolID;
                    $scope.DetailQuery.SchoolDogReq.SchoolID = school.SchoolID;
                    $scope.DetailQuery.SchoolPaperReq.SchoolID = school.SchoolID;
                    LoadContenPackage();
                    LoadSchoolDog();
                    LoadSchoolPaper();
                    SchoolService.GetChannelBBusiness(school.SchoolID).then(function (result) {
                        console.log(result);
                        $scope.ActiveChannelName = result.data.BusinessName;
                    });

                    angular.element('#SchoolDetailDialog').modal('show');
                }

                $scope.CurrentTabIndex = 1;
                $scope.TabChange = function (step) {
                    $scope.CurrentTabIndex = step;
                }

                //邮箱验证
                $scope.CheckEmail = function () {
                    $scope.ErrorFor = {
                        EmailError: 0,
                        PwdError: 0,
                        ContentSNum: 0,
                    };
                    var email = $scope.ManagerParam.Email;
                    if (email == "") {
                        toaster.clear('dialog5');
                        $scope.ErrorFor = {
                            EmailError: 1,
                            PwdError: 0,
                            ContentSNum: 0,
                        };
                        toaster.error({
                            body: "请输入登录邮箱",
                            toasterId: 'dialog5'
                        });
                        return false;
                    }
                    var emailPattern = new RegExp("^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$");

                    if (email == undefined && emailPattern.test(email) == false) {
                        toaster.clear('dialog5');
                        $scope.ErrorFor = {
                            EmailError: 1,
                            PwdError: 0,
                            ContentSNum: 0,
                        };
                        toaster.error({
                            body: "必须符合邮箱格式",
                            toasterId: 'dialog5'
                        });
                        return false;
                    }


                    SchoolService.CheckEmail(email).then(function (result) {
                        if (result.data.errorno == 0) {
                            //success
                        } else {
                            $scope.ErrorFor = {
                                EmailError: 1,
                                PwdError: 0,
                                ContentSNum: 0,
                            };
                            toaster.clear('dialog5');
                            toaster.error({
                                body: result.data.error,
                                toasterId: 'dialog5'
                            });
                        }
                    });

                }

                $scope.ValidPackageCode = function () {
                    var param = $scope.ManagerParam;
                    $scope.ErrorFor = {
                        EmailError: 0,
                        PwdError: 0,
                        ContentSNum: 0,
                    };
                    SchoolService.ValidPackageCode(param).then(function (result) { }, function (result) {
                        toaster.clear('dialog5');
                        $scope.ErrorFor = {
                            EmailError: 0,
                            PwdError: 0,
                            ContentSNum: 1,
                        };
                        toaster.error({
                            body: result.data.Message,
                            toasterId: 'dialog5'
                        });
                    });
                }


                //#region 批量更新学校排名
                $scope.OpenBatchUpdateSchoolRangeZoneDialog = function () {
                    $scope.CurrentPercent = 0;
                    $scope.files = [];
                    $scope.ImportErrorFile = '';
                    $scope.ErrorMessage = '';
                    angular.element('#BatchUpdateSchoolRangeZoneDialog').modal('show');
                }
                $scope.CloseBatchUpdateSchoolRangeZoneDialog = function () {
                    angular.element('#BatchUpdateSchoolRangeZoneDialog').modal('hide');
                }

                $scope.CurrentPercent = 0;
                $scope.files = [];
                $scope.ImportErrorFile = '';
                $scope.ErrorMessage = '';
                $scope.UploadFiles = function (files) {

                    if (!files || files.length <= 0)
                    {
                        $scope.ErrorMessage = "请先选择导入文件！";
                        return;
                    }

                    $scope.CurrentPercent = 0;
                    $scope.LocalImportMessage = "";
                    $scope.ErrorMessage = '';
                    Upload.upload({
                        url: '/api/Business/importSchool',
                        data: {
                            file: files
                        }
                    }).progress(function (evt) {
                        console.log('import percent: ' + parseInt(100.0 * (evt.loaded * 0.99 / evt.total)));
                        $scope.CurrentPercent = parseInt(100.0 * (evt.loaded * 0.99 / evt.total));
                    }).success(function (data, status, headers, config) {
                        console.log('success, response data:', data);
                        if (data.success) {
                            $scope.CloseBatchUpdateSchoolRangeZoneDialog();
                            $scope.CurrentPercent = 0;
                            $scope.SearchSchool();
                        }
                        else {
                            if (data.errorno == 3)
                            {
                                $scope.ErrorMessage = data.error;
                            } else {
                                $scope.ImportErrorFile = data.error;
                            }
                           
                        }

                    }).error(function (data, status, headers, config) {
                        console.log('error');
                        console.log(data.Message);
                        $scope.LocalImportMessage = data.Message;
                        $scope.CurrentPercent = 0;
                    }).then(function (response) {
                        console.log('final');
                    });
                }
                //#endregion

            }
        ])

        /*
         * Services
         */
        .service('SchoolService', function ($http, Constants) {
            var serviceBase = Constants.apiServiceBaseUri;
            var self = this;

            self.GetSchoolList = function (param) {
                return $http.post(serviceBase + 'api/business/schoolList', param);
            }
            self.GetSchoolListByRegion = function (param) {
                return $http.post(serviceBase + 'api/business/schoolListByRegion', param);
            }

            self.DelSchool = function (schoolID) {
                return $http.get(serviceBase + 'api/business/delschool/' + schoolID);
            }

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


            self.GetProvinceById = function (provinceid) {
                return $http.get(serviceBase + 'api/business/provice', {
                    ProvinceID: provinceid
                });
            }

            self.GetCityById = function (cityid) {
                return $http.post(serviceBase + 'api/business/city', {
                    CityID: cityid
                });
            }

            self.GetAreaById = function (areaid) {
                return $http.post(serviceBase + 'api/business/area', {
                    AreaID: areaid
                });
            }

            self.GetSchoolListNew = function (params) {
                return $http.post(serviceBase + 'api/dongle/schooList2', params);
            }


            self.SchoolAdd = function (addParam) {
                return $http.post(serviceBase + 'api/business/addSchool', addParam);
            }

            self.SchoolUpdate = function (updateParam) {
                return $http.post(serviceBase + 'api/business/updateSchool', updateParam);
            }

            self.ManagerSet = function (managerParam) {
                return $http.post(serviceBase + 'api/business/managerSet', managerParam);
            }

            self.GetActivePLCodeBySchoolID = function (schoolID) {
                return $http.get(serviceBase + 'api/business/activePackageCodeBySchool/' + schoolID);
            }

            self.ResetPwd = function (userID, pwd) {
                return $http.post(serviceBase + 'api/account/resetBusinessPwd', {
                    UserID: userID,
                    NewPwd: pwd
                });
            }


            self.GetContentPackageList = function (param) {
                return $http.post(serviceBase + 'api/business/contentPackage', param);
            }
            self.GetSchoolDongleList = function (param) {
                return $http.post(serviceBase + 'api/business/schoolDongle', param);
            }
            self.GetSchoolPaperleList = function (param) {
                return $http.post(serviceBase + 'api/business/schoolPaper', param);
            }
            self.GetChannelBBusiness = function (schoolID) {
                return $http.get(serviceBase + 'api/business/channelBBySchool/' + schoolID);
            }
            self.CheckEmail = function (email) {
                return $http.post(serviceBase + 'api/account/checkEmailForSchoolManagerFromBussiness', {
                    Email: email
                });
            };

            self.ValidPackageCode = function (param) {
                return $http.post(serviceBase + 'api/business/validPackageCode', param);
            };

            self.DataTransfer = function (param) {
                return $http.post(serviceBase + 'api/business/transferschoolinformation', param);
            }

        });

    /*
     * Directives
     */

    /*
     * Filters
     */
});