define(['angular', 'cropper', 'ng-table', 'ngToaster', 'ng-file-upload-all', 'FileAPI'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('StudentHomeCtrl', ['$rootScope', '$scope', 'AuthService', '$state', '$location', 'LocationService', '$timeout', '$stateParams', 'toaster', 'StudentHomePersonalService', 'Upload', 'Constants', 'stuClassService', function ($rootScope, $scope, AuthService, $state, $location, LocationService, $timeout, $stateParams, toaster, StudentHomePersonalService, Upload, Constants, stuClassService) {

        console.log("enter StudentHomeCtrl");
        $scope.IEVersion = getIEVersion();
        //Start 特殊处理页面样式, 隐藏个人中心链接, 左侧菜单
        angular.element("#navbar-personallink").hide();
        angular.element("#sidebar_menu").hide();
        angular.element("#div_mainChildView").removeClass();
        angular.element("#div_mainChildView").addClass('col-xs-12 col-sm-12 col-md-12');
        //End

        var childview = $stateParams.childview;
        console.log("childview:" + childview);
        if (childview != undefined && childview != "") {
            $state.go("studenthome." + childview);
        }
        else {
            $state.go("studenthome.studentreport");
        }


        //Start PersonalHeaderAndMenu

        $scope.personalMenuItems = AuthService.AuthData().menuItems.MenuItems;

        $scope.GetMenuTarget = function (item) {
            if (item.target != null && item.target != '') {
                return item.target;
            }
            return '';
        }

        //Cropper
        $scope.OpenEditHeadPicDialog = function () {
            angular.element('#EditHeadPicDialog').modal({ backdrop: 'static', keyboard: false });
        }
        $scope.CancelHeadPic = function () {
            angular.element('#EditHeadPicDialog').modal('hide');
        }

        $scope.ImageShowed = true;

        var options = {
            aspectRatio: 38 / 51,
            preview: '.img-preview',
            dragMode: 'move',
            crop: function (e) {
                //console.log(e);
            }
        };

        angular.element('#HeadPicImg').on({
            'build.cropper': function (e) {
                //console.log(e.type);
            },
            'built.cropper': function (e) {
                //console.log(e.type);
            },
            'cropstart.cropper': function (e) {
                //console.log(e.type, e.action);
            },
            'cropmove.cropper': function (e) {
                //console.log(e.type, e.action);
            },
            'cropend.cropper': function (e) {
                //console.log(e.type, e.action);
            },
            'crop.cropper': function (e) {
                // console.log(e.type, e.x, e.y, e.width, e.height, e.rotate, e.scaleX, e.scaleY);
            },
            'zoom.cropper': function (e) {
                // console.log(e.type, e.ratio);
            }
        }).cropper(options);

        $scope.ChangeImage = function (file) {

            var HeadPicImg = angular.element('#HeadPicImg');
            var inputImage = angular.element('#inputImage');

            if (!HeadPicImg.data('cropper')) {
                //return;
            }
            //console.log(file.size);
            if (file && file.size) {

                if (/^image\/\w+$/.test(file.type)) {

                    //console.log(file.size);
                    //if (file.size > 5 * 1024 * 1024) {
                    //    $rootScope.openCommonErrorDialog("错误", '文件大小不能超过5M', null);
                    //    return;
                    //}

                    var URL = window.URL || window.webkitURL;

                    var blobURL = URL.createObjectURL(file);
                    HeadPicImg.one('built.cropper', function () {

                        // Revoke when load complete
                        URL.revokeObjectURL(blobURL);
                    }).cropper('reset').cropper('replace', blobURL);
                    inputImage.val('');

                    $scope.ImageShowed = true;

                    $scope.OpenEditHeadPicDialog();

                } else {
                    $rootScope.openCommonErrorDialog("错误", '请选择图片', null);
                    return;
                }
            }

        }

        var authData = AuthService.AuthData();
        $scope.ImportPercent = 0;
        $scope.ImportErrorMessage = "";
        $scope.ImportMessage = "";

        $scope.OpenImportProgressDialog = function () {
            $scope.ImportPercent = 0;
            $scope.ImportErrorMessage = "";
            $scope.ImportMessage = "";
            angular.element('#ImportProgressDialog').modal({ backdrop: 'static', keyboard: false });
        }

        $scope.CloseImportProgressDialog = function () {
            $scope.ImportPercent = 0;
            $scope.ImportErrorMessage = "";
            $scope.ImportMessage = "";
            angular.element('#ImportProgressDialog').modal('hide');
        }

        $scope.UploadHeadPic = function ($files) {
            $scope.ImportPercent = 0;
            $scope.ImportErrorMessage = "";
            $scope.ImportMessage = "";
            var files = $files;
            if (files == undefined || files.length == 0 || files[0].name == "") {
                $scope.ImportErrorMessage = "请选择头像";
                return;
            }
            $scope.OpenImportProgressDialog();

            Upload.upload({
                url: GLOBAL_CENTRAL_URL + 'api/account/UploadHeadPic',
                data: { file: files, userID: authData != null && authData != undefined ? authData.userID : "" }
            }).progress(function (evt) {
                $scope.ImportMessage = "正在上传头像";
                $scope.ImportPercent = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function (data, status, headers, config) {

                $scope.CloseImportProgressDialog();

                console.log('success', data);

                if (data.errorno == 0) {
                    var headPicUrl = data.data;
                    headPicUrl = headPicUrl + "?t=" + Math.random();
                    AuthService.UpdateHeadPic(headPicUrl);
                    $scope.HeadPic = headPicUrl;
                    console.log(headPicUrl);

                } else {
                    $scope.ImportErrorMessage = "上传头像错误" + data.error;
                }

            }).error(function (data, status, headers, config) {
                if (data != undefined && data.Message != undefined) {
                    $scope.ImportErrorMessage = data.Message;
                }
                else {
                    $scope.ImportErrorMessage = "上传遇到异常";
                }
                $scope.ImportMessage = "";

                $scope.CloseImportProgressDialog();

            }).then(function (response) {

                $scope.CloseImportProgressDialog();
            });
        };


        $scope.SaveHeadPic = function () {
            var headPicImg = angular.element('#HeadPicImg');

            if (headPicImg.data('cropper')) {

                var result = headPicImg.cropper('getCroppedCanvas');

                if (result) {
                    var imageBase64Data = result.toDataURL('image/png');

                    StudentHomePersonalService.updateHeadPic(imageBase64Data).then(function (result) {
                        var response = result.data;
                        if (response.errorno == 0) {
                            var headPicUrl = response.data;
                            headPicUrl = headPicUrl + "?t=" + Math.random();
                            AuthService.UpdateHeadPic(headPicUrl);
                            $scope.HeadPic = headPicUrl;
                            console.log(headPicUrl);
                            //toaster.success({ body: "头像修改成功", toasterId: 1 });
                            angular.element('#EditHeadPicDialog').modal('hide');
                        }
                        else {
                            toaster.error({
                                body: response.error, toasterId: 1
                            });
                        }
                    });
                }

            }
        };
        //Cropper
        //End PersonalHeaderAndMenu


        //Start 学生绑定班级
        $scope.StudentClassData = [];

        $scope.LoadStuClsList = function () {
            StudentHomePersonalService.GetStudentClass().then(function (result) {
                $scope.StudentClassData = result.data;
                stuClassService.setData(result.data);
                $scope.BroadcastBindClassChangedEvent();
                console.log("StudentBindingClassData", $scope.StudentClassData);
            });
        }
        $scope.LoadStuClsList();


        $scope.BindClassParam = {
            ClassNumber: '',
            StudentNumber: '',
            StudentName: AuthService.AuthData().nickName,
        };

        $scope.BindJudge = function () {
            $scope.BindClassParam = {
                ClassNumber: '',
                StudentNumber: '',
                StudentName: AuthService.AuthData().nickName,
            };
            angular.element('#StudentBindClassDialog').modal({ backdrop: 'static', keyboard: false });
        };

        $scope.BindClass = function () {
            StudentHomePersonalService.bindClass($scope.BindClassParam).then(function (result) {
                // update Constants
                var data = result.data;
                GLOBAL_API_URL = data.apiServiceBaseUri;
                GLOBAL_CENTRAL_URL = data.authServiceBaseUri;
                GLOBAL_ANSWER_URL = data.answerBaseUrl;
                GLOBAL_PAPER_RESOURCE_URL = data.paperResourceBaseUrl;
                AuthService.UpdateApiURLForAuthData(GLOBAL_API_URL, GLOBAL_CENTRAL_URL, GLOBAL_ANSWER_URL, GLOBAL_PAPER_RESOURCE_URL);
                //
                $scope.LoadStuClsList();
                angular.element('#StudentBindClassDialog').modal('hide');

                // $scope.BroadcastBindClassChangedEvent('addBinding');
                //toaster.success({ body: data, toasterId: 'sctoaster' });
                $state.go("studenthome.studentreport");
            }, function (error) {
                var errormsg = error.data.Message;
                toaster.error({ body: errormsg, toasterId: 'sctoaster' });
            });
        };


        $scope.ChoosedModel = {};
        $scope.OpenCancelBindClsDialog = function (stucls) {
            console.log(stucls);
            $scope.ChoosedModel = stucls;
            $rootScope.openCommonModalDialog("确认取消绑定", "您确定要取消绑定吗？", $scope.CancelBindClass);
        }


        $scope.CancelBindClass = function () {
            var data = {
                ClassID: $scope.ChoosedModel.ClassID,
                ClassNumber: $scope.ChoosedModel.ClassNumber,
                StudentNumber: $scope.ChoosedModel.StudentNumber
            };
            StudentHomePersonalService.CancelBindClass(data).then(function (result) {

                // update Constants
                var data = result.data;
                GLOBAL_API_URL = data.apiServiceBaseUri;
                GLOBAL_CENTRAL_URL = data.authServiceBaseUri;
                GLOBAL_ANSWER_URL = data.answerBaseUrl;
                GLOBAL_PAPER_RESOURCE_URL = data.paperResourceBaseUrl;
                AuthService.UpdateApiURLForAuthData(GLOBAL_API_URL, GLOBAL_CENTRAL_URL, GLOBAL_ANSWER_URL, GLOBAL_PAPER_RESOURCE_URL);
                //

                $scope.LoadStuClsList();
                // $scope.BroadcastBindClassChangedEvent('cancelBinding');
                //toaster.success({ body: result.data });
            });
        }

        $scope.BroadcastBindClassChangedEvent = function () {
            $scope.$broadcast('bindClassChanged');
        }

        //End
    }])


    .controller('StudentHomeReportCtrl', ['$scope', 'NgTableParams', 'AuthService', '$state', 'StudentHomeReportService', '$stateParams', 'toaster', 'Constants', 'stuClassService', function ($scope, NgTableParams, AuthService, $state, StudentHomeReportService, $stateParams, toaster, Constants, stuClassService) {

        console.log("enter StudentHomeReportCtrl");

        $scope.AuthService = AuthService;

        $scope.ShowBdClassView = 0;
        $scope.ShowStudentReportView = 0;

        //处理传递过来的参数
        $scope.CurrentClassID = $stateParams.classID;
        console.log("ClassID:" + $scope.CurrentClassID);
        $scope.CurrentStudentNumber = $stateParams.studentNumber;
        console.log("StudentNumber:" + $scope.CurrentStudentNumber);
        $scope.From = $stateParams.from;
        console.log("From:" + $scope.From);

        $scope.CheckIfExistBindingClass = function () {
            // StudentHomeReportService.GetStudentClass().then(function (result) {
            //     //console.log(result);
            //     if (angular.isArray(result.data) && result.data.length > 0) {
            //         $scope.ShowBdClassView = 0;
            //         $scope.ShowStudentReportView = 1;
            //         $scope.QueryTaskScoreList();
            //     } else {
            //         $scope.ShowBdClassView = 1;
            //         $scope.ShowStudentReportView = 0;
            //     }
            // });
            var data = stuClassService.getData();
            if (angular.isArray(data) && data.length > 0) {
                $scope.ShowBdClassView = 0;
                $scope.ShowStudentReportView = 1;
                setTimeout(function () {
                    $scope.QueryTaskScoreList();
                }, 0);
            } else {
                $scope.ShowBdClassView = 1;
                $scope.ShowStudentReportView = 0;
            }
        }

        //Start 检查是否需要显示 [提示绑定班级]
        if ($scope.CurrentClassID != undefined
            && $scope.CurrentClassID != ""
            && $scope.CurrentStudentNumber != undefined
            && $scope.CurrentStudentNumber != "") {
            //教师从班级学生管理页面跳转到 查看学生成绩报告的列表
            $scope.ShowBdClassView = 0;
            $scope.ShowStudentReportView = 1;

        } else {
            $scope.CheckIfExistBindingClass();
        }

        //监听绑定班级变化的事件
        $scope.$on('bindClassChanged', function (event) {
            console.log('bindClassChanged event triggered');
            $scope.CheckIfExistBindingClass();
        });


        $scope.ToStudentReport = function () {
            $state.go('studenthome', { childview: 'studentreport' });
        }

        //绑定班级
        $scope.BindJudge = function () {
            $scope.BindClassParam = {
                ClassNumber: '',
                StudentNumber: '',
                StudentName: AuthService.AuthData().nickName,
            };
            angular.element('#StudentBindClassDialog').modal({ backdrop: 'static', keyboard: false });
        };

        $scope.BindClass = function () {
            StudentHomeReportService.bindClass($scope.BindClassParam).then(function (result) {

                // update Constants
                var data = result.data;
                GLOBAL_API_URL = data.apiServiceBaseUri;
                GLOBAL_CENTRAL_URL = data.authServiceBaseUri;
                GLOBAL_ANSWER_URL = data.answerBaseUrl;
                GLOBAL_PAPER_RESOURCE_URL = data.paperResourceBaseUrl;
                AuthService.UpdateApiURLForAuthData(GLOBAL_API_URL, GLOBAL_CENTRAL_URL, GLOBAL_ANSWER_URL, GLOBAL_PAPER_RESOURCE_URL);
                //

                angular.element('#StudentBindClassDialog').modal('hide');

                $scope.ToStudentReport();
            }, function (error) {
                toaster.error({ body: error.data.Message, toasterId: 'dialog1' });
            });
        };



        //End 检查是否需要显示 [提示绑定班级]

        $scope.QueryParams = {
            PostParams: [],
            TaskName: '',
        };

        $scope.TaskScoreListData = [];

        $scope.TaskScoreList = new NgTableParams({ count: 50 }, {
            counts: [50, 100],
            getData: function (params) {
                if ($scope.CurrentClassID != undefined
                    && $scope.CurrentClassID != ""
                    && $scope.CurrentStudentNumber != undefined
                    && $scope.CurrentStudentNumber != "") {

                    $scope.QueryParams.StudentNumber = $scope.CurrentStudentNumber;
                    $scope.QueryParams.ClassID = $scope.CurrentClassID;
                } else {
                    $scope.QueryParams.StudentID = AuthService.AuthData().userID;
                }
                $scope.QueryParams.PostParams = null;//学生主页的报告没有分页
                //console.log(params.parameters());
                return StudentHomeReportService.GetReport_TaskListForStudent($scope.QueryParams).then(function (results) {

                    params.total(results.data.Count);
                    $scope.TaskScoreListData = results.data.TaskStudentListData;
                    //console.log($scope.TaskScoreListData);
                    return results.data.TaskStudentListData;
                });
            }
        });

        $scope.QueryTaskScoreList = function () {
            $scope.TaskScoreList.reload();
        };
        // $scope.QueryTaskScoreList();

    }])

    .controller('StudentHomePersonalSettingCtrl', ['$scope', '$rootScope', 'AuthService', 'Constants', 'StudentHomePersonalService', 'toaster', function ($scope, $rootScope, AuthService, Constants, StudentHomePersonalService, toaster) {
        $scope.IEVersion = getIEVersion();
        //console.log("init PersonalSettingCtrl");

        $scope.CurrentUserInfo = {
            UserInfo: {}
        };

        $scope.SchoolInvateCode = {
            InvateCode: "",
        };

        $scope.packageInfo = {
            packageCode: ""
        }

        $scope.OldPhoneNumber = "";
        $scope.OldEmail = "";
        $scope.OldEmailConfirmed = false;
        AuthService.GetUserInfo().then(function (result) {
            $scope.CurrentUserInfo.UserInfo = result.data;

            $scope.OldPhoneNumber = $scope.CurrentUserInfo.UserInfo.PhoneNumber;
            $scope.OldEmail = $scope.CurrentUserInfo.UserInfo.Email;
            $scope.OldEmailConfirmed = $scope.CurrentUserInfo.UserInfo.EmailConfirmed;

            //console.log($scope.CurrentUserInfo.UserInfo);
            $scope.packageInfo.packageCode = $scope.CurrentUserInfo.UserInfo.PackageCode;

        });

        $scope.SaveInfo = function () {

            if ($scope.ValidateUserInfo() == false) {
                return false;
            }
            $scope.phoneNumberMsg = "";
            $scope.EmailMsg = "";

            var userInfo = $scope.CurrentUserInfo.UserInfo;
            StudentHomePersonalService.saveInfo(userInfo).then(function (result) {
                //console.log(result);
                toaster.success({ body: result.data });
                AuthService.GetUserInfo().then(function (result) {
                    $scope.CurrentUserInfo.UserInfo = result.data;

                    $scope.OldPhoneNumber = $scope.CurrentUserInfo.UserInfo.PhoneNumber;
                    $scope.OldEmail = $scope.CurrentUserInfo.UserInfo.Email;
                    $scope.OldEmailConfirmed = $scope.CurrentUserInfo.UserInfo.EmailConfirmed;

                    console.log($scope.CurrentUserInfo.UserInfo);
                    $scope.packageInfo.packageCode = $scope.CurrentUserInfo.UserInfo.PackageCode;

                });

            }, function (error) {
                toaster.error({ body: error.data.Message });
            });
        }


        $scope.IsShow = function (typeArr) {
            var usertype = $scope.CurrentUserInfo.UserInfo.UserType;
            //console.log(usertype);
            if (usertype == undefined)
                return;
            var con = [];
            angular.forEach(typeArr, function (item, i) {
                if (usertype == item) {
                    con.push(item);
                }
            });
            if (con.length > 0)
                return true;
            return false;
        }

        $scope.CheckPhoneNumber = function () {
            var phoneNumber = $scope.CurrentUserInfo.UserInfo.PhoneNumber;

            if ($scope.ValidatePhoneNumber(phoneNumber) == false
                || $scope.ValidatePhoneNumberPattern(phoneNumber) == false) {
                return false;
            }
        }
        $scope.GetPhoneNumberValidateCode = function () {

            var phoneNumber = $scope.CurrentUserInfo.UserInfo.PhoneNumber;

            if ($scope.ValidatePhoneNumber(phoneNumber) == false
                || $scope.ValidatePhoneNumberPattern(phoneNumber) == false) {
                return false;
            }
            else {
                AuthService.CheckPhoneNumberExist(phoneNumber).then(function (result) {

                    if (result.data.errorno == 0) {
                        AuthService.GetPhoneNumberValidateCode(phoneNumber).then(function (result) {
                            var errorno = result.data.errorno;
                            if (errorno == 0) {
                                //手机验证码发送成功
                                //获取验证码按钮->禁用,灰色, 开始倒计时60秒,倒计时结束后可以重新获取验证码
                                var buttonElement = angular.element("#btn_PhoneNumberValidateCode");
                                $scope.StartTimer(buttonElement, 60000);
                                angular.element("#PhoneNumberValidateCodeDialog").modal({ backdrop: 'static', keyboard: false });
                            }
                            else {
                                var error = result.data.error;
                                toaster.error({ body: "手机验证码发送错误" + error });
                            }
                        });
                    }
                    else if (result.data.errorno == 1) {
                        $scope.phoneNumberMsg = "该手机号码已被注册";
                    }
                })

            }
        };
        $scope.StartTimer = function (buttonElement, time) {
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

        $scope.phoneNumberMsg = "";
        $scope.ValidatePhoneNumber = function (phoneNumber) {
            $scope.phoneNumberMsg = "";
            if (phoneNumber == undefined || phoneNumber == "") {
                $scope.phoneNumberMsg = "请输入手机号码";
                return false;
            }
            return true;
        };
        $scope.ValidatePhoneNumberPattern = function (phoneNumber) {
            $scope.phoneNumberMsg = "";
            var reg = /^0?1[3|4|5|8|7][0-9]\d{8}$/;
            var valid = reg.test(phoneNumber);
            if (valid == false) {
                $scope.phoneNumberMsg = "请输入正确的手机号码";
                return false;
            }
            return true;
        };

        $scope.EmailMsg = "";
        $scope.CheckEmailIfNeedValidate = function () {
            $scope.EmailMsg = "";
            var newEmail = $scope.CurrentUserInfo.UserInfo.Email;
            if (newEmail != $scope.OldEmail) {
                $scope.CurrentUserInfo.UserInfo.EmailConfirmed = false;
            } else {
                $scope.CurrentUserInfo.UserInfo.EmailConfirmed = $scope.OldEmailConfirmed;
            }
        }

        $scope.SendValidateEmail = function () {
            $scope.EmailMsg = "";
            var email = $scope.CurrentUserInfo.UserInfo.Email;

            if (email == undefined || email == "") {
                $scope.EmailMsg = "请输入邮箱";
                return false;
            }

            var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (emailFilter.test(email) == false) {
                $scope.EmailMsg = "请输入正确格式的邮箱";
                return false;
            }

            AuthService.CheckEmail(email).then(function (result) {
                if (result.data.errorno == 0) {
                    var emailType = 2; // 1=找回密码   2=验证邮箱
                    AuthService.SendEmail(email, emailType).then(function (result) {
                        if (result.data.errorno == 0) {
                            $rootScope.openCommonInfoDialog("消息", "邮件已发送成功，请您登录邮箱完成验证！", null);
                        }
                        else {
                            $rootScope.openCommonErrorDialog("错误", "邮件发送错误" + result.data.error, null);
                        }
                    });
                }
                else if (result.data.errorno == 1) {
                    $scope.EmailMsg = "该邮箱已被注册";
                    return false;
                }
            })

        };

        $scope.PhoneNumberValidateCode = "";
        $scope.PhoneNumberValidateCodeMsg = "";
        $scope.ActivePhoneNumberValidateCode = function () {
            $scope.PhoneNumberValidateCodeMsg = "";
            if ($scope.PhoneNumberValidateCode == undefined || $scope.PhoneNumberValidateCode == "") {
                $scope.PhoneNumberValidateCodeMsg = "请输入手机验证码";
                return;
            }

            var phoneNumber = $scope.CurrentUserInfo.UserInfo.PhoneNumber;
            AuthService.ActivePhoneNumberValidateCode(phoneNumber, $scope.PhoneNumberValidateCode).then(function (result) {
                if (result.data.errorno == 0) {
                    $scope.PhoneNumberValidateCodeMsg = "";
                    $scope.CurrentUserInfo.UserInfo.PhoneNumberConfirmed = true;
                    angular.element("#PhoneNumberValidateCodeDialog").modal("hide");
                }
                else {
                    $scope.PhoneNumberValidateCodeMsg = "您输入的验证码有误";
                }
            });
        };


        $scope.RebindPhoneNumber = function () {
            $scope.CurrentUserInfo.UserInfo.PhoneNumber = "";
            $scope.CurrentUserInfo.UserInfo.PhoneNumberConfirmed = false;
        }

        $scope.nickNameMsg = "";
        $scope.CheckNickName = function () {
            $scope.nickNameMsg = "";
            var nickName = $scope.CurrentUserInfo.UserInfo.NickName;
            if (nickName == undefined || nickName == "") {
                $scope.nickNameMsg = "请输入真实姓名";
                return false;
            }
        }


        $scope.ValidateUserInfo = function () {
            if ($scope.CheckNickName() == false) {
                return false;
            }
            if ($scope.OldPhoneNumber != $scope.CurrentUserInfo.UserInfo.PhoneNumber && $scope.CurrentUserInfo.UserInfo.PhoneNumberConfirmed == false) {
                $scope.phoneNumberMsg = "请完成手机号码验证";
                return false;
            }

            if ($scope.CurrentUserInfo.UserInfo.PhoneNumber == "" && $scope.CurrentUserInfo.UserInfo.Email == "") {
                $scope.phoneNumberMsg = "请输入手机号码";
                $scope.EmailMsg = "请输入邮箱";
                return false;
            }
        }
    }])

    .controller('StudentHomeChangePasswordCtrl', ['$scope', 'AuthService', 'Constants', 'toaster', function ($scope, AuthService, Constants, toaster) {

        $scope.oldPasswordMsg = "";
        $scope.newPasswordMsg = "";
        $scope.confirmPasswordMsg = "";

        $scope.changePasswordData = {
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
        $(".eye-icon").click(function () {
            var pwdName = $(this).attr("for");
            if ($(this).attr("checked")) {
                $(this).attr("checked", false);
                $(this).attr("src", "http://cdn.uukaola.com/web/img/login/eyeselected.png");
                angular.element("[name=" + pwdName + "Show]").show();
                angular.element("[name=" + pwdName + "]").hide();
            }
            else {
                $(this).attr("checked", true);
                $(this).attr("src", "http://cdn.uukaola.com/web/img/login/eyeunselect.png");
                angular.element("[name=" + pwdName + "Show]").hide();
                angular.element("[name=" + pwdName + "]").show();
            }
        });
        $("[name=oldPassword]").change(function () {
            if (!angular.element("[name=oldPassword]").hidden) {
                angular.element("[name=oldPasswordShow]").val(angular.element("[name=oldPassword]").val());
            }
        });
        $("[name=oldPasswordShow]").change(function () {
            if (!angular.element("[name=oldPasswordShow]").hidden) {
                angular.element("[name=oldPassword]").val(angular.element("[name=oldPasswordShow]").val());
                $scope.changePasswordData.oldPassword = angular.element("[name=oldPasswordShow]").val();
            }
        });
        $("[name=newPassword]").change(function () {
            if (!angular.element("[name=newPassword]").hidden) {
                angular.element("[name=newPasswordShow]").val(angular.element("[name=newPassword]").val());
            }
        });
        $("[name=newPasswordShow]").change(function () {
            if (!angular.element("[name=newPasswordShow]").hidden) {
                angular.element("[name=newPassword]").val(angular.element("[name=newPasswordShow]").val());
                $scope.changePasswordData.newPassword = angular.element("[name=newPasswordShow]").val();
            }
        });
        $("[name=confirmNewpassword]").change(function () {
            if (!angular.element("[name=confirmNewpassword]").hidden) {
                angular.element("[name=confirmNewpasswordShow]").val(angular.element("[name=confirmNewpassword]").val());
            }
        });
        $("[name=confirmNewpasswordShow]").change(function () {
            if (!angular.element("[name=confirmNewpasswordShow]").hidden) {
                angular.element("[name=confirmNewpassword]").val(angular.element("[name=confirmNewpasswordShow]").val());
                $scope.changePasswordData.confirmPassword = angular.element("[name=confirmNewpasswordShow]").val();
            }
        });
        $scope.ValidateData = function (data) {

            $scope.oldPasswordMsg = "";
            $scope.newPasswordMsg = "";
            $scope.confirmPasswordMsg = "";

            var hasError = false;
            if (data.oldPassword == undefined || data.oldPassword == "") {
                $scope.oldPasswordMsg = "请输入旧密码";
                hasError = true;
            }
            if (data.newPassword == undefined || data.newPassword == "") {
                $scope.newPasswordMsg = "请输入新密码";
                hasError = true;

            }
            if (data.confirmPassword == undefined || data.confirmPassword == "") {
                $scope.confirmPasswordMsg = "请输入确认密码";
                hasError = true;
            }
            if (data.confirmPassword != undefined && data.confirmPassword != "" && data.newPassword != undefined && data.newPassword != "" && data.newPassword != data.confirmPassword) {
                $scope.confirmPasswordMsg = "新密码和确认密码不一致";
                hasError = true;
            }

            if (hasError == false) {
                return true;
            }
            else {
                return false;
            }

        }
        $scope.ChangePassword = function () {

            if (!$scope.ValidateData($scope.changePasswordData)) {
                return;
            }

            AuthService.ChangePassword($scope.changePasswordData).then(function (response) {
                toaster.success({ body: "修改成功" });
            }, function (error) {
                toaster.error({ body: "您输入的旧密码有误" });
            });
        }


    }])

    .service('StudentHomePersonalService', function ($http, Constants) {
        var self = this;

        //个人身份信息
        self.getSchoolList = function () {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/schoolList');
        }

        self.getSchoolInfo = function () {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/schoolInfo');
        }

        self.saveInfo = function (userinfo) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/saveinfo', { UserInfo: userinfo });
        }
        self.activeContent = function (userinfo, schoolId, packageCode) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/activecontent', { UserInfo: userinfo, SchoolID: schoolId, PackageCOde: packageCode });
        }

        self.updateHeadPic = function (imageBase64Data) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/updateHeadPic', { ImageData: imageBase64Data });
        }

        self.UpdateUserInfo = function (userinfo) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/updateUserInfo', userinfo);
        }


        //业务相关

        self.GetStudentClass = function () {
            return $http.get(GLOBAL_CENTRAL_URL + 'api/account/stuClass');
        }

        self.bindClass = function (bindclassnfo) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/bindclass', bindclassnfo);
        }

        self.CancelBindClass = function (data) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/cancelBindclass', data);
        }
    })

    .service('StudentHomeReportService', function ($http, Constants) {

        var self = this;

        self.GetStudentClass = function () {
            return $http.get(GLOBAL_CENTRAL_URL + 'api/account/stuClass');
        }

        self.bindClass = function (bindclassnfo) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/bindclass', bindclassnfo);
        }


        self.GetReport_TaskListForStudent = function (queryParams) {
            return $http.post(GLOBAL_API_URL + 'api/report/report_TaskListForStudentReport', queryParams);
        }
    })

    .service('stuClassService', function () {
        var data = [];
        this.getData = function () {
            return data;
        }
        this.setData = function (d) {
            data = d;
        }
    });

});