define(['angular'], function (angular) {
    'use strict'
    angular.module('app').directive('mistakeScoreInfo', ['Audio', '$rootScope', function (Audio, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                answerData: '=answerData',
                questionData: '=questionData',
                EnableShowScoreComment: '=showScoreComment',
                ShowSampleAnswer: '=showSampleAnswer',
                ShowStudentAnswer: '=showStudentAnswer',
                ShowQuestionAudio: '=showQuestionAudio'
            },
            link: function (scope, element, attrs) {

                scope.CurrentContent = undefined;

                scope.getContentUrl = function () {
                    //console.log('answerData:', scope.answerData);
                    //console.log('questionData:', scope.questionData);
                    if (scope.answerData != undefined && scope.answerData.ContentID != undefined) {
                        if (scope.questionData != undefined
                            && scope.questionData.QuestionModel != undefined
                            && scope.questionData.QuestionModel.Contents)
                            for (var i = 0; i < scope.questionData.QuestionModel.Contents.length; i++) {
                                var c = scope.questionData.QuestionModel.Contents[i];
                                if (c.ContentID == scope.answerData.ContentID) {
                                    scope.CurrentContent = c;
                                }
                            }
                    }
                    if (scope.CurrentContent == undefined) {
                        scope.CurrentContent = scope.questionData.QuestionModel.Contents[0];
                    }
                    //console.log("CurrentContent:", scope.CurrentContent);

                    //信息转述题型,显示[播放录音]按钮
                    if (scope.questionData.AreaType == 19) {
                        scope.ShowQuestionAudio = true;
                        scope.ShowSampleAnswer = false;
                    }
                    return '/web/components/directives/mistakeCollection/directive_scoreInfo.html';
                };

                //support functions
                scope.PlayAudio = function (item, itemID, audioPath, audioType) {
                    console.log("$rootScope.AudioPlayingItemID == itemID:", $rootScope.AudioPlayingItemID, itemID);
                    if (scope.IsAudioPlaying(itemID)) {
                        item.AudioPlaying = false;
                        Audio.stop();
                        safeApply(scope, function () {
                            $rootScope.AudioPlayingItemID = '';
                        });
                    } else {
                        if (audioType == "paper") {
                            var path = scope.questionData.ResourcePath;
                            if (audioPath.indexOf(path) < 0) {
                                audioPath = path + audioPath;
                            }
                        }
                        if (audioType == "answer") {
                            var answerBaseUrl = scope.questionData.answerBaseUrl;
                            if (audioPath.indexOf(answerBaseUrl) < 0) {
                                audioPath = answerBaseUrl + audioPath;
                            }
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

                };

                scope.IsAudioPlaying = function (itemID) {
                    return itemID == $rootScope.AudioPlayingItemID;
                }

                function safeApply(scope, fn) {
                    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
                }
            },
            template: '<div class="row" ng-include="getContentUrl()"></div>'
        }
    }])
});
