define(['angular'], function (angular) {
    'use strict';

    angular.module('Content', ['ui.router'])
        .config([
            '$stateProvider', function ($stateProvider) {
                $stateProvider
                    .state('content',
                    {
                        url: "/content",
                        views: {
                            'mainChildView': {
                                templateUrl:  "business/content/content.html",
                                controller: 'ContentCtrl'
                            }
                        }
                    })
                    .state('contentPaper',
                    {
                        url: "/content/paper",
                        views: {
                            'mainChildView': {
                                templateUrl:  "business/content/paper.html",
                                controller: 'ContentPaperCtrl'
                            }
                        }
                    });
            }
        ])
        /*
        * Controllers
        */
        .controller('ContentCtrl',
        [
            '$scope', 'AuthService', 'Constants', 'NgTableParams', 'ContentService', 'toaster', '$rootScope',
            'AreaService', '$state', 'Upload',
            function ($scope,
                AuthService,
                Constants,
                NgTableParams,
                ContentService,
                toaster,
                $rootScope,
                AreaService,
                $state, Upload) {


                $scope.QueryParams = {
                    PackageName: ''
                };
                $scope.SearchPackage = function () {
                    $scope.PackageList.parameters().page = 1;
                    $scope.PackageList.reload();
                }

                $scope.PackageList = new NgTableParams({ count: 20 },
                {
                    counts: [10, 20, 30, 50],
                    getData: function (params) {
                        //console.log(params.parameters());
                        $scope.QueryParams.PostParam = params.parameters();
                        return ContentService.GetPackageList($scope.QueryParams)
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
                $scope.CurrentPercent = "";

                $scope.AddPackagePaperListFilter = {
                    Province: 0,
                    Year: 0,
                    Grade: 0,
                    Level: 0
                }

                $scope.AddPackage = {
                    PaperList: new NgTableParams({ count: 5 },
                    {
                        counts: [5],
                        getData: function (params) {
                            return [];
                        }
                    }),
                    PaperPackageName: '',
                    CurrentGrade: $scope.GradeList[0],
                    CurrentProvince: $scope.ProvinceList[0],
                    CurrentYear: $scope.YearList[0],
                    CurrentLevel: $scope.LevelList[0],
                    CurrentPaperPackageType: $scope.PaperPackageTypeList[0]
                };

                $scope.OpenAddPackage = function () {
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
                    ContentService.GetPaperPackageTypeList()
                        .then(function (result) {
                            $scope.PaperPackageTypeList = result.data;
                            $scope.PaperPackageTypeList.splice(0, 0, { Value: "-1", Text: "请选择" });
                        });
                    ContentService.GetLevelList()
                        .then(function (result) {
                            if (angular.isArray(result.data) && result.data.length > 0) {
                                angular.forEach(result.data,
                                    function (item, i) {
                                        $scope.LevelList.push(item);
                                    });
                            }
                        });

                    ContentService.GetYearList()
                      .then(function (result) {
                          if (angular.isArray(result.data) && result.data.length > 0) {
                              angular.forEach(result.data,
                                  function (item, i) {
                                      $scope.YearList.push(item);
                                  });
                          }
                      });


                    $scope.AddPackage = {
                        PaperList: new NgTableParams({ count: 5 },
                        {
                            counts: [5],
                            getData: function (params) {
                                return ContentService.GetPaperList($scope.AddPackagePaperListFilter)
                                    .then(function (results) {
                                        return results.data.PaperViewList;
                                    });
                            }
                        }),
                        CurrentGrade: $scope.GradeList[0],
                        CurrentProvince: $scope.ProvinceList[0],
                        CurrentYear: $scope.YearList[0],
                        CurrentLevel: $scope.LevelList[0],
                        PaperPackageName: '',
                        CurrentPaperPackageType: $scope.PaperPackageTypeList[0]
                    };
                    angular.element('#AddPaperPckageDialog').modal('show');
                }


                $scope.SavePaperPackage = function () {
                    var params = {
                        PaperList: $scope.AddPackage.PaperList.data,
                        PaperPackageType: $scope.AddPackage.CurrentPaperPackageType.Value,
                        PaperPackageName: $scope.AddPackage.PaperPackageName
                    };
                    ContentService.AddPackage(params)
                        .then(function (result) {
                            $scope.SearchPackage();
                            angular.element('#AddPaperPckageDialog').modal('hide');
                            toaster.clear("addPaperPckageDialog");
                            toaster.success({ body: "添加成功", toasterId: 'addPaperPckageDialog' });
                        },
                            function (error) {
                                toaster.clear("addPaperPckageDialog");
                                toaster.error({ body: error.data.Message, toasterId: 'addPaperPckageDialog' });
                            });
                }

                $scope.CancelPaperPackage = function () {
                    $scope.AddPackagePaperListFilter = {
                        Province: 0,
                        Year: 0,
                        Grade: 0,
                        Level: 0
                    }
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
                        PaperList: new NgTableParams({ count: 10 },
                        {
                            counts: [10],
                            getData: function (params) {
                                var param = {
                                    PostParam: params.parameters(),
                                    PaperPackageID: packageObj.PaperPackageID
                                }
                                return ContentService.GetPackagePagerList(param)
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
                                return ContentService.GetPackageContentList(param).then(function (results) {
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
                        }
                    }
                    return selectCount;
                }

                $scope.SelectPaper = function (selected) {
                    if (selected == 1) {
                        $scope.SelectAllPaperCount--;
                    } else {
                        $scope.SelectAllPaperCount++;
                    }
                    if ($scope.SelectAllPaperCount == $scope.AddPackage.PaperList.data.length) {
                        $scope.SelectAllPaperTag = true;
                    } else {
                        $scope.SelectAllPaperTag = false;
                    }
                }

                $scope.CurrentPaper = "";
                $scope.PreviewPaperDetail = function (paperID) {
                    ContentService.GetPaperDetail(paperID)
                        .then(function (result) {
                            $scope.CurrentPaper = result.data;
                            angular.element("#PreviewPaperDetailDialog").modal("show");
                        });
                }

                $scope.GoToPaperManage = function () {
                    $state.go('contentPaper');
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

                //Start LocalImport
                $scope.ImportNewPaperDialog = function () {
                    $scope.OpenLocalImportDialog();
                }
                $scope.OpenLocalImportDialog = function () {
                    angular.element('#ImportNewPaperDialog').modal('show');
                }
                $scope.CloseLocalImportDialog = function () {
                    angular.element('#ImportNewPaperDialog').modal('hide');
                }
                $scope.LocalImportMessage = "";
                $scope.files = []; //文件数组
                $scope.UploadFiles = function (files) {
                    $scope.CurrentPercent = 0;
                    $scope.LocalImportMessage = "";
                    Upload.upload({
                        url: '/api/paper/import',
                        data: { file: files }
                    }).progress(function (evt) {
                        console.log('import percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        $scope.CurrentPercent = parseInt(100.0 * evt.loaded / evt.total);
                    }).success(function (data, status, headers, config) {
                        console.log('success');
                        $scope.CloseLocalImportDialog();
                        $scope.CurrentPercent = 0;
                    }).error(function (data, status, headers, config) {
                        console.log('error');
                        console.log(data.Message);
                        $scope.LocalImportMessage = data.Message;
                        $scope.CurrentPercent = 0;
                    }).then(function (response) {
                        console.log('final');

                    });
                };
                //End LocalImport
            }
        ])
         .controller('ContentPaperCtrl', ['$scope', 'AuthService', 'Constants', 'AreaService', 'ContentPaperService', 'NgTableParams', 'ContentService', '$state',
             function ($scope, AuthService, Constants, AreaService, ContentPaperService, NgTableParams, ContentService, $state) {
                 $scope.QueryParams = {
                     Grade: '',
                     Province: '',
                     Year: '',
                     Level: '',
                     PaperName: ''
                 };
                 $scope.GradeList = [{ Grade: '-1', Name: '请选择' }];;
                 $scope.ProvinceList = [{ ProvinceID: '-1', ProvinceName: '请选择' }];
                 $scope.LevelList = [{ Key: '-1', DisplayMember: '请选择' }];
                 $scope.YearList = [{ Key: '-1', DisplayMember: '请选择' }];

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

                 ContentService.GetLevelList()
                     .then(function (result) {
                         if (angular.isArray(result.data) && result.data.length > 0) {
                             angular.forEach(result.data,
                                 function (item, i) {
                                     $scope.LevelList.push(item);
                                 });
                         }
                     });

                 ContentService.GetYearList()
                   .then(function (result) {
                       if (angular.isArray(result.data) && result.data.length > 0) {
                           angular.forEach(result.data,
                               function (item, i) {
                                   $scope.YearList.push(item);
                               });
                       }
                   });
                 $scope.Filter = {
                     CurrentGrade: $scope.GradeList[0],
                     CurrentProvince: $scope.ProvinceList[0],
                     CurrentYear: $scope.YearList[0],
                     CurrentLevel: $scope.LevelList[0]
                 };

                 $scope.PaperList = new NgTableParams({ count: 20 }, {
                     counts: [10, 20, 30, 50],
                     getData: function (params) {
                         //console.log(params.parameters());
                         $scope.QueryParams.PostParam = params.parameters();
                         return ContentPaperService.GetPaperList($scope.QueryParams).then(function (results) {
                             //console.log(results);
                             params.total(results.data.Count);
                             return results.data.PaperViewList;
                         });
                     }
                 });
                 $scope.SearchPaperList = function () {
                     $scope.QueryParams.Grade = $scope.Filter.CurrentGrade.Grade;
                     $scope.QueryParams.Province = $scope.Filter.CurrentProvince.ProvinceID;
                     $scope.QueryParams.Year = $scope.Filter.CurrentYear.Key;
                     $scope.QueryParams.Level = $scope.Filter.CurrentLevel.Key;
                     $scope.PaperList.parameters().page = 1;
                     $scope.PaperList.reload();
                 }

                 $scope.CurrentPaper = "";
                 $scope.PreviewPaperDetail = function (paperID) {
                     ContentService.GetPaperDetail(paperID)
                         .then(function (result) {
                             $scope.CurrentPaper = result.data;
                             angular.element("#PreviewPaperDetailDialog").modal("show");
                         });
                 }

             }])

    /*
    * Services
    */
    .service('ContentPaperService',
            function ($http, Constants) {
                var serviceBase = Constants.apiServiceBaseUri;
                var self = this;
                self.GetLevelList = function () {
                    return $http.post(serviceBase + 'api/paper/getlevellist');
                }

                self.GetPaperList = function (params) {
                    return $http.post(serviceBase + 'api/paper/getpaperlist', params);
                }

            })
            /*
            * Services
            */
        .service('ContentService',
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
            })

        .directive('paperPreview1',
        [
            '$log', '$state', 'Audio', function ($log, $state, Audio) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        paper: '=paper'
                    },
                    link: function (scope, element, attrs) {
                        scope.PlayPaperAudio = function (audio) {
                            Audio.play(scope.paper.ResourcePath + audio);
                        };

                        scope.PlayAnswerAudio = function (answer) {
                            Audio.play("/web/answers/" +
                                answer.BatchID +
                                "/" +
                                answer.StudentID +
                                "/" +
                                answer.AnswerContent);
                        };

                        scope.OpenAddTaskDialogFromPreview = function () {
                            $state.go('paper.createtask',
                                { data: { 'dialogElement': 'AddTaskDialog', 'PaperList': [scope.paper.PaperID] } });
                            angular.element('#AddTaskDialog').modal('show');
                            angular.element("#PreviewPackageDetailDialog").modal("hide");
                        }

                        scope.showPaperProperties = function () {
                            var paper = scope.paper;

                            scope.properties = [
                                ['ID', paper.PaperID],
                                ['试卷名称', paper.PaperName],
                                ['试卷标题', paper.PaperTitle],
                                ['试卷类型', paper.PaperType == 1 ? '正式考试' : '模拟考试'],
                                ['背景音', paper.BackgroundAudio],
                                ['资源路径', paper.ResourcePath]
                            ];
                        };

                        scope.showAreaProperties = function (area) {
                            scope.properties = [
                                ['ID', area.AreaID],
                                ['题型标题', area.AreaTitle],
                                ['题型', area.AreaType],
                                ['提示信息', area.Prompt],
                                ['背景音乐', area.BackgroundAudio],
                                ['顺序', area.Index]
                            ];
                        };

                        scope.showQuestionProperties = function (question) {
                            scope.properties = [
                                ['ID', question.QuestionID],
                                ['题目标题', question.QuestionTitle],
                                ['题型', question.QuestionType],
                                ['提示文本', question.Prompt],
                                ['提示信息', question.Tips],
                                ['准备时间', question.PrepareSeconds],
                                ['背景音乐', question.BackgroundAudio],
                                ['背景音乐播放次数', question.BackgroundAudioTimes],
                                ['题目文本', question.Text],
                                ['图片', question.Image],
                                ['音频', question.Audio],
                                ['视频', question.Video],
                                ['播放次数', question.Times],
                                ['顺序', question.Index]
                            ];
                        };

                        scope.showContentProperties = function (content) {
                            scope.properties = [
                                ['ID', content.ContentID],
                                ['题型', content.ContentType],
                                ['提示文本', content.Prompt],
                                ['提示信息', content.Tips],
                                ['准备时间', content.PrepareSeconds],
                                ['答题时间', content.AnswerSeconds],
                                ['等待时间', content.WaitSeconds],
                                ['选择题类型', content.ChooseType == 1 ? '单选' : '多选'],
                                ['资源类型', content.ResourceType],
                                ['选择项排版', content.Layout],
                                ['文本', content.Text],
                                ['图片', content.Image],
                                ['音频', content.Audio],
                                ['视频', content.Video],
                                ['播放次数', content.Times],
                                ['分值', content.Score],
                                ['顺序', content.Index]
                            ];
                        };

                        scope.showOptionProperties = function (option) {
                            scope.properties = [
                                ['ID', option.OptionID],
                                ['选项内容', option.Content],
                                ['顺序', option.Index]
                            ];
                        };

                        scope.showAnswerProperties = function (answer) {
                            scope.properties = [
                                ['ID', answer.AnswerID],
                                ['答案内容', answer.Content],
                                ['答案音频', answer.Audio],
                                ['顺序', answer.Index]
                            ];
                        };
                        scope.showRefrenceTextsProperties = function (ref) {
                            scope.properties = [
                                ['ID', ref.RefTextID],
                                ['参考文本内容', ref.Content],
                                ['顺序', ref.Index]
                            ];
                        };

                    },
                    templateUrl:  '/web/business/template/directive_paper_preview.html'
                }
            }
        ])
        .directive('refText1',
        [
            '$log', function ($log) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        refs: '=refs'
                    },
                    link: function (scope, element, attrs) {
                        scope.currentRef = null;

                        scope.init = function () {
                            if (scope.currentRef == null && scope.refs.length > 0) {
                                scope.currentRef = scope.refs[0];
                            }

                            return  '/web/business/template/directive_ref_text.html';
                        };

                        scope.SelectRef = function (ref) {
                            scope.currentRef = ref;
                            $log.info("selected:", scope.currentRef);
                        };
                    },
                    template: '<div class="nav-refrence" ng-include="init()"></div>'
                }
            }
        ])
        /*
        * Filters
        */
        .filter('option_type1',
            function () {
                return function (option) {
                    var answer_txt = "";
                    if (option == null) {
                        answer_txt = "";
                    } else {
                        switch (option.Index) {
                            case 1:
                                answer_txt = "A--";
                                break;
                            case 2:
                                answer_txt = "B--";
                                break;
                            case 3:
                                answer_txt = "C--";
                                break;
                        }
                    }
                    return answer_txt;
                }
            })
        .filter('paperType1',
            function () {
                return function (paperType) {
                    var paperTypeText = "系统默认";
                    if (paperType == 1) {
                        paperTypeText = "系统默认";
                    }
                    if (paperType == 2) {
                        paperTypeText = "我的试卷";
                    }
                    if (paperType == 3) {
                        paperTypeText = "分享试卷";
                    }
                    return paperTypeText;
                }
            })
        .filter('format_refs1',
            function () {
                return function (refs) {
                    var reftexts = "空";
                    if (angular.isArray(refs)) {
                        reftexts = "";

                        angular.forEach(refs,
                            function (ref) {
                                reftexts += ref.Content + "\r\n";
                            });
                    }

                    return reftexts;
                }
            });


    /*
    * Filters
    */
});
