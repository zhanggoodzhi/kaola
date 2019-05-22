define(['angular'], function (angular) {
    'use strict';

    angular.module('User', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('user', {
            url: "/user",
            views: {
                'mainChildView': {
                    templateUrl:  "business/user/user.html",
                    controller: 'UserCtrl'
                }
            }
        })
            .state('changepassword', {
                url: "/user/changepassword",
                views: {
                    'mainChildView': {
                        templateUrl:  "business/user/changepassword.html",
                        controller: 'ChangePasswordCtrl'
                    },
                }
            })

    }])
    /*
    * Controllers
    */
    .controller('UserCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'UserService', '$state', '$rootScope', 'toaster', function ($scope, AuthService, Constants, NgTableParams, UserService, $state, $rootScope, toaster) {

        $scope.resetPWDValidateMessage =''
        $scope.addUserValidateMessage = '';
        $scope.updateUserValidateMessage = '';
        $scope.BusinessUserList = new NgTableParams({ count: 99999 }, {
            counts: [10, 20, 30, 50],
            getData: function (params) {
                //console.log(params.parameters());
                return UserService.GetBusinessUserList().then(function (results) {
                    //console.log(results);
                    //params.total(results.data.Count);
                    return results.data.BusinessUserList;
                });
            }
        });

        $scope.GoToAddUser = function () {
            $scope.addUserValidateMessage = '';
            $scope.BusniessRoles = [];

            $scope.ContentProvider = [];

            $scope.ChannelBusiness = [];

            UserService.GetBusinessRoles().then(function (result) {
                console.log(result);
                $scope.BusniessRoles = result.data;
            });

            UserService.GetContentProvider().then(function (result) {
                console.log(result);
                $scope.ContentProvider = result.data;
            });


            UserService.GetChannelBusiness().then(function (result) {
                console.log(result);
                $scope.ChannelBusiness = result.data;
            });

            $scope.AddBusinessUser = {
                RoleIDs: [],
                UserName: "",
                ContentProviderID: "",
                BusinessID: "",
                PhoneNumber: "",
                Password: "",
            };

            $scope.Choosed = {
                ContentProvider: {
                    ContentProviderName: "",
                    ContentProviderID: "",
                },
                ChannelBusiness: {
                    BusinessID: "",
                    BusinessName: '',
                },
            }

            $scope.ContentChange = function (content) {
                $scope.Choosed.ContentProvider = content;
            }

            $scope.ChannelChange = function (chanel) {
                $scope.Choosed.ChannelBusiness = chanel;
            }


            $scope.selected = [];
            $scope.selectedTags = [];
            var updateSelected = function (action, id, name) {
                if (action == 'add' && $scope.selected.indexOf(id) == -1) {
                    $scope.selected.push(id);
                    $scope.selectedTags.push(name);
                    if (id == 3) {
                        $scope.ShowContentFlag = true;
                    }
                    //$scope.AddBusinessUser.Roles.push({ ID: id, Name: name });
                }
                if (action == 'remove' && $scope.selected.indexOf(id) != -1) {
                    var idx = $scope.selected.indexOf(id);
                    $scope.selected.splice(idx, 1);
                    $scope.selectedTags.splice(idx, 1);
                    if (id == 3) {
                        $scope.ShowContentFlag = false;
                    }
                    //$scope.AddBusinessUser.Roles.splice(idx, 1);
                }
            }
            $scope.ShowContentFlag = false;
            $scope.updateSelection = function ($event, id, name) {
                var checkbox = $event.target;
                var action = (checkbox.checked ? 'add' : 'remove');
                updateSelected(action, id, name);
            }


            
            angular.element('#AddUserDialog').modal('show');
        }
        $scope.BusinessUserAdd = function () {

            $scope.AddBusinessUser.RoleIDs = $scope.selected;
            $scope.AddBusinessUser.ContentProviderID = $scope.Choosed.ContentProvider.ContentProviderID || "";
            $scope.AddBusinessUser.BusinessID = $scope.Choosed.ChannelBusiness.BusinessID || "";
            console.log($scope.AddBusinessUser);

            if ($scope.AddBusinessUser.UserName == '') {
                $scope.addUserValidateMessage = '请输入姓名';
                return;
            }

            if ($scope.AddBusinessUser.PhoneNumber == '') {
                $scope.addUserValidateMessage = '请输入登录手机号';
                return;
            }


            if ($scope.AddBusinessUser.Password == '') {
                $scope.addUserValidateMessage = '请输入登录密码';
                return;
            }

            var reg = /^0?1[3|4|5|8|7][0-9]\d{8}$/;
            var valid = reg.test($scope.AddBusinessUser.PhoneNumber);
            if (valid == false) {
                $scope.addUserValidateMessage = "输入的手机号码有误";
                return;
            }

            UserService.BusinessUserAdd($scope.AddBusinessUser).then(function (result) {
                angular.element('#AddUserDialog').modal('hide');
                $scope.BusinessUserList.parameters().page = 1;
                $scope.BusinessUserList.reload();
            }, function (result) {
                $scope.addUserValidateMessage = result.data.Message;
            });

        }
        $scope.ChoosedUser = {};
        $scope.DeleteBusinessUser = function () {
            UserService.DelBusinessUser($scope.ChoosedUser.UserID).then(function () {
                $scope.BusinessUserList.parameters().page = 1;
                $scope.BusinessUserList.reload();
            });
        }
        $scope.OpeDeleteUserDialog = function (user) {

            console.log(user);
            var tr = jQuery("#" + user.UserID);
            tr.addClass("delete-background");
            $scope.ChoosedUser = user;
            $rootScope.openCommonModalDialog("删除", "您确定要删除此用户吗？", $scope.DeleteBusinessUser, function () {
                tr.removeClass("delete-background");
            });
        }

        $scope.OpenResetPwdDialog = function (user) {
            $scope.resetPWDValidateMessage = '';
            $scope.ChoosedUser = user;
            $scope.NewPwd = '';
            angular.element('#ResetPwdDialog').modal('show');

        }
        $scope.ResetPwd = function () {
           
            if ($scope.NewPwd=='')
            {   
                $scope.resetPWDValidateMessage = '密码不能为空';
                return;
            }
            UserService.ResetBusinessPwd($scope.ChoosedUser.UserID, $scope.NewPwd).then(function (result) {
                angular.element('#ResetPwdDialog').modal('hide');
                //todo how to show message
            }, function (error) {
                $scope.resetPWDValidateMessage = error.data.Message;
            });
        }

        $scope.isCurrentUser = function (user) {
           
            return AuthService.AuthData().userName != user.PhoneNumber;
        }

        $scope.BusinessUserUpdate = function () {

            $scope.CurrentUser.RoleIdList = $scope.selected;
            $scope.CurrentUser.ContentProviderID = $scope.Choosed.ContentProvider.ContentProviderID || "";
            $scope.CurrentUser.ChannelBusinessUserID = $scope.Choosed.ChannelBusiness.BusinessID || "";

            if ($scope.CurrentUser.UserName == '') {
                $scope.updateUserValidateMessage = '请输入姓名';
                return;
            }

            if ($scope.CurrentUser.PhoneNumber == '') {
                $scope.updateUserValidateMessage = '请输入登录手机号';
                return;
            }

           

            var reg = /^0?1[3|4|5|8|7][0-9]\d{8}$/;
            var valid = reg.test($scope.CurrentUser.PhoneNumber);
            if (valid == false) {
                $scope.updateUserValidateMessage = "输入的手机号码有误";
                return;
            }
            UserService.BusinessUserUpdate($scope.CurrentUser).then(function (result) {
                angular.element('#UpdateUserDialog').modal('hide');
                $scope.BusinessUserList.parameters().page = 1;
                $scope.BusinessUserList.reload();
                //todo how to show message
            }, function (result) {               
                $scope.updateUserValidateMessage = result.data.Message;
            });
        }

        //修改用户
        $scope.GoToUpdateUser = function (user) {
            
            $scope.BusniessRoles = [];

            $scope.ContentProvider = [];

            $scope.ChannelBusiness = [];

            $scope.CurrentBusineeUserInfo = {};

            UserService.GetBusinessRoles().then(function (result) {
                //console.log(result);               
                $scope.BusniessRoles = result.data;
            });

            $scope.Choosed = {
                ContentProvider: {
                    ContentProviderName: "",
                    ContentProviderID: "",
                },
                ChannelBusiness: {
                    BusinessID: "",
                    BusinessName: '',
                },
            }

            $scope.ContentChange = function (content) {
                $scope.Choosed.ContentProvider = content;
            }

            $scope.ChannelChange = function (chanel) {
                $scope.Choosed.ChannelBusiness = chanel;
            }

            var LoadContentProvider = function () {
                UserService.GetContentProvider().then(function (result) {
                    //console.log(result);
                    $scope.ContentProvider = result.data;
                    if ($scope.CurrentUser.ContentProviderID) {
                        if (angular.isArray($scope.ContentProvider) && $scope.ContentProvider.length > 0) {
                            angular.forEach($scope.ContentProvider, function (item, i) {
                                if (item.ContentProviderID == $scope.CurrentUser.ContentProviderID) {
                                    $scope.Choosed.ContentProvider = item;
                                }
                            })

                        }
                    }
                });
            }

            var LoadChannelBusiness = function () {
                UserService.GetChannelBusiness().then(function (result) {
                    //console.log(result);
                    $scope.ChannelBusiness = result.data;
                    if ($scope.CurrentUser.ChannelBusinessUserID) {
                        if (angular.isArray($scope.ChannelBusiness) && $scope.ChannelBusiness.length > 0) {
                            angular.forEach($scope.ChannelBusiness, function (item, i) {
                                if (item.BusinessID == $scope.CurrentUser.ChannelBusinessUserID) {
                                    $scope.Choosed.ChannelBusiness = item;
                                }
                            })

                        }
                    }

                });
            }

            $scope.selected = [];
            $scope.selectedTags = [];
            var updateSelected = function (action, id, name) {
                if (action == 'add' && $scope.selected.indexOf(id) == -1) {
                    $scope.selected.push(id);
                    $scope.selectedTags.push(name);
                    //$scope.AddBusinessUser.Roles.push({ ID: id, Name: name });
                    if (id == 3) {
                        $scope.ShowContentFlag = true;
                    }
                }
                if (action == 'remove' && $scope.selected.indexOf(id) != -1) {
                    var idx = $scope.selected.indexOf(id);
                    $scope.selected.splice(idx, 1);
                    $scope.selectedTags.splice(idx, 1);
                    //$scope.AddBusinessUser.Roles.splice(idx, 1);
                    if (id == 3) {
                        $scope.ShowContentFlag = false;
                    }
                }

            }

            $scope.ShowContentFlag = false;
            $scope.updateSelection = function ($event, id, name) {
                var checkbox = $event.target;
                var action = (checkbox.checked ? 'add' : 'remove');
                updateSelected(action, id, name);
            }

            $scope.ShowContentFlag = false;
            $scope.isSelected = function (id) {
                var isContain = $scope.selected.indexOf(id) >= 0;
                if (isContain && id == 3) {//内容管理员
                    $scope.ShowContentFlag = true;
                } else {
                    $scope.ShowContentFlag = false;
                }
                return isContain;
            }

            $scope.CurrentUser = user;
            UserService.GetBusinessUserInfo(user.UserID).then(function (result) {
                console.log('GetBusinessUserInfo', result);
                $scope.CurrentUser = result.data;
                if (angular.isArray($scope.CurrentUser.RoleIdList) && $scope.CurrentUser.RoleIdList.length > 0) {
                    angular.forEach($scope.CurrentUser.RoleIdList, function (item, i) {
                        $scope.selected.push(item);
                    });
                };
                LoadContentProvider();
                LoadChannelBusiness();
            });
               
            angular.element('#UpdateUserDialog').modal('show');
        }

    }])
    .controller('ChangePasswordCtrl', ['$scope', 'AuthService', 'Constants', 'toaster', '$rootScope', function ($scope, AuthService, Constants, toaster, $rootScope) {

        $scope.oldPasswordMsg = "";
        $scope.newPasswordMsg = "";
        $scope.confirmPasswordMsg = "";
        $scope.saveResult = "";
        $scope.changePasswordData = {
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        }

        $scope.ValidateData = function (data) {

            $scope.oldPasswordMsgShow=false;
            $scope.newPasswordMsgShow= false;
            $scope.confirmPasswordMsgShow = false;
            $scope.confirmPasswordMsg = "";
            $scope.saveResult = "";
           
            if (data.oldPassword == undefined || data.oldPassword == "") {
                $scope.confirmPasswordMsg = "请输入旧密码";
                $scope.oldPasswordMsgShow = true;
                return false;
            }
            if (data.newPassword == undefined || data.newPassword == "") {
                $scope.confirmPasswordMsg = "请输入新密码";
                $scope.newPasswordMsgShow = true;
                return false;
            }
            if (data.newPassword.length < 6 || data.newPassword.length > 20) {
                $scope.confirmPasswordMsg = "新密码长度为6~20个字符";
                $scope.newPasswordMsgShow = true;
                return false;
            }
            if (data.confirmPassword == undefined || data.confirmPassword == "") {
                $scope.confirmPasswordMsg = "请输入确认密码";
                $scope.confirmPasswordMsgShow = true;
                return false;
            }
            if (data.confirmPassword != undefined && data.confirmPassword != "" && data.newPassword != undefined && data.newPassword != "" && data.newPassword != data.confirmPassword) {
                $scope.confirmPasswordMsg = "新密码和确认密码不一致";
                $scope.confirmPasswordMsgShow = true;
                return false;
            }

            return true;

        }
        $scope.ChangePassword = function () {

            if (!$scope.ValidateData($scope.changePasswordData)) {
                return;
            }

            AuthService.ChangePassword($scope.changePasswordData).then(function (response) {
             
                $scope.saveResult = "密码修改成功！";
            }, function (error) {
                $scope.confirmPasswordMsgShow = true;
                $scope.confirmPasswordMsg = error.data.Message;
            });
        }

        $scope.Cancel = function () {
            $rootScope.back();
        }

    }])   

    /*
    * Services
    */
    .service('UserService', function ($http, Constants) {
        var serviceBase = Constants.apiServiceBaseUri;
        var self = this;

        self.GetBusinessUserList = function (params) {
            return $http.post(serviceBase + 'api/account/businessUser', params);
        }

        self.GetBusinessRoles = function () {
            return $http.get(serviceBase + 'api/account/businessRoles');
        }

        self.GetContentProvider = function () {
            return $http.get(serviceBase + 'api/account/contentProvider');
        }

        self.GetChannelBusiness = function () {
            return $http.get(serviceBase + 'api/account/channelBusiness');
        }

        self.BusinessUserAdd = function (params) {
            return $http.post(serviceBase + 'api/account/businessUserAdd', params);
        }

        self.DelBusinessUser = function (userID) {
            if (!userID)
                return;
            return $http.post(serviceBase + 'api/account/updateUserInfo', { UserID: userID, Status: 2 });
        }

        self.ResetBusinessPwd = function (userID, pwd) {
            return $http.post(serviceBase + 'api/account/resetBusinessPwd', { UserID: userID, NewPwd: pwd });
        }

        self.GetBusinessUserInfo = function (userID) {
            return $http.get(serviceBase + 'api/account/currentBusinessUser/' + userID);
        }

        self.BusinessUserUpdate = function (params) {
            return $http.post(serviceBase + 'api/account/businessUserUpdate',params);
        }
    });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
