define(['angular', 'ng-table', '/web/components/directives/paperpreview_rebuild/paperpreview.js'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('PaperPreviewCtrl', ['$scope', '$stateParams', 'NgTableParams', 'AuthService', 'Constants', 'PaperPreviewService', '$state', 'ShowService', function ($scope, $stateParams, NgTableParams, AuthService, Constants, PaperPreviewService, $state, ShowService) {

        $scope.Constants = {
            apiServiceBaseUri: GLOBAL_API_URL,
            authServiceBaseUri: GLOBAL_CENTRAL_URL,
            answerBaseUrl: GLOBAL_ANSWER_URL,
            paperResourceBaseUrl: GLOBAL_PAPER_RESOURCE_URL
        };


        $scope.OpenAddTaskDialogFromPreview = function () {
            $state.go('paperpreview.createtask', { data: { 'dialogElement': 'AddTaskDialog', 'PaperList': [$scope.CurrentPaper.PaperID], 'IsCustomPaper': $scope.CurrentPaper.IsCustomPaper } });
            angular.element('#AddTaskDialog').modal({ backdrop: 'static', keyboard: false });

        }

        //Start Paper Preview
        $scope.CurrentPaper = "";
        $scope.PreviewPackageDetail = function (paperID) {
            PaperPreviewService.GetPaperDetail(paperID).then(function (result) {
                var data = result.data;

                var path = data.ResourcePath;
                if (path.indexOf($scope.Constants.paperResourceBaseUrl) == -1) {
                    path = $scope.Constants.paperResourceBaseUrl + path;
                    data.ResourcePath = path;
                }

                $scope.CurrentPaper = data;
                console.log("paper data:", result.data);
            })
        }

        //console.log("state params: ", $stateParams);
        var paperID = $stateParams.paperID;
        var enableCreateTask = $stateParams.enableCreateTask;
        console.log("paperID:", paperID);
        //console.log("enableCreateTask:", enableCreateTask);

        if (angular.isString(paperID) && paperID.length > 0) {

            //Start 特殊处理页面样式, 隐藏个人中心, 左侧菜单
            angular.element("#div_header_kaola").hide();
            angular.element("#sidebar_menu").hide();
            angular.element("#div_mainChildView").removeClass();
            angular.element("#div_mainChildView").addClass('col-xs-12 col-sm-12 col-md-12 center');
            angular.element("#sidebar_menu_row ").css('padding-top', '0px');

            if (enableCreateTask != undefined) {
                if (enableCreateTask == "false" || enableCreateTask == false) {
                    console.log("hide create task button");
                    angular.element("#btn_createTaskFromPaperPreview").hide();
                }
            }
            //End
            console.log("PreviewPackageDetail :", paperID);
            $scope.PreviewPackageDetail(paperID);
        }

        $scope.AudioRefText = '';
        $scope.$on('ShowAudioRefText', function (d, data) {
            console.log(data);
            $scope.AudioRefText = data;
            angular.element("#showAudioRefTextDialog").modal('show');
        });


    }])

        /*
        * Services
        */
    .service('PaperPreviewService', function ($http, Constants) {
        var self = this;

        self.GetPaperDetail = function (paperID) {
            return $http.get(GLOBAL_API_URL + 'api/paper/detail/' + paperID);
        }

    })

});
