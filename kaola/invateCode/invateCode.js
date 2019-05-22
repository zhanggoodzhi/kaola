define(['angular', 'ng-table', 'ngToaster'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('invateCodeCtrl', ['$scope', 'AuthService', 'Constants', 'NgTableParams', 'InvateCodeService', 'toaster', '$rootScope', function ($scope, AuthService, Constants, NgTableParams, InvateCodeService, toaster, $rootScope) {

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
                angular.element("[name=" + pwdName + "Show").hide();
                angular.element("[name=" + pwdName).show();
            }
        });
        $("[name=pwd]").change(function () {
            if (!angular.element("[name=pwd]").hidden) {
                angular.element("[name=pwdShow]").val(angular.element("[name=pwd]").val());
            }
        });
        $("[name=pwdShow]").change(function () {
            if (!angular.element("[name=pwdShow]").hidden) {
                angular.element("[name=pwd]").val(angular.element("[name=pwdShow]").val());
                $scope.ChoosedCode.Pwd = angular.element("[name=pwdShow]").val();
            }
        });
        $scope.hasData = true;

        $scope.InvateCodeList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 30, 50],
            getData: function (params) {
                //console.log(params);
                return InvateCodeService.getBindingInvateCodeList(params.parameters()).then(function (results) {
                    console.log(results);
                    params.total(results.data.Count);
                    $scope.hasData = results.data.TotalInvateCodeCount > 0;
                    return results.data.BindingInvateCodeModels;
                }, function (error) {
                    toaster.error({ body: error.data.Message });
                });
            }

        });


        //$scope.InvateCodeList.reload();

        $scope.InvateCodeNumMsg = "";
        $scope.CheckInvateCodeNum = function (invateCodeNum) {
            $scope.InvateCodeNumMsg = "";
            if (invateCodeNum == undefined || invateCodeNum == "") {
                $scope.InvateCodeNumMsg = "请输入生成数量";
                return false;
            }
            if (isNaN(invateCodeNum)) {
                $scope.InvateCodeNumMsg = "请输入数字";
                return false;
            }

            if (invateCodeNum.indexOf(".") != -1) {
                $scope.InvateCodeNumMsg = "请输入有效的整数( 1~50 )";
                return false;
            }

            if (invateCodeNum <= 0) {
                $scope.InvateCodeNumMsg = "请输入正确的数量( 1~50 )";
                return false;
            }
            if (invateCodeNum > 50) {
                $scope.InvateCodeNumMsg = "最多输入数量50";
                return false;
            }
            return true;
        };
        $scope.InvateCodeNum = "";
        $scope.GenerateIC = function () {
            if ($scope.CheckInvateCodeNum($scope.InvateCodeNum) == false) {
                return;
            }

            InvateCodeService.generateIC($scope.InvateCodeNum).then(function () {
                $scope.InvateCodeList.reload();
                angular.element('#SchoolInvateCodeDialog').modal('hide');
            }, function (result) {
                console.log(result);
                toaster.error({ body: result.data.Message, toasterId: 'dialog2' });
            });
        }

        $scope.OpenSICDialog = function () {
            $scope.InvateCodeNum = "";
            $scope.InvateCodeNumMsg = "";
            angular.element('#SchoolInvateCodeDialog').modal({ backdrop: 'static', keyboard: false });

        }

        $scope.DeleteCode = "";
        $scope.CodeBindUserID = "";
        $scope.DeleteInvateCode = function (code, userId) {
            $scope.DeleteCode = code;
            $scope.CodeUserID = userId;

            $rootScope.openCommonModalDialog("确认", "您确定要删除该邀请码吗？", function () {
                if ($scope.CodeBindUserID == null || $scope.CodeBindUserID == undefined) {
                    $scope.CodeBindUserID = '';
                }
                if ($scope.DeleteCode == null || $scope.DeleteCode == undefined) {
                    $scope.DeleteCode = '';
                    return;
                }

                console.log($scope.DeleteCode + ',' + $scope.CodeBindUserID);
                InvateCodeService.deleteIC($scope.DeleteCode, $scope.CodeBindUserID).then(function (result) {

                    toaster.success({ body: "删除成功" });

                    $scope.InvateCodeList.reload();
                }, function (error) {
                    toaster.error({ body: "删除失败" + error.data.Message });
                });
            })



        }


        //教师管理
        $scope.ChoosedTeacher = {};
        $scope.OpenTeacherDialog = function (teacher) {
            console.log(teacher);
            $scope.ChoosedTeacher = teacher;
            $scope.IsShowPwd = false;
            $scope.PwdMsg = '';
            $scope.PwdErrorMsg = '';
            angular.element("#TeacherDialog").modal({ backdrop: 'static', keyboard: false });
        }

        //----密码重置


        //$scope.OpenResetPwdDialog = function () {
        //    $rootScope.openCommonModalDialog("重置密码", "你确认要更新密码为初始密码么？", $scope.ResetPwd);
        //}


        $scope.IsShowPwd = false;
        $scope.ShowPwd = function () {
            $scope.IsShowPwd = true;
            $scope.PwdMsg = '';
            $scope.PwdErrorMsg = '';
        }

        $scope.ClearPwd = function () {
            $scope.ChoosedTeacher.Pwd = '';
            $scope.PwdMsg = '';
            $scope.PwdErrorMsg = '';
            $scope.IsShowPwd = false;
        }
        $scope.PwdErrorMsg = '';
        $scope.ResetPwd = function () {
            $scope.PwdMsg = '';
            $scope.PwdErrorMsg = '';
            var userID = $scope.ChoosedTeacher.UserID;
            var pwd = $scope.ChoosedTeacher.Pwd;
            if (pwd == undefined || pwd == '') {
                $scope.PwdErrorMsg = "请输入密码";
                return;
            }

            InvateCodeService.ResetPwd(userID, pwd).then(function (result) {
                $scope.PwdMsg = "密码重置成功";
                $scope.IsShowPwd = false;
                //toaster.success({ body: "重置成功", toasterId: 'dialog1' });
            });
        }

        $scope.SaveTeacher = function () {
            //console.log($scope.ChoosedTeacher);
            InvateCodeService.UpdateUserInfo($scope.ChoosedTeacher.UserID, $scope.ChoosedTeacher.AulStatus).then(function (result) {
                $scope.InvateCodeList.reload();
                //toaster.success({ body: "保存成功", toasterId: 'dialog1' });
                angular.element("#TeacherDialog").modal('hide');
            });
        }

        $scope.OpenSICFromSchoolDialog = function () {
            angular.element("#InvateCodeDialog").modal({ backdrop: 'static', keyboard: false });
            $scope.InvateCodeListFromSchhol = new NgTableParams({ count: 10 }, {
                counts: [10, 20, 30, 50],
                getData: function (params) {
                    return InvateCodeService.GetInvateCodeFromSchool(params.parameters()).then(function (results) {
                        console.log(results);
                        return results.data;
                    }, function (error) {
                        console.log(error);
                    });
                }
            });


        }
        $scope.ChoosedCode = {};
        var pwdDialog = angular.element("#ResetPwdDialog");
        pwdDialog.on("shown.bs.modal", function () {
            angular.element("[name=pwdShow]").val("");
            angular.element("[name=pwd]").val("");
            var pwdName = $(".eye-icon").attr("for");
            $(".eye-icon").attr("checked", true);
            $(".eye-icon").attr("src", "http://cdn.uukaola.com/web/img/login/eyeunselect.png");
            angular.element("[name=" + pwdName + "Show").hide();
            angular.element("[name=" + pwdName).show();
        })
        $scope.OpenResetPwdDialog = function (invateCode) {
            //$scope.ChoosedCode.Pwd = "";
            $scope.ChoosedCode = invateCode;
            pwdDialog.modal({ backdrop: 'static', keyboard: false });
        }

        $scope.ResetPwd2 = function () {
            $scope.PwdErrorMsg = '';
            var userID = $scope.ChoosedCode.UserID;
            var pwd = $scope.ChoosedCode.Pwd;
            if (pwd == undefined || pwd == '') {
                $scope.PwdErrorMsg = "请输入密码";
                return;
            }

            InvateCodeService.ResetPwd(userID, pwd).then(function (result) {
                $scope.PwdMsg = "密码重置成功";
                $scope.IsShowPwd = false;
                pwdDialog.modal('hide');
            }, function (result) {
                toaster.error({ body: "重置失败", toasterId: 'dialog1' });
            });
        }

        //启用
        $scope.EnalbleTeacher = function (userId) {

            $rootScope.openCommonModalDialog("确认", "您确定要启用吗？", function () {

                InvateCodeService.UpdateUserInfo(userId, 1).then(function (result) {
                    if (result.data.errorno != 0) {
                        toaster.error({ body: "启用失败" });
                        return;
                    }
                    $scope.InvateCodeList.reload();
                    toaster.success({ body: "启用成功" });
                });
            });
        }

        //停用
        $scope.DisableTeacher = function (userId) {
            $rootScope.openCommonModalDialog("确认", "您确定要停用吗？", function () {

                InvateCodeService.UpdateUserInfo(userId, 2).then(function (result) {
                    if (result.data.errorno != 0) {
                        toaster.error({ body: "停用失败" });
                        return;
                    }
                    $scope.InvateCodeList.reload();
                    toaster.success({ body: "停用成功" });
                });
            });
        }


    }])

    /*
    * Services
    */
    .service('InvateCodeService', function ($http, Constants) {

        var self = this;

        self.getBindingInvateCodeList = function (param) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/bindingInvatecodelist', param);
        }

        self.GetInvateCodeFromSchool = function (param) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/GetInvateCodeFromSchool', param);
        }

        self.generateIC = function (num) {
            return $http.get(GLOBAL_CENTRAL_URL + 'api/teacher/generateIC/' + num);
        }

        self.deleteIC = function (code, userid) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/deleteIC', { Code: code, UserID: userid });
        }


        self.ResetPwd = function (teacherID, pwd) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/resetPwd', { ChoosedUserId: teacherID, PassWord: pwd });
        };

        self.SaveTeacher = function (invateCode, status) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/saveTeacher', { InvateCode: invateCode, Status: status });
        };

        self.UpdateUserInfo = function (userID, aulStatus) {
            return $http.post(GLOBAL_CENTRAL_URL + 'api/account/updateUserInfo', { UserID: userID, Status: aulStatus });
        };


    })

    /*
    * Directives
    */

    /*
    * Filters
    */


});
