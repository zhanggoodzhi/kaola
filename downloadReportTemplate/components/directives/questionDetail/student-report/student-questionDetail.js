define([
    'angular',
    'components/directives/questionDetail/student-report/directive_1.html.js',
    'components/directives/questionDetail/student-report/directive_2.html.js',
    'components/directives/questionDetail/student-report/directive_5.html.js',
    'components/directives/questionDetail/student-report/directive_7.html.js',
    'components/directives/questionDetail/student-report/directive_9.html.js',
    'components/directives/questionDetail/student-report/directive_10.html.js',
    'components/directives/questionDetail/student-report/directive_11.html.js',
    'components/directives/questionDetail/student-report/directive_14.html.js',
    'components/directives/questionDetail/student-report/directive_16.html.js',
    'components/directives/questionDetail/student-report/directive_18.html.js',
    'components/directives/questionDetail/student-report/directive_19.html.js',
    'components/directives/questionDetail/student-report/directive_20.html.js',
    'components/directives/questionDetail/student-report/directive_21.html.js',
    'components/directives/questionDetail/student-report/directive_22.html.js',
    'components/directives/questionDetail/student-report/directive_24.html.js',
    'components/directives/questionDetail/student-report/directive_25.html.js',
    'components/directives/questionDetail/student-report/directive_26.html.js',
    'components/directives/questionDetail/student-report/directive_27.html.js',
    'components/directives/questionDetail/student-report/directive_701.html.js',
    'components/directives/questionDetail/student-report/directive_readText.html.js',
    'components/directives/questionDetail/student-report/student-scoreInfo.js',
    'components/directives/ngVideo/ngVideo.js'
], function (angular, h1, h2, h5, h7, h9, h10, h11, h14, h16, h18, h19, h20, h21, h22, h24, h25, h26, h27, h701, hreadText) {
    'use strict'
    var html = {
        h1: h1,
        h2: h2,
        h5: h5,
        h7: h7,
        h9: h9,
        h10: h10,
        h11: h11,
        h14: h14,
        h16: h16,
        h18: h18,
        h19: h19,
        h20: h20,
        h21: h21,
        h22: h22,
        h24: h24,
        h25: h25,
        h26: h26,
        h27: h27,
        h701: h701,
        hreadText: hreadText
    }
    angular
        .module('app')
        .directive('studentQuestionDetail', [
            '$log',
            '$timeout',
            'Audio',
            '$rootScope',
            '$compile',
            function ($log, $timeout, Audio, $rootScope, $compile) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        questionData: '=questionData',
                        analysisData: '=analysisData',
                        paperResourceBaseUrl: '=paperResourceBaseUrl',
                        answerBaseUrl: '=answerBaseUrl'
                    },
                    link: function (scope, element, attrs) {

                        //是否显示知识点
                        scope.EnableShowKnowledgePoint = false;
                        scope.EnableShowScoreComment = true;

                        //
                        // scope.getContentUrl = function () { };
                        scope.UpdatePaperResourcePath = function (questionData, url) {

                            //ResourcePath
                            var path = questionData.ResourcePath;
                            if (path.indexOf(url) == -1) {
                                path = url + path;
                            }
                            if (/^\/web/.test(path) === true) {
                                path = path.substring(5);
                            }
                            questionData.ResourcePath = path;
                            questionData.paperResourceBaseUrl = url;
                            //console.log(path);
                        }
                        scope.UpdateStudentAnswerPath = function (questionData, url) {

                            //StudentAnswerPath
                            questionData.answerBaseUrl = url;
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
                                Audio
                                    .play(audioPath, function () {
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

                        scope.PlaySpecialStudentAudioForAreaType16 = function () {

                            console.log("scope.questionData:", scope.questionData);

                            var itemID = scope.questionData.QuestionID + '_16_PlayAnswer';

                            if (scope.IsAudioPlaying(itemID)) {
                                scope.questionData.AudioPlaying = false;
                                Audio.stop();
                                safeApply(scope, function () {
                                    $rootScope.AudioPlayingItemID = '';
                                });
                            } else {
                                scope.PlayQuestionAnswerFor16(scope.questionData);
                            }
                            //console.log(ca);
                        };
                        scope.PlayQuestionAnswerFor16 = function (qData) {
                            if (qData == undefined || qData.StudentContentAnswerData == undefined || qData.StudentContentAnswerData.length == 0) {
                                return;
                            }

                            var itemID = qData.QuestionID + '_16_PlayAnswer';

                            var studentAnswer = qData.StudentContentAnswerData[0].StudentAnswerData;
                            var studentAnswerAudioPath = studentAnswer.StudentAnswerContent;
                            var contentID = studentAnswer.ContentID;
                            var questionID = studentAnswer.QuestionID;

                            var audioPath = studentAnswerAudioPath.replace(contentID, questionID);

                            if (audioPath.indexOf('/web') < 0) {
                                audioPath = qData.ResourcePath + audioPath;
                            }
                            console.log("audioPath:", audioPath);
                            Audio.play(audioPath, function () {
                                safeApply(scope, function () {
                                    $rootScope.AudioPlayingItemID = '';
                                });
                            });
                            qData.AudioPlaying = true;
                            safeApply(scope, function () {
                                $rootScope.AudioPlayingItemID = itemID;
                            });
                        };

                        scope.IsAudioPlaying = function (itemID) {
                            return itemID == $rootScope.AudioPlayingItemID;
                        }

                        scope.UpdateQuestionField = function (qData, aData) {
                            //update  questionData to add more fields
                            if (qData.StudentContentAnswerData != undefined && qData.StudentContentAnswerData.length > 0) {
                                if (qData.StudentContentAnswerData[0].AudioPlaying != undefined) {
                                    return;
                                }

                                for (var i = 0; i < qData.StudentContentAnswerData.length; i++) {
                                    qData.StudentContentAnswerData[i].AudioPlaying = false;

                                    var contentID = qData.StudentContentAnswerData[i].PaperContent.ContentID;
                                    var areaType = qData.AreaType;

                                    if (areaType == 3 || areaType == 6 || areaType == 13 || areaType == 17) {
                                        //朗读短文3, 句子仿读6, 句子朗读13,模仿朗读17
                                        var filterAnalysisData = scope.GetPaperAnalysisData(contentID, aData);
                                        if (filterAnalysisData == undefined || filterAnalysisData.ReadTextScoreDetail == undefined || filterAnalysisData.ReadTextScoreDetail.length == 0) {

                                            if (filterAnalysisData == undefined) {
                                                filterAnalysisData = {};
                                            }

                                            if (filterAnalysisData.ReadTextScoreDetail == undefined) {
                                                filterAnalysisData.ReadTextScoreDetail = [];
                                            }

                                            filterAnalysisData
                                                .ReadTextScoreDetail
                                                .push({CharText: qData.StudentContentAnswerData[i].PaperContent.Text, scoreLevel: 0})
                                        }
                                        qData.StudentContentAnswerData[i].PaperAnalysisData = filterAnalysisData;

                                    }
                                }
                            }

                            //特殊处理题型数据:  跟读与模仿16
                            if (qData != undefined && qData.AreaType == 16) {
                                var questionID = qData.QuestionID;
                                var filterAnalysisData = scope.GetPaperAnalysisData(questionID, aData);
                                if (filterAnalysisData == undefined || filterAnalysisData.ReadTextScoreDetail == undefined || filterAnalysisData.ReadTextScoreDetail.length == 0) {

                                    if (filterAnalysisData == undefined) {
                                        filterAnalysisData = {};
                                    }

                                    if (filterAnalysisData.ReadTextScoreDetail == undefined) {
                                        filterAnalysisData.ReadTextScoreDetail = [];
                                    }

                                    filterAnalysisData
                                        .ReadTextScoreDetail
                                        .push({CharText: qData.Text, scoreLevel: 0})
                                    qData.QuestionAnalysisData = filterAnalysisData;
                                    qData.QuestionAnalysisData.ScoreComment = '';
                                } else {
                                    qData.QuestionAnalysisData = filterAnalysisData;
                                }

                                var findContentAnswer = false;
                                if (qData.StudentContentAnswerData != undefined && qData.StudentContentAnswerData.length > 0) {
                                    for (var i = 0; i < qData.StudentContentAnswerData.length; i++) {
                                        var ca = qData.StudentContentAnswerData[i];
                                        if (ca.StudentAnswerData != undefined && ca.StudentAnswerData.StudentAnswerContent != undefined && ca.StudentAnswerData.StudentAnswerContent != '') {
                                            findContentAnswer = true;
                                            break;
                                        }
                                    }
                                }
                                qData.QuestionAnalysisData.HasAnswer = findContentAnswer;
                            }
                        }

                        function safeApply(scope, fn) {
                            (scope.$$phase || scope.$root.$$phase)
                                ? fn()
                                : scope.$apply(fn);
                        }

                        scope.GetOptionIcon = function (saData, option) {
                            if (option.OptionID == saData.PaperAnswerContent) {
                                return 'img/report/right1.png';
                            } else {
                                if (saData.StudentAnswerContent == option.OptionID) {
                                    return 'img/report/wrong1.png';
                                } else {
                                    return 'img/report/xuanzhong.png';
                                }
                            }

                        }

                        scope.ShowAudioRefText = function (refText) {
                            $rootScope.RefText = "";
                            if (refText != undefined) {
                                $rootScope.RefText = refText;
                            }

                            angular
                                .element('#showRefTextDialog')
                                .modal({backdrop: 'static', keyboard: false});
                        }

                        // method for paper analysis data
                        scope.GetPaperAnalysisData = function (contentID, aData) {
                            //  console.log("contentID:", contentID, aData);
                            var filterAnalysisData = {};
                            if (aData != undefined && aData.length > 0) {
                                for (var i = 0; i < aData.length; i++) {
                                    var item = aData[i];
                                    if (item.ContentID == contentID) {
                                        filterAnalysisData = item;
                                        break;
                                    }
                                }
                            }
                            //  console.log(filterAnalysisData);
                            return filterAnalysisData;
                        }
                        scope.GetTextColorByScoreLevel = function (scoreLevel) {
                            var colorClass = 'readtext default';

                            if (scoreLevel == 1) {
                                colorClass = 'readtext red';
                            }
                            if (scoreLevel == 2) {
                                colorClass = 'readtext blue';
                            }
                            if (scoreLevel == 3) {
                                colorClass = 'readtext yellow';
                            }
                            if (scoreLevel == 4) {
                                colorClass = 'readtext green';
                            }
                            return colorClass;
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
                            //console.log(answerStr);
                            return answerStr;
                        }

                        scope.GetVideoData = function (questionData, ca) {
                            if (ca.PaperContent.videoData == undefined || ca.PaperContent.videoData == null) {
                                ca.PaperContent.videoData = {
                                    id: ca.PaperContent.ContentID,
                                    path: questionData.ResourcePath + ca.PaperContent.Video
                                };
                                // console.log("init content.videoData:", ca.PaperContent.videoData);
                            }

                            return ca.PaperContent.videoData;
                        }

                        scope.UpdatePaperResourcePath(scope.questionData, scope.paperResourceBaseUrl);
                        scope.UpdateStudentAnswerPath(scope.questionData, scope.answerBaseUrl);

                        scope.UpdateQuestionField(scope.questionData, scope.analysisData);

                        if (angular.isObject(scope.questionData)) {
                            var templateName = scope.questionData.AreaType;
                            if (scope.questionData.AreaType == 3 || scope.questionData.AreaType == 6 || scope.questionData.AreaType == 13 || scope.questionData.AreaType == 17) {
                                //朗读短文3, 句子仿读6, 句子朗读13, 模仿朗读17
                                templateName = 'readText';
                            }
                            var content = $compile(html['h' + templateName])(scope);
                            element.append(content);
                            // return '/web/components/directives/questionDetail/student-report/directive_'
                            // + templateName + '.html';
                        }
                    }
                }
            }
        ])
});