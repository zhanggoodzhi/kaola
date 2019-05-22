define(['angular'], function (angular) {
    'use strict';

    angular.module('Auth', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('login', {
            url: "/login",
            views: {
                'standaloneView': {
                    templateUrl:  "business/auth/login.html",
                    controller: 'LoginCtrl'
                },
            }
        }).state('logout', {
            url: "/logout",
            views: {
                'standaloneView': {
                    controller: 'LogoutCtrl'
                },
            }
        });
    }])
    /*
    * Controllers
    */
    .controller('LoginCtrl', ['$scope', '$log', '$location', 'AuthService', 'Constants', '$rootScope', '$state', 'LocationService', function ($scope, $log, $location, AuthService, Constants, $rootScope, $state, LocationService) {

        var authData = AuthService.AuthData();
        if (angular.isObject(authData)) {
            $scope.loginData = {
                userName: authData.userName,
                password: authData.password,
                useRefreshTokens: authData.useRefreshTokens,
                rememberPwd: authData.rememberPwd
            };
        } else {
            $scope.loginData = {
                userName: "",
                password: "",
                useRefreshTokens: false,
                rememberPwd: false
            };
        }

        $scope.usernameValidateMsg = "";       

        $scope.message = "";

        $scope.doLogin = function () {
            $scope.usernameValidateMsg = "";
         

            if ($scope.loginData.userName == "" && $scope.loginData.password == "") {
                $scope.usernameValidateMsg = "请输入手机号码和密码";
                return;
            }

            if ($scope.loginData.userName == "") {
                $scope.usernameValidateMsg = "请输入手机号码";
            }

            if ($scope.loginData.password == "") {
                $scope.usernameValidateMsg = "请输入密码";
            }
            if ($scope.loginData.userName == "" || $scope.loginData.password == "") {
                return;
            }

            AuthService.login($scope.loginData).then(
                function (response) {
                    console.log("Login Success");

                    AuthService.ShowStandaloneView(false);
                    LocationService.GotoDefaultURL();

                },
                function (err) {
                    console.log(err);

                    if (err.error == "disabled") {
                        $rootScope.openCommonErrorDialog("错误", "用户名或密码不正确", null);
                    }
                    else if (err.error == "invalid_grant") {
                        $scope.usernameValidateMsg = "您输入的手机号码或密码不正确";
                    }

                }
            );

            $scope.Submit = function () {
                console.log("Submit");
            }

        };
    }])
    .controller('LogoutCtrl', ['AuthService', '$state', function (AuthService, $state) {
        AuthService.logout();
        $state.go('login');
    }])


/*
* Services
*/
.service('AuthService', function ($http, $q, localStorageService, Constants, $log, $location) {
    var serviceBase = Constants.apiServiceBaseUri;
    var self = this;
    var deferAuthenticationUpdater = $q.defer();
    this.observeAuthentication = function () { return deferAuthenticationUpdater.promise; }

    self.LocalStorageAuthKey = 'business_authorizationData';

    self.AppKey = "$business";

    self.showStandaloneView = false;     //独立页面标志, 不显示主页面布局    
    self.showMainPageView = true;  //主页面显示标志

    var _validation = {
        validateCode: ""
    };

    var _authentication = {
        isAuth: false,
        userName: "",
        nickName: "",
        password: "",
        useRefreshTokens: false,
        rememberPwd: false,
        userType: "",
        headPic: "",
        userRole: []
    };

    self.NotifyAuthenticationUpdate = function () {
        console.log("NotifyAuthenticationUpdate");
        deferAuthenticationUpdater.notify(_authentication);
    }

    self.logout = function () {
        if (_authentication.rememberPwd == undefined || _authentication.rememberPwd == false) {
            localStorageService.remove(self.LocalStorageAuthKey);
            _authentication.userName = "";
            _authentication.nickName = "";
            _authentication.useRefreshTokens = false;
            _authentication.password = "";
            _authentication.userType = "";
            _authentication.headPic = "";
            _authentication.userRole = [];
        }
        else {
            var authData = localStorageService.get(self.LocalStorageAuthKey);
            if (authData) {
                authData.isAuth = false;
                localStorageService.remove(self.LocalStorageAuthKey);
                localStorageService.set(self.LocalStorageAuthKey, authData);
            }

        }
        _authentication.isAuth = false;

        self.ShowStandaloneView(true);
        self.NotifyAuthenticationUpdate();
    };

    self.RefreshExpireTime = function (d, addMinutes) {
        //addMinutes = 5;
        //return d.setSeconds(d.getSeconds() + addMinutes);

        return d.setMinutes(d.getMinutes() + addMinutes);
    };
    self.ExpireTimeMinutes = 30;

    self.login = function (loginData) {
        var data = "grant_type=password&username=" + loginData.userName + self.AppKey + "&password=" + loginData.password;

        data = data + "&clientid=" + Constants.clientId;

        var deferred = $q.defer();

        $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

            var password = "";
            var rememberPwd = false;
            if (loginData.rememberPwd != undefined && loginData.rememberPwd == true) {
                password = loginData.password;
                rememberPwd = true;
            }

            var userRoleStrArray = response.userRole.split(",");
            var userRole = [];
            for (var i = 0; i < userRoleStrArray.length; i++) {
                userRole.push(parseInt(userRoleStrArray[i]));
            }

            var now = new Date();
            //有效时间重新设置= 当前时间+xx分钟
            var expireTime = self.RefreshExpireTime(now, self.ExpireTimeMinutes);

            if (loginData.useRefreshTokens) {
                localStorageService.set(self.LocalStorageAuthKey, { token: response.access_token, userName: loginData.userName, password: password, rememberPwd: rememberPwd, nickName: response.nickName, refreshToken: response.refresh_token, useRefreshTokens: true, userType: response.userType, headPic: response.headPic, userRole: userRole, isAuth: true, expireTime: expireTime});
        }
        else {
                localStorageService.set(self.LocalStorageAuthKey, { token: response.access_token, userName: loginData.userName, password: password, rememberPwd: rememberPwd, nickName: response.nickName, refreshToken: "", useRefreshTokens: false, userType: response.userType, headPic: response.headPic, userRole: userRole, isAuth: true, expireTime: expireTime });
            }

            _authentication.isAuth = true;
            _authentication.userName = loginData.userName;
            _authentication.nickName = response.nickName;
            _authentication.useRefreshTokens = loginData.useRefreshTokens;
            _authentication.password = loginData.password;
            _authentication.rememberPwd = loginData.rememberPwd;
            _authentication.userType = response.userType;
            _authentication.headPic = response.headPic;
            _authentication.userRole = userRole;
            _authentication.expireTime = expireTime;
            deferred.resolve(response);

        }).error(function (err, status) {
            self.logout();
            deferred.reject(err);
        });

        return deferred.promise;

    };


    self.ShowStandaloneView = function (flag) {
        self.showStandaloneView = flag;
        self.showMainPageView = !flag;
        console.log("showStandaloneView:" + flag + ",showMainPageView:" + !flag);
    }
    self.StandaloneViewShown = function () {
        return self.showStandaloneView;
    }
    self.MainPageViewShown = function () {
        return self.showMainPageView;
    }

    self.AuthData = function () {
        var authData = localStorageService.get(self.LocalStorageAuthKey);
        //console.log(authData);
        if (authData) {
            _authentication.isAuth = false;            
            if (authData.token != undefined && authData.token != "") {

                //验证有效时间
                var expireTime = authData.expireTime;
                var now = new Date();
                //console.log("expireTime", expireTime, now.getTime());
                //console.log("expire?", expireTime > now.getTime());
                if (expireTime > now.getTime()) {
                    _authentication.isAuth = true;
                    //有效时间重新设置= 当前时间+xx分钟
                    expireTime = self.RefreshExpireTime(now, self.ExpireTimeMinutes);
                    _authentication.expireTime = expireTime;
                    self.UpdateExpireTime(expireTime);
                    //console.log("refresh expireTime", new Date(expireTime));
                }
                else {
                    //console.log("login expired", new Date(expireTime));
                }
            }          
            _authentication.userName = authData.userName;
            _authentication.nickName = authData.nickName;
            _authentication.useRefreshTokens = authData.useRefreshTokens;
            _authentication.password = authData.password;
            _authentication.rememberPwd = authData.rememberPwd;
            _authentication.userType = authData.userType;
            _authentication.headPic = authData.headPic;
            _authentication.userRole = authData.userRole;
            if (_authentication.isAuth == false) {
                //默认显示StandaloneView
                if (self.StandaloneViewShown() == false) {
                    self.ShowStandaloneView(true);
                }

                if (!($location.path() == '/signup' || $location.path() == '/validate' || $location.path().indexOf("/resetpwd") > -1 || $location.path() == '/findpwd')) {
                    $location.path('/login');
                }

            }
            return _authentication;

        }
        else {

            //默认显示StandaloneView
            if (self.StandaloneViewShown() == false) {
                self.ShowStandaloneView(true);
            }
        }
        //console.log(_authentication);
        return _authentication;
    };


    self.UpdateExpireTime = function (expireTime) {
        var authData = localStorageService.get(self.LocalStorageAuthKey);
        if (authData) {
            authData.expireTime = expireTime;

            localStorageService.remove(self.LocalStorageAuthKey);
            localStorageService.set(self.LocalStorageAuthKey, authData);
        }
    }

    self.UpdateAuthData = function (userName, nickName, userType, headPic, userRole) {
        var authData = localStorageService.get(self.LocalStorageAuthKey);
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = userName;
            _authentication.nickName = nickName;
            _authentication.userType = userType;
            _authentication.headPic = headPic;
            _authentication.userRole = userRole;

            authData.isAuth = true;
            authData.userName = userName;
            authData.nickName = nickName;
            authData.userType = userType;
            authData.headPic = headPic + "?t=" + Math.random();
            authData.userRole = userRole;

            localStorageService.remove(self.LocalStorageAuthKey);
            localStorageService.set(self.LocalStorageAuthKey, authData);
        }
    };


    self.ChangePassword = function (data) {
        return $http.post(serviceBase + 'api/account/changepassword', data);
    }


    self.findPwd = function (params) {
        return $http.post(serviceBase + 'api/account/findpwd', { UserName: params.UserName, Email: params.Email, Mobile: params.Mobile });
    };


    self.CheckPhoneNumberExist = function (phoneNumber) {
        return $http.post(serviceBase + 'api/account/checkExistPhoneNumberForBusiness', { PhoneNumber: phoneNumber });
    };


    self.RestPwd = function (resetPwdParam) {
        return $http.post(serviceBase + 'api/account/resetPwd', resetPwdParam);
    };


});


});
