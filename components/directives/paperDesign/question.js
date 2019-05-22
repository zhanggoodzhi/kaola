define(['angular', '/web/components/directives/ngVideo/ngVideo.js', '/web/components/directives/paperDesign/operation.js'], function (angular) {
    'use strict'
    angular.module('app').directive('question', ['$timeout', 'Audio', '$rootScope', function ($timeout, Audio, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                data: '=data'
            },
            link: function (scope, element, attrs) {

                scope.getContentUrl = function () {

                    if (angular.isObject(scope.data)) {
                        var templateName = scope.data.AreaType;

                        if (templateName > 0) {
                            return '/web/components/directives/paperDesign/directive_' + templateName + '.html';
                        }
                        else {
                            return '/web/components/directives/paperDesign/directive_' + "default" + '.html';
                        }
                    }
                };

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
                scope.PlayAudio = function (itemID,model, path) {
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
