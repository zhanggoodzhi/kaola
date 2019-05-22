define(['angular', 'ng-table', 'ngToaster', 'ng-file-upload-all', 'FileAPI', '/web/components/directives/progressbar/progressbar.js', 'uploadifyjs'], function (angular) {
    'use strict';


    /*
    * Controllers
    */
    angular.module('app').controller('StudentCtrl', [
            '$scope', 'AuthService', 'Constants', 'StudentService', 'toaster', 'NgTableParams', '$rootScope', 'Upload', '$stateParams', '$state', 'SlideMenuService', function ($scope, AuthService, Constants, StudentService, toaster, NgTableParams, $rootScope, Upload, $stateParams, $state, SlideMenuService) {

                $scope.centralServiceBaseUri = GLOBAL_CENTRAL_URL;
                $scope.BatchUpdateFilePath = '';

                SlideMenuService.SetActiveSideMenu('class');

                $scope.hasData = false;

                $scope.FilterParam = {
                    FilterStr: "",
                };

                $scope.CurrentClass = [];
                $scope.ClassID = $stateParams.classId;

                $scope.IsHistoryClass = false;
                if ($stateParams.isHistoryClass != undefined && $stateParams.isHistoryClass != null) {
                    $scope.IsHistoryClass = $stateParams.isHistoryClass;
                }

                console.log("ClassID", $scope.ClassID);
                console.log("IsHistoryClass", $scope.IsHistoryClass);

                $scope.LoadClassInfo = function () {
                    if ($scope.ClassID == undefined || $scope.ClassID == "") {
                        return;
                    }
                    StudentService.getClassInfo($scope.ClassID).then(function (result) {
                        $scope.CurrentClass = result.data;

                        $scope.LoadStudentList();

                    })
                }
                $scope.LoadStudentList = function () {
                    if ($scope.ClassID == undefined || $scope.ClassID == "") {
                        return;
                    }

                    StudentService.GetStudentList($scope.ClassID, $scope.FilterParam.FilterStr, $scope.IsHistoryClass).then(function (results) {
                        $scope.StudentList = new NgTableParams({ count: 999 }, {
                            counts: [10, 20, 30, 50],
                            dataset: results.data.StudentList
                        });

                        if (results.data.StudentList.length > 0) {
                            $scope.hasData = true;
                        } else {
                            $scope.hasData = false;
                        }
                    });
                }

                $scope.LoadClassInfo();

                $scope.StudentAdd = {
                    Sex: 1,
                };
                $scope.OpenAddStudentDialog = function () {
                    $scope.StudentAdd.Sex = 1;
                    $scope.StudentAdd.StudentNumber = '';
                    $scope.StudentAdd.StudentName = '';
                    $scope.StudentAdd.AdmissionTicketNO = '';
                    angular.element('#AddStudentDialog').modal({ backdrop: 'static', keyboard: false });
                }

                $scope.ValidateStudent = function (addStudent, actionUpdate) {
                    if (!actionUpdate) {
                        if (addStudent.StudentNumber == undefined || addStudent.StudentNumber == "") {
                            toaster.error({ body: "请输入学号", toasterId: 'dialog1' });
                            return false;
                        }
                        if (addStudent.StudentName == undefined || addStudent.StudentName == "") {
                            toaster.error({ body: "请输入姓名", toasterId: 'dialog1' });
                            return false;
                        }
                        if (addStudent.Sex == undefined) {
                            toaster.error({ body: "请选择性别", toasterId: 'dialog1' });
                            return false;
                        }
                    } else {
                        if (addStudent.StudentNumber == undefined || addStudent.StudentNumber == "") {
                            toaster.error({ body: "请输入学号", toasterId: 'dialog2' });
                            return false;
                        }
                        if (addStudent.StudentName == undefined || addStudent.StudentName == "") {
                            toaster.error({ body: "请输入姓名", toasterId: 'dialog2' });
                            return false;
                        }
                        if (addStudent.Sex == undefined) {
                            toaster.error({ body: "请选择性别", toasterId: 'dialog2' });
                            return false;
                        }
                    }



                }

                $scope.AddStudent = function () {
                    $scope.StudentAdd.ClassID = $scope.ClassID;
                    if ($scope.ValidateStudent($scope.StudentAdd) == false) {
                        return;
                    }
                    StudentService.AddStudent($scope.StudentAdd).then(function (result) {
                        $scope.LoadStudentList();
                        //$scope.StudentList.reload();
                        angular.element('#AddStudentDialog').modal('hide');

                        toaster.success({ body: "添加成功" });

                    }, function (error) {
                        toaster.error({ body: error.data.Message, toasterId: 'dialog1' });
                    });
                }


                $scope.ChoosedStudent = {

                };

                $scope.OpenUpdateStudentDialog = function (stu) {
                    $scope.ChoosedStudent = {}
                    //console.log(stu);
                    $scope.ChoosedStudent.StudentNumber = stu.StudentNumber;
                    $scope.ChoosedStudent.StudentName = stu.StudentName;
                    $scope.ChoosedStudent.Sex = stu.Sex;
                    $scope.ChoosedStudent.ClassID = stu.ClassID;
                    $scope.ChoosedStudent.StudentID = stu.StudentID;
                    $scope.ChoosedStudent.AdmissionTicketNO = stu.AdmissionTicketNO;
                    $scope.IsShowPwd = false;
                    $scope.PwdMsg = '';
                    $scope.ChoosedStudent.OldStudentNumber = stu.StudentNumber;
                    console.log($scope.ChoosedStudent);
                    angular.element('#UpdateStudentDialog').modal({ backdrop: 'static', keyboard: false });
                }

                $scope.UpdateStudent = function () {

                    if ($scope.ValidateStudent($scope.ChoosedStudent, true) == false) {
                        return false;
                    }

                    StudentService.UpdateStudent($scope.ChoosedStudent).then(function (result) {
                        $scope.LoadStudentList();
                        angular.element('#UpdateStudentDialog').modal('hide');

                        toaster.success({ body: "修改成功" });
                    }, function (error) {
                        $scope.LoadStudentList();
                        toaster.error({ body: error.data.Message, toasterId: 'dialog2' });
                    });
                }


                $scope.OpeDeleteStudentDialog = function (stu) {
                    $scope.ChoosedStudent = stu;

                    $rootScope.openCommonModalDialog("删除学生", "你确认要删除该学生么？", $scope.DeleteStudent);
                }


                $scope.DeleteStudent = function () {

                    StudentService.DeleteStudent($scope.ChoosedStudent.ClassID, $scope.ChoosedStudent.StudentNumber).then(function (result) {
                        //$scope.StudentList.reload();
                        $scope.LoadStudentList();
                        //$scope.HistoryClassList.reload();

                        toaster.success({ body: "删除成功" });
                        //$scope.StudentList.parameters().page = 1;
                        //$scope.StudentList.reload();


                    }, function (error) {
                        toaster.error({ body: error.data.Message });
                    });
                }




                $scope.SelectAllTag = false;
                $scope.SelectAllStudent = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllTag = $scope.SelectAllTag ? false : true;

                    $scope.SelectStudent($scope.StudentList.settings().dataset, $scope.SelectAllTag);
                }

                $scope.SelectStudent = function (data, flag) {
                    var newValue = "0";
                    if (flag) {
                        newValue = "1";
                    }
                    if (angular.isArray(data) && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            data[i].Selected = newValue;
                        }
                    }
                }

                var GetSelectedStu = function (data) {
                    $scope.SelectedStuNum = [];
                    if (angular.isArray(data) && data.length > 0) {
                        angular.forEach(data, function (item, i) {
                            if (item.Selected == 1) {
                                $scope.SelectedStuNum.push(item.StudentNumber);
                            } else {
                                //$scope.SelectAllStuTag = false;
                            }
                        });
                    }
                }


                $scope.OpenDelStudentDialog = function () {
                    GetSelectedStu($scope.StudentList.settings().dataset);
                    console.log($scope.SelectedStuNum);
                    if ($scope.SelectedStuNum.length <= 0) {
                        toaster.error({ body: '请选择要删除的学生' });
                        return;
                    }

                    $rootScope.openCommonModalDialog("批量删除", "您确定要删除所选学生吗？", $scope.BatchDelete);
                }
                $scope.BatchDelete = function () {
                    StudentService.BathDelStu($scope.ClassID, $scope.SelectedStuNum).then(function (result) {
                        $scope.LoadStudentList();

                        toaster.success({ body: "批量删除成功" });


                    }, function (error) {
                        toaster.error({ body: error.data.Message });
                    });
                }


                //上传 upload
                $scope.ImportData = {
                    Percent: 0,
                    Message: ""
                };
                $scope.ImportDataPercent = 0;
                $scope.ImportInfoMessage = "";

                $scope.ImportErrMsg = "";
                $scope.ErrorFile = "";

                $scope.IEVersion = getIEVersion();

                $scope.openImportDialog = function () {
                    $scope.ImportErrMsg = "";
                    $scope.ImportErrMsgType = "0";

                    angular.element('#ImportDialog').modal({ backdrop: 'static', keyboard: false });
                    if ($scope.IEVersion <= 11) {
                        var bindElement = "#upload-import-student";
                        var formData = {
                            ClassID: $scope.ClassID
                        };
                        var uploadUrl = GLOBAL_CENTRAL_URL + "api/teacher/importstudent";
                        var buttonText = "导入学生名单";
                        var dialogName = "#ImportDialog";

                        $scope.uploadForLowVersion(bindElement, formData, uploadUrl, buttonText, dialogName);
                    }

                }

                $scope.OpenImportProgressDialog = function () {
                    $scope.ImportData.Percent = 0;
                    $scope.ImportData.Message = "";
                    $scope.ImportErrMsg = "";
                    $scope.ImportErrMsgType = "0";
                    angular.element('#ImportProgressDialog').modal({ backdrop: 'static', keyboard: false });
                }

                $scope.CloseImportProgressDialog = function () {
                    $scope.ImportData.Percent = 0;
                    $scope.ImportData.Message = "";
                    angular.element('#ImportProgressDialog').modal('hide');
                }


                $scope.uploadFiles = function ($files) {
                    var uploadUrl = GLOBAL_CENTRAL_URL + 'api/teacher/importstudent';
                    var dialogName = '#ImportDialog';
                    var data = { file: $files, ClassID: $scope.ClassID }
                    $scope.upload(data, uploadUrl, dialogName);
                }


                $scope.FilterSearch = function () {
                    $scope.LoadStudentList();
                };


                $scope.OpenChooseFileDialog = function () {
                    //angular.element('#ImportDialog').modal('hide');
                    angular.element('#ChooseFileDialog').modal({ backdrop: 'static', keyboard: false });
                };



                //创建任务————start
                $scope.$on('createTaskFinished', function (d, data) {
                    console.log("trigger event createTaskFinished");
                    $state.go('student', { classId: $scope.ClassID, isHistoryClass: $scope.IsHistoryClass });
                });
                angular.element('#AddTaskDialog').on('hidden.bs.modal', function () {
                    $scope.SetActiveSideMenu('class');
                });

                $scope.OpenAddTaskDialog = function () {
                    var selectClassList = [];
                    var stuList = $scope.StudentList.settings().dataset
                    if (stuList != null && stuList.length > 0) {
                        selectClassList.push($scope.ClassID);
                    }
                    $state.go('student.createtask', { data: { 'dialogElement': 'AddTaskDialog', 'ClassList': selectClassList } });
                    angular.element('#AddTaskDialog').modal({ backdrop: 'static', keyboard: false });

                }

                //创建任务————end

                //----密码重置---------------

                $scope.IsShowPwd = false;
                $scope.ShowPwd = function () {
                    $scope.IsShowPwd = true;
                }

                $scope.NotUpdatePwd = function () {
                    $scope.ChoosedStudent.Pwd = '';
                    $scope.PwdMsg = '';
                    $scope.IsShowPwd = false;
                }

                $scope.ResetPwd = function () {
                    var userID = $scope.ChoosedStudent.StudentID;
                    var pwd = $scope.ChoosedStudent.Pwd;
                    StudentService.ResetPwd(userID, pwd).then(function (result) {
                        //$scope.PwdMsg = "密码重置成功";
                        toaster.success({ body: "密码重置成功", toasterId: 'dialog2' });
                        $scope.NotUpdatePwd();
                    }, function (error) {
                        toaster.error({ body: error.data.Message, toasterId: 'dialog2' });
                    });
                }

                $scope.ReturnToClass = function () {
                    $state.go('class', { isHistoryClass: $scope.IsHistoryClass });
                }


                //---全选
                $scope.SelectAllStuTag = false;
                $scope.SelectAllStudent = function (event) {
                    event.stopPropagation(); // 阻止事件冒泡

                    $scope.SelectAllStuTag = $scope.SelectAllStuTag ? false : true;

                    $scope.SelectAll($scope.StudentList.settings().dataset, $scope.SelectAllStuTag);
                }

                $scope.SelectAll = function (data, flag) {
                    var newValue = "0";
                    if (flag) {
                        newValue = "1";
                    }
                    if (angular.isArray(data) && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            data[i].Selected = newValue;
                        }
                    }
                }

                $scope.SelectAllStuTagChange = function (stu) {
                    //event.stopPropagation(); // 阻止事件冒泡
                    stu.Selected = stu.Selected == 1 ? 0 : 1;
                    if (stu.Selected == 0) {
                        $scope.SelectAllStuTag = false;
                    }
                };


                //--全选end


                $scope.CloseAddDialog = function () {
                    angular.element('#AddStudentDialog').modal('hide');
                }


                $scope.CloseUpdateDialog = function () {
                    angular.element('#UpdateStudentDialog').modal('hide');
                }


                //#region 批量修改学生信息


                $scope.OpenBatchUpdateStudentDialog = function () {

                    var params = { ClassID: $scope.CurrentClass.ClassID }
                    StudentService.GetStudentsByClassID(params).then(function (result) {
                        if (result.data.success) {

                            $scope.BatchUpdateFilePath = result.data.error;
                        }
                    });

                    $scope.ImportErrMsgType = '0';
                    $scope.ImportErrMsg = '';
                    $scope.ErrorFile = '';
                    $scope.BatchUpdateFilePath = '';
                    angular.element('#BatchUpdateStudentDialog').modal({ backdrop: 'static', keyboard: false });
                    if ($scope.IEVersion <= 11) {
                        var bindElement = "#upload-batch-update-student";
                        var formData = {
                            ClassID: $scope.ClassID
                        };
                        var uploadUrl = GLOBAL_CENTRAL_URL + "api/teacher/updatestudents";
                        var buttonText = "导入修改后数据";
                        var dialogName = "#BatchUpdateStudentDialog";

                        $scope.uploadForLowVersion(bindElement, formData, uploadUrl, buttonText, dialogName);
                    }

                }
                $scope.uploadForLowVersion = function (bindElement, formData, uploadUrl, buttonText, dialogName) {
                    $(bindElement).uploadify(
                        {
                            formData: formData,
                            height: 19,
                            swf: "/web/lib/uploadify/uploadify.swf",
                            uploader: uploadUrl,
                            width: 90,
                            buttonText: buttonText,
                            buttonClass: "importBtn",
                            onInit: function () {
                                $("#upload_excel-queue").hide();
                            },
                            onUploadStart: function (file) {
                                $scope.OpenImportProgressDialog();
                                $scope.localImportMessage = "";
                            },
                            onUploadProgress: function (file, bytesUploaded, bytesTotal, totalBytesUploaded, totalBytesTotal) {
                                $scope.ImportInfoMessage = "正在上传学生信息";
                                $scope.ImportDataPercent = parseInt(100.0 * totalBytesUploaded / totalBytesTotal);
                                console.log('上传进度: ' + $scope.ImportData.Percent);
                                $("#importProgressBar").css("width", $scope.ImportDataPercent + "%");
                                if ($scope.ImportDataPercent > 50) {
                                    $("#progressTitle").css("color", "#ffffff");
                                }
                                else {
                                    $("#progressTitle").css("color", "#178ec9");
                                }
                                $("#progressTitle").html($scope.ImportDataPercent + "%");
                                if ($scope.ImportInfoMessage == "") {
                                    $("#errorMsgContainer").css("display", "none");
                                }
                            },
                            onUploadError: function (file, errorCode, errorMsg, errorString) {
                                console.log('onUploadError');
                                if (errorString != "") {
                                    $scope.ImportErrMsg = errorString;
                                    $("#errorMsgContainer").css("display", "block");
                                    $("#errorMsgContent").html(errorString);
                                }
                            },
                            onUploadSuccess: function (file, data, response) {

                                var successResult = eval('(' + data + ')');
                                console.log('onUploadSuccess:', successResult);
                                $scope.CloseImportProgressDialog();
                                if (successResult.errorno == 0) {
                                    angular.element('#ChooseFileDialog').modal('hide');
                                    angular.element(dialogName).modal('hide');
                                    $scope.LoadStudentList();
                                } else {
                                    angular.element('#ChooseFileDialog').modal('hide');
                                    angular.element(dialogName).modal({ backdrop: 'static', keyboard: false });

                                    if (successResult.errorno == -1) {
                                        //动态绑定在IE8下失效，手动用JS处理
                                        //Fk IE8
                                        $scope.ImportErrMsgType = "1";
                                        $scope.ErrorFile = successResult.error;
                                        console.log('divErrMsgDownload');
                                        $("#divErrMsgDownload").show();
                                        $("#divErrMsgDownload").removeClass('ng-hide');
                                        var errorFileUrl = $scope.centralServiceBaseUri + 'api/teacher/download/' + $scope.ErrorFile;
                                        console.log('errorFileUrl:', errorFileUrl);
                                        $("#divErrMsgDownload a").attr('href', errorFileUrl);
                                    }
                                    else {
                                        $scope.ImportErrMsgType = "2";
                                        $scope.ImportErrMsg = successResult.error;
                                        console.log('divErrMsg');
                                        $("#divErrMsg").show();
                                        $("#divErrMsg").removeClass('ng-hide');
                                    }
                                }
                            },
                            onUploadComplete: function (file) {
                                console.log('onUploadComplete');
                                $scope.CloseImportProgressDialog();
                            }
                        });
                }

                $scope.uploadFilesForBatchUpdateStudent = function ($files) {
                    var uploadUrl = GLOBAL_CENTRAL_URL + 'api/teacher/updatestudents';
                    var dialogName = '#BatchUpdateStudentDialog';
                    var data = { file: $files, ClassID: $scope.ClassID }
                    $scope.upload(data, uploadUrl, dialogName);
                }
                $scope.upload = function (data, uploadUrl, dialogName) {

                    $scope.OpenImportProgressDialog();

                    $scope.localImportMessage = "";
                    Upload.upload({
                        url: uploadUrl,
                        data: data
                    }).progress(function (evt) {
                        $scope.ImportData.Message = "正在上传学生信息";
                        $scope.ImportData.Percent = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('上传进度: ' + $scope.ImportData.Percent);

                    }).success(function (data, status, headers, config) {

                        $scope.CloseImportProgressDialog();

                        console.log('success', data);

                        if (data.errorno == 0) {
                            angular.element('#ChooseFileDialog').modal('hide');
                            angular.element(dialogName).modal('hide');
                            $scope.LoadStudentList();
                        } else {
                            angular.element('#ChooseFileDialog').modal('hide');
                            angular.element().modal({ backdrop: 'static', keyboard: false });

                            if (data.errorno == -1) {
                                $scope.ImportErrMsgType = "1";
                                $scope.ErrorFile = data.error;
                            }
                            else {
                                $scope.ImportErrMsgType = "2";
                                $scope.ImportErrMsg = data.error;
                            }

                        }

                    }).error(function (data, status, headers, config) {

                        $scope.CloseImportProgressDialog();

                        console.log('error', data.Message, data.ExceptionMessage);
                        angular.element(dialogName).modal({ backdrop: 'static', keyboard: false });
                        angular.element('#ChooseFileDialog').modal('hide');
                        $scope.ImportErrMsgType = "2";
                        $scope.ImportErrMsg = data.ExceptionMessage;
                    }).then(function (response) {
                        console.log('final');
                        $scope.CloseImportProgressDialog();
                    });
                };


                //#endregion
            }
    ])

        /*
    * Services
    */
        .service('StudentService', function ($http, Constants) {
            var self = this;

            self.getClassInfo = function (classID) {
                return $http.get(GLOBAL_CENTRAL_URL + 'api/teacher/class/' + classID);
            };

            self.AddStudent = function (studentAdd) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/addStudent', studentAdd);
            };


            self.UpdateStudent = function (choosedStudent) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/updateStudent', choosedStudent);
            };

            self.DeleteStudent = function (classId, studentNum) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/deleteStudent', { ClassID: classId, StudentNumber: studentNum });
            };

            self.BathDelStu = function (classId, studentNumL) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/batchDelStu', { ClassID: classId, StudentNumList: studentNumL });
            };


            self.GetTeacherClsList = function () {
                return $http.get(GLOBAL_CENTRAL_URL + 'api/teacher/teacherclsList');
            };

            self.GetStudentList = function (classId, param, isHistoryClass) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/studentList', { ClassID: classId, SearchParam: param, IsHistoryClass: isHistoryClass });
            };


            self.ResetPwd = function (teacherID, pwd) {
                return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/resetPwd', { ChoosedUserId: teacherID, PassWord: pwd });
            };

            //////////////

            self.CreateTask = function (task) {
                return $http.post(GLOBAL_API_URL + 'api/task/create', task);
            }

            //
            self.GetStudentsByClassID = function (params) {
                return $http.post(GLOBAL_API_URL + 'api/teacher/getupdatestudents', params);
            }
        })

    /*
* Directives
*/


});
