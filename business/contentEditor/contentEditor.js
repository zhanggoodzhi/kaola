define(['angular'], function (angular) {
    'use strict';

    angular.module('ContentEditor', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('contentEditor',
                {
                    url: "/contentEditor",
                    views: {
                        'mainChildView': {
                            templateUrl:  "business/contentEditor/contentEditor.html",
                            controller: 'ContentEditorCtrl'
                        }
                    }
                })
                .state('contentEditorAdd',
                {
                    url: "/contentEditor/contentEditorAdd",
                    views: {
                        'mainChildView': {
                            templateUrl:  "business/contentEditor/contentEditorAdd.html",
                            controller: 'ContentEditorAddCtrl'
                        }
                    }
                })
                .state('contentEditorEdit',
                {
                    url: "/user/contentEditorEdit",
                    views: {
                        'mainChildView': {
                            templateUrl:  "business/contentEditor/contentEditorEdit.html",
                            controller: 'ContentEditorEditCtrl'
                        }
                    },
                    params: {
                        UserID: ""
                    }
                });
    }])
    /*
    * Controllers
    */
    .controller('ContentEditorCtrl', ['$scope', 'AuthService', 'Constants', '$state', 'ContentEditorService', 'NgTableParams', 'toaster', '$rootScope','UserService',
        function ($scope, AuthService, Constants, $state, ContentEditorService, NgTableParams, toaster, $rootScope,UserService) {
            $scope.QueryParams = {
                PostParam: '',
                ContentProviderId:''
            }
            $scope.ContentProviderList = [{ ContentProviderID: '', ContentProviderName: '请选择' }];
            UserService.GetContentProvider().then(function (result) {

                if (angular.isArray(result.data) && result.data.length > 0) {
                    angular.forEach(result.data, function (item, i) {
                        $scope.ContentProviderList.push(item);
                    });
                }
            });           
            $scope.Filter = {
                CurrentContentProvider: $scope.ContentProviderList[0],
                AddContentProvider: $scope.ContentProviderList[0],
                EditContentProvider: $scope.ContentProviderList[0]
            };
           
            var authData = AuthService.AuthData();
           
            $scope.isAdmin = authData.userRole.indexOf(1) > -1;
            $scope.addEditorValidateMessage = '';
            $scope.EditorList = new NgTableParams({ count: 9999 },
                   {
                       counts: [10, 20, 30, 50],
                       getData: function (params) {
                           //console.log(params.parameters());
                           $scope.QueryParams.PostParam = params.parameters();
                           return ContentEditorService.GetEditorListResp($scope.QueryParams)
                               .then(function (results) {
                                   return results.data.ContentEditorViewList;
                               });
                       }
                   });

            $scope.SearchEditor = function ()
            {
                $scope.QueryParams.ContentProviderId = $scope.Filter.CurrentContentProvider.ContentProviderID;
                $scope.EditorList.parameters().page = 1;
                $scope.EditorList.reload();
            }
            $scope.RefreshEditorList = function () {
                $scope.EditorList.parameters().page = 1;
                $scope.EditorList.reload();
            }

            $scope.GoEditorAdd = function () {
                $scope.EditorAddParams = {
                    NickName: '',
                    PhoneNumber: '',
                    Password: '',
                    ContentProviderId:''
                }
                if (!$scope.isAdmin)
                {                    
                    ContentEditorService.GetCurrentUserContentProviderID().then(function (result) {
                        if (result.data) {
                            if (angular.isArray($scope.ContentProviderList) && $scope.ContentProviderList.length > 0) {
                                angular.forEach($scope.ContentProviderList, function (item, i) {                                   
                                    if (item.ContentProviderID == result.data.ContentProviderID) {                                       
                                        $scope.Filter.AddContentProvider = item;
                                    }
                                })
                            }
                        }
                    });
                }
                $scope.addEditorValidateMessage = '';
                angular.element('#AddEditorUserDialog').modal('show');
            }

            $scope.GoEditorEdit = function (editor) {
                $scope.editEditorValidateMessage = '';
                $scope.EditorEditParams = {
                    NickName: editor.NickName,
                    PhoneNumber: editor.PhoneNumber,
                    UserID: editor.UserID,
                    ContentProviderID: editor.ContentProviderID,
                    OldContentProviderID:editor.ContentProviderID
                }
      
               
                if (editor.ContentProviderID) {
                    if (angular.isArray($scope.ContentProviderList) && $scope.ContentProviderList.length > 0) {
                        angular.forEach($scope.ContentProviderList, function (item, i) {
                            if (item.ContentProviderID == editor.ContentProviderID) {
                                $scope.Filter.EditContentProvider = item;
                            }
                        })
                    }
                }
           
           
                angular.element('#EditEditorUserDialog').modal('show');
            }

            $scope.OpenEditorPwsResetDialog = function (editor) {
                $scope.EditorPwdResetDialog = {
                    Password: '',
                    UserID: editor.UserID
                }
                angular.element('#EditorPwdResetDialog').modal('show');
            }


            //Delete
            $scope.OpeDeleteEditorDialog = function (editor) {
                
                var tr = jQuery("#" + editor.UserID);
                tr.addClass("delete-background");                
                $scope.editorDelete = editor;
                $rootScope.openCommonModalDialog("删除内容编辑", "你确定要删除该内容编辑么？", $scope.Delete, function () {
                    tr.removeClass("delete-background");
                });
            }

            $scope.Delete = function () {
                ContentEditorService.EditorDelete($scope.editorDelete.UserID)
                    .then(function (result) {
                        toaster.clear("contentEditorList");
                        toaster.success({ body: '删除成功', toasterId: 'contentEditorList' });
                        $scope.RefreshEditorList();
                    }, function (error) {
                        toaster.clear("contentEditorList");
                        toaster.error({ body: "内容编辑删除失败," + error.data.Message, toasterId: 'contentEditorList' });
                    });
            }


            $scope.ResetPwd = function () {
                var params = {
                    Password: $scope.EditorPwdResetDialog.Password,
                    UserID: $scope.EditorPwdResetDialog.UserID
                }
                ContentEditorService.EditorPwdReset(params)
                     .then(function (result) {
                         toaster.clear("contentEditorList");
                         toaster.success({ body: "保存成功", toasterId: "contentEditorList" });
                         $scope.RefreshEditorList();
                         angular.element('#EditorPwdResetDialog').modal('hide');
                     },
                         function (error) {
                             toaster.clear("editorPwdResetDialog");
                             toaster.error({ body: error.data.Message, toasterId: "editorPwdResetDialog" });
                         });
            }
       
          
           

            //新增用户          

            $scope.EditorAdd = function () {
                
                var reg = /^0?1[3|4|5|8|7][0-9]\d{8}$/;
                var valid = reg.test($scope.EditorAddParams.PhoneNumber);
                if (valid == false) {
                    $scope.addEditorValidateMessage = "输入的手机号码有误";
                    return;
                }
                $scope.EditorAddParams.ContentProviderId = $scope.Filter.AddContentProvider.ContentProviderID;
                ContentEditorService.EditorAdd($scope.EditorAddParams)
                      .then(function (result) {
                          $scope.EditorList.parameters().page = 1;
                          $scope.EditorList.reload();
                          angular.element('#AddEditorUserDialog').modal('hide');
                      },
                          function (error) {
                              $scope.addEditorValidateMessage = error.data.Message;
                          });
            }
            $scope.EditAddCancel = function () {
                angular.element('#AddEditorUserDialog').modal('hide');
            }

            //编辑内容编辑

            $scope.CurrentUser = {};  
           

            $scope.EditorEdit = function () {
               
                $scope.EditorEditParams.ContentProviderID = $scope.Filter.EditContentProvider.ContentProviderID;
                var reg = /^0?1[3|4|5|8|7][0-9]\d{8}$/;
                var valid = reg.test($scope.EditorEditParams.PhoneNumber);
                if (valid == false) {
                    $scope.editEditorValidateMessage="输入的手机号码有误";
                    return;
                }
                ContentEditorService.EditorEdit($scope.EditorEditParams)
                    .then(function (result) {
                        angular.element('#EditEditorUserDialog').modal('hide');
                        $scope.EditorList.parameters().page = 1;
                        $scope.EditorList.reload();
                    },
                        function (error) {
                            $scope.editEditorValidateMessage= error.data.Message;
                        });
            };
            $scope.EditorEditCancel = function () {
                angular.element('#EditEditorUserDialog').modal('hide');
            }
        }])       

    /*
    * Services
    */
    .service('ContentEditorService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;

        self.GetEditorListResp = function (params) {
            return $http.post(serviceBase + 'api/business/getEditorListResp', params);
        }

        self.EditorAdd = function (params) {
            return $http.post(serviceBase + 'api/business/editorAdd', params);
        }

        self.EditorEdit = function (params) {
            return $http.post(serviceBase + 'api/business/editorEdit', params);
        }

        self.EditorPwdReset = function (params) {
            return $http.post(serviceBase + 'api/business/editorPwdReset', params);
        }

        self.GetBusinessUserInfo = function (userID) {
            return $http.get(serviceBase + 'api/account/currentBusinessUser/' + userID);
        }

        self.EditorDelete = function (userID) {
            return $http.get(serviceBase + 'api/business/editorDelete/' + userID);
        }

        self.GetCurrentUserContentProviderID = function () {
            return $http.get(serviceBase + 'api/business/getcurrentusercontentproviderid');
        }
    });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
