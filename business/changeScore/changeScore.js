define([
    'angular', '/web/components/directives/refText/reftext.js'
], function (angular) {
    'use strict';

    angular
        .module('ChangeScore', ['ui.router', 'refTextModule'])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state('changeScore', {
                    url: "/changeScore",
                    views: {
                        'mainChildView': {
                            templateUrl: "business/changeScore/changeScore.html",
                            controller: 'ChangeScoreCtrl'
                        }
                    }
                })
            }
        ])
        /*
    * Controllers
    */
        .controller('ChangeScoreCtrl', [
            '$scope',
            'AuthService',
            'Constants',
            '$state',
            'ChangeScoreService',
            'NgTableParams',
            'toaster',
            '$rootScope',
            'Audio',
            function ($scope, AuthService, Constants, $state, ChangeScoreService, NgTableParams, toaster, $rootScope, Audio, UserService) {
                $scope.typeList = [
                    {
                        name: '0分_PRED和PRTL都是0分',
                        value: '1'
                    }, {
                        name: '0分_PRED为0分但是PRTL有分',
                        value: '2'
                    }, {
                        name: '0分_PRED有分但是PRTL为0分',
                        value: '3'
                    }, {
                        name: '0分_STRN为0分',
                        value: '4'
                    }, {
                        name: 'PRED偏低_比PRTL差不多或低',
                        value: '5'
                    }, {
                        name: 'PRTL偏低_PRTL比RRED低5分以上',
                        value: '6'
                    }
                ];
                $scope.Filter = {
                    searchType: $scope.typeList[0]
                };
                $scope.sIsPause = true;
                $scope.qIsPause = true;
                $scope.cIsPause = true;
                $scope.playAudio = function (src, type) {
                    if ($scope[type] === true) {
                        $scope.sIsPause = true;
                        $scope.qIsPause = true;
                        $scope.cIsPause = true;
                    }
                    $scope[type] = !$scope[type];
                    Audio.play(src, function () {
                        $scope
                            .$apply(function () {
                                $scope[type] = true;
                            });
                    });
                }
                $scope.QueryParams = {
                    ClassGrade:'8',
                    HideAdjusted: false,
                    SearchType: $scope.typeList[0].value
                }
                $scope.canEdit = false;
                var authData = AuthService.AuthData();

                $scope.isAdmin = authData
                    .userRole
                    .indexOf(1) > -1;
                $scope.reload = function () {
                    ChangeScoreService
                        .getAnswerList($scope.QueryParams)
                        .then(function (results) {
                            $scope
                                .EditorList
                                .settings({dataset: results.data});
                        });
                }

                $scope.addEditorValidateMessage = '';
                ChangeScoreService
                    .getAnswerList($scope.QueryParams)
                    .then(function (results) {
                        $scope.EditorList = new NgTableParams({
                            count: 10
                        }, {dataset: results.data});
                    });

                $scope.SearchEditor = function () {
                    $scope.QueryParams.SearchType = $scope.Filter.searchType.value;
                    $scope
                        .EditorList
                        .parameters()
                        .page = 1;
                    $scope.reload();
                }

                $scope.detailData = {
                    StudentNumber: '',
                    ContentID: '',
                    MarkResultID: '',
                    AreaTypeDesc: '',
                    AMSScore: '',
                    AnswerBaseURL: '',
                    ContentDetail: {},
                    ContentScore: '',
                    ContentRefTexts: [],
                    MarkResult: '',
                    Score: '',
                    Fluency: '',
                    Integrity: '',
                    Pron: '',
                    Rhythm: ''
                };
                $('#EditEditorDialog').on('hidden.bs.modal', function () {
                    $scope.stopAudio();
                });
                $scope.GoEditorEdit = function (editor) {
                    $scope.editEditorValidateMessage = '';
                    ChangeScoreService
                        .getDetail({AnswerID: editor.AnswerID})
                        .then(function (result) {
                            const info = result.data;
                            // $scope.canEdit = true;
                            $scope.canEdit = info.NeedUpdateDetailScore;

                            $scope.detailData = {
                                StudentNumber: info.StudentNumber,
                                ContentID: info.ContentID,
                                MarkResultID: info.MarkResultID,
                                AreaTypeDesc: info.AreaTypeDesc,
                                MarkResult: info.MarkResult,
                                ContentDetail: info.ContentDetail,
                                ContentScore: info.ContentScore,
                                AMSScore: info.AMSScore,
                                AnswerBaseURL: info.AnswerBaseURL,
                                ContentRefTexts: info.ContentRefTexts,
                                Score: info.Score,
                                Fluency: info.Fluency,
                                Integrity: info.Integrity,
                                Pron: info.Pron,
                                Rhythm: info.Rhythm
                            };

                            setTimeout(function () {
                                if (angular.element('#ref-text').find('li').length) {
                                    angular
                                        .element('#ref-text')
                                        .find('li')[0]
                                        .click();
                                }
                            }, 100);
                            $scope.EditorEditParams = $scope.canEdit
                                ? {
                                    AnswerID: info.AnswerID,
                                    Score: info.Score,
                                    Fluency: info.Fluency,
                                    Integrity: info.Integrity,
                                    Pron: info.Pron,
                                    Rhythm: info.Rhythm
                                }
                                : {
                                    AnswerID: info.AnswerID,
                                    Score: info.Score
                                }
                        }, function (error) {
                            $scope.editEditorValidateMessage = error.data.Message;
                        });
                    angular
                        .element('#EditEditorDialog')
                        .modal('show');
                }

                $scope.stopAudio = function () {
                    Audio.stop();
                    $scope.sIsPause = true;
                    $scope.qIsPause = true;
                    $scope.cIsPause = true;
                }
                //编辑内容编辑
                $scope.EditorEdit = function () {
                    if ($scope.EditorEditParams.Score === '') {
                        $scope.editEditorValidateMessage = "请输入得分";
                        return;
                    }
                    if ($scope.canEdit) {
                        if ($scope.EditorEditParams.Fluency == '-1' || $scope.EditorEditParams.Integrity == '-1' || $scope.EditorEditParams.Pron == '-1' || $scope.EditorEditParams.Rhythm == '-1') {
                            $scope.editEditorValidateMessage = "请将人工评分填写完整";
                            return;
                        }
                    }
                    const score = Number($scope.EditorEditParams.Score);
                    if (!score && score !== 0) {
                        $scope.editEditorValidateMessage = "输入的得分必须为数字";
                        return;
                    } else if (score < 0) {
                        $scope.editEditorValidateMessage = "得分必须大于0";
                        return;
                    } else if (score > $scope.detailData.ContentScore) {
                        $scope.editEditorValidateMessage = "得分不能大于题目分数";
                        return;
                    } else {
                        $scope.EditorEditParams.Score = score;
                    }
                    ChangeScoreService
                        .save($scope.EditorEditParams)
                        .then(function (result) {
                            angular
                                .element('#EditEditorDialog')
                                .modal('hide');
                            $scope.stopAudio();
                            $scope.reload();
                        }, function (error) {
                            $scope.editEditorValidateMessage = error.data.Message;
                        });
                };
                $scope.showMachineDetail = function () {
                    angular
                        .element('#machine-detail')
                        .modal('show');
                }
            }
        ])

        /*
    * Services
    */
        .service('ChangeScoreService', function ($http, Constants) {
             var serviceBase = Constants.apiServiceBaseUri;
            // var serviceBase = 'http://10.0.70.70:80/';
            var self = this;

            self.getAnswerList = function (params) {
                return $http.post(serviceBase + 'api/scoreAdjust/getAnswerList', params);
                // return $http.post(serviceBase + 'api/business/getEditorListResp', params);
            }

            self.save = function (params) {
                return $http.post(serviceBase + 'api/scoreAdjust/save', params);
            }

            self.getDetail = function (params) {
                return $http.post(serviceBase + 'api/scoreAdjust/detail', params);
            }

        });

    /*
    * Directives
    */

    /*
    * Filters
    */
});
