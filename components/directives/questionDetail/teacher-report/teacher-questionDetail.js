define(['angular', '/web/components/directives/ngVideo/ngVideo.js'], function (angular) {
    'use strict'
    angular.module('app').directive('teacherQuestionDetail', ['Audio', '$rootScope', '$timeout', function (Audio, $rootScope, $timeout) {
        var option = {
            restrict: 'E',
            replace: true,
            scope: {
                analysisDetailData: '=analysisDetailData',
                questionData: '=questionData',
                areaData: '=areaData',
                paperResourceBaseUrl: '=paperResourceBaseUrl'
            },
            link: function (scope, element, attrs) {
                //是否显示知识点
                scope.EnableShowKnowledgePoint = false;

                //
                scope.getContentUrl = function () {

                    scope.UpdatePaperResourcePath(scope.questionData, scope.paperResourceBaseUrl);

                    scope.UpdateQuestionField(scope.questionData);

                    if (angular.isObject(scope.questionData)) {

                        var templateName = scope.questionData.AreaType;
                        if (scope.questionData.AreaType == 3
                            || scope.questionData.AreaType == 6
                            || scope.questionData.AreaType == 13
                            || scope.questionData.AreaType == 17) {
                            //朗读短文3, 句子仿读6, 句子朗读13, 模仿朗读17
                            templateName = 'readText';
                        }
                        return '/web/components/directives/questionDetail/teacher-report/directive_' + templateName + '.html';
                    }
                };
                scope.UpdatePaperResourcePath = function (questionData, url) {
                    //console.log("url", url);
                    //console.log("questionData.ResourcePath", questionData.ResourcePath);
                    //ResourcePath
                    var path = questionData.ResourcePath;
                    if (path.indexOf(url) == -1) {
                        path = url + path;
                    }
                    questionData.ResourcePath = path;
                    //console.log("UpdatePaperResourcePath:", path);
                }

                //support functions
                scope.PlayAudio = function (item, itemID, audioPath) {
                    if (scope.IsAudioPlaying(itemID)) {
                        item.AudioPlaying = false;
                        Audio.stop();
                        safeApply(scope, function () {
                            $rootScope.AudioPlayingItemID = '';
                        });
                    } else {
                        if (audioPath.indexOf('/web') < 0) {
                            audioPath = scope.questionData.ResourcePath + audioPath;
                        }
                        Audio.play(audioPath, function () {
                            safeApply(scope, function () {
                                $rootScope.AudioPlayingItemID = '';
                            });
                        });
                        item.AudioPlaying = true;
                        safeApply(scope, function () {
                            $rootScope.AudioPlayingItemID = itemID;
                        });
                    }
                    //console.log(ca);
                };

                scope.IsAudioPlaying = function (itemID) {
                    return itemID == $rootScope.AudioPlayingItemID;
                }

                scope.UpdateQuestionField = function (qData) {
                    //update  questionData to add more fields
                    if (qData.StudentContentAnswerData != undefined && qData.StudentContentAnswerData.length > 0) {
                        if (qData.StudentContentAnswerData[0].AudioPlaying != undefined) {
                            return;
                        }

                        for (var i = 0; i < qData.StudentContentAnswerData.length; i++) {
                            qData.StudentContentAnswerData[i].AudioPlaying = false;
                        }
                    }

                    //console.log(qData);
                }
                function safeApply(scope, fn) {
                    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
                }

                scope.GetOptionIcon = function (answerData, option) {
                    if (answerData != undefined && answerData.length > 0) {
                        for (var i = 0; i < answerData.length; i++) {
                            if (answerData[i].Content == option.OptionID) {
                                return 'http://cdn.uukaola.com/web/img/report/right1.png';
                            }
                        }
                    }
                    return 'http://cdn.uukaola.com/web/img/report/xuanzhong.png';
                }

                scope.ShowAudioRefText = function (refText) {
                    $rootScope.RefText = "";
                    if (refText != undefined) {
                        $rootScope.RefText = refText;
                    }

                    angular.element('#showRefTextDialog').modal('show');
                }

                scope.ViewContentScoreDetail = function (ca, $event) {
                    var id = ca.PaperContent.ContentID;
                    var data = null;
                    scope.analysisDetailData.forEach(function (v) {
                        if (id === v.ContentID) {
                            data = v
                        }
                    });
                    // scope.$emit('TeacherReport_ViewContentScoreDetail', ca);
                    // questionType  0口语题，1填空题，2选择题，3多维度题
                    // var data = {
                    //     questionType: 0,
                    //     chartData: [
                    //         { name: '0-1', value: 33 },
                    //         { name: '1-2', value: 31 },
                    //         { name: '2-3', value: 23 },
                    //         { name: '3-4', value: 13 },
                    //         { name: '4-5', value: 15 }
                    //     ],
                    //     tableData: [{
                    //         studentId: '001',
                    //         name: '张三',
                    //         score: 2,
                    //         sourceUrl: 'http://www.uukaola.com/web/resources/papers/9013c9679358439ba25184afc7a6fbd7/c85ccee2f4c240dca16bf66a7f538a52_Audio.mp3'
                    //     },
                    //     {
                    //         studentId: '002',
                    //         name: '李四',
                    //         score: 4,
                    //         sourceUrl: 'http://www.uukaola.com/web/resources/papers/9013c9679358439ba25184afc7a6fbd7/6a41cff527814747997f77fb8ca4e51a_Audio.mp3'
                    //     }]
                    // }
                    // var data = {
                    //     questionType: 1,
                    //     chartData: [
                    //         { name: '对', value: 33 },
                    //         { name: '错', value: 31 },
                    //     ],
                    //     tableData: [{
                    //         studentId: '001',
                    //         name: '张三',
                    //         answer: 'aaaa dsft wdfsd fsds dsf s',
                    //         ifTrue: true
                    //     },
                    //     {
                    //         studentId: '002',
                    //         name: '李四',
                    //         answer: 'bbbb',
                    //         ifTrue: false
                    //     }]
                    // }
                    // var data = {
                    //     questionType: 2,
                    //     chartData: [
                    //         { name: 'A', value: 33, ifTrue: true },
                    //         { name: 'B', value: 31 },
                    //         { name: 'C', value: 23 }
                    //     ],
                    //     tableData: [{
                    //         studentId: '001',
                    //         name: '张三',
                    //         answer: 'A',
                    //         ifTrue: true
                    //     },
                    //     {
                    //         studentId: '002',
                    //         name: '李四',
                    //         answer: 'B',
                    //         ifTrue: false
                    //     }, {
                    //         studentId: '003',
                    //         name: '王五',
                    //         answer: null,// anwer为null表示未答题
                    //         ifTrue: false
                    //     }]
                    // }
                    // var data = {
                    //     questionType: 3,
                    //     chartData: [
                    //         {
                    //             chartType: 1,
                    //             data: [
                    //                 { name: '0.0-1.0分', value: 33, },
                    //                 { name: '1.0-2.0分', value: 13, },
                    //                 { name: '2.0-3.0分', value: 18, },
                    //                 { name: '3.0-4.0分', value: 43, },
                    //                 { name: '4.0-5.0分', value: 31, },
                    //             ]
                    //         },
                    //         {
                    //             chartType: 2,
                    //             data: [
                    //                 { name: '优', value: 33, },
                    //                 { name: '良', value: 31 },
                    //                 { name: '中', value: 23 },
                    //                 { name: '差', value: 3 }
                    //             ]
                    //         },
                    //         {
                    //             chartType: 3,
                    //             data: [
                    //                 { name: '优', value: 33, },
                    //                 { name: '良', value: 31 },
                    //                 { name: '中', value: 23 },
                    //                 { name: '差', value: 3 }
                    //             ]
                    //         }, {
                    //             chartType: 4,
                    //             data: [
                    //                 { name: '优', value: 33, },
                    //                 { name: '良', value: 31 },
                    //                 { name: '中', value: 23 },
                    //                 { name: '差', value: 3 }
                    //             ]
                    //         }
                    //     ],
                    //     tableData: [{
                    //         studentId: '001',
                    //         name: '张三',
                    //         score: 4,
                    //         complete: '差',
                    //         exact: '优',
                    //         fluency: '中',
                    //         content: [{
                    //             text: 'we',
                    //             scoreLevel: 1
                    //         }, {
                    //             text: ' ',
                    //             scoreLevel: -1
                    //         }, {
                    //             text: 'are',
                    //             scoreLevel: 2
                    //         }, {
                    //             text: ' ',
                    //             scoreLevel: -1
                    //         }, {
                    //             text: 'young',
                    //             scoreLevel: 3
                    //         }, {
                    //             text: '.',
                    //             scoreLevel: -1
                    //         }],
                    //         sourceUrl: 'http://www.uukaola.com/web/resources/papers/9013c9679358439ba25184afc7a6fbd7/c85ccee2f4c240dca16bf66a7f538a52_Audio.mp3',
                    //     },
                    //     {
                    //         studentId: '002',
                    //         name: '李四',
                    //         score: 5,
                    //         complete: '中',
                    //         exact: '优',
                    //         fluency: '中',
                    //         content: [{
                    //             text: 'we',
                    //             scoreLevel: 1
                    //         }, {
                    //             text: ' ',
                    //             scoreLevel: -1
                    //         }, {
                    //             text: 'are',
                    //             scoreLevel: 2
                    //         }, {
                    //             text: ' ',
                    //             scoreLevel: -1
                    //         }, {
                    //             text: 'young',
                    //             scoreLevel: 3
                    //         }, {
                    //             text: '.',
                    //             scoreLevel: -1
                    //         }],
                    //         sourceUrl: 'http://www.uukaola.com/web/resources/papers/9013c9679358439ba25184afc7a6fbd7/6a41cff527814747997f77fb8ca4e51a_Audio.mp3'
                    //     },
                    //     ]
                    // }

                    scope.$emit('TeacherReport_ViewContentScoreDetail', data);
                    // $event.stopPropagation(); 暂时关闭
                }
                // 测试
                // $timeout(function () {
                //     scope.ViewContentScoreDetail();
                // });
                scope.GetVideoData = function (questionData, ca) {
                    if (ca.PaperContent.videoData == undefined || ca.PaperContent.videoData == null) {
                        ca.PaperContent.videoData = {
                            id: ca.PaperContent.ContentID,
                            path: questionData.ResourcePath + ca.PaperContent.Video,
                        };
                        //console.log("init content.videoData:", ca.PaperContent.videoData);
                    }

                    return ca.PaperContent.videoData;
                }

                scope.GetSpecialContentAnswer = function (contentAnswers) {
                    var answerStr = "";
                    if (contentAnswers != undefined && contentAnswers.length > 0) {
                        for (var i = 0; i < contentAnswers.length; i++) {
                            if (answerStr.length > 0) {
                                answerStr += " / ";
                            }
                            answerStr += contentAnswers[i].Content;
                        }
                    }
                    return answerStr;
                }

            },
            template: '<div class="row" ng-include="getContentUrl()"></div>'
        };
        return option;

    }])
})
