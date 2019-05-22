define(['angular'], function (angular) {
    'use strict';

    angular.module('PaperPackage', ['ui.router'])
        .config([
            '$stateProvider', function ($stateProvider) {
                $stateProvider
                    .state('paperpackage',
                    {
                        url: "/PaperManagement/paperpackage",
                        views: {
                            'mainChildView': {
                                templateUrl:  "business/PaperManagement/paperpackage.html",
                                controller: 'PaperPackageCtrl'
                            }
                        }
                    });
            }
        ])
        /*
        * Controllers
        */
        .controller('PaperPackageCtrl',
        [
            '$scope', 'AuthService', 'Constants', 'NgTableParams', 'PaperPackageService', 'toaster', '$rootScope',
            'AreaService', '$state', 'Upload', 'UserService', 'ngTableEventsChannel','Audio',
            function ($scope, AuthService, Constants, NgTableParams, PaperPackageService, toaster, $rootScope, AreaService, $state, Upload, UserService, ngTableEventsChannel, Audio) {
                Array.prototype.indexOf = function (val) {
                    for (var i = 0; i < this.length; i++) {
                        if (this[i] == val) return i;
                    }
                    return -1;
                };

                Array.prototype.remove = function (val) {
                    var index = this.indexOf(val);
                    if (index > -1) {
                        this.splice(index, 1);
                    }
                };

                var authData = AuthService.AuthData();
                $scope.isAdmin = authData.userRole.indexOf(1) > -1;
                $scope.selectPaperId = [];


                $scope.QueryParams = {
                    PackageName: '',
                    ContentProviderID: '',
                };
                $scope.SearchPackage = function () {
                    $scope.QueryParams.ContentProviderID = $scope.Filter.CurrentContentProvider.ContentProviderID;
                    $scope.PackageList.parameters().page = 1;
                    $scope.PackageList.reload();
                }

                $scope.PackageList = new NgTableParams({ count: 10 },
                {

                    counts: [10, 20, 30, 50],
                    getData: function (params) {
                        //console.log(params.parameters());

                        $scope.QueryParams.PostParam = params.parameters();
                        return PaperPackageService.GetPackageList($scope.QueryParams)
                            .then(function (results) {
                                //console.log(results);
                                params.total(results.data.Count);
                                return results.data.PaperPackageViewList;
                            });
                    }
                });

                $scope.GradeList = [{ Key: '-1', Name: '请选择' }];;
                $scope.ProvinceList = [{ ProvinceID: '-1', ProvinceName: '请选择' }];
                $scope.LevelList = [{ Key: '-1', DisplayMember: '请选择' }];
                $scope.YearList = [{ Key: '-1', DisplayMember: '请选择' }];
                $scope.PaperPackageTypeList = [{ Value: "-1", Text: "请选择" }];
                $scope.ContentProviderList = [{ ContentProviderID: '', ContentProviderName: '请选择' }];
                $scope.SearchContentProviderList = [{ ContentProviderID: '', ContentProviderName: '请选择' }];
                $scope.CurrentPercent = "";
                $scope.UpdatePaperPackageModel = { PaperPackageName: '', RenamePaperPackageName: '', PaperPackageId: '' };
                $scope.AddPackagePaperListFilter = {
                    Province: 0,
                    Year: 0,
                    Grade: 0,
                    Level: 0,
                    ContentProviderID: '',
                    PaperName:''

                }
                $scope.updatePaperPackageValidateMessage = '';

                UserService.GetContentProvider().then(function (result) {
                    if (angular.isArray(result.data) && result.data.length > 0) {
                        angular.forEach(result.data, function (item, i) {
                            $scope.ContentProviderList.push(item);
                            $scope.SearchContentProviderList.push(item);
                        });
                    }

                });

                $scope.Filter = {
                    CurrentContentProvider: $scope.ContentProviderList[0]
                };

                $scope.OpenAddPackage = function () {
                    $scope.addPaperPackageValidateMessage = '';
                    $scope.selectPaperId = [];
                    $scope.InitialPaperListFilter();
                    $scope.SelectAllPaperCount = 0;
                    $scope.SelectAllPaperTag = false;
                    $scope.GradeList = [{ Key: '-1', Name: '请选择' }];;
                    $scope.ProvinceList = [{ ProvinceID: '-1', ProvinceName: '请选择' }];
                    $scope.LevelList = [{ Key: '-1', DisplayMember: '请选择' }];
                    $scope.YearList = [{ Key: '-1', DisplayMember: '请选择' }];

                    //$scope.PaperPackageTypeList = [{ Value: "-1", Text: "请选择" }];

                    AreaService.GetProvinceList()
                  .then(function (result) {
                      if (angular.isArray(result.data) && result.data.length > 0) {
                          angular.forEach(result.data,
                              function (item, i) {
                                  $scope.ProvinceList.push(item);
                              });
                      }
                  });
                    angular.forEach(Constants.gradeItems,
                        function (item, i) {
                            $scope.GradeList.push(item);
                        });
                    PaperPackageService.GetPaperPackageTypeList()
                        .then(function (result) {
                            $scope.PaperPackageTypeList = result.data;
                            $scope.PaperPackageTypeList.splice(0, 0, { Value: "-1", Text: "请选择" });
                        });
                    PaperPackageService.GetLevelList()
                        .then(function (result) {
                            if (angular.isArray(result.data) && result.data.length > 0) {
                                angular.forEach(result.data,
                                    function (item, i) {
                                        $scope.LevelList.push(item);
                                    });
                            }
                        });

                    PaperPackageService.GetYearList()
                      .then(function (result) {
                          if (angular.isArray(result.data) && result.data.length > 0) {
                              angular.forEach(result.data,
                                  function (item, i) {
                                      $scope.YearList.push(item);
                                  });
                          }
                      });


                    $scope.AddPackage = {
                        PaperList: new NgTableParams({ count: 10, tableName: 'packageTable' },
                          {
                              counts: [10, 20, 30, 50],
                              getData: function (params) {
                                  $scope.AddPackagePaperListFilter.PostParam = params.parameters();
                                  return PaperPackageService.GetPaperList($scope.AddPackagePaperListFilter)
                                      .then(function (results) {
                                          params.total(results.data.Count);
                                          return results.data.PaperViewList;
                                      });
                              }
                          }),
                        CurrentGrade: $scope.GradeList[0],
                        CurrentProvince: $scope.ProvinceList[0],
                        CurrentYear: $scope.YearList[0],
                        CurrentLevel: $scope.LevelList[0],
                        SearchContentProvider: $scope.SearchContentProviderList[0],                       
                        PaperPackageName: '',
                        RenamePaperName:'',
                        CurrentPaperPackageType: $scope.PaperPackageTypeList[0]
                    };
                    ngTableEventsChannel.onPagesChanged(function (f, m) {

                        if (f.parameters().tableName == 'packageTable') {
                            $scope.SelectAllPaperCount = 0;
                            $scope.SelectAllPaperTag = false;
                            angular.forEach(f.data, function (item, index, data) {
                                if ($scope.selectPaperId.indexOf(item.PaperID) > -1) {

                                    $scope.SelectAllPaperCount++;
                                }

                            });

                            if ($scope.SelectAllPaperCount == f.data.length) {
                                $scope.SelectAllPaperTag = true;
                            }
                        }
                    }, $scope);
                    angular.element('#AddPaperPckageDialog').modal('show');
                }


                $scope.SavePaperPackage = function () {

                    var params = {
                        PaperList: $scope.AddPackage.PaperList.data,
                        SelectPaperId: $scope.selectPaperId,
                        PaperPackageType: $scope.AddPackage.CurrentPaperPackageType.Value,
                        PaperPackageName: $scope.AddPackage.PaperPackageName,
                        RenamePaperName: $scope.AddPackage.RenamePaperName
                    };
                    PaperPackageService.AddPackage(params)
                        .then(function (result) {
                            $scope.SearchPackage();
                            angular.element('#AddPaperPckageDialog').modal('hide');

                        },
                            function (error) {
                                $scope.addPaperPackageValidateMessage = error.data.Message;
                            });
                }

                $scope.InitialPaperListFilter = function () {
                    $scope.AddPackagePaperListFilter = {
                        Province: 0,
                        Year: 0,
                        Grade: 0,
                        Level: 0,
                        ContentProviderID: ''
                    }
                };

                $scope.CancelPaperPackage = function () {
                    angular.element('#AddPaperPckageDialog').modal('hide');
                }

                $scope.ProvinceChange = function (province) {
                    $scope.AddPackage.CurrentProvince = province;
                    $scope.AddPackagePaperListFilter.Province = province.ProvinceID;

                    $scope.AddPackage.PaperList.parameters().page = 1;
                    $scope.AddPackage.PaperList.reload();
                }


                $scope.YearChange = function (year) {

                    $scope.AddPackage.CurrentYear = year;
                    $scope.AddPackagePaperListFilter.Year = year.Key;
                    $scope.AddPackage.PaperList.parameters().page = 1;
                    $scope.AddPackage.PaperList.reload();
                }

                $scope.GradeChange = function (grade) {
                    $scope.AddPackage.CurrentGrade = grade;
                    $scope.AddPackagePaperListFilter.Grade = grade.Grade;
                    $scope.AddPackage.PaperList.parameters().page = 1;
                    $scope.AddPackage.PaperList.reload();
                }

                $scope.LevelChange = function (level) {
                    $scope.AddPackage.CurrentLevel = level;
                    $scope.AddPackagePaperListFilter.Level = level.Key;
                    $scope.AddPackage.PaperList.parameters().page = 1;
                    $scope.AddPackage.PaperList.reload();
                }


                $scope.ContentProviderChange = function (contentProvider) {
                    $scope.AddPackage.SearchContentProvider = contentProvider;
                    $scope.AddPackagePaperListFilter.ContentProviderID = contentProvider.ContentProviderID;
                    $scope.AddPackage.PaperList.parameters().page = 1;
                    $scope.AddPackage.PaperList.reload();
                }
                $scope.SearchPaperForAddPackage = function ()
                {
                    $scope.AddPackage.PaperList.parameters().page = 1;
                    $scope.AddPackage.PaperList.reload();
                }
                //试卷包详情
                $scope.CurrentTabIndex = 1;
                $scope.TabChange = function (step) {
                    $scope.CurrentTabIndex = step;
                }


                $scope.OpenPaperPackageDetail = function (packageObj) {
                    
                    $scope.CurrentTabIndex = 1;
                    $scope.PaperPackageDetail = {
                        PaperPackageName: packageObj.PaperPackageName,
                        PaperPackageTypeDes: packageObj.PaperPackageTypeDes,
                        ContentProviderName: packageObj.ContentProviderName,
                        PaperList: new NgTableParams({ count: 10 },
                        {
                            counts: [10],
                            getData: function (params) {
                                var param = {
                                    PostParam: params.parameters(),
                                    PaperPackageID: packageObj.PaperPackageID
                                }
                                return PaperPackageService.GetPackagePagerList(param)
                                    .then(function (results) {
                                        params.total(results.data.Count);
                                        return results.data.PaperViewList;
                                    });
                            }
                        }),
                        ContentList: new NgTableParams({ count: 10 },
                        {
                            counts: [10],
                            getData: function (params) {
                                var param = {
                                    PostParam: params.parameters(),
                                    PaperPackageID: packageObj.PaperPackageID
                                }
                                return PaperPackageService.GetPackageContentList(param).then(function (results) {
                                    params.total(results.data.Count);
                                    return results.data.PackageListModelViewList;
                                });
                            }
                        })
                    }

                    angular.element("#PaperPackageDetailDialog").modal('show');
                }

                $scope.SelectAllPaperTag = false;
                $scope.SelectAllPaperCount = 0;
                $scope.SelectAllPaper = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllPaperTag = $scope.SelectAllPaperTag ? false : true;

                    $scope.SelectAllPaperCount = $scope
                        .SelectAll($scope.AddPackage.PaperList.data, $scope.SelectAllPaperTag);
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
                            if (newValue == 1 && $scope.selectPaperId.indexOf(data[i].PaperID) == -1) {

                                $scope.selectPaperId.push(data[i].PaperID);
                            } else if (newValue == 0 && $scope.selectPaperId.indexOf(data[i].PaperID) > -1) {
                                $scope.selectPaperId.remove(data[i].PaperID);
                            }
                        }
                        console.log($scope.selectPaperId);
                        console.log($scope.AddPackage.PaperList.data);
                    }
                    return selectCount;
                }

                $scope.SelectPaper = function ($event, paper) {

                    var checkBox = $event.target;
                    if (paper.Selected == 0) {
                        $scope.SelectAllPaperCount++;
                        $scope.selectPaperId.push(checkBox.id);
                    } else {
                        $scope.SelectAllPaperCount--;
                        $scope.selectPaperId.remove(checkBox.id);
                    }
                    if ($scope.SelectAllPaperCount == $scope.AddPackage.PaperList.data.length) {
                        $scope.SelectAllPaperTag = true;
                    } else {
                        $scope.SelectAllPaperTag = false;
                    }
                    paper.Selected = paper.Selected == 1 ? 0 : 1;
                }

                $scope.isSelected = function (paper) {
                    var index = $scope.selectPaperId.indexOf(paper.PaperID);
                    if (index > -1) {
                        paper.Selected = 1;
                    }
                    return index > -1;
                }

                $scope.CurrentPaper = "";
                $scope.PreviewPaperDetail = function (paperID) {
                    PaperPackageService.GetPaperDetail(paperID)
                        .then(function (result) {
                            $scope.CurrentPaper = result.data;

                            angular.element('#PreviewPaperDetailDialog').on('hidden.bs.modal', function () {
                                console.log("hidden.bs.modal");
                                Audio.stop();
                                $rootScope.AudioPlayingItemID = '';
                            });
                            angular.element("#PreviewPaperDetailDialog").modal("show");
                        });
                }

                $scope.DeletePaperPackage = function ()
                {
                    PaperPackageService.DeletePaperPackage($scope.ChoosedPaperPackageId).then(function () {
                        $scope.PackageList.parameters().page = 1;
                        $scope.PackageList.reload();
                    });
                }

                $scope.OpeDeletePaperPackageDialog = function (paperPackageId) {
                    var tr = jQuery("#" + paperPackageId);
                    tr.addClass("delete-background");
                    $scope.ChoosedPaperPackageId = paperPackageId;
                    $rootScope.openCommonModalDialog("删除", "您确定要删除此试卷包吗？", $scope.DeletePaperPackage, function () {
                        tr.removeClass("delete-background");
                    });
                }

                $scope.OpenUpdatePaperPackageDialog = function (paperPackage)
                {
                    $scope.updatePaperPackageValidateMessage = '';
                    $scope.UpdatePaperPackageModel.PaperPackageName = paperPackage.PaperPackageName;
                    $scope.UpdatePaperPackageModel.RenamePaperPackageName = paperPackage.PaperPackageRename;
                    $scope.UpdatePaperPackageModel.PaperPackageId = paperPackage.PaperPackageID;
                    $scope.UpdatePaperPackageModel.ContentProviderID = paperPackage.ContentProviderID;
                    angular.element("#UpdatePaperPackageDialog").modal("show");
                }

                $scope.KeyupSearchPackage = function (e) {
                    var keycode = window.event ? e.keyCode : e.which;
                    if (keycode == 13) {
                        $scope.SearchPackage();
                    }
                }


                $scope.SaveUpdatePaperPackage = function ()
                {

                    if (!$scope.UpdatePaperPackageModel.PaperPackageName)
                    {
                        $scope.updatePaperPackageValidateMessage = '请输入试卷包名称';
                        return;
                    }

                    //if (!$scope.UpdatePaperPackageModel.RenamePaperPackageName) {
                    //    $scope.updatePaperPackageValidateMessage = '请输入试卷包重命名';
                    //    return;
                    //}

                    PaperPackageService.UpdatePaperPackage($scope.UpdatePaperPackageModel).then(function () {
                        angular.element("#UpdatePaperPackageDialog").modal("hide");
                        $scope.PackageList.parameters().page = 1;
                        $scope.PackageList.reload();
                    }, function (error) {
                        $scope.updatePaperPackageValidateMessage = error.data.Message;
                         });
                      
                }
                function contains(arr, obj) {
                    var i = arr.length;
                    while (i--) {
                        if (arr[i] === obj) {
                            return true;
                        }
                    }
                    return false;
                }

            }

        ])

    /*
    * Services
    */
    .service('PaperPackageService',
            function ($http, Constants) {
                var serviceBase = Constants.apiServiceBaseUri;
                var self = this;

                self.GetPackageList = function (params) {
                    return $http.post(serviceBase + 'api/content/getpaperpackagelist', params);
                }

                self.GetPaperList = function (params) {
                    return $http.post(serviceBase + 'api/paper/getpaperlist', params);
                }

                self.GetLevelList = function () {
                    return $http.post(serviceBase + 'api/paper/getlevellist');
                }

                self.GetYearList = function () {
                    return $http.post(serviceBase + 'api/paper/getyearlist');
                }

                self.AddPackage = function (params) {
                    return $http.post(serviceBase + 'api/content/addpaperpackage', params);
                }

                self.GetPackagePagerList = function (param) {
                    return $http.post(serviceBase + 'api/content/getpackagepagerlist', param);
                }

                self.GetPackageContentList = function (param) {
                    return $http.post(serviceBase + 'api/content/getpackagecontentlist', param);
                }

                self.GetPaperDetail = function (paperID) {
                    return $http.get(serviceBase + 'api/paper/detail/' + paperID);
                }

                self.GetPaperPackageTypeList = function () {
                    return $http.post(serviceBase + 'api/content/getpaperpackagetypelist');
                }

                self.DeletePaperPackage = function (paperpackageid)
                {
                    return $http.get(serviceBase + 'api/content/deletepaperpackage/' + paperpackageid);
                }

                self.UpdatePaperPackage = function (paperpackage)
                {
                    
                    return $http.post(serviceBase + 'api/content/updatepaperpackage', paperpackage);
                }

            });
            /*
            * Services
            */


        /*
        * Filters
        */
  


    /*
    * Filters
    */
});
