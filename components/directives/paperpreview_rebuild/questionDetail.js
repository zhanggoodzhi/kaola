define(['angular', '/web/components/directives/ngVideo/ngVideo.js', '/web/components/directives/refText/reftext.js', '/web/components/directives/refText/reftext25.js'], function (angular) {
    'use strict'
    angular.module('paperPreviewQuestionDetailModule', []).directive('paperPreviewQuestionDetail', ['Audio', '$rootScope', function (Audio, $rootScope) {
        var option = {
            restrict: 'E',
            replace: true,
            scope: {
                questionData: '=questionData',
                resourcePath: '=resourcePath',
                areaType: '=areaType'
            },
            link: function (scope, element, attrs) {

                scope.getContentUrl = function () {

                    //console.log(scope.questionData, scope.resourcePath, scope.areaType);
                    if (angular.isObject(scope.questionData)) {

                        var templateName = scope.areaType;
                        if (scope.areaType == 3
                            || scope.areaType == 6
                            || scope.areaType == 13
                            || scope.areaType == 17) {
                            //朗读短文3, 句子仿读6, 句子朗读13, 模仿朗读17
                            templateName = 'readText';
                        }
                        return '/web/components/directives/paperpreview_rebuild/directive_' + templateName + '.html';
                    }
                };

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
                            audioPath = scope.resourcePath + audioPath;
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

                scope.ShowAudioRefText = function (audioText) {
                    $rootScope.AudioRefText = "";
                    if (audioText != undefined) {
                        $rootScope.AudioRefText = audioText;
                    }

                    scope.$emit('ShowAudioRefText', audioText);
                }

                scope.GetVideoData = function (questionData, ca) {
                    if (ca.videoData == undefined || ca.videoData == null) {
                        ca.videoData = {
                            id: ca.ContentID,
                            path: scope.resourcePath + ca.Video,
                        };
                        //console.log("init content.videoData:", ca.PaperContent.videoData);
                    }

                    return ca.videoData;
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
