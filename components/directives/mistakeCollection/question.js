define(['angular', '/web/components/directives/ngVideo/ngVideo.js', '/web/components/directives/mistakeCollection/operation.js', '/web/components/directives/mistakeCollection/mistakeScoreInfo.js'], function (angular) {
    'use strict'
    angular.module('app').directive('question', ['Audio', '$rootScope', function (Audio, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                data: '=data',
                paperResourceBaseUrl: '=paperResourceBaseUrl',
                answerBaseUrl: '=answerBaseUrl'
            },
            link: function (scope, element, attrs) {

                scope.getContentUrl = function () {

                    if (angular.isObject(scope.data)) {

                        //console.log('scope.paperResourceBaseUrl:', scope.paperResourceBaseUrl);
                        scope.UpdatePaperResourcePath(scope.data, scope.paperResourceBaseUrl);
                        scope.UpdateStudentAnswerPath(scope.data, scope.answerBaseUrl);

                        var areaType = scope.data.AreaType;
                        var templateName = 'default';
                        if (areaType == 3
                            || areaType == 6
                            || areaType == 13
                            || areaType == 17) {
                            //朗读短文3, 句子仿读6, 句子朗读13, 模仿朗读17
                            templateName = 'readText';
                        } else {
                            if (areaType > 0) {
                                templateName = areaType;
                            }
                        }

                        return '/web/components/directives/mistakeCollection/directive_' + templateName + '.html';
                         
                    }
                };

                scope.UpdatePaperResourcePath = function (questionData, url) {

                    //ResourcePath
                    var path = questionData.ResourcePath;
                    if (path.indexOf(url) == -1) {
                        path = url + path;
                    }
                    questionData.ResourcePath = path;
                    questionData.paperResourceBaseUrl = url;
                }
                scope.UpdateStudentAnswerPath = function (questionData, url) {
                    //StudentAnswerPath 
                    questionData.answerBaseUrl = url;
                }


                //scope.UnderLineBlock = "<div style='width:210px;height:20px;margin-left:4px;display:inline-block;border-bottom:1px solid #333333;'></div>"




                scope.GetOptionIcon = function (answerData, option) {
                    if (answerData != undefined && answerData.length > 0) {
                        if (answerData[0].Content == option.OptionID) {
                            return '/web/img/paperDesign/option_right.png';
                        }
                    }
                    return '/web/img/paperDesign/option_empty.png';


                }

                scope.GetVideoData = function (resourcePath, c) {
                    if (c.videoData == undefined || c.videoData == null) {
                        c.videoData = {
                            id: c.ContentID,
                            path: resourcePath + c.Video,
                        };
                        //console.log("init content.videoData:", ca.PaperContent.videoData);
                    }

                    return c.videoData;
                }
                scope.PlayAudio = function (itemID, model, path) {
                    if (scope.IsAudioPlaying(itemID)) {
                        model.AudioPlaying = false;
                        var audioPath = "";
                        Audio.stop();
                        safeApply(scope, function () {
                            $rootScope.AudioPlayingItemID = '';
                        });
                    } else {
                        if (path.indexOf('/web') >= 0) {
                            audioPath = path;
                        }
                        Audio.play(audioPath, function () {
                            safeApply(scope, function () {
                                $rootScope.AudioPlayingItemID = '';
                            });
                        });
                        model.AudioPlaying = true;
                        safeApply(scope, function () {
                            $rootScope.AudioPlayingItemID = itemID;
                        });
                    }
                }
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
