define(['angular'], function (angular) {
    'use strict'
    angular.module('app').directive('questionOperation', ['$timeout', '$rootScope', 'CommonBusinessService', function ($timeout, $rootScope, CommonBusinessService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                data: '=data',
                showAnswer: '=showAnswer'
            },
            link: function (scope, element, attrs) {
                var areaType = scope.data.AreaType

                scope.Choose = function () {
                    scope.$emit('Operation_Choose', scope.data);
                }
                scope.Remove = function () {
                    scope.$emit('Operation_Remove', scope.data);
                }
                scope.isShow = false;
                scope.AnswerToggle = function () {
                    scope.isShow = !scope.isShow;

                    if ($rootScope.SearchText != undefined && $rootScope.SearchText != '') { 
                        CommonBusinessService.HighlightSearchTextAsync($rootScope.SearchText);
                    }
                }
                scope.ChooseTask = function (task, changedQuestionID) {
                    scope.data.CurrentSelectedTask = task;

                    //更新影响的QuestionID 下的Content数据
                    if (changedQuestionID != undefined && scope.data.QuestionModel.QuestionID != changedQuestionID) {
                        console.log('未找到数据,QuestionID:', changedQuestionID);
                        return;
                    }
                    if (scope.GetAnswerDisplayType(scope.data.AreaType) == 8) {
                        scope.UpdateQuestionAnswer(scope.data.QuestionModel, ata.CurrentSelectedTask.AnswerData);
                    }
                    else {
                        for (var i = 0; i < scope.data.QuestionModel.Contents.length; i++) {
                            var content = scope.data.QuestionModel.Contents[i];
                            scope.UpdateContentAnswer(content, scope.data.CurrentSelectedTask.AnswerData);
                        }
                    }

                    if ($rootScope.SearchText != undefined && $rootScope.SearchText != '') {
                        CommonBusinessService.HighlightSearchTextAsync($rootScope.SearchText);
                    }

                    console.log("CurrentSelectedTask:");
                    console.log(scope.data.CurrentSelectedTask);

                }
                scope.GetAnswerDisplayType = function (areaType) {
                    //1=单选题目, 2=多选题目 ,3=朗读短文/句子 ,4=直接显示参考答案 ,5=听后记录与转述 ,6=信息转述与询问

                    if (areaType == 1 || areaType == 5 || areaType == 18) {
                        return 1;
                    }

                    if (areaType == 2) {
                        return 2;
                    }
                    if (areaType == 3 || areaType == 4 || areaType == 6 || areaType == 13 || areaType == 17) {
                        return 3;
                    }
                    if (areaType == 25) {
                        return 5;
                    }
                    if (areaType == 26) {
                        return 6;
                    }
                    if (areaType == 27) {
                        return 7;
                    }
                    if (areaType == 16) {
                        return 8;
                    }
                    return 4;
                }

                scope.GetAnswerData = function (answerData, content) {
                    //console.log("GetAnswerData:", content);
                    if (answerData == undefined) { return undefined; }
                    if (scope.GetAnswerDisplayType(scope.data.AreaType) == 8) {
                        return answerData[0];
                    }
                    else {
                        for (var i = 0; i < answerData.length; i++) {
                            if (answerData[i].ContentID == content.ContentID
                                || answerData[i].OriginalContentID == content.ContentID) {
                                //console.log("Find AnswerData:", answerData[i]);
                                return answerData[i];
                            }
                        }
                    }
                }

                scope.GetOptionAnswer = function (answerID, options, newOptionsFromAnswer) {
                    if (options == undefined || options.length == 0) {
                        return '未知';
                    }
                    var optionStr = ["A", "B", "C", "D", "F", "G", ]
                    var optionIndex = -1;
                    for (var i = 0; i < options.length; i++) {
                        if (answerID == options[i].Guid) {
                            optionIndex = i;
                        }
                    }
                    if (optionIndex == -1 && newOptionsFromAnswer != undefined && newOptionsFromAnswer.length > 0) {
                        for (var i = 0; i < newOptionsFromAnswer.length; i++) {
                            if (answerID == newOptionsFromAnswer[i].OptionID) {
                                optionIndex = i;
                            }
                        }
                    }
                    if (optionIndex == -1) {
                        return '未知';
                    }
                    return optionStr[optionIndex];
                }
                scope.GetTextColorByScoreLevel = function (scoreLevel) {
                    //console.log(scoreLevel);
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
                scope.UpdateContentAnswer = function (content, taskAnswerDataList) {
                    if (content == undefined) {
                        return;
                    }

                    //console.log('UpdateContentAnswer')

                    var findAnswerData = scope.GetAnswerData(taskAnswerDataList, content);
                    //选择题
                    if (scope.GetAnswerDisplayType(scope.data.AreaType) == 1 || scope.GetAnswerDisplayType(scope.data.AreaType) == 2) {
                        content.OptionAnswer = scope.GetOptionAnswer(content.Answers[0].Content, content.Options);

                        content.StudentOptionAnswer = "未答题"

                        if (findAnswerData != undefined) {
                            content.StudentOptionAnswer = scope.GetOptionAnswer(findAnswerData.AnswerContent, content.Options, findAnswerData.AnswerOptions);
                        }
                        content.IsRight = (content.OptionAnswer == content.StudentOptionAnswer);
                    }
                    if (scope.GetAnswerDisplayType(scope.data.AreaType) == 3) {
                        content.ReadTextScoreDetailList = [];
                        content.IsRight = false;
                        for (var j = 0; j < content.Answers.length; j++) {
                            content.OptionAnswer += content.Answers[j].Content + " / ";
                        }

                        if (findAnswerData != undefined) {
                            content.ReadTextScoreDetailList = findAnswerData.ReadTextScoreDetailList;
                        }
                    }
                    if (scope.GetAnswerDisplayType(scope.data.AreaType) == 5 || scope.GetAnswerDisplayType(scope.data.AreaType) == 7) {
                        content.OptionAnswer = "";
                        content.IsRight = false;
                        for (var j = 0; j < content.Answers.length; j++) {
                            content.OptionAnswer += content.Answers[j].Content + " / ";
                        }
                        if (content.OptionAnswer.length > 2) {
                            content.OptionAnswer = content.OptionAnswer.substr(0, content.OptionAnswer.length - 2);
                        }
                        content.StudentOptionAnswer = "未答题"

                        if (findAnswerData != undefined) {
                            content.StudentOptionAnswer = findAnswerData.AnswerContent;
                            for (var j = 0; j < content.Answers.length; j++) {
                                if (myTrim(findAnswerData.AnswerContent.toUpperCase()) == myTrim(content.Answers[j].Content.toUpperCase())) {
                                    content.IsRight = true;
                                }
                            }
                        }
                    }
                }
                scope.UpdateQuestionAnswer = function (question, taskAnswerDataList) {
                    if (scope.GetAnswerDisplayType(scope.data.AreaType) == 8) {
                        var content = question.Contents[0];
                        content.ReadTextScoreDetailList = [];
                        content.IsRight = false;
                        var findAnswerData = taskAnswerDataList[0];
                        //选择题
                        if (findAnswerData != undefined) {
                            content.ReadTextScoreDetailList = findAnswerData.ReadTextScoreDetailList;
                        }
                        content.audioText = findAnswerData.Text;
                    }
                }
            },
            templateUrl: '/web/components/directives/mistakeCollection/directive_operation.html'
        }
    }])
});
function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
}
