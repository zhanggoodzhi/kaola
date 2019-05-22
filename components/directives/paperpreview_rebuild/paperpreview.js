define(['angular', 'ng-table', '/web/components/directives/paperpreview_rebuild/questionDetail.js'], function (angular) {
    'use strict';

    angular.module('paperPreviewModule', ['paperPreviewQuestionDetailModule']).directive('paperPreview', ['$log', '$state', 'Audio', 'CommonBusinessService', function ($log, $state, Audio, CommonBusinessService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                paper: '=paper'
            },
            link: function (scope, element, attrs) {

                scope.CurrentPlayAudioItemID = "";

                scope.getContentUrl = function () {
                    scope.AddExtField(scope.paper);

                    return '/web/components/directives/paperpreview_rebuild/directive_paper_preview.html';

                };

                scope.PlayPaperAudio = function (id, audio) {

                    if (scope.CurrentPlayAudioItemID != "") {
                        Audio.stop();
                        safeApply(scope, function () {
                            scope.CurrentPlayAudioItemID = '';
                        });
                    } else {
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
                    (scope.$$phase || scope.$root.$$phase) ? fn(): scope.$apply(fn);
                }

                //miscellaneous methods
                //展开/收缩
                scope.collapseToggle = function (d) {
                    if (d.CollapseState != undefined) {
                        d.CollapseState = d.CollapseState == 0 ? 1 : 0;
                    }
                }
                scope.AddExtField = function (paperData) {
                    var data = paperData && paperData.Areas;
                    if (data == undefined || data.length == 0) {
                        return;
                    }

                    for (var i = 0; i < data.length; i++) {
                        if (data[i].CollapseState == undefined) {
                            data[i].CollapseState = 0;
                        }
                    }
                }

                scope.GetContentCount = function (sa) {
                    if (sa.AreaType != 16) {
                        if (sa.Questions != undefined && sa.Questions.length > 0) {

                            var totalContentCount = 0;
                            for (var i = 0; i < sa.Questions.length; i++) {
                                var q = sa.Questions[i];
                                if (q != undefined && q.Contents != undefined) {
                                    totalContentCount += q.Contents.length;
                                }
                            }
                            return totalContentCount;

                        }

                    } else {

                        if (sa.Questions != undefined && sa.Questions.length > 0) {
                            return sa.Questions.length;
                        }
                    }

                    return 0;
                }
                scope.GetContentScore = function (sa) {
                    if (sa.AreaType != 16) {
                        if (sa.Questions != undefined && sa.Questions.length > 0) {
                            var contentData = sa.Questions[0].Contents;
                            if (contentData != undefined && contentData.length > 0) {
                                return contentData[0].Score;
                            }
                        }
                    } else {
                        if (sa.Questions != undefined && sa.Questions.length > 0) {
                            var contentData = sa.Questions[0].Contents;
                            var questionScore = 0;
                            if (contentData != undefined && contentData.length > 0) {
                                for (var ci = 0; ci < contentData.length; ci++) {
                                    questionScore += contentData[ci].Score;
                                }
                            }
                            return questionScore;
                        }
                    }

                    return 0;
                }
                scope.GetAreaScore = function (sa) {
                    var totalScore = 0;
                    if (sa.Questions != undefined) {
                        for (var i = 0; i < sa.Questions.length; i++) {
                            var q = sa.Questions[i];
                            if (q != undefined && q.Contents != undefined) {
                                for (var ci = 0; ci < q.Contents.length; ci++) {
                                    totalScore += q.Contents[ci].Score;
                                }
                            }
                        }
                    }
                    return totalScore;
                }

                scope.GetPart1ContentCount = function (sa) {
                    if (sa.Questions != undefined && sa.Questions.length > 0) {
                        var contentData = sa.Questions[0].Contents;
                        if (contentData != undefined && contentData.length > 0) {
                            return contentData.length - 1;
                        }
                    }
                    return 0;
                }
                scope.GetPart1ContentScore = function (sa) {
                    if (sa.Questions != undefined && sa.Questions.length > 0) {
                        var contentData = sa.Questions[0].Contents;
                        if (contentData != undefined && contentData.length > 0) {
                            return contentData[0].Score;
                        }
                    }
                }
                scope.GetPart2ContentScore = function (sa) {
                    if (sa.Questions != undefined && sa.Questions.length > 0) {
                        var contentData = sa.Questions[0].Contents;
                        if (contentData != undefined && contentData.length > 0) {
                            return contentData[contentData.length - 1].Score;
                        }
                    }
                }
                scope.GetPart1TotalScoreFor26 = function (sa) {
                    if (sa.AreaType != 26) {
                        return 0;
                    }
                    var totalScore = 0;
                    if (sa.Questions != undefined) {
                        for (var i = 0; i < sa.Questions.length; i++) {
                            if (sa.Questions[i].Index == 1) {
                                var q = sa.Questions[i];
                                //console.log(q);
                                if (q != undefined && q.Contents != undefined) {
                                    for (var ci = 0; ci < q.Contents.length; ci++) {
                                        totalScore += q.Contents[ci].Score;
                                    }
                                }
                            }
                        }
                    }
                    return totalScore;
                }
                scope.GetPart2TotalScoreFor26 = function (sa) {
                    if (sa.AreaType != 26) {
                        return 0;
                    }
                    var totalScore = 0;
                    if (sa.Questions != undefined) {
                        for (var i = 0; i < sa.Questions.length; i++) {
                            if (sa.Questions[i].Index != 1) {
                                var q = sa.Questions[i];
                                //console.log(q);
                                if (q != undefined && q.Contents != undefined) {
                                    for (var ci = 0; ci < q.Contents.length; ci++) {
                                        totalScore += q.Contents[ci].Score;
                                    }
                                }
                            }
                        }
                    }
                    return totalScore;
                }


                scope.GetAreaTitle = function (sa) {
                    var data = {};
                    //console.log(sa.AreaTitle);
                    data.IsCustomPaper = scope.paper.IsCustomPaper;
                    data.AreaTitle = sa.AreaTitle;
                    data.ContentCount = scope.GetContentCount(sa);
                    data.AreaScore = roundMin0Max2Filter(scope.GetAreaScore(sa));
                    data.AvgContentScore = roundMin0Max2Filter(data.AreaScore / data.ContentCount);
                    data.QuestionCount = 0;
                    if (sa.Questions != undefined && sa.Questions != null) {
                        data.QuestionCount = sa.Questions.length;
                    }
                    data.AvgQuestionScore = roundMin0Max2Filter(data.AreaScore / data.QuestionCount)
                    data.AreaTitle = sa.AreaTitle;
                    data.AreaType = sa.AreaType;
                    data.Part1ContentCount = scope.GetPart1ContentCount(sa);
                    data.Part1ContentScore = scope.GetPart1ContentScore(sa);
                    data.Part2ContentScore = scope.GetPart2ContentScore(sa);

                    data.Part1TotalScoreFor26 = scope.GetPart1TotalScoreFor26(sa);
                    data.Part2TotalScoreFor26 = scope.GetPart2TotalScoreFor26(sa);

                    //console.log(data); 
                    return CommonBusinessService.GetAreaTitle(data);
                }

            },
            template: '<div class="row" ng-include="getContentUrl()"></div>'
        }
    }])
});