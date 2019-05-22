define(['angular', '/web/components/directives/paperpreview_rebuild/paperpreview.js', 'jquery-scrollbar', 'jquery-mousewheel'], function (angular) {
    'use strict';

    angular.module('PaperLibaray', ['ui.router', 'paperPreviewModule'])
        .config([
            '$stateProvider', function ($stateProvider) {
                $stateProvider
                    .state('paperlibaray',
                    {
                        url: "/PaperManagement/paperlibaray",
                        views: {
                            'mainChildView': {
                                templateUrl: "business/PaperManagement/paperlibaray.html",
                                controller: 'PaperLibarayCtrl'
                            }
                        }
                    });
            }
        ])
        /*
        * Controllers
        */
         .controller('PaperLibarayCtrl', ['$scope', 'AuthService', 'Constants', 'AreaService', 'PaperLibarayService', 'NgTableParams', 'PaperPackageService', '$state', 'UserService', 'Upload', '$rootScope', 'Audio',
             function ($scope, AuthService, Constants, AreaService, PaperLibarayService, NgTableParams, PaperPackageService, $state, UserService, Upload, $rootScope, Audio) {
                 var authData = AuthService.AuthData();
                 $scope.IsSuperAdmin = authData
                    .userRole
                    .indexOf(100) > -1;

                 $scope.ShowReplace = false;
                 $scope.ReplaceData = [];
                 $scope.OldPaperData = [];
                 $scope.ReplaceResult = {};
                 $scope.NewReplacePaperID = '';
                 $scope.OldReplacePaperID = '';
                 $scope.ChoosedPaperId = '';
                 $scope.isAdmin = authData.userRole.indexOf(1) > -1;
                 $scope.QueryParams = {
                     ContentProviderId: '',
                     Grade: '',
                     Province: '',
                     Year: '',
                     Level: '',
                     PaperName: ''
                 };
                 $scope.GradeList = [{ Grade: '-1', Name: '请选择' }];;
                 $scope.ProvinceList = [];
                 $scope.ContentProviderList = [{ ContentProviderID: '', ContentProviderName: '请选择' }];
                 $scope.LevelList = [{ Key: '-1', DisplayMember: '请选择' }];
                 $scope.YearList = [{ Key: '-1', DisplayMember: '请选择' }];
                 $scope.ContentProviderListImport = [{ ContentProviderID: '', ContentProviderName: '请选择' }];
                 AreaService.GetProvinceList()
                     .then(function (result) {
                         if (angular.isArray(result.data) && result.data.length > 0) {
                             angular.forEach(result.data,
                                 function (item, i) {
                                     $scope.ProvinceList.push(item);
                                 });
                         }
                         $scope.Filter.CurrentProvince = $scope.ProvinceList[0];


                     });
                 angular.forEach(Constants.gradeItems,
                     function (item, i) {
                         $scope.GradeList.push(item);
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

                 UserService.GetContentProvider().then(function (result) {

                     if (angular.isArray(result.data) && result.data.length > 0) {
                         angular.forEach(result.data, function (item, i) {
                             $scope.ContentProviderList.push(item);
                             $scope.ContentProviderListImport.push(item);
                         });

                     }


                 });

                 $scope.Filter = {
                     CurrentGrade: $scope.GradeList[0],
                     //CurrentProvince: $scope.ProvinceList[0],
                     CurrentYear: $scope.YearList[0],
                     CurrentLevel: $scope.LevelList[0],
                     CurrentContentProvider: $scope.ContentProviderList[0]
                 };


                 $scope.FilterImport = {
                     CurrentContentProviderImport: $scope.ContentProviderListImport[0]
                 };
                 $scope.PaperList = new NgTableParams({ count: 10 }, {
                     counts: [10, 20, 30, 50],
                     getData: function (params) {
                         //console.log(params.parameters());
                         $scope.QueryParams.PostParam = params.parameters();
                         return PaperLibarayService.GetPaperList($scope.QueryParams).then(function (results) {
                             //console.log(results);
                             params.total(results.data.Count);
                             return results.data.PaperViewList;
                         });
                     }
                 });
                 $scope.SearchPaperList = function () {
                     $scope.QueryParams.ContentProviderID = $scope.Filter.CurrentContentProvider.ContentProviderID;
                     $scope.QueryParams.Grade = $scope.Filter.CurrentGrade.Grade;
                     $scope.QueryParams.Province = $scope.Filter.CurrentProvince.ProvinceID;
                     $scope.QueryParams.Year = $scope.Filter.CurrentYear.Key;
                     $scope.QueryParams.Level = $scope.Filter.CurrentLevel.Key;
                     $scope.PaperList.parameters().page = 1;
                     $scope.PaperList.reload();
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

                 $scope.OpenDeletePaperDialog = function (paperId) {
                     var tr = jQuery("#" + paperId);
                     tr.addClass("delete-background");
                     $scope.ChoosedPaperId = paperId;
                     $rootScope.openCommonModalDialog("删除", "您确定要删除此试卷吗？", $scope.DeletePaper, function () {
                         tr.removeClass("delete-background");
                     });
                 }

                 $scope.DeletePaper = function () {
                     PaperLibarayService.DeletePaper($scope.ChoosedPaperId).then(function () {
                         $scope.PaperList.parameters().page = 1;
                         $scope.PaperList.reload();
                     });
                 }



                 //Start LocalImport
                 $scope.ImportNewPaperDialog = function (isImport, showReplace) {
                     $scope.ShowReplace = showReplace;
                     if (isImport) {
                         $scope.reImportPaperId = '';
                     }
                     $scope.files = []; //文件数组 
                     $scope.LocalImportMessage = '';

                     $scope.OpenLocalImportDialog();
                 }

                 $scope.OpenLocalImportDialog = function () {
                     $scope.CurrentPercent = 0
                     $scope.LocalImportMessage = "";
                     angular.element('#ImportNewPaperDialog').modal('show');
                 }
                 $scope.CloseLocalImportDialog = function () {
                     angular.element('#ImportNewPaperDialog').modal('hide');
                 }
                 $scope.LocalImportMessage = "";


                 $scope.OpenReimportDialog = function (reImportPaperId) {
                     $scope.ShowReplace = false;
                     $scope.reImportPaperId = reImportPaperId;
                     $rootScope.openCommonModalDialog("重新导入", "重新导入该套试卷，系统将会删除原有试卷，创建一套新试卷，您确定要重新导入吗？", $scope.ImportNewPaperDialog);
                 }

                 $scope.KeyupSearchPaperList = function (e) {
                     var keycode = window.event ? e.keyCode : e.which;
                     if (keycode == 13) {
                         $scope.SearchPaperList();
                     }
                 }
                 $scope.SelectPaper = function (paper) {
                     $scope.NewReplacePaperID = paper.PaperID;
                     PaperLibarayService.GetReplacePaper({ PaperID: paper.PaperID }).then(function (results) {

                         $scope.OldPaperData = results.data;

                     });
                 };
                 $scope.SetOldPaperID = function (paperID) {
                     $scope.OldReplacePaperID = paperID;
                 };
                 $scope.UploadFiles = function (files, reImportPaperId) {

                     if ($scope.isAdmin && $scope.FilterImport.CurrentContentProviderImport.ContentProviderID == '') {
                         $scope.LocalImportMessage = "请选内容商";
                         return;
                     }

                     $scope.CurrentPercent = 0;
                     $scope.LocalImportMessage = "";
                     Upload.upload({
                         url: '/api/paper/import',
                         data: {
                             file: files, PaperId: reImportPaperId,
                             ContentProviderID: $scope.FilterImport.CurrentContentProviderImport.ContentProviderID
                         }
                     }).progress(function (evt) {
                         console.log('import percent: ' + parseInt(100.0 * (evt.loaded * 0.99 / evt.total)));
                         $scope.CurrentPercent = parseInt(100.0 * (evt.loaded * 0.99 / evt.total));
                     }).success(function (data, status, headers, config) {
                         console.log('success');
                         $scope.CloseLocalImportDialog();
                         $scope.CurrentPercent = 0;
                         $scope.PaperList.parameters().page = 1;
                         $scope.PaperList.reload();

                         if ($scope.ShowReplace) {
                             $scope.OldReplacePaperID = '';
                             $scope.NewReplacePaperID = '';
                             $scope.ReplaceResult = {};
                             $scope.ReplaceData = data;
                             angular.element('#replacePaper').modal('show');
                         }
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

                 $scope.AudioRefText = '';
                 $scope.$on('ShowAudioRefText', function (d, data) {
                     console.log(data);
                     $scope.AudioRefText = data;
                     angular.element("#showAudioRefTextDialog").modal('show');
                 });

                 $scope.IsShowError = false;

                 $scope.ShowErrorMsg = function () {
                     $scope.IsShowError = !$scope.IsShowError;
                     //刷新自定义滚动条
                     customScrollbarHelper.refreshScrollbar();
                 }

                 $scope.ReplacePaper = function () {
                     if ($scope.NewReplacePaperID && $scope.OldReplacePaperID) {
                         PaperLibarayService.ReplacePaper({ NewReplacePaperID: $scope.NewReplacePaperID, OldReplacePaperID: $scope.OldReplacePaperID }).then(function (results) {
                             $scope.ReplaceResult = results.data;
                             $scope.CurrentPercent = 0;
                             $scope.PaperList.parameters().page = 1;
                             $scope.PaperList.reload();
                             $scope.OldReplacePaperID = '';
                             PaperLibarayService.GetReplacePaper({ PaperID: $scope.NewReplacePaperID }).then(function (results) {
                                 $scope.OldPaperData = results.data;
                             });
                         });
                     } else {

                         alert("请选择试卷");
                     }
                 };

             }])

    /*
    * Services
    */
    .service('PaperLibarayService',
            function ($http, Constants) {
                var serviceBase = Constants.apiServiceBaseUri;
                var self = this;
                self.GetLevelList = function () {
                    return $http.post(serviceBase + 'api/paper/getlevellist');
                }

                self.GetPaperList = function (params) {
                    return $http.post(serviceBase + 'api/paper/getpaperlist', params);
                }

                self.DeletePaper = function (params) {
                    return $http.get(serviceBase + 'api/paper/delete/' + params);
                }

                self.GetReplacePaper = function (params) {
                    return $http.post(serviceBase + 'api/paper/getreplacepaper', params);
                }
                self.ReplacePaper = function (params) {
                    return $http.post(serviceBase + 'api/paper/replacepaper', params);
                }
            })
});
