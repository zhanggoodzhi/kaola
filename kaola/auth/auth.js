define(['angular'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('LoginCtrl', ['$scope', '$log', '$location', 'AuthService', 'Constants', '$rootScope', '$state', 'LocationService', function ($scope, $log, $location, AuthService, Constants, $rootScope, $state, LocationService) {

        console.log("enter login controller");
        var checkedpwd = false;
        $("#showPwd").click(function () {
            if (checkedpwd) {
                angular.element("#showPwd").attr("src", "http://cdn.uukaola.com/web/img/login/eyeunselect.png");
                if (angular.element("#id_password").val() == angular.element("#id_password").attr("placeholder")) {
                    angular.element("#id_password").val("");
                }
                angular.element("#id_password").show();
                angular.element("#id_showPassword").hide();
                checkedpwd = false;
            }
            else {
                angular.element("#showPwd").attr("src", "http://cdn.uukaola.com/web/img/login/eyeselected.png");
                angular.element("#id_password").hide();
                angular.element("#id_showPassword").show();
                checkedpwd = true;
            }
        });
        $("#id_password").change(function () {
            if (!angular.element("#id_password").hidden) {
                angular.element("#id_showPassword").val(angular.element("#id_password").val());
            }
        });
        $("#id_showPassword").change(function () {
            if (!angular.element("#id_showPassword").hidden) {
                angular.element("#id_password").val(angular.element("#id_showPassword").val());
                $scope.loginData.password = angular.element("#id_showPassword").val();
            }
        });
        //Start 特殊处理页面样式, 个人中心链接, 左侧菜单
        angular.element("#navbar-personallink").show();
        angular.element("#sidebar_menu").show();
        angular.element("#div_mainChildView").removeClass();
        angular.element("#div_mainChildView").addClass('col-xs-11 col-sm-11 col-md-11');
        //End

        var authData = AuthService.AuthData();
        var isAuth = authData ? authData.isAuth : false;

        if (isAuth) {
            AuthService.logout();
        }


        var authData = AuthService.AuthData();
        console.log(authData);
        if (angular.isObject(authData)) {
            $scope.loginData = {
                userName: authData.userName,
                password: authData.password,
                useRefreshTokens: authData.useRefreshTokens,
                rememberPwd: authData.rememberPwd,
                keepLogin: authData.keepLogin
            };
        } else {
            $scope.loginData = {
                userName: "",
                password: "",
                useRefreshTokens: false,
                rememberPwd: false,
                keepLogin: false
            };
        }

        $scope.usernameValidateMsg = "";
        $scope.passwordValidateMsg = "";

        $scope.ValidateMsg = "";

        $scope.message = "";

        $scope.doLogin = function () {
            $scope.usernameValidateMsg = "";
            $scope.passwordValidateMsg = "";

            $scope.ValidateMsg = "";
            if ($scope.loginData.userName == "") {
                $scope.usernameValidateMsg = "请输入用户名";
                $scope.ValidateMsg = "请输入用户名";
                return;
            }

            if ($scope.loginData.password == "") {
                $scope.passwordValidateMsg = "请输入密码";
                $scope.ValidateMsg = "请输入密码";
                return;
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
                        $scope.ValidateMsg = "该用户已被停用，请联系学校管理员";
                        // $rootScope.openCommonErrorDialog("错误", "该用户已被停用，请联系学校管理员", null);
                    }
                    else if (err.error == "invalid_grant") {
                        $scope.ValidateMsg = "您输入的用户名或密码不正确";
                    }

                    if (err.error == "unConfirmed") {
                        $scope.ValidateMsg = err.error_description;
                        // $rootScope.openCommonErrorDialog("错误", "该用户已被停用，请联系学校管理员", null);
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
    .controller('SignupCtrl', ['$q', '$scope', '$log', '$location', '$timeout', 'AuthService', '$state', '$rootScope',
        function ($q, $scope, $log, $location, $timeout, AuthService, $state, $rootScope) {

            function InitionErrorMsg() {
                $scope.infoMessage = "";
                $scope.TeacherPhoneNumberVCMsg = "";
                $scope.StudentPhoneNumberVCMsg = "";
                $scope.InvateCodeMsg = "";

                $scope.TeacherEmailMsg = "";
                $scope.StudentEmailMsg = "";

                $scope.phoneNumberMsg = "";
                $scope.passwordMsg = "";
                $scope.passwordConfirmMsg = "";
                $scope.phoneNumber2Msg = "";
                $scope.password2Msg = "";
                $scope.passwordConfirm2Msg = "";

                $scope.ValidateMsg = "";
            }

            InitionErrorMsg();
            //$scope.infoMessage = "";
            //$scope.TeacherPhoneNumberVCMsg = "";
            //$scope.StudentPhoneNumberVCMsg = "";
            //$scope.InvateCodeMsg = "";

            //$scope.TeacherEmailMsg = "";
            //$scope.StudentEmailMsg = "";

            //$scope.phoneNumberMsg = "";
            //$scope.passwordMsg = "";
            //$scope.passwordConfirmMsg = "";
            //$scope.phoneNumber2Msg = "";
            //$scope.password2Msg = "";
            //$scope.passwordConfirm2Msg = "";


            //$scope.ValidateMsg = "";
            //$scope.ValidateMsg2 = "";
            $scope.registration = {
                registerType: 1,            //1=手机注册  2=邮箱注册
                phoneNumber: "",              //手机号码 
                phoneNumberValidateCode: "",  //验证码
                email: "",                     //邮箱
                password: "",                 //密码
                confirmPassword: "",          //确认密码
                inviteCode: "",               //邀请码
                userType: 1,//用户身份 0系统管理员,  1教师,  2学生  3,学校管理员
            };
            $(".eye-icon").click(function () {
                var pwdName = $(this).attr("for");
                if ($(this).attr("checked")) {
                    $(this).attr("checked", false);
                    $(this).attr("src", "http://cdn.uukaola.com/web/img/login/eyeselected.png");
                    if (angular.element("[name=" + pwdName + "]").val() == angular.element("[name=" + pwdName + "]").attr("placeholder")) {
                        angular.element("[name=" + pwdName + "]").val("");
                    }
                    angular.element("[name=" + pwdName + "Show]").css("display", "block");
                    angular.element("[name=" + pwdName + "]").css("display", "none");
                }
                else {
                    $(this).attr("checked", true);
                    $(this).attr("src", "http://cdn.uukaola.com/web/img/login/eyeunselect.png");

                    angular.element("[name=" + pwdName + "Show]").css("display", "none");
                    angular.element("[name=" + pwdName + "]").css("display", "block");
                }
            });
            $("[name=confirmPassword]").change(function () {
                if (!angular.element("[name=confirmPassword]").hidden) {
                    angular.element("[name=confirmPasswordShow]").val(angular.element("[name=confirmPassword]").val());
                }
            });
            $("[name=confirmPasswordShow]").change(function () {
                if (!angular.element("[name=confirmPasswordShow]").hidden) {
                    angular.element("[name=confirmPassword]").val(angular.element("[name=confirmPasswordShow]").val());
                    $scope.registration.confirmPassword = angular.element("[name=confirmPasswordShow]").val();
                }
            });
            $("[name=teacher_password]").change(function () {
                if (!$("[name=teacher_password]").hidden) {
                    $("[name=teacher_passwordShow]").val($("[name=teacher_password]").val());
                }
            });
            $("[name=teacher_passwordShow]").change(function () {
                if (!$("[name=teacher_passwordShow]").hidden) {
                    $("[name=teacher_password]").val($("[name=teacher_passwordShow]").val());
                    $scope.registration.password = $("[name=teacher_passwordShow]").val();
                }
            });
            $("[name=student_password]").change(function () {
                if (!angular.element("[name=student_password]").hidden) {
                    angular.element("[name=student_passwordShow]").val(angular.element("[name=student_password]").val());
                }
            });
            $("[name=student_passwordShow]").change(function () {
                if (!angular.element("[name=student_passwordShow]").hidden) {
                    angular.element("[name=student_password]").val(angular.element("[name=student_passwordShow]").val());
                    $scope.registration.password = angular.element("[name=student_passwordShow]").val();
                }
            });
            $("[name=confirmPasswordStu]").change(function () {
                if (!angular.element("[name=confirmPasswordStu]").hidden) {
                    angular.element("[name=confirmPasswordStuShow]").val(angular.element("[name=confirmPasswordStu]").val());
                }
            });
            $("[name=confirmPasswordStuShow]").change(function () {
                if (!angular.element("[name=confirmPasswordStuShow]").hidden) {
                    angular.element("[name=confirmPasswordStu]").val(angular.element("[name=confirmPasswordStuShow]").val());
                    $scope.registration.confirmPassword = angular.element("[name=confirmPasswordStuShow]").val();
                }
            });


            $scope.Submit = function () {
                console.log("Submit");
            }
            $scope.ValidatePhoneNumber = function (data, userType) {
                InitionErrorMsg();
                if (userType == 1) {
                    $scope.phoneNumberMsg = "";
                } else {
                    $scope.phoneNumber2Msg = "";
                }

                var error = "";

                if (data.phoneNumber == undefined) {
                    error = "请输入手机号码";
                }
                var phoneNumber = data.phoneNumber.toString();
                if (phoneNumber == undefined || phoneNumber == "") {
                    error = "请输入手机号码";

                }
                if (phoneNumber.length != 11) {
                    error = "请输入正确的手机号码";

                }
                if (error != "") {
                    if (userType == 1) {
                        $scope.phoneNumberMsg = error;

                    } else {
                        $scope.phoneNumber2Msg = error;
                    }
                    $scope.ValidateMsg = error;
                    return false;
                }

                return true;
            }
            $scope.ValidatePhoneNumberPattern = function (data, userType) {
                InitionErrorMsg();
                if (userType == 1) {
                    $scope.phoneNumberMsg = "";
                } else {
                    $scope.phoneNumber2Msg = "";
                }

                if (data.phoneNumber == undefined) {
                    return false;
                }

                var phoneNumber = data.phoneNumber.toString();
                var reg = /^0?1[3|4|5|8|7][0-9]\d{8}$/;
                var valid = reg.test(phoneNumber);
                if (valid == false) {
                    if (userType == 1) {
                        $scope.phoneNumberMsg = "请输入正确的手机号码";
                    } else {
                        $scope.phoneNumber2Msg = "请输入正确的手机号码";
                    }
                    $scope.ValidateMsg = "请输入正确的手机号码";
                }
                return valid;
            }

            $scope.ValidatePhoneNumberVC = function (data, userType) {
                InitionErrorMsg();
                if (userType == 1) {
                    $scope.TeacherPhoneNumberVCMsg = "";
                } else {
                    $scope.StudentPhoneNumberVCMsg = "";
                }

                var phoneNumberValidateCode = data.phoneNumberValidateCode;
                if (phoneNumberValidateCode == undefined || phoneNumberValidateCode == "") {
                    if (userType == 1) {
                        $scope.TeacherPhoneNumberVCMsg = "请输入手机验证码";
                    } else {
                        $scope.StudentPhoneNumberVCMsg = "请输入手机验证码";
                    }
                    $scope.ValidateMsg = "请输入手机验证码";
                    return false;
                }

                return true;
            }

            $scope.ValidateData = function (data, key) {
                InitionErrorMsg();
                var hasError = false;
                var registerType = data.registerType;
                if (registerType != 1 && registerType != 2) {
                    return false;
                }

                var userType = data.userType;
                if (userType != 1 && userType != 2) {
                    return false;
                }

                if (userType == 1) {
                    var inviteCode = $scope.registration.inviteCode;
                    if (inviteCode == undefined || inviteCode == "") {
                        $scope.InvateCodeMsg = "请输入邀请码";
                        $scope.ValidateMsg = "请输入邀请码";
                        hasError = true;
                        return false;
                    }

                    if (key == 'invateCode')
                    {
                        return true;
                    }
                }

                if (registerType == 1) {

                    if ($scope.ValidatePhoneNumber($scope.registration, userType) == false) {
                        //hasError = true;
                        return false;
                    }
                    if ($scope.ValidatePhoneNumberPattern($scope.registration, userType) == false) {
                        //hasError = true;
                        return false;
                    }
                    if (key == 'phoneNumber') {
                        return true;
                    }

                    if ($scope.ValidatePhoneNumberVC($scope.registration, userType) == false) {
                        //hasError = true;
                        return false;
                    }
                    if (key == 'phoneNumberVC') {
                        return true;
                    }
                   

                    
                }

                if (registerType == 2) {
                    if (userType == 1) {
                        $scope.TeacherEmailMsg = "";
                    } else if (userType == 2) {
                        $scope.StudentEmailMsg = "";
                    }

                    var email = data.email;

                    if (email == undefined || email == "") {
                        hasError = true;
                        if (userType == 1) {
                            $scope.TeacherEmailMsg = "您填写的邮箱不符合要求";
                        } else if (userType == 2) {
                            $scope.StudentEmailMsg = "您填写的邮箱不符合要求";
                        }
                        $scope.ValidateMsg = "您填写的邮箱不符合要求";
                        return false;
                    }
                }
                if (key == 'email') {
                    return true;
                }

                var password = data.password;
                if (!$scope.CheckPassword(userType, password)) {
                    //hasError = true;
                    return false;
                }
                if (key == 'password') {
                    return true;
                }

                var confirmPassword = data.confirmPassword;
                if (!$scope.CheckPasswordConfirm(userType, confirmPassword)) {
                    //hasError = true;
                    return false;
                }
                if (key == 'confirmPassword') {
                    return true;
                }

                if (!$scope.CheckPasswordSame(userType, password, confirmPassword)) {
                    //hasError = true;
                    return false;
                }

                return hasError ? false : true;

            }

            $scope.CheckPassword = function (userType, password) {
                InitionErrorMsg();
                if (userType == 1) {
                    $scope.passwordMsg = "";
                } else {
                    $scope.password2Msg = "";
                }
                if (password == undefined || password == "") {
                    if (userType == 1) {
                        $scope.passwordMsg = "请输入密码";
                    } else {
                        $scope.password2Msg = "请输入密码";
                    }
                    $scope.ValidateMsg = "请输入密码";
                    return false;
                }
                return true;
            }
            $scope.CheckPasswordConfirm = function (userType, confirmPassword) {
                InitionErrorMsg();
                if (userType == 1) {
                    $scope.passwordConfirmMsg = "";
                } else {
                    $scope.passwordConfirm2Msg = "";
                }
                if (confirmPassword == undefined || confirmPassword == "") {
                    if (userType == 1) {
                        $scope.passwordConfirmMsg = "请输入确认密码";
                    } else {
                        $scope.passwordConfirm2Msg = "请输入确认密码";
                    }
                    $scope.ValidateMsg = "请输入确认密码";
                    return false;
                }

                return $scope.CheckPasswordSame(userType, $scope.registration.password, confirmPassword);
            }
            $scope.CheckPasswordSame = function (userType, password, confirmPassword) {
                InitionErrorMsg();
                if (password != confirmPassword) {
                    if (userType == 1) {
                        $scope.passwordConfirmMsg = "密码和确认密码不一致";
                    } else {
                        $scope.passwordConfirm2Msg = "密码和确认密码不一致";
                    }
                    $scope.ValidateMsg = "密码和确认密码不一致";
                    return false;
                }
                return true;
            }
            $scope.GetPhoneNumberValidateCode = function (userType) {
                InitionErrorMsg();
                if ($scope.ValidatePhoneNumber($scope.registration, userType) == false
                    || $scope.ValidatePhoneNumberPattern($scope.registration, userType) == false) {
                    return;
                }
                else {
                    var phoneNumber = $scope.registration.phoneNumber;
                    AuthService.GetPhoneNumberValidateCode(phoneNumber).then(function (result) {
                        var errorno = result.data.errorno;
                        if (errorno == 0) {
                            //手机验证码发送成功
                            //获取验证码按钮->禁用,灰色, 开始倒计时60秒,倒计时结束后可以重新获取验证码
                            var buttonElement;
                            if (userType == 1) {
                                buttonElement = angular.element("#btn_teacher_PhoneNumberValidateCode");
                            }
                            if (userType == 2) {
                                buttonElement = angular.element("#btn_student_PhoneNumberValidateCode");
                            }
                            $scope.StartTimer(buttonElement, 60000);
                        }
                        else {
                            if (errorno == 1) {
                                if (userType == 1) {
                                    $scope.phoneNumberMsg = "该手机号码已注册，请直接登录";
                                }
                                if (userType == 2) {
                                    $scope.phoneNumber2Msg = "该手机号码已注册，请直接登录";
                                }
                                $scope.ValidateMsg = "该手机号码已注册，请直接登录";
                                return;
                            }
                            var error = result.data.error;
                            $rootScope.openCommonErrorDialog("错误", error, null);
                        }
                    });
                }
            }

            $scope.CheckPhoneNumber = function (userType) {
                if (!$scope.ValidatePhoneNumber($scope.registration, userType)) {
                    return false;
                }
                var phoneNumber = $scope.registration.phoneNumber.toString();
                AuthService.CheckPhoneNumberExist(phoneNumber).then(function (result) {
                    if (result.data.errorno == 1) {
                        if (userType == 1) {
                            $scope.phoneNumberMsg = "该手机号码已注册，请直接登录";
                        }
                        if (userType == 2) {
                            $scope.phoneNumber2Msg = "该手机号码已注册，请直接登录";
                        }
                        $scope.ValidateMsg = "该手机号码已注册，请直接登录";
                    }
                });

            }
            $scope.CheckPhoneNumberVC = function (userType) {
                InitionErrorMsg();
                if (!$scope.ValidatePhoneNumberVC($scope.registration, userType)) {
                    return false;
                }

                var phoneNumber = $scope.registration.phoneNumber;
                var phoneNumberVC = $scope.registration.phoneNumberValidateCode;
                AuthService.CheckPhoneNumberVC(phoneNumber, phoneNumberVC).then(function (result) {
                    if (result.data.errorno == 0) {
                        //success
                    }
                    else {
                        if (userType == 1) {
                            $scope.TeacherPhoneNumberVCMsg = result.data.error;
                        } else if (userType == 2) {
                            $scope.StudentPhoneNumberVCMsg = result.data.error;
                        }
                        $scope.ValidateMsg = result.data.error;
                    }
                });

            }
            $scope.CheckInvateCode = function () {
                $scope.InvateCodeMsg = "";
                InitionErrorMsg();
                var inviteCode = $scope.registration.inviteCode;
                if (inviteCode == undefined || inviteCode == "") {
                    $scope.InvateCodeMsg = "请输入邀请码";
                    $scope.ValidateMsg = "请输入邀请码";
                    return false;
                }

                AuthService.CheckInvateCode(inviteCode).then(function (result) {
                    if (result.data.errorno == 0) {
                        //success
                    }
                    else {
                        $scope.InvateCodeMsg = result.data.error;
                        $scope.ValidateMsg = result.data.error;
                    }
                });

            }
            $scope.CheckEmail = function (userType) {
                InitionErrorMsg();
                if (userType == 1) {
                    $scope.TeacherEmailMsg = "";
                } else if (userType == 2) {
                    $scope.StudentEmailMsg = "";
                }

                var email = $scope.registration.email;
                if (email == undefined || email == "") {
                    if (userType == 1) {
                        $scope.TeacherEmailMsg = "您填写的邮箱不符合要求";
                    } else if (userType == 2) {
                        $scope.StudentEmailMsg = "您填写的邮箱不符合要求";
                    }
                    $scope.ValidateMsg = "您填写的邮箱不符合要求";
                    return false;
                }

                AuthService.CheckEmail(email).then(function (result) {
                    if (result.data.errorno == 0) {
                        //success
                    }
                    else {
                        if (userType == 1) {
                            $scope.TeacherEmailMsg = result.data.error;
                        } else if (userType == 2) {
                            $scope.StudentEmailMsg = result.data.error;
                        }
                        $scope.ValidateMsg = result.data.error;
                    }
                });

            }


            $scope.StartTimer = function (buttonElement, time) {
                //console.log(buttonElement);
                buttonElement.attr("disabled", "true");
                var InterValObj; //timer变量，控制时间            
                var curCount = time / 1000;//当前剩余秒数

                InterValObj = window.setInterval(function () {
                    if (curCount == 0) {
                        window.clearInterval(InterValObj);//停止计时器
                        buttonElement.removeAttr("disabled");//启用按钮
                        buttonElement.html("获取验证码");
                    }
                    else {
                        curCount--;
                        buttonElement.html("重新获取(" + curCount + "s)");
                    }
                }, 1000);

            }

            $scope.TriggerValidate = function (key) {
                console.log("userType:" + $scope.registration.userType);
                console.log($scope.registration);
                $scope.ValidateData($scope.registration, key);
            }

            $scope.SignUpTeacher = function () {

                $scope.infoMessage = "";


                //console.log("SignUpTeacher");
                $scope.registration.userType = 1;

                var validateResult = $scope.ValidateData($scope.registration);
                if (!validateResult) {
                    return;
                }

                $scope.doSignup($scope.registration);

            }

            $scope.SignUpStudent = function () {
                $scope.infoMessage = "";

                //console.log("SignUpStudent");
                $scope.registration.userType = 2;
                var validateResult = $scope.ValidateData($scope.registration);
                if (!validateResult) {
                    return;
                }

                $scope.doSignup($scope.registration);
            }

            $scope.doSignup = function (registrationData) {

                AuthService.SignUp(registrationData).then(function (response) {

                    // 邮箱注册, 显示提示信息
                    if (registrationData.registerType == 2) {
                        $rootScope.openCommonInfoDialog("提示", "系统给您发送了一封确认邮件,完成邮箱验证后,可通过此邮箱找回密码!", function (result) {
                            $scope.doAutoLogin(registrationData.email, registrationData.password);
                        });
                    }
                    else {
                        //手机注册
                        $scope.doAutoLogin(registrationData.phoneNumber, registrationData.password);
                    }
                }, function (error) {
                    $scope.ValidateMsg = "创建用户失败," + error.data.Message;
                }
                );
            };

            $scope.doAutoLogin = function (userName, password) {
                $scope.infoMessage = "用户创建成功,自动登录...";


                var loginData = {
                    userName: userName,
                    password: password,
                    useRefreshTokens: false
                };
                AuthService.login(loginData).then(
                       function (response) {
                           console.log("Login Success");

                           AuthService.ShowStandaloneView(true);

                           $state.go("completePersonalInfo");

                       },
                       function (err) {
                           console.log(err.error_description);
                           $scope.infoMessage = "登录错误:" + err.error_description;
                       }
                    );

            };

            $scope.CurrentTabIndex = 1;
            $scope.TabChange = function (tabIndex) {
                InitionErrorMsg();
                if (tabIndex == $scope.CurrentTabIndex) {
                    return;
                }

                $scope.CurrentTabIndex = tabIndex;

                $scope.registration.registerType = 1;
                $scope.registration.phoneNumber = "";
                $scope.registration.phoneNumberValidateCode = "";
                $scope.registration.email = "";
                $scope.registration.password = "";
                $scope.registration.confirmPassword = "";
                $scope.registration.inviteCode = "";
                $scope.registration.userType = tabIndex;

                $scope.TeacherPhoneNumberVCMsg = "";
                $scope.StudentPhoneNumberVCMsg = "";
                $scope.InvateCodeMsg = "";

                $scope.TeacherEmailMsg = "";
                $scope.StudentEmailMsg = "";

                $scope.phoneNumberMsg = "";
                $scope.passwordMsg = "";
                $scope.passwordConfirmMsg = "";
                $scope.phoneNumber2Msg = "";
                $scope.password2Msg = "";
                $scope.passwordConfirm2Msg = "";

                $scope.infoMessage = "";


                $("[name=confirmPasswordShow]").val("");
                $("[name=teacher_passwordShow]").val("");
                $("[name=student_passwordShow]").val("");
                $("[name=confirmPasswordStuShow]").val("");

            };

            $scope.CurrentRegisterType = 1;
            $scope.ChangeRegisterType = function (type) {
                if (type == $scope.CurrentRegisterType) {
                    return;
                }

                $scope.CurrentRegisterType = type;

                $scope.registration.phoneNumber = "";
                $scope.registration.phoneNumberValidateCode = "";
                $scope.registration.email = "";
                $scope.registration.password = "";
                $scope.registration.confirmPassword = "";
                $scope.registration.inviteCode = "";

                $scope.TeacherPhoneNumberVCMsg = "";
                $scope.StudentPhoneNumberVCMsg = "";
                $scope.InvateCodeMsg = "";

                $scope.TeacherEmailMsg = "";
                $scope.StudentEmailMsg = "";

                $scope.phoneNumberMsg = "";
                $scope.passwordMsg = "";
                $scope.passwordConfirmMsg = "";
                $scope.phoneNumber2Msg = "";
                $scope.password2Msg = "";
                $scope.passwordConfirm2Msg = "";

                $scope.infoMessage = "";

                $scope.ValidateMsg = "";
                angular.element("#teacher_passwordShow").val('');
                angular.element("#confirmPasswordShow").val('');
                angular.element("#student_passwordShow").val('');
                angular.element("#confirmPasswordStuShow").val('');
            }

        }])
    .controller('FindpwdCtrl', ['$scope', 'AuthService', '$state', '$stateParams', function ($scope, AuthService, $state, $stateParams) {


        var authData = AuthService.AuthData();
        var isAuth = authData ? authData.isAuth : false;

        if (isAuth) {
            AuthService.logout();
        }

        $scope.FindPwdParams = {
            UserName: "",
            Mobile: "",
            MobileValidNum: '',
            Email: "",
            FindType: 1,
        };


        $scope.message = "";

        $scope.ErrorMsg = {
            pwdPhoneMsg: '',
            pwdPhoneValidateMsg: '',
            pwdEmailMsg: '',
            ValidateMsg: "",
        };


        //手机找回
        $scope.Mobile_FindPwd = function () {
            $scope.ErrorMsg.pwdPhoneMsg = "";
            $scope.ErrorMsg.pwdPhoneValidateMsg = "";
            if ($scope.FindPwdParams.Mobile.trim() == '') {
                $scope.ErrorMsg.pwdPhoneMsg = "请输入手机号码";
                $scope.ErrorMsg.ValidateMsg = "请输入手机号码";
                return;
            }

            //if ($scope.FindPwdParams.MobileValidNum.trim() == '') {
            //    $scope.ErrorMsg.pwdPhoneValidateMsg = "请输入手机验证码";
            //    return;
            //}

            //验证验证码是否正确

            AuthService.CheckPhoneVCByFindPwd($scope.FindPwdParams.Mobile, $scope.FindPwdParams.MobileValidNum).then(function (result) {
                console.log(result);
                if (result.data.errorno == 0) {
                    //$stateParams.phoneNum = $scope.FindPwdParams.Mobile;
                    $state.go('resetpwd', { phoneNum: $scope.FindPwdParams.Mobile });
                } else {
                    if (result.data.errorno == 3) {
                        $scope.ErrorMsg.pwdPhoneMsg = result.data.error;
                    }
                    else {
                        $scope.ErrorMsg.pwdPhoneValidateMsg = result.data.error;
                    }
                    $scope.ErrorMsg.ValidateMsg = result.data.error;
                }
            });
        }
        //邮箱找回
        $scope.Email_FindPwd = function () {
            $scope.ErrorMsg.pwdEmailMsg = '';
            if ($scope.FindPwdParams.Email == undefined || $scope.FindPwdParams.Email.trim() == '') {
                $scope.ErrorMsg.pwdEmailMsg = "请输入注册邮箱地址";
                $scope.ErrorMsg.ValidateMsg = "请输入注册邮箱地址";
                return;
            }

            var emailType = 1; // 1=找回密码   2=验证邮箱
            AuthService.SendEmail($scope.FindPwdParams.Email, emailType).then(function (result) {
                if (result.data.errorno == 0) {
                    $scope.message = "邮件已发送成功";
                }
                else {
                    $scope.ErrorMsg.pwdEmailMsg = result.data.error;
                    $scope.ErrorMsg.ValidateMsg = result.data.error;
                }
            });

        }

        //获取手机验证码--------

        $scope.GetPhoneNumberValidateCode = function () {
            $scope.ErrorMsg.pwdPhoneMsg = '';
            $scope.ErrorMsg.pwdPhoneValidateMsg = '';
            var phoneNumber = $scope.FindPwdParams.Mobile.toString();
            if (phoneNumber == undefined || phoneNumber == "") {
                $scope.ErrorMsg.pwdPhoneMsg = "请输入手机号码";
                $scope.ErrorMsg.ValidateMsg = "请输入手机号码";
                return;
            }
            else if (phoneNumber.length != 11) {
                $scope.ErrorMsg.pwdPhoneMsg = "请输入正确的手机号码";
                $scope.ErrorMsg.ValidateMsg = "请输入正确的手机号码";
                return;
            }
            else {
                AuthService.GetPhoneNumberValidateCodeByFindPwd(phoneNumber).then(function (result) {
                    var errorno = result.data.errorno;
                    if (errorno == 0) {
                        //手机验证码发送成功
                        //获取验证码按钮->禁用,灰色, 开始倒计时60秒,倒计时结束后可以重新获取验证码
                        var buttonElement;
                        buttonElement = angular.element("#btnGetValidNum");
                        $scope.StartTimer(buttonElement, 60000);
                    }
                    else {
                        var error = result.data.error;
                        if (errorno == 1) {
                            $scope.ErrorMsg.pwdPhoneMsg = error;
                        } else {
                            $scope.ErrorMsg.pwdPhoneValidateMsg = error;
                        }
                        $scope.ErrorMsg.ValidateMsg = error;
                    }
                });
            }
        }

        $scope.InitMsg = function () {
            $scope.ErrorMsg = {
                pwdPhoneMsg: '',
                pwdPhoneValidateMsg: '',
                pwdEmailMsg: '',
                ValidateMsg: "",
            };
        }

        $scope.StartTimer = function (buttonElement, time) {
            //console.log(buttonElement);
            buttonElement.attr("disabled", "true");
            var InterValObj; //timer变量，控制时间            
            var curCount = time / 1000;//当前剩余秒数

            InterValObj = window.setInterval(function () {
                if (curCount == 0) {
                    window.clearInterval(InterValObj);//停止计时器
                    buttonElement.removeAttr("disabled");//启用按钮
                    buttonElement.html("获取验证码");
                }
                else {
                    curCount--;
                    buttonElement.html("重新获取(" + curCount + "s)");
                }
            }, 1000);

        }

        //获取手机验证码--------
    }])
    .controller('ResetPwdCtrl', ['$scope', '$rootScope', 'AuthService', '$state', '$stateParams', 'LocationService', function ($scope, $rootScope, AuthService, $state, $stateParams, LocationService) {

        AuthService.ShowStandaloneView(true);

        console.log($stateParams.phoneNum);

        $scope.ResetPwdParams = {
            NewPwd: "",
            ConfirmPwd: "",
            PhoneNum: "",
            Email: "",
        };

        $scope.ResetPwdParams.PhoneNum = $stateParams.phoneNum;
        $scope.ResetPwdParams.Email = $stateParams.email || '';
        console.log($scope.ResetPwdParams);
        $scope.message = "";

        $scope.ErrorMsg = {
            NewPwdMsg: '',
            ConfirmPwdMsg: '',
        };

        $scope.SavePwd = function () {

            $scope.ErrorMsg.NewPwdMsg = "";
            $scope.ErrorMsg.ConfirmPwdMsg = "";

            var resetParam = $scope.ResetPwdParams;

            if (resetParam.NewPwd == "") {
                $scope.ErrorMsg.NewPwdMsg = '请输入新密码';
                return;

            }
            if (resetParam.ConfirmPwd == "") {
                $scope.ErrorMsg.ConfirmPwdMsg = '请输入确认密码';
                return;

            }

            if (resetParam.NewPwd != resetParam.ConfirmPwd) {
                $scope.ErrorMsg.ConfirmPwdMsg = '新密码和确认密码不一致';
                return;
            }
            if (resetParam.PhoneNum.trim() == '' && resetParam.Email.trim() == '') {
                $rootScope.openCommonErrorDialog("错误", "无效的手机号码或邮箱地址", null);
                return;
            }
            AuthService.RestPwd($scope.ResetPwdParams).then(function (result) {

                if (result.data.errorno == 0) {

                    var userName = result.data.data;
                    var password = $scope.ResetPwdParams.NewPwd;
                    var loginData = {
                        userName: userName,
                        password: password,
                        useRefreshTokens: false
                    };
                    AuthService.login(loginData).then(
                           function (response) {
                               console.log("Login Success");
                               AuthService.ShowStandaloneView(false);
                               LocationService.GotoDefaultURL();

                           },
                           function (err) {
                               console.log(err.error_description);
                               $state.go("login");
                           }
                        );

                }
                else {
                    $rootScope.openCommonErrorDialog("错误", result.data.error, null);
                    return;
                }
            });
        }


    }])
    .controller('ValidateCtrl', ['$scope', '$rootScope', '$log', '$location', 'AuthService', 'Constants', '$state', 'LocationService', function ($scope, $rootScope, $log, $location, AuthService, Constants, $state, LocationService) {

        AuthService.ShowStandaloneView(true);

        $scope.validateData = {
            validateCode: "",
            password: ""
        };

        $scope.GetValidateCode = function () {
            $scope.validateData.validateCode = AuthService.ValidateData().validateCode;
            if ($scope.validateData.validateCode == undefined || $scope.validateData.validateCode == "") {
                console.log("No validateCode avaliable");
            }
        }
        $scope.GetValidateCode();

        $scope.passwordValidateMsg = "";

        $scope.UserName = "";

        $scope.doValidate = function () {
            $scope.passwordValidateMsg = "";

            if ($scope.validateData.password == "") {
                $scope.passwordValidateMsg = "请输入密码";
                return;
            }
            AuthService.ValidateEmail($scope.validateData).then(function (result) {
                if (result.data.errorno == 0) {
                    $scope.UserName = result.data.data;// 得到登录用户名

                    //清除本地的验证码信息
                    AuthService.ClearValidateData();

                    $rootScope.openCommonInfoDialog("提示", "恭喜您完成邮箱验证！", $scope.doAutologin);

                }
                else {
                    //$rootScope.openCommonErrorDialog("错误", "验证失败," + result.data.error, null);
                    $scope.passwordValidateMsg = result.data.error;
                }
            })

        };
        $scope.doAutologin = function () {
            var loginData = {
                userName: $scope.UserName,
                password: $scope.validateData.password,
                useRefreshTokens: false
            };
            console.log("doLogin");
            //登录
            AuthService.login(loginData).then(function (response) {
                console.log("Login Success");

                AuthService.ShowStandaloneView(false);
                LocationService.GotoDefaultURL();

            }, function (err) {
                console.log(err.error_description);
                $rootScope.openCommonErrorDialog("错误", "您输入的用户名或密码不正确", null);
            }
            );
        }
    }])

});
