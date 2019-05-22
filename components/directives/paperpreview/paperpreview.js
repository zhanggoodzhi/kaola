define(['angular', 'ng-table', '/web/components/directives/ngVideo/ngVideo.js', '/web/components/directives/refText/reftext.js', '/web/components/directives/refText/reftext25.js'], function (angular) {
    'use strict';

    angular.module('paperPreviewModule', []).directive('paperPreview', ['$log', '$state', 'Audio', function ($log, $state, Audio) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                paper: '=paper'
            },
            link: function (scope, element, attrs) {

                scope.CurrentPlayAudioItemID = "";

                scope.PlayPaperAudio = function (id, audio) {

                    if (scope.CurrentPlayAudioItemID != "") {
                        Audio.stop();
                        safeApply(scope, function () {
                            scope.CurrentPlayAudioItemID = '';
                        });
                    }
                    else {
                        var audioPath = audio;
                        if (audioPath.indexOf('/web') < 0) {
                            audioPath = scope.paper.ResourcePath + audioPath;
                        }

                        Audio.play(audioPath, function () {
                            safeApply(scope, function () {
                                scope.CurrentPlayAudioItemID = '';
                            });
                        });
                        safeApply(scope, function () {
                            scope.CurrentPlayAudioItemID = id;
                        });
                        console.log("PaperPreview PlayAudio:" + audioPath + ",id:" + id);
                    }
                };
                scope.IsAudioPlaying = function (id) {
                    return id == scope.CurrentPlayAudioItemID;
                }
                function safeApply(scope, fn) {
                    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
                }

                scope.GetVideoData = function (content) {
                    if (content.videoData == undefined || content.videoData == null) {
                        content.videoData = {
                            id: content.ContentID,
                            path: scope.paper.ResourcePath + content.Video,
                        };
                        //console.log("init content.videoData:", content.videoData);
                    }
                    //console.log("paper preview GetVideoData:", content.videoData);

                    return content.videoData;

                }
                scope.specialContentAnswers = [];
                scope.GetSpecialContentAnswerForArea25 = function (contents) {

                    var newContentAnswerArray = [];
                    if (contents == undefined || contents.length == 0) {
                        return;
                    }

                    for (var i = 0; i < contents.length; i++) {
                        var c = contents[i];
                        var title = "第" + ConvertNumberToCN(i + 1) + "题"
                        var contentID = c.ContentID;
                        var answerContent = "";

                        if (c.Answers != undefined && c.Answers.length > 0) {
                            for (var answerIndex = 0; answerIndex < c.Answers.length; answerIndex++) {
                                if (answerContent.length > 0) {
                                    answerContent += " / ";
                                }
                                answerContent += c.Answers[answerIndex].Content;
                            }
                        }

                        newContentAnswerArray.push({ Title: title, ContentID: contentID, Content: answerContent });
                    }
                    console.log(newContentAnswerArray);
                    return newContentAnswerArray;
                }
            },
            templateUrl: '/web/components/directives/paperpreview/directive_paper_preview.html'
        }
    }])
});
