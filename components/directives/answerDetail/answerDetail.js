define(['angular', '/web/components/directives/ngAudiowave/ngAudiowave.js', '/web/components/directives/ngAudiowave/ngAudio.js', '/web/components/directives/ngVideo/ngVideo.js', '/web/components/directives/refText/reftext.js', '/web/components/directives/refText/reftext25.js', ], function (angular) {
    'use strict'
    angular.module('answerDetailModule', []).directive('answerDetail', ['$log', '$timeout', 'Audio', '$rootScope', function ($log, $timeout, Audio, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                answer: '=answer',
                contentAnswers: '=contentAnswers',
                answerBaseUrl: '=answerBaseUrl',
                paperResourceBaseUrl: '=paperResourceBaseUrl'
            },
            link: function (scope, element, attrs) {
                scope.BroswerVerion = getIEVersion();
                scope.AnswerAudioPlaying = false;

                scope.getContentUrl = function () {
                    //console.log(scope.serverUrl);
                    if (angular.isObject(scope.answer)) {
                        //update paper resource path
                        scope.UpdatePaperResourcePath(scope.answer, scope.paperResourceBaseUrl);

                        //update answer audio path
                        scope.UpdateAnswerAudioPath(scope.answer, scope.answerBaseUrl);

                        var areatype = scope.answer.AreaType;
                        if (scope.answer.ContentAreaType != undefined && scope.answer.ContentAreaType > 0) {
                            areatype = scope.answer.ContentAreaType;
                        }
                        else if (scope.answer.QuestionAreaType != undefined && scope.answer.QuestionAreaType > 0) {
                            areatype = scope.answer.QuestionAreaType;
                        }
                        //console.log(areatype);
                        return '/web/components/directives/answerDetail/directive_' + areatype + '.html';
                    }
                };
                scope.UpdatePaperResourcePath = function (answer, url) {

                    //ResourcePath
                    var path = answer.ResourcePath;
                    if (path.indexOf(url) == -1) {
                        path = url + path;
                    }
                    answer.ResourcePath = path;

                }
                scope.UpdateAnswerAudioPath = function (answer, url) {
                    if (scope.BroswerVerion > 11) {
                        //show audiowave
                        var prefix = url + 'api/answer/getAnswerAudio/';
                        if (answer.AudioPath.indexOf(prefix) == -1) {
                            var newPath = answer.AudioPath.replace(/\//g, "$");
                            newPath = newPath.replace(/\\/g, "$");
                            newPath = newPath.replace(/\./g, "^");
                            answer.AudioPath = prefix + newPath;
                            //console.log(scope.answer.AudioPath);
                        }
                    } else {
                        if (answer.AudioPath.indexOf(url) == -1) {
                            answer.AudioPath = url + answer.AudioPath;
                        }
                    }
                }

                scope.SetAudioPlaying = function (flag) {
                    //console.log("SetAudioPlaying ", flag);
                    scope.AnswerAudioPlaying = flag;
                }

                scope.PlayContentAudio = function (answer) {
                    var path = answer.ResourcePath + answer.ContentAudio;
                    Audio.play(path);
                };
                scope.PlayQuestionAudio = function (answer) {
                    var path = answer.ResourcePath + answer.QuestionAudio;
                    Audio.play(path);
                };

                scope.ChoosePa = function (pa) {
                    scope.ChoosedPa = pa;
                };
                scope.LoadPa = function () {
                    scope.SetAudioPlaying(false);
                    scope.ChoosedPa = scope.answer.AnswerModels[0] || {};

                }
                scope.LoadPa();
                scope.$watch(function () {
                    var answerID = scope.answer.AnswerID;
                    var newValue = answerID;
                    return newValue;
                }, scope.LoadPa);

                scope.GetVideoData = function (answer) {
                    if (answer.videoData == undefined || answer.videoData == null) {

                        var path = answer.ResourcePath + answer.ContentVideo;
                        answer.videoData = {
                            id: answer.ContentID,
                            path: path,
                            answerID: answer.AnswerID,
                        };
                        //console.log("init answer.videoData:", answer.videoData);
                    }
                    return answer.videoData;
                }
            },
            template: '<div class="row" ng-include="getContentUrl()"></div>'
        }
    }])
});
