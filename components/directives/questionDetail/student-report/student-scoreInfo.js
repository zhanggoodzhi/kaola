define(['angular'], function (angular) {
    'use strict'
    angular.module('app').directive('studentScoreInfo', ['$log', '$timeout', 'Audio', '$rootScope', function ($log, $timeout, Audio, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                ca: '=contentData',
                questionData: '=questionData',
                EnableShowScoreComment: '=showScoreComment',
                ShowSampleAnswer: '=showSampleAnswer',
                ShowStudentAnswer: '=showStudentAnswer',
                ShowQuestionAudio: '=showQuestionAudio'
            },
            link: function (scope, element, attrs) {


                //
                scope.getContentUrl = function () {
                    return '/web/components/directives/questionDetail/student-report/directive_scoreInfo.html';
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
                    //console.log(ca);
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
