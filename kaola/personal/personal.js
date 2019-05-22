define(['angular', 'placeholderjs', 'cropper', 'ng-table', 'ngToaster', 'ng-file-upload-all', 'FileAPI'], function (angular, placeholderjs) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('PersonalCtrl', ['$scope', '$state', 'AuthService', 'Constants', '$timeout', 'PersonalService', 'toaster', '$rootScope', '$stateParams', 'Upload', function ($scope, $state, AuthService, Constants, $timeout, PersonalService, toaster, $rootScope, $stateParams, Upload) {

        angular.element("#sidebar_menu").show();
        angular.element("#div_mainChildView").removeClass();
        angular.element("#div_mainChildView").addClass('col-xs-11 col-sm-11 col-md-11');
        console.log("adjust view in person page");

        $scope.AuthService = AuthService;
        //$scope.HeadPic = AuthService.AuthData().headPic;
        //$scope.NickName = AuthService.AuthData().nickName;
        $scope.IEVersion = getIEVersion();
        $scope.personalMenuItems =
              [
                    { 'title': '个人信息', 'state': 'personal.setting', icon: 'shezhi' },
                    { 'title': '修改密码', 'state': 'personal.changepassword', icon: 'mima' }
              ]
        ;

        var childview = $stateParams.childview;
        console.log("childview:" + childview);
        if (childview != undefined && childview != "") {
            $state.go("personal." + childview);
        }
        else {
            $state.go("personal.setting");
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
        var authData = AuthService.AuthData();
        $scope.ImportPercent = 0;
        $scope.ImportErrorMessage = "";
        $scope.ImportMessage = "";
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

                    PersonalService.updateHeadPic(imageBase64Data).then(function (result) {
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
                            toaster.error({ body: response.error, toasterId: 1 });
                        }
                    });
                }

            }
        };
        //Cropper

    }])

   .controller('PersonalSettingCtrl', ['$scope', '$rootScope', 'AuthService', 'Constants', 'PersonalService', 'toaster', function ($scope, $rootScope, AuthService, Constants, PersonalService, toaster) {

       angular.element("#sidebar_menu").show();
       angular.element("#div_mainChildView").removeClass();
       angular.element("#div_mainChildView").addClass('col-xs-11 col-sm-11 col-md-11');
       console.log("adjust view in person setting page");

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
           $scope.phoneNumberMsg = "";
           $scope.EmailMsg = "";

           if ($scope.ValidateUserInfo() == false) {
               return false;
           }

           var email = $scope.CurrentUserInfo.UserInfo.Email;
           if (email != undefined && email != '') {
               AuthService.CheckEmail(email).then(function (result) {
                   if (result.data.errorno == 0) {
                       $scope.doSaveInfo();
                   }
                   else if (result.data.errorno == 1) {
                       $scope.EmailMsg = "该邮箱已被注册";
                       return false;
                   }
               })
           }

           else {
               $scope.doSaveInfo();
           }
       }
       $scope.doSaveInfo = function () {
           var userInfo = $scope.CurrentUserInfo.UserInfo;
           PersonalService.saveInfo(userInfo).then(function (result) {
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
       $scope.CanGenerate = true;
       $scope.GetPhoneNumberValidateCode = function () {
           if ($scope.CanGenerate == false) {
               return;
           }
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
                       }, function (error) {
                           toaster.error({ body: "手机验证码发送错误" + error.data.Message });
                       });
                   }
                   else if (result.data.errorno == 1) {
                       $scope.phoneNumberMsg = "该手机号码已被注册";
                   }
               }, function (error) {
                   toaster.error({ body: "手机验证码发送错误" + error.data.Message });
               });

           }
       };
       $scope.StartTimer = function (buttonElement, time) {

           var InterValObj; //timer变量，控制时间            
           var curCount = time / 1000;//当前剩余秒数
           $scope.CanGenerate = false;
           InterValObj = window.setInterval(function () {
               if (curCount == 0) {
                   window.clearInterval(InterValObj);//停止计时器
                   //buttonElement.removeAttr("disabled");//启用按钮
                   $scope.CanGenerate = true;
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

           var email = $scope.CurrentUserInfo.UserInfo.Email;
           if (email != undefined && email != "") {
               var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
               if (emailFilter.test(email) == false) {
                   $scope.EmailMsg = "请输入正确格式的邮箱";
                   return false;
               }
           }

       }
   }])
   .controller('ChangePasswordCtrl', ['$scope', 'AuthService', 'Constants', 'toaster', function ($scope, AuthService, Constants, toaster) {


       $scope.oldPasswordMsg = "";
       $scope.newPasswordMsg = "";
       $scope.confirmPasswordMsg = "";
       angular.element("[name=oldPassword]").val("");
       angular.element("[name=newPassword]").val("");
       angular.element("[name=confirmNewpassword]").val("");
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
               if (angular.element("[name=" + pwdName + "]").val() == angular.element("[name=" + pwdName + "]").attr("placeholder")) {
                   angular.element("[name=" + pwdName + "]").val("");
               }
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
               if (angular.element("[name=newPasswordShow]").val() != angular.element("[name=newPasswordShow]").attr("placeholder")) {
                   angular.element("[name=newPassword]").val(angular.element("[name=newPasswordShow]").val());
                   $scope.changePasswordData.newPassword = angular.element("[name=newPasswordShow]").val();
               }
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

   .controller('CompletePersonalInfoCtrl', ['$scope', '$rootScope', 'AuthService', 'PersonalService', 'toaster', 'LocationService',
    function ($scope, $rootScope, AuthService, PersonalService, toaster, LocationService) {

        AuthService.ShowStandaloneView(true);

        $scope.HeadPic = "http://cdn.uukaola.com/web/img/defaultHeadPic.png";

        var nickName = AuthService.AuthData().nickName;
        if (nickName != "") {
            $scope.HeadPic = AuthService.AuthData().headPic;
        }

        $scope.UserInfo = {
            NickName: "",
            Sex: 1
        };

        $scope.infoMessage = "";
        $scope.errorMessage = "";

        $scope.CompletePersonalInfo = function () {
            $scope.errorMessage = "";
            if ($scope.CheckNickName() == false) {
                return;
            }

            PersonalService.UpdateUserInfo($scope.UserInfo).then(function (result) {
                if (result.data.errorno == 0) {
                    //console.log("Update UserInfo Success");
                    AuthService.UpdateNickName($scope.UserInfo.NickName);
                    AuthService.ShowStandaloneView(false);
                    LocationService.GotoDefaultURL();
                }
                else {
                    $scope.errorMessage = result.data.error;
                }
            });
        }

        $scope.nickNameMsg = "";
        $scope.CheckNickName = function () {
            $scope.nickNameMsg = "";
            if ($scope.UserInfo.NickName == undefined || $scope.UserInfo.NickName == "") {
                $scope.nickNameMsg = "请输入真实姓名";
                return false;
            }
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
                console.log(e);
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
            console.log(file.size);
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

        $scope.SaveHeadPic = function () {
            var headPicImg = angular.element('#HeadPicImg');

            if (headPicImg.data('cropper')) {

                var result = headPicImg.cropper('getCroppedCanvas');


                if (result) {
                    var imageBase64Data = result.toDataURL('image/png');

                    PersonalService.updateHeadPic(imageBase64Data).then(function (result) {
                        var response = result.data;
                        if (response.errorno == 0) {
                            var headPicUrl = response.data;
                            headPicUrl = headPicUrl + "?t=" + Math.random();
                            AuthService.UpdateHeadPic(headPicUrl);
                            $scope.HeadPic = headPicUrl;
                            console.log(headPicUrl);
                            toaster.success({ body: "头像修改成功", toasterId: 1 });
                            angular.element('#EditHeadPicDialog').modal('hide');
                        }
                        else {
                            toaster.error({ body: response.error, toasterId: 1 });
                        }
                    });
                }

            }
        };
        //Cropper

    }])
/*
* Services
*/
.service('PersonalService', function ($http, Constants) {

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

})

    /*
    * Directives
    */


});
