define(['angular', 'ng-table', 'ngToaster'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('SelectSchoolCtrl', ['$scope', 'toaster', 'AuthService', '$timeout', 'Constants', 'NgTableParams', 'SelectSchoolService', 'SlideMenuService', '$rootScope', '$state', function ($scope, toaster, AuthService, $timeout, Constants, NgTableParams, SelectSchoolService, SlideMenuService, $rootScope, $state) {
        console.log('params:', $state.params);
        $scope.ExamPlanID = '';
        $scope.backState = 'examfororg';
        SlideMenuService.SetActiveSideMenu('examfororg', 200);
        if ($state.params.data) {
            $scope.ExamPlanID = $state.params.data.ExamPlanID;

            var bs = $state.params.data.backState;
            if (bs != undefined && bs != '') {
                $scope.backState = bs;
            }
        }
        if ($scope.ExamPlanID == undefined || $scope.ExamPlanID == '') {
            $state.go($scope.backState);
        }
        $scope.bindToolTip = function () {
            $timeout(function () {
                $('.ellipsis').each(function (i, v) {
                    if (v.offsetWidth < v.scrollWidth) {
                        $(v).data('toggle', 'tooltip')
                            .attr('title', $(v).text());
                        $(v).tooltip();
                    }
                });
            }, 100);
        }
        $scope.bindToolTip();

        $scope.jumpBack = function () {
            if ($scope.backState != undefined && $scope.backState != '') {
                $state.go($scope.backState, { data: { 'ExamPlanID': $scope.ExamPlanID } });
            }
        }
        $scope.enterEvent = function (e) {
            var keycode = window.event ? e.keyCode : e.which;//获取按键编码  
            if (keycode == 13) {
                $scope.search();
            }
        }
        $scope.selectedAreaId = '';
        // $scope.areaData = {
        //     cityName: '北京',
        //     areaList: [{
        //         id: '0',
        //         name: '全部'
        //     },
        //     {
        //         id: '1',
        //         name: '东城区'
        //     },
        //     {
        //         id: '2',
        //         name: '西城区'
        //     }]
        // }
        $scope.schoolData = [];
        $scope.selectArea = function (id) {
            $scope.selectedAreaId = id;
            $scope.search();
        }
        $scope.selectedSchoolSimpleData = [];
        $scope.selectedSchoolTreeData = [];
        $scope.expandArr = [];
        $scope.$watch('selectedSchoolSimpleData', function (newValue, oldValue) {
            var data = [];
            newValue.forEach(function (v) {
                var ifExist = false;
                data.forEach(function (sv, si) {
                    if (sv.areaId === v.Area) {
                        ifExist = true;
                        data[si].children.push({
                            name: v.SchoolName,
                            id: v.SchoolID
                        });
                    }
                });
                if (!ifExist) {
                    data.push({
                        areaName: v.AreaName,
                        areaId: v.Area,
                        children: [{
                            name: v.SchoolName,
                            id: v.SchoolID
                        }]
                    });
                }
            });
            data.sort(function (a, b) {
                return a.areaName > b.areaName
            });
            console.log(data);
            $scope.selectedSchoolTreeData = data;
        }, true);
        $scope.schoolName = '';
        $scope.search = function () {
            var param = {
                CityID: $scope.areaData.CityID,
                AreaIDs: [$scope.selectedAreaId],
                SchoolName: $scope.schoolName
            };
            SelectSchoolService.getSchoolListForChoose(param).then(function (result) {
                const d = result.data;
                $scope.schoolData = d.SchoolList;
            });
            // var data = [];
            // if ($scope.selectedAreaId == '0') {
            //     data = [{
            //         name: '实验小学',
            //         id: '0',
            //         areaName: '东城区',
            //         areaId: '1'
            //     }, {
            //         name: '实验小学2',
            //         id: '1',
            //         areaName: '东城区',
            //         areaId: '1'
            //     }, {
            //         name: '高大上中学',
            //         id: '2',
            //         areaName: '西城区',
            //         areaId: '2'
            //     }, {
            //         name: '高大上中学2',
            //         id: '3',
            //         areaName: '西城区',
            //         areaId: '2'
            //     }]
            // } else if ($scope.selectedAreaId == '1') {
            //     data = [{
            //         name: '实验小学',
            //         id: '0',
            //         areaName: '东城区',
            //         areaId: '1'
            //     },
            //     {
            //         name: '实验小学2',
            //         id: '1',
            //         areaName: '东城区',
            //         areaId: '1'
            //     }]
            // } else {
            //     data = [{
            //         name: '高大上中学',
            //         id: '2',
            //         areaName: '西城区',
            //         areaId: '2'
            //     }, {
            //         name: '高大上中学2',
            //         id: '3',
            //         areaName: '西城区',
            //         areaId: '2'
            //     }]
            // }
        }
        $scope.selectSchool = function (item) {
            var ifSelected = false;
            $scope.selectedSchoolSimpleData.forEach(function (v, i) {
                if (v.SchoolID === item.SchoolID) {
                    ifSelected = true;
                    $scope.selectedSchoolSimpleData.splice(i, 1);
                }
            });
            if (!ifSelected) {
                $scope.selectedSchoolSimpleData.push(item);
            }
        }
        $scope.ifInSelectedSchools = function (id) {
            var ifSelected = false;
            $scope.selectedSchoolSimpleData.forEach(function (v, i) {
                if (v.SchoolID === id) {
                    ifSelected = true;
                }
            });
            return ifSelected;
        }
        $scope.expandArea = function (id) {
            $timeout(function () {
                if ($scope.expandArr.indexOf(id) === -1) {
                    $scope.expandArr.push(id);
                    $scope.bindToolTip();
                } else {
                    $scope.expandArr.splice($scope.expandArr.indexOf(id), 1);
                }
            }, 10);
        }
        $scope.ifExpand = function (id) {
            return $scope.expandArr.indexOf(id) !== -1
        }
        $scope.selectAll = function () {
            if ($scope.selectedSchoolSimpleData.length === $scope.schoolData.length) {
                $scope.selectedSchoolSimpleData = [];
            } else {
                $scope.selectedSchoolSimpleData = angular.copy($scope.schoolData);
            }
        }
        $scope.clearAll = function () {
            $scope.selectedSchoolSimpleData = []
        }
        $scope.deleteSchool = function (id) {
            $scope.selectedSchoolSimpleData.forEach(function (v, i) {
                if (v.SchoolID === id) {
                    $scope.selectedSchoolSimpleData.splice(i, 1);
                }
            });
        }
        $scope.getCityListForExamPlan = function () {
            SelectSchoolService.GetExamPlanList().then(function (result) {
                var d = result.data;
                if (d.AreaList.length === 1) {
                    $scope.selectedAreaId = d.AreaList[0].AreaID;
                }

                $scope.areaData = d;
                $scope.search();
                $scope.getSelectedSchool();
            });
        }
        $scope.getSelectedSchool = function () {
            SelectSchoolService.getSchoolListForExamPlan({ ExamPlanID: $scope.ExamPlanID }).then(function (result) {
                var d = result.data;
                $scope.selectedSchoolSimpleData = d.SchoolList;
            });
        }
        $scope.getCityListForExamPlan();
        $scope.update = function () {
            var idArr = [];
            $scope.selectedSchoolSimpleData.forEach(function (v) {
                idArr.push(v.SchoolID);
            });
            var param = {
                ExamPlanID: $scope.ExamPlanID,
                SchoolList: idArr
            };
            SelectSchoolService.updateSchoolListForExamPlan(param).then(function (result) {
                if (result.data.Success) {
                    //toaster.success({ body: result.data.State, toasterId: 'select-school-toast' });
                    $scope.jumpBack();
                    return;
                }
                toaster.error({ body: result.data.State, toasterId: 'select-school-toast' });
            }, function (error) {
                toaster.error({ body: error.data.Message, toasterId: 'select-school-toast' });
            });
        }
    }])
        /*
        * Services
        */
        .service('SelectSchoolService', function ($http, Constants) {
            var self = this;

            self.GetExamPlanList = function (param) {
                return $http.post('/api/examplan/getCityListForExamPlan', param);
            }
            self.getSchoolListForChoose = function (param) {
                return $http.post('/api/examplan/getSchoolListForChoose', param);
            }
            self.getSchoolListForExamPlan = function (param) {
                return $http.post('/api/examplan/getSchoolListForExamPlan', param);
            }
            self.updateSchoolListForExamPlan = function (param) {
                return $http.post('/api/examplan/updateSchoolListForExamPlan', param);
            }

        })
});
