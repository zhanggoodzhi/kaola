define(['angular', 'ng-file-upload-all', 'FileAPI', 'angular-deckgrid', 'ng-table', 'ngToaster'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('ClassCtrl', ['$scope', 'AuthService', 'Constants', 'ClassService', 'toaster', 'NgTableParams', '$rootScope', '$state', 'ShowService', '$stateParams', function ($scope, AuthService, Constants, ClassService, toaster, NgTableParams, $rootScope, $state, ShowService, $stateParams) {

        $scope.hasData = true;

        $scope.ClassParam = {
            ClassName: "",
            Grade: {}
        };

        $scope.UpdateCls = {};


        $scope.Grade = Constants.gradeItems;


        $scope.OpenAddClassDialog = function () {
            $scope.ClassParam = {
                ClassName: "",
                Grade: {}
            };
            angular.element('#AddClassDialog').modal({ backdrop: 'static', keyboard: false });
        };

        $scope.choosedClass = {
            currentGrade: {},
        };

        $scope.SelectCard = function (card) {
            card.Selected = (card.StudentCount > 0 ? (card.Selected == 1 ? 0 : 1) : 0)
        }

        var getCurrentGrade = function () {
            angular.forEach($scope.Grade, function (item, i) {
                if (item.Grade == $scope.UpdateCls.Grade) {
                    $scope.choosedClass.currentGrade = item;
                }
            });

        }

        $scope.OpenUpdateClassDialog = function (cls) {
            $scope.UpdateCls = {
                ClassID: cls.ClassID, ClassName: cls.ClassName, Grade: cls.Grade
            };
            getCurrentGrade();
            console.log($scope.choosedClass.currentGrade.currentGrade);
            angular.element('#UpdateClassDialog').modal({ backdrop: 'static', keyboard: false });
        };


        $scope.OpenUpGradeDialog = function (cls) {


            $scope.UpdateCls = {
                ClassID: cls.ClassID, ClassName: cls.ClassName, Grade: cls.Grade
            };
            if ($scope.UpdateCls.Grade < 12) {
                $scope.UpdateCls.Grade++;
            }
            getCurrentGrade();
            angular.element('#UpdateClassDialog').modal({ backdrop: 'static', keyboard: false });
        }


        $scope.DeleteCls = {};
        $scope.OpeDeleteClassDialog = function (cls) {
            $scope.DeleteCls = cls;
            $rootScope.openCommonModalDialog("删除班级", "您确定要永久删除所选班级吗？", $scope.DeleteClass);
        };


        $scope.Adding = false;
        $scope.AddClass = function () {
            if ($scope.Adding == true) {
                return;
            }
            $scope.Adding = true;
            ClassService.AddClass($scope.ClassParam.ClassName, $scope.ClassParam.Grade.Grade).then(function (result) {
                $scope.LoadClsList();
                angular.element('#AddClassDialog').modal('hide');
                //console.log(result);                 
                toaster.success({ body: "添加成功" });
                $scope.Adding = false;
            }, function (error) {
                toaster.error({ body: "" + error.data.Message, toasterId: 'dialog1' });
                $scope.Adding = false;
            });

        };

        $scope.GradeChange = function () {
            console.log($scope.choosedClass.currentGrade);
        }


        $scope.ClassList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 30, 50],
            dataset: [],
        });
        $scope.HistoryClassList = new NgTableParams({ count: 10 }, {
            counts: [10, 20, 30, 50],
            dataset: [],
        });


        $scope.FilterParam = {
            FilterStr: "",
            FilterStr2: '',
        };


        $scope.InitDataForDeckGrid = false;// 增加该变量是为了在初始化DeckGrid之前, 将数据准备好. 如果没有数据,DeckGrid显示为空

        $scope.ClassDataList = [];
        $scope.ClsListStatus = 1;
        $scope.LoadClsList = function () {

            $scope.InitDataForDeckGrid = false;

            $scope.ClsListStatus = 1;//显示历史按钮
            ClassService.getClassList($scope.FilterParam.FilterStr).then(function (result) {
                $scope.ClassDataList = result.data;
                $scope.ClassList.settings({
                    dataset: result.data
                });
                $scope.InitDataForDeckGrid = true;
                console.log(" $scope.InitDataForDeckGrid:", $scope.InitDataForDeckGrid);
                if ($scope.ClassDataList.length <= 0) {
                    $scope.hasData = false;
                } else {
                    $scope.hasData = true;
                }
            });
        }

        //注册浏览器窗体大小变化的事件, 通过设置 $scope.InitDataForDeckGrid 来触发 DeckGrid的刷新,使得布局重新计算
        window.onresize = function () {
            console.log("window resize");
            $scope.InitDataForDeckGrid = false;
            $scope.$apply();
            setTimeout(function () { $scope.InitDataForDeckGrid = true; $scope.$apply(); }, 0);
        }

        $scope.isHistoryClass = false;//标记当前是否是历史班级

        $scope.LoadHistoryClsList = function () {
            $scope.ClsListStatus = 2;//显示正常按钮
            $scope.isHistoryClass = true;

            ClassService.getHistoryClassList($scope.FilterParam.FilterStr).then(function (result) {
                $scope.ClassDataList = result.data;
                $scope.HistoryClassList.settings({
                    dataset: result.data
                });
                if ($scope.ClassDataList.length <= 0) {
                    $scope.hasData = false;
                } else {
                    $scope.hasData = true;
                }
            });
        }



        $scope.DeleteClass = function () {

            ClassService.DeleteClass($scope.DeleteCls.ClassID).then(function (result) {
                //$scope.LoadClsList();
                $scope.LoadHistoryClsList();

                toaster.success({ body: "删除成功" });

            }, function (error) {
                toaster.error({ body: error.data.Message });
            });

        }
        $scope.UpdateClass = function () {
            if ($scope.choosedClass.currentGrade == null) {
                $scope.UpdateCls.Grade = 0;
            } else {
                $scope.UpdateCls.Grade = $scope.choosedClass.currentGrade.Grade;
            }
            console.log($scope.UpdateCls);
            ClassService.UpdateClass($scope.UpdateCls.ClassID, $scope.UpdateCls.ClassName, $scope.UpdateCls.Grade).then(function (result) {
                $scope.LoadClsList();
                angular.element('#UpdateClassDialog').modal('hide');
                toaster.success({ body: "修改成功" });
            }, function (error) {
                toaster.error({ body: error.data.Message, toasterId: 'dialog2' });
            });

        }

        $scope.choosedClass.ClassID = '';
        $scope.OpenClsToHistoryDialog = function (clsId) {
            $scope.choosedClass.ClassID = clsId;
            $rootScope.openCommonModalDialog("删除", "你确认要删除此班级么？", $scope.ClassToHistory);
        }

        $scope.ClassToHistory = function () {

            ClassService.ClsToHistory($scope.choosedClass.ClassID).then(function (result) {
                $scope.LoadClsList();
                //$scope.HistoryClassList.reload();

                toaster.success({ body: "删除成功" });

            }, function (error) {
                toaster.error({ body: error.Message });
            });

        }


        $scope.ClassToCurrent = function (clsId) {

            ClassService.ClsToCurrent(clsId).then(function (result) {
                $scope.LoadClsList();
                //$scope.HistoryClassList.reload();

                toaster.success({ body: "恢复成功" });

            }, function (error) {
                toaster.error({ body: error.data.Message });
            });

        }


        $scope.UpGrade = function (clsId) {
            ClassService.UpGrade(clsId).then(function (result) {
                $scope.LoadClsList();
                $scope.HistoryClassList.reload();

                toaster.success({ body: "升班成功" });

            }, function (error) {
                toaster.error({ body: error.data.Message });
            });
        }


        $scope.FilterSearch = function () {
            console.log($scope.FilterParam);
            $scope.LoadClsList();

        };


        $scope.FilterSearch2 = function () {
            $scope.HistoryClassList.reload();

        };



        //历史班级全选----start

        $scope.SelectAllClsTag = false;
        $scope.SelectAllClass = function (event) {
            event.stopPropagation(); // 阻止事件冒泡

            $scope.SelectAllClsTag = $scope.SelectAllClsTag ? false : true;
            if ($scope.ClsListStatus == 1) {
                $scope.SelectAll($scope.ClassList.settings().dataset, $scope.SelectAllClsTag);
            } else if ($scope.ClsListStatus == 2) {
                $scope.SelectAllHistory($scope.HistoryClassList.settings().dataset, $scope.SelectAllClsTag);
            }
        }

        $scope.SelectAll = function (data, flag) {
            var newValue = "0";
            if (flag) {
                newValue = "1";
            }
            var message = '';
            if (angular.isArray(data) && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].StudentCount == 0 && flag) {
                        //message += (data[i].ClassName + "没有考生信息；");
                        data[i].Selected = 0;
                        continue;
                    }
                    data[i].Selected = newValue;
                }
            }
        }
        $scope.SelectAllHistory = function (data, flag) {
            var newValue = "0";
            if (flag) {
                newValue = "1";
            }
            var message = '';
            if (angular.isArray(data) && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    data[i].Selected = newValue;
                }
            }

        }

        function GetSelectedCls(data) {
            $scope.SelectedCls = [];
            if (angular.isArray(data) && data.length > 0) {
                angular.forEach(data, function (item, i) {
                    if (item.Selected == 1) {
                        $scope.SelectedCls.push(item.ClassID);
                    }
                });

            }
            return $scope.SelectedCls;
        }
        function GetSelectedHistoryCls(data) {
            $scope.SelectedHistoryCls = [];
            if (angular.isArray(data) && data.length > 0) {
                angular.forEach(data, function (item, i) {
                    if (item.Selected == 1) {
                        $scope.SelectedHistoryCls.push(item.ClassID);
                    }
                });

            }
            return $scope.SelectedHistoryCls;
        }

        //历史班级全选----end

        //创建任务————start
        angular.element('#AddTaskDialog').on('hidden.bs.modal', function () {
            //console.log("AddTaskDialog dismiss and go back to state [task]");
            if (ShowService.IsHiddin) {
                $state.go('class');
            }
            ShowService.IsHiddin = true;
            //$scope.TaskList.reload();
        });


        $scope.OpenAddTaskDialog = function () {

            var selectClassList = GetSelectedCls($scope.ClassList.settings().dataset);
            //console.log(selectClassList);
            $state.go('class.createtask', { data: { 'dialogElement': 'AddTaskDialog', 'ClassList': selectClassList } });
            angular.element('#AddTaskDialog').modal({ backdrop: 'static', keyboard: false });
        }


        //批量删除

        $scope.OpenDelClsDialog = function () {
            if ($scope.ClsListStatus == 2) {
                GetSelectedHistoryCls($scope.HistoryClassList.settings().dataset);
                if ($scope.SelectedHistoryCls.length <= 0) {
                    toaster.error({ body: '请选择要删除的班级' });
                    return;
                }

                console.log($scope.SelectedHistoryCls);
                $rootScope.openCommonModalDialog("批量删除", "你确认要批量删除这些班级么？", $scope.BatchDelete);
            }
        }
        $scope.BatchDelete = function () {
            ClassService.BatchDeleteClass($scope.SelectedHistoryCls).then(function (result) {
                $scope.LoadHistoryClsList();
                toaster.success({ body: "批量删除成功" });
            }, function (error) {
                toaster.error({ body: error.data.Message });
            });
        }



        //跳转到学生管理
        $scope.ReturnToStu = function (card) {
            $state.go('student', { classId: card.ClassID, isHistoryClass: $scope.isHistoryClass });
        }


        $scope.CloseUpdateDialog = function () {
            angular.element('#UpdateClassDialog').modal('hide');
        }
        $scope.CloseAddDialog = function () {
            angular.element('#AddClassDialog').modal('hide');
        }


        $scope.IsHistoryClass = false;
        if ($stateParams.isHistoryClass != undefined && $stateParams.isHistoryClass != null) {
            $scope.IsHistoryClass = $stateParams.isHistoryClass;
        }

        if ($scope.IsHistoryClass) {
            $scope.LoadHistoryClsList();
        }
        else {
            $scope.LoadClsList();
        }
    }])

/*
* Services
*/
.service('ClassService', function ($http, Constants) {
    var self = this;

    self.AddClass = function (clsName, grade) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/addClass', { ClassName: clsName, Grade: grade });
    };

    self.UpdateClass = function (classId, clsName, grade) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/updateClass', { ClassName: clsName, Grade: grade, ClassID: classId });
    };


    self.DeleteClass = function (classId) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/deleteClass', { ClassID: classId });
    };


    self.BatchDeleteClass = function (clsIDArry) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/batchDeleteClass', clsIDArry);
    }

    self.ClsToHistory = function (classId) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/clsToHistory', { ClassID: classId });
    };


    self.ClsToCurrent = function (classId) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/clsToCurrent', { ClassID: classId });
    };
    self.UpGrade = function (classId) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/upGrade', { ClassID: classId });
    };


    self.getClassList = function (filterStr) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/classList', { FilterStr: filterStr });
    };
    self.getClassInfo = function (classID) {
        return $http.get(GLOBAL_CENTRAL_URL + 'api/teacher/class/' + classID);
    };

    self.getHistoryClassList = function (filterStr) {
        return $http.post(GLOBAL_CENTRAL_URL + 'api/teacher/historyclassList', { FilterStr: filterStr });
    };


    self.CreateTask = function (task) {
        return $http.post(GLOBAL_API_URL + 'api/task/create', task);
    }

})


    /*
    * Directives
    */



});
