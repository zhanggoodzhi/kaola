define(['angular'], function (angular) {
    'use strict';

    angular.module('AuthServiceModule', []).service('AuthService', function ($http, $q, localStorageService, Constants, $log, $location) {
        var authServiceBase = GLOBAL_CENTRAL_URL;

        var self = this;
        var deferAuthenticationUpdater = $q.defer();
        this.observeAuthentication = function () { return deferAuthenticationUpdater.promise; }

        self.LocalStorageAuthKey = 'kaola_authorizationData';

        self.AppKey = "$kaola";

        self.showStandaloneView = false;     //独立页面标志,不显示主页面布局
        self.showMainPageView = true;  //主页面显示标志

        var _validation = {
            validateCode: ""
        };

        var _authentication = {
            isAuth: false,
            userID: "",
            userName: "",
            nickName: "",
            password: "",
            useRefreshTokens: false,
            rememberPwd: false,
            keepLogin: false,
            expireTime: "",
            userType: "",
            headPic: "",
            menuItems: {},

            apiServiceBaseUri: '/',
            authServiceBaseUri: '/',
            answerBaseUrl: '/',
            paperResourceBaseUrl: '/',

        };

        self.CurrentUserInfo = {};

        self.ResetConstants = function () {
            Constants.serverDomain = "DEFAULT";
            GLOBAL_API_URL = '/';
            GLOBAL_CENTRAL_URL = '/';
            GLOBAL_ANSWER_URL = '/';
            GLOBAL_PAPER_RESOURCE_URL = '/';
            authServiceBase = GLOBAL_CENTRAL_URL;

            console.log("ResetConstants:", GLOBAL_API_URL, GLOBAL_CENTRAL_URL, GLOBAL_ANSWER_URL, GLOBAL_PAPER_RESOURCE_URL);
        }

        self.RefreshConstants = function () {
            var authData = self.AuthData();
            Constants.serverDomain = authData.serverDomain;
            GLOBAL_API_URL = authData.apiServiceBaseUri;
            GLOBAL_CENTRAL_URL = authData.authServiceBaseUri;
            GLOBAL_ANSWER_URL = authData.answerBaseUrl;
            GLOBAL_PAPER_RESOURCE_URL = authData.paperResourceBaseUrl;
            authServiceBase = GLOBAL_CENTRAL_URL;

            console.log("RefreshConstants:", GLOBAL_API_URL, GLOBAL_CENTRAL_URL, GLOBAL_ANSWER_URL, GLOBAL_PAPER_RESOURCE_URL);

        }

        self.GetUserInfo = function (userName) {

            self.RefreshConstants();

            return $http.get(authServiceBase + 'api/account/detail').then(function (result) {
                var userInfo = result.data;
                self.UpdateAuthData(userInfo.Name, userInfo.NickName, userInfo.UserType, userInfo.HeadPic);
                return result;
            });
        }

        self.NotifyAuthenticationUpdate = function () {
            //console.log("NotifyAuthenticationUpdate");
            deferAuthenticationUpdater.notify(_authentication);
        }

        self.logout = function () {

            self.ResetConstants();

            var authData = localStorageService.get(self.LocalStorageAuthKey);
            if (authData) {

                authData.password = "";
                authData.token = "";
                authData.nickName = "";
                authData.useRefreshTokens = false;
                authData.userType = "";
                authData.headPic = "";
                authData.menuItems = {};

                authData.apiServiceBaseUri = "/";
                authData.authServiceBaseUri = "/";
                authData.answerBaseUrl = "/";
                authData.paperResourceBaseUrl = "/";

                localStorageService.remove(self.LocalStorageAuthKey);
                localStorageService.set(self.LocalStorageAuthKey, authData);
            }

            _authentication.isAuth = false;
            _authentication.nickName = "";
            _authentication.useRefreshTokens = false;
            _authentication.userType = "";
            _authentication.headPic = "";
            _authentication.password = "";
            _authentication.menuItems = {};

            _authentication.serverDomain = 'DEFAULT';
            _authentication.apiServiceBaseUri = "/";
            _authentication.authServiceBaseUri = "/";
            _authentication.answerBaseUrl = "/";
            _authentication.paperResourceBaseUrl = "/";

            self.ShowStandaloneView(true);
            self.NotifyAuthenticationUpdate();
        };


        self.RefreshExpireTime = function (d, addMinutes) {
            //addMinutes = 5;
            //return d.setSeconds(d.getSeconds() + addMinutes);

            return d.setMinutes(d.getMinutes() + addMinutes);
        }

        //页面有效期, 页面没有操作,将在xx分钟后要求重新登录
        self.ExpireTimeMinutes = 30;

        self.login = function (loginData) {
            var data = "grant_type=password&username=" + loginData.userName + self.AppKey + "&password=" + loginData.password;


            var deferred = $q.defer();

            $http.post(authServiceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

                var password = "";
                var rememberPwd = false;
                if (loginData.rememberPwd != undefined && loginData.rememberPwd == true) {
                    password = loginData.password;
                    rememberPwd = true;
                }
                var keepLogin = false;
                if (loginData.keepLogin != undefined && loginData.keepLogin == true) {
                    keepLogin = true;
                }

                var now = new Date();
                //有效时间重新设置= 当前时间+xx分钟
                var expireTime = self.RefreshExpireTime(now, self.ExpireTimeMinutes);

                var serverDomain = response.serverDomain;
                if (serverDomain == undefined || serverDomain == '') {
                    serverDomain = 'DEFAULT';
                }

                var apiServiceBaseUri = response.apiServiceBaseUri;
                if (apiServiceBaseUri == undefined || apiServiceBaseUri == '') {
                    apiServiceBaseUri = '/';
                }

                var authServiceBaseUri = response.authServiceBaseUri;
                if (authServiceBaseUri == undefined || authServiceBaseUri == '') {
                    authServiceBaseUri = '/';
                }

                var answerBaseUrl = response.answerBaseUrl;
                if (answerBaseUrl == undefined || answerBaseUrl == '') {
                    answerBaseUrl = '/';
                }

                var paperResourceBaseUrl = response.paperResourceBaseUrl;
                if (paperResourceBaseUrl == undefined || paperResourceBaseUrl == '') {
                    paperResourceBaseUrl = PAPER_RESOURCE_DEFAULT_ADDRESS_PREFIX;
                }

                var headPic = response.headPic;
                if (headPic != undefined && headPic != '') {
                    if (headPic.indexOf(authServiceBaseUri) < 0) {
                        headPic = authServiceBaseUri + headPic;
                    }
                }

                localStorageService.set(self.LocalStorageAuthKey, {
                    token: response.access_token,
                    userID: response.userID,
                    userName: loginData.userName,
                    password: password,
                    rememberPwd: rememberPwd,
                    keepLogin: keepLogin,
                    expireTime: expireTime,
                    nickName: response.nickName,
                    refreshToken: "",
                    useRefreshTokens: false,
                    userType: response.userType,
                    menuItems: JSON.parse(response.menuItems),

                    headPic: headPic,
                    serverDomain: serverDomain,
                    apiServiceBaseUri: apiServiceBaseUri,
                    authServiceBaseUri: authServiceBaseUri,
                    answerBaseUrl: answerBaseUrl,
                    paperResourceBaseUrl: paperResourceBaseUrl,
                });


                _authentication.isAuth = true;
                _authentication.userID = response.userID;
                _authentication.userName = loginData.userName;
                _authentication.nickName = response.nickName;
                _authentication.useRefreshTokens = loginData.useRefreshTokens;
                _authentication.password = loginData.password;
                _authentication.rememberPwd = loginData.rememberPwd;
                _authentication.keepLogin = loginData.keepLogin;
                _authentication.expireTime = expireTime;
                _authentication.userType = response.userType;
                _authentication.menuItems = JSON.parse(response.menuItems);

                _authentication.headPic = headPic;
                _authentication.serverDomain = serverDomain;
                _authentication.apiServiceBaseUri = apiServiceBaseUri;
                _authentication.authServiceBaseUri = authServiceBaseUri;
                _authentication.answerBaseUrl = answerBaseUrl;
                _authentication.paperResourceBaseUrl = paperResourceBaseUrl;

                self.RefreshConstants();

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
            //console.log("showStandaloneView:" + flag + ",showMainPageView:" + !flag);
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

                    //保持登录
                    if (authData.keepLogin != undefined && authData.keepLogin == true) {
                        _authentication.isAuth = true;
                    }

                    //页面跳转
                    if (authData.directUrl != undefined && authData.directUrl != "") {
                        _authentication.isAuth = true;
                    }

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
                _authentication.userID = authData.userID;
                _authentication.userName = authData.userName;
                _authentication.nickName = authData.nickName;
                _authentication.useRefreshTokens = authData.useRefreshTokens;
                _authentication.password = authData.password;
                _authentication.rememberPwd = authData.rememberPwd;
                _authentication.keepLogin = authData.keepLogin;
                _authentication.userType = authData.userType;
                _authentication.menuItems = authData.menuItems;

                _authentication.headPic = authData.headPic;
                _authentication.serverDomain = authData.serverDomain;
                _authentication.apiServiceBaseUri = authData.apiServiceBaseUri;
                _authentication.authServiceBaseUri = authData.authServiceBaseUri;
                _authentication.answerBaseUrl = authData.answerBaseUrl;
                _authentication.paperResourceBaseUrl = authData.paperResourceBaseUrl;


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

        self.UpdateAuthData = function (userName, nickName, userType, headPic) {
            var authData = localStorageService.get(self.LocalStorageAuthKey);
            if (authData) {
                _authentication.isAuth = true;
                _authentication.userName = userName;
                _authentication.nickName = nickName;
                _authentication.userType = userType;

                var authServiceBaseUri = authData.authServiceBaseUri;
                if (authServiceBaseUri != undefined && authServiceBaseUri != '') {
                    if (headPic.indexOf(authServiceBaseUri) < 0) {
                        headPic = authServiceBaseUri + headPic;
                    }
                }
                authData.headPic = headPic + "?t=" + Math.random();

                authData.userName = userName;
                authData.nickName = nickName;
                authData.userType = userType;
                localStorageService.remove(self.LocalStorageAuthKey);
                localStorageService.set(self.LocalStorageAuthKey, authData);
            }
        };

        self.UpdateApiURLForAuthData = function (apiUrl, centralUrl, answerUrl, paperResourceUrl) {
            var authData = localStorageService.get(self.LocalStorageAuthKey);
            if (authData) {
                authData.apiServiceBaseUri = apiUrl;
                authData.authServiceBaseUri = centralUrl;
                authData.answerBaseUrl = answerUrl;
                authData.paperResourceBaseUrl = paperResourceUrl;

                console.log("UpdateApiURLForAuthData:", apiUrl, centralUrl, answerUrl, paperResourceUrl);

                localStorageService.remove(self.LocalStorageAuthKey);
                localStorageService.set(self.LocalStorageAuthKey, authData);
            }
        };

        self.UpdateExpireTime = function (expireTime) {
            var authData = localStorageService.get(self.LocalStorageAuthKey);
            if (authData) {
                authData.expireTime = expireTime;

                localStorageService.remove(self.LocalStorageAuthKey);
                localStorageService.set(self.LocalStorageAuthKey, authData);
            }
        }
        self.UpdateNickName = function (nickName) {
            var authData = localStorageService.get(self.LocalStorageAuthKey);
            if (authData) {
                _authentication.nickName = nickName;
                authData.nickName = nickName;
                localStorageService.remove(self.LocalStorageAuthKey);
                localStorageService.set(self.LocalStorageAuthKey, authData);
            }
        };
        self.UpdateHeadPic = function (headPic) {
            var authData = localStorageService.get(self.LocalStorageAuthKey);
            if (authData) {

                var authServiceBaseUri = authData.authServiceBaseUri;
                if (authServiceBaseUri != undefined && authServiceBaseUri != '') {
                    if (headPic.indexOf(authServiceBaseUri) < 0) {
                        headPic = authServiceBaseUri + headPic;
                    }
                }
                authData.headPic = headPic + "?t=" + Math.random();

                localStorageService.remove(self.LocalStorageAuthKey);
                localStorageService.set(self.LocalStorageAuthKey, authData);
            }
        };


        self.ValidateData = function () {
            var validateData = localStorageService.get('kaola_validateData');
            //console.log(validateData);
            if (validateData) {
                _validation.validateCode = validateData.validateCode;
            }

            return _validation;
        };
        self.ClearValidateData = function () {
            localStorageService.remove('kaola_validateData');
        };


        self.SignUp = function (registration) {
            return $http.post(authServiceBase + 'api/account/register', registration);
        };


        self.ChangePassword = function (data) {
            return $http.post(authServiceBase + 'api/account/changepassword', data);
        }


        self.findPwd = function (params) {
            return $http.post(authServiceBase + 'api/account/findpwd', { UserName: params.UserName, Email: params.Email, Mobile: params.Mobile });
        };

        self.GetPhoneNumberValidateCode = function (phoneNumber) {
            return $http.post(authServiceBase + 'api/account/phonenumberValidateCode', { PhoneNumber: phoneNumber });
        };

        self.GetPhoneNumberValidateCodeByFindPwd = function (phoneNumber) {
            return $http.post(authServiceBase + 'api/account/phonenumberValidateCodeByFindPwd', { PhoneNumber: phoneNumber });
        };

        self.CheckPhoneNumberExist = function (phoneNumber) {
            return $http.post(authServiceBase + 'api/account/checkExistPhoneNumberForKaola', { PhoneNumber: phoneNumber });
        };

        self.CheckPhoneNumberVC = function (phoneNumber, phoneNumberVC) {
            return $http.post(authServiceBase + 'api/account/CheckPhoneNumberVC', { PhoneNumber: phoneNumber, PhoneNumberValidateCode: phoneNumberVC });
        };

        self.CheckPhoneVCByFindPwd = function (phoneNumber, phoneNumberVC) {
            return $http.post(authServiceBase + 'api/account/checkPhoneNumVCByFindPwd', { PhoneNumber: phoneNumber, PhoneNumberValidateCode: phoneNumberVC });
        };



        self.CheckInvateCode = function (invateCode) {
            return $http.post(authServiceBase + 'api/account/CheckInvateCode', { InvateCode: invateCode });
        };

        self.CheckEmail = function (email) {
            return $http.post(authServiceBase + 'api/account/CheckEmail', { Email: email });
        };
        self.ValidateEmail = function (validateEmailData) {
            return $http.post(authServiceBase + 'api/account/ValidateEmail', { ValidateCode: validateEmailData.validateCode, Password: validateEmailData.password });
        };

        self.RestPwd = function (resetPwdParam) {
            return $http.post(authServiceBase + 'api/account/resetPwd', resetPwdParam);
        };

        self.SendEmail = function (email, emailType) {
            return $http.post(authServiceBase + 'api/account/sendEmail', { Email: email, EmailType: emailType });
        };

        self.UpdateUserInfo = function (userID, nickName, sex) {
            return $http.post(authServiceBase + 'api/account/updateUserInfo', { UserID: userID, NickName: nickName, Sex: sex });
        };

        self.ActivePhoneNumberValidateCode = function (phoneNumber, phoneNumberValidateCode) {
            return $http.post(authServiceBase + 'api/account/activePhoneNumberValidateCode', { PhoneNumber: phoneNumber, PhoneNumberValidateCode: phoneNumberValidateCode });
        }


        self.CheckModuleEnable = function (m) {

            var authData = self.AuthData();
            if (authData != undefined && authData.menuItems != undefined) {
                console.log(authData.menuItems);
                var moduleItems = authData.menuItems.ModuleItems;
                if (moduleItems != undefined && moduleItems.length > 0) {
                    for (var i = 0; i < moduleItems.length; i++) {
                        var moduleItem = moduleItems[i];
                        if (moduleItem.ModuleName == m) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        self.CheckMenuEnable = function (menuState) {

            var authData = self.AuthData();
            if (authData != undefined && authData.menuItems != undefined) {
                console.log(authData.menuItems);
                var menus = authData.menuItems.MenuItems;
                if (menus != undefined && menus.length > 0) {
                    for (var i = 0; i < menus.length; i++) {
                        var menu = menus[i];
                        if (menu.state == menuState) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    });

});
