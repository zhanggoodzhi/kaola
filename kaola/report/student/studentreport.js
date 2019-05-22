define(['angular', 'echarts', 'html2canvas', 'ng-table', 'ngToaster', '/web/components/directives/questionDetail/student-report/student-questionDetail.js'], function (angular, echarts, html2canvas) {
    'use strict';

    /*
     * Controllers
     */
    angular.module('app')
        .controller('StudentReportTaskDetailCtrl', ['$scope', '$rootScope', 'AuthService', '$state', 'ReportService', 'NgTableParams', '$stateParams', '$timeout', 'Constants', 'CommonBusinessService', function ($scope, $rootScope, AuthService, $state, ReportService, NgTableParams, $stateParams, $timeout, Constants, CommonBusinessService) {

            $scope.Constants = {
                apiServiceBaseUri: GLOBAL_API_URL,
                authServiceBaseUri: GLOBAL_CENTRAL_URL,
                answerBaseUrl: GLOBAL_ANSWER_URL,
                paperResourceBaseUrl: GLOBAL_PAPER_RESOURCE_URL
            };


            $scope.GetRefText = function () {
                return $rootScope.RefText;
            }

            $scope.PaperAnalysisData = {};
            $scope.StudentTaskData = [];
            $scope.IsCustomPaper = false;
            $scope.ListeningAreaData = [];
            $scope.SpeakingAreaData = [];
            $scope.taskID = $stateParams.taskID;
            $scope.studentNumber = $stateParams.studentNumber;
            $scope.from = $stateParams.from;
            $scope.classID = $stateParams.classID;
            console.log("TaskID:" + $scope.taskID);
            console.log("StudentNumber:" + $scope.studentNumber);
            console.log("From:" + $scope.from);
            console.log("ClassID:" + $scope.classID);

            $scope.LoadStudentTaskData = function (taskID, studentNumber) {
                var queryParam = {
                    TaskID: taskID,
                    StudentNumber: studentNumber
                };
                ReportService.GetReport_TaskListForStudent(queryParam).then(function (result) {
                    $scope.StudentTaskData = result.data.TaskStudentListData[0];
                    $scope.IsCustomPaper = result.data.TaskStudentListData[0].IsCustomPaper;
                    var studentPaperID = $scope.StudentTaskData.PaperID;
                    $scope.GetTaskPaperAnalysisDataForStudent(taskID, studentNumber, studentPaperID);
                });
            }

            $scope.GetTaskPaperAnalysisDataForStudent = function (taskID, studentNumber, paperID) {
                ReportService.GetTaskPaperAnalysisDataForStudent(taskID, studentNumber, paperID).then(function (result) {
                    $scope.PaperAnalysisData = result.data.PaperAnalysisData;
                    console.log("$scope.PaperAnalysisData", $scope.PaperAnalysisData);
                    $scope.LoadStudentAreaData(taskID, studentNumber);
                }, function (error) {})
            }

            $scope.LoadStudentAreaData = function (taskID, studentNumber) {
                var queryParam = {
                    TaskID: taskID,
                    StudentNumber: studentNumber
                };
                ReportService.GetReport_TaskAreaDataForStudent(queryParam).then(function (result) {
                    var lData = result.data.ListeningAreaData;
                    var sData = result.data.SpeakingAreaData;
                    console.log("LoadStudentAreaData", result.data);
                    $scope.AddExtField(lData);
                    $scope.AddExtField(sData);
                    console.log("LoadStudentAreaData AddExtField");
                    $scope.ListeningAreaData = lData;
                    $scope.SpeakingAreaData = sData;
                    console.log(11, sData);
                    // $scope.SpeakingAreaData[0].ContentData.push($scope.SpeakingAreaData[0].ContentData[1]);
                    // $scope.SpeakingAreaData[0].QuestionData[0].StudentContentAnswerData.push($scope.SpeakingAreaData[0].QuestionData[0].StudentContentAnswerData[1]);
                    $scope.HandleDisplayRowForListeningAreaData($scope.ListeningAreaData);
                    $scope.HandleDisplayRowForSpeakingAreaData($scope.SpeakingAreaData);
                    console.log("LoadStudentAreaData HandleDisplayRowForSpeakingAreaData ");
                    console.log("ListeningAreaData", $scope.ListeningAreaData);
                    console.log("SpeakingAreaData", $scope.SpeakingAreaData);
                    console.log($scope.SpeakingAreaData);
                });
            }


            $scope.ShowTaskDetailReportForStudent = function (taskID, studentNumber) {
                $scope.LoadStudentTaskData(taskID, studentNumber);
            }


            //展开/收缩
            $scope.collapseToggle = function (d) {
                if (d.CollapseState != undefined) {
                    d.CollapseState = d.CollapseState == 0 ? 1 : 0;
                }
            }
            $scope.AddExtField = function (data) {
                if (data == undefined || data.length == 0) {
                    return;
                }
                for (var i = 0; i < data.length; i++) {
                    if (data[i].CollapseState == undefined) {
                        data[i].CollapseState = 0;
                    }
                }
                //console.log(data);
            }





            if (angular.isString($scope.taskID) && $scope.taskID.length > 0 &&
                angular.isString($scope.studentNumber) && $scope.studentNumber.length > 0) {
                $scope.ShowTaskDetailReportForStudent($scope.taskID, $scope.studentNumber);

            }

            //miscellaneous methods
            $scope.GetPart1ContentCount = function (sa) {
                if (sa.ContentData != undefined) {
                    return sa.ContentData.length - 1;
                }
                return 0;
            }
            $scope.GetPart1ContentCountByQuestionIDFor25 = function (sa, questionID) {
                var count = 0;
                if (sa.ContentData != undefined) {
                    for (var i = 0; i < sa.ContentData.length; i++) {
                        var d = sa.ContentData[i];
                        if (d.QuestionID == questionID) {
                            count++;
                        }
                    }
                }
                count = count - 1;
                return count;
            }
            $scope.GetPart1ContentScore = function (sa) {
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    var contentData = sa.QuestionData[0].StudentContentAnswerData;
                    if (contentData != undefined && contentData.length > 0) {
                        return contentData[0].PaperContent.Score;
                    }
                }
            }
            $scope.GetPart1ContentScoreByQuestionID = function (sa, questionID) {
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        var d = sa.QuestionData[i];
                        if (d.QuestionID == questionID) {
                            var contentData = d.StudentContentAnswerData;
                            if (contentData != undefined && contentData.length > 0) {
                                return contentData[0].PaperContent.Score;
                            }
                        }
                    }
                }
            }
            $scope.GetPart2ContentScore = function (sa) {
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    var contentData = sa.QuestionData[0].StudentContentAnswerData;
                    if (contentData != undefined && contentData.length > 0) {
                        return contentData[contentData.length - 1].PaperContent.Score;
                    }
                }
            }
            $scope.GetPart2ContentScoreByQuestionIDFor25 = function (sa, questionID) {
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].QuestionID == questionID) {
                            var contentData = sa.QuestionData[i].StudentContentAnswerData;
                            if (contentData != undefined && contentData.length > 0) {
                                return contentData[contentData.length - 1].PaperContent.Score;
                            }
                        }
                    }
                }
            }
            $scope.GetPart1StudentScoreFor25 = function (sa) {
                var totalScore = 0;
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    var contentData = sa.QuestionData[0].StudentContentAnswerData;
                    if (contentData != undefined && contentData.length > 0) {
                        for (var i = 0; i < contentData.length - 1; i++) {
                            var studentAnswerData = contentData[i].StudentAnswerData;
                            if (studentAnswerData != undefined) {
                                totalScore += studentAnswerData.FinalScore;
                            }
                        }
                    }
                }
                return totalScore;
            }
            $scope.GetPart1StudentScoreByQuestionIDFor25 = function (sa, questionID) {
                var totalScore = 0;
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    for (var qIndex = 0; qIndex < sa.QuestionData.length; qIndex++) {
                        if (sa.QuestionData[qIndex].QuestionID == questionID) {
                            var contentData = sa.QuestionData[qIndex].StudentContentAnswerData;
                            if (contentData != undefined && contentData.length > 0) {
                                for (var i = 0; i < contentData.length - 1; i++) {
                                    var studentAnswerData = contentData[i].StudentAnswerData;
                                    if (studentAnswerData != undefined) {
                                        totalScore += studentAnswerData.FinalScore;
                                    }
                                }
                            }
                        }
                    }

                }
                return totalScore;
            }
            $scope.GetPart2StudentScoreFor25 = function (sa) {
                var totalScore = 0;
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    var contentData = sa.QuestionData[0].StudentContentAnswerData;
                    if (contentData != undefined && contentData.length > 0) {
                        var studentAnswerData = contentData[contentData.length - 1].StudentAnswerData;
                        if (studentAnswerData != undefined) {
                            totalScore += studentAnswerData.FinalScore;
                        }
                    }
                }
                return totalScore;
            }
            $scope.GetPart2StudentScoreByQuestionIDFor25 = function (sa, questionID) {
                var totalScore = 0;
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].QuestionID == questionID) {
                            var contentData = sa.QuestionData[i].StudentContentAnswerData;
                            if (contentData != undefined && contentData.length > 0) {
                                var studentAnswerData = contentData[contentData.length - 1].StudentAnswerData;
                                if (studentAnswerData != undefined) {
                                    totalScore += studentAnswerData.FinalScore;
                                }
                            }
                        }
                    }
                }
                return totalScore;
            }

            $scope.GetPart1TotalScoreFor26 = function (sa) {
                if (sa.AreaType != 26) {
                    return 0;
                }
                var totalScore = 0;
                if (sa.QuestionData != undefined) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].Idx == 1) {
                            var q = sa.QuestionData[i];
                            if (q != undefined && q.StudentContentAnswerData != undefined) {
                                for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                                    totalScore += q.StudentContentAnswerData[ci].PaperContent.Score;
                                }
                            }
                        }
                    }
                }
                return totalScore;
            }
            $scope.GetPart1TotalScoreByQuestionIDFor26 = function (sa, questionID) {
                if (sa.AreaType != 26) {
                    return 0;
                }
                var totalScore = 0;
                if (sa.QuestionData != undefined) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].QuestionID == questionID) {
                            var q = sa.QuestionData[i];
                            if (q != undefined && q.StudentContentAnswerData != undefined) {
                                for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                                    totalScore += q.StudentContentAnswerData[ci].PaperContent.Score;
                                }
                            }

                        }
                    }
                    return totalScore;
                }
            }

            $scope.GetPart2TotalScoreFor26 = function (sa) {
                if (sa.AreaType != 26) {
                    return 0;
                }
                var totalScore = 0;
                if (sa.QuestionData != undefined) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].Idx != 1) {
                            var q = sa.QuestionData[i];
                            if (q != undefined && q.StudentContentAnswerData != undefined) {
                                for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                                    totalScore += q.StudentContentAnswerData[ci].PaperContent.Score;
                                }
                            }
                        }
                    }
                }
                return totalScore;
            }
            $scope.GetPart2TotalScoreByQuestionIDFor26 = function (sa, part1QuestionID) {
                if (sa.AreaType != 26) {
                    return 0;
                }
                var part2QuestionID = $scope.FindPart2QuestionIDByPart1QuestionID(sa, part1QuestionID);
                var totalScore = 0;
                if (sa.QuestionData != undefined) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].QuestionID == part2QuestionID) {
                            var q = sa.QuestionData[i];
                            if (q != undefined && q.StudentContentAnswerData != undefined) {
                                for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                                    totalScore += q.StudentContentAnswerData[ci].PaperContent.Score;
                                }
                            }
                        }
                    }
                }
                return totalScore;
            }


            $scope.GetPart1StudentScoreFor26 = function (sa) {
                var totalScore = 0;
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {

                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].Idx == 1) {
                            var q = sa.QuestionData[i];
                            if (q != undefined && q.StudentContentAnswerData != undefined) {
                                for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                                    totalScore += q.StudentContentAnswerData[ci].StudentAnswerData.FinalScore;
                                }
                            }
                        }
                    }
                }
                return totalScore;

            }

            $scope.GetPart1StudentScoreByQuestionIDFor26 = function (sa, questionID) {
                var totalScore = 0;
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {

                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].QuestionID == questionID) {
                            var q = sa.QuestionData[i];
                            if (q != undefined && q.StudentContentAnswerData != undefined) {
                                for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                                    totalScore += q.StudentContentAnswerData[ci].StudentAnswerData.FinalScore;
                                }
                            }
                        }
                    }
                }
                return totalScore;

            }

            $scope.GetPart2StudentScoreFor26 = function (sa) {
                var totalScore = 0;
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].Idx != 1) {
                            var q = sa.QuestionData[i];
                            if (q != undefined && q.StudentContentAnswerData != undefined) {
                                for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                                    totalScore += q.StudentContentAnswerData[ci].StudentAnswerData.FinalScore;
                                }
                            }
                        }
                    }
                }
                return totalScore;
            }

            $scope.GetPart2StudentScoreByQuestionIDFor26 = function (sa, part1QuestionID) {
                var part2QuestionID = $scope.FindPart2QuestionIDByPart1QuestionID(sa, part1QuestionID);

                var totalScore = 0;
                if (sa.QuestionData != undefined && sa.QuestionData.length > 0) {
                    for (var i = 0; i < sa.QuestionData.length; i++) {
                        if (sa.QuestionData[i].QuestionID == part2QuestionID) {
                            var q = sa.QuestionData[i];
                            if (q != undefined && q.StudentContentAnswerData != undefined) {
                                for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                                    totalScore += q.StudentContentAnswerData[ci].StudentAnswerData.FinalScore;
                                }
                            }
                        }
                    }
                }
                return totalScore;
            }

            $scope.FindPart2QuestionIDByPart1QuestionID = function (area, part1QuestionID) {
                for (var i = 0; i < area.QuestionData.length; i++) {
                    var d = area.QuestionData[i];
                    if (d.QuestionID == part1QuestionID) {
                        return area.QuestionData[i + 1].QuestionID;
                    }
                }
                return undefined;
            }
            $scope.GetPart2ContentCountByQuestionIDFor26 = function (area, part1QuestionID) {
                var findPart2QuestionID = $scope.FindPart2QuestionIDByPart1QuestionID(area, part1QuestionID);

                var contentCount = 0;
                if (findPart2QuestionID != undefined) {
                    for (var i = 0; i < area.ContentData.length; i++) {
                        if (area.ContentData[i].QuestionID == findPart2QuestionID) {
                            contentCount++;
                        }
                    }
                }

                console.log('GetPart2ContentCountByQuestionIDFor26,Part1QuestionID:' + part1QuestionID + ",Part2QuestionID:" + findPart2QuestionID + ",ContentCount:" + contentCount);

                return contentCount;
            }

            $scope.GetQuestionScore = function (q) {
                var totalScore = 0;
                if (q != undefined && q.StudentContentAnswerData != undefined) {
                    for (var ci = 0; ci < q.StudentContentAnswerData.length; ci++) {
                        totalScore += q.StudentContentAnswerData[ci].StudentAnswerData.FinalScore;
                    }
                }
                return totalScore;
            }

            $scope.ColumnCountPerRow = 5;

            $scope.GetContentDataCssStyle = function (area, partFlag, questionID) {
                var height = 81;
                var lineHeight = 79;

                var areaType = area.AreaType;

                if (areaType != 16 && areaType != 25 && areaType != 26) {
                    if (area.ContentData != undefined) {
                        var len = area.ContentData.length;

                        var lineCount = Math.ceil(len / $scope.ColumnCountPerRow);

                        height = height * lineCount;
                        lineHeight = lineHeight * lineCount;
                    }
                }
                if (areaType == 16) {
                    if (area.QuestionData != undefined) {
                        var len = area.QuestionData.length;

                        var lineCount = Math.ceil(len / $scope.ColumnCountPerRow);

                        height = height * lineCount;
                        lineHeight = lineHeight * lineCount;
                    }
                }
                if (areaType == 25) {
                    if (partFlag != undefined && partFlag == 'Part1' && area.ContentData != undefined) {

                        var len = $scope.GetPart1ContentCountByQuestionIDFor25(area, questionID);

                        var lineCount = Math.ceil(len / $scope.ColumnCountPerRow);

                        height = height * lineCount;
                        lineHeight = lineHeight * lineCount;
                    }
                }
                if (areaType == 26) {
                    if (partFlag != undefined && partFlag == 'Part2' && area.ContentData != undefined) {

                        //for (var i = 0; i < area.ContentData.length; i++) {
                        //    if (area.ContentData[i].QuestionIndex != 1) {
                        //        len++;
                        //    }
                        //}
                        var len = $scope.GetPart2ContentCountByQuestionIDFor26(area, questionID);
                        //console.log(len);
                        var lineCount = Math.ceil(len / $scope.ColumnCountPerRow);

                        height = height * lineCount;
                        lineHeight = lineHeight * lineCount;
                    }
                }


                var cssStyle = {
                    'height': height + 'px',
                    'line-height': lineHeight + 'px'
                };
                console.log('cssStyle:', cssStyle);
                //同步刷新左侧标题的高度
                setTimeout(function () {
                    const el = angular.element('.left-title-wrap');
                    const height = el.parent().height() - 1;
                    el.height(height);
                    el.css('lineHeight', height + 'px');
                }, 0);
                return cssStyle;
            }

            $scope.HandleDisplayRowForListeningAreaData = function (areaList) {
                if (areaList != undefined) {
                    for (var i = 0; i < areaList.length; i++) {
                        var aData = areaList[i];
                        var contentData = aData.ContentData;
                        aData.DisplayRows = [];
                        if (contentData != undefined && contentData.length > 0) {

                            var currentRow = {
                                Columns: []
                            };
                            for (var j = 0; j < contentData.length; j++) {

                                if (j % $scope.ColumnCountPerRow == 0) {
                                    aData.DisplayRows.push({
                                        Columns: []
                                    });
                                    currentRow = aData.DisplayRows[aData.DisplayRows.length - 1];
                                }

                                var contentItem = contentData[j];
                                var newColumn = {
                                    Index: contentItem.ContentIndex,
                                    IsRight: contentItem.IsRight,
                                    Score: contentItem.Score
                                }
                                currentRow.Columns.push(newColumn);
                            }
                        }
                        console.log(aData);
                    }
                }
            }
            $scope.HandleDisplayRowForSpeakingAreaData = function (areaList) {
                if (areaList != undefined) {
                    for (var areaIndex = 0; areaIndex < areaList.length; areaIndex++) {
                        var aData = areaList[areaIndex];
                        var areaType = aData.AreaType;

                        if (areaType != 16 && areaType != 25 && areaType != 26) {
                            var contentData = aData.ContentData;
                            aData.DisplayRows = [];
                            if (contentData != undefined && contentData.length > 0) {

                                var currentRow = {
                                    Columns: []
                                };
                                for (var cIndex = 0; cIndex < contentData.length; cIndex++) {

                                    if (cIndex % $scope.ColumnCountPerRow == 0) {
                                        aData.DisplayRows.push({
                                            Columns: []
                                        });
                                        currentRow = aData.DisplayRows[aData.DisplayRows.length - 1];
                                    }

                                    var contentItem = contentData[cIndex];
                                    var newColumn = {
                                        Index: contentItem.ContentIndex,
                                        Score: contentItem.FinalScore
                                    }
                                    currentRow.Columns.push(newColumn);
                                }
                            }
                        }
                        if (areaType == 16) {
                            var QuestionData = aData.QuestionData;
                            aData.DisplayRows = [];
                            if (QuestionData != undefined && QuestionData.length > 0) {

                                var currentRow = {
                                    Columns: []
                                };
                                for (var qIndex = 0; qIndex < QuestionData.length; qIndex++) {

                                    if (qIndex % $scope.ColumnCountPerRow == 0) {
                                        aData.DisplayRows.push({
                                            Columns: []
                                        });
                                        currentRow = aData.DisplayRows[aData.DisplayRows.length - 1];
                                    }

                                    var contentItem = QuestionData[qIndex];
                                    var newColumn = {
                                        Index: contentItem.Idx,
                                        Score: contentItem.Score
                                    }
                                    currentRow.Columns.push(newColumn);
                                }
                            }
                        }
                        if (areaType == 25) {
                            var QuestionData = aData.QuestionData;


                            if (QuestionData != undefined && QuestionData.length > 0) {
                                for (var qIndex = 0; qIndex < QuestionData.length; qIndex++) {

                                    var q = QuestionData[qIndex];
                                    //part1
                                    q.Part1 = {
                                        DisplayRows: []
                                    };
                                    var part1Data = q.StudentContentAnswerData;

                                    var currentRow = {
                                        Columns: []
                                    };
                                    for (var p1Index = 0; p1Index < part1Data.length - 1; p1Index++) {

                                        if (p1Index % $scope.ColumnCountPerRow == 0) {
                                            q.Part1.DisplayRows.push({
                                                Columns: []
                                            });
                                            currentRow = q.Part1.DisplayRows[q.Part1.DisplayRows.length - 1];
                                        }

                                        var contentItem = part1Data[p1Index];
                                        var newColumn = {
                                            Index: p1Index + 1,
                                            Score: contentItem.StudentAnswerData.FinalScore
                                        }
                                        currentRow.Columns.push(newColumn);
                                    }

                                    //part2
                                    q.Part2 = {
                                        DisplayRows: []
                                    };
                                    var part2Data = q.StudentContentAnswerData;
                                    var contentItem = part2Data[part2Data.length - 1];
                                    var newColumn = {
                                        Index: 1,
                                        Score: contentItem.StudentAnswerData.FinalScore
                                    }
                                    q.Part2.DisplayRows.push({
                                        Columns: [newColumn]
                                    });
                                }
                            }

                        }
                        if (areaType == 26) {
                            var QuestionData = aData.QuestionData;

                            if (QuestionData != undefined && QuestionData.length > 0) {

                                //part1
                                aData.Part1 = {
                                    DisplayRows: []
                                };
                                var part1Data = QuestionData[0];

                                var score = $scope.GetQuestionScore(part1Data);
                                var newColumn = {
                                    Index: 1,
                                    Score: score
                                }
                                aData.Part1.DisplayRows.push({
                                    Columns: [newColumn]
                                });


                                //part2
                                aData.Part2 = {
                                    DisplayRows: []
                                };
                                var currentRow = {
                                    Columns: []
                                };
                                for (var p2QIndex = 0; p2QIndex < QuestionData.length; p2QIndex++) {
                                    if (QuestionData[p2QIndex].Idx == 1) {
                                        continue;
                                    }
                                    var part2Data = QuestionData[p2QIndex].StudentContentAnswerData;

                                    for (var p2Index = 0; p2Index < part2Data.length; p2Index++) {

                                        if (p2Index % $scope.ColumnCountPerRow == 0) {
                                            aData.Part2.DisplayRows.push({
                                                Columns: []
                                            });
                                            currentRow = aData.Part2.DisplayRows[aData.Part2.DisplayRows.length - 1];
                                        }

                                        var contentItem = part2Data[p2Index];
                                        var newColumn = {
                                            Index: p2Index + 1,
                                            Score: contentItem.StudentAnswerData.FinalScore
                                        }
                                        currentRow.Columns.push(newColumn);
                                    }
                                }


                            }
                        }
                    }
                }
            }

            $scope.GetAreaTitle = function (sa) {
                var data = {};
                data.IsCustomPaper = $scope.IsCustomPaper;
                data.AreaTitle = sa.AreaTitle;
                data.ContentCount = sa.ContentData.length;
                data.AreaScore = roundMin0Max2Filter(sa.PaperAreaScore);
                data.AvgContentScore = roundMin0Max2Filter(data.AreaScore / data.ContentCount);
                data.QuestionCount = sa.QuestionData.length;
                data.AvgQuestionScore = roundMin0Max2Filter(data.AreaScore / data.QuestionCount)
                data.AreaTitle = sa.AreaTitle;
                data.AreaType = sa.AreaType;
                data.Part1ContentCount = $scope.GetPart1ContentCount(sa);
                data.Part1ContentScore = $scope.GetPart1ContentScore(sa);
                data.Part2ContentScore = $scope.GetPart2ContentScore(sa);

                data.Part1TotalScoreFor26 = $scope.GetPart1TotalScoreFor26(sa);
                data.Part2TotalScoreFor26 = $scope.GetPart2TotalScoreFor26(sa);

                //console.log(data);
                return CommonBusinessService.GetAreaTitle(data);
            }
        }])
        /*
         * Services
         */
        .service('ReportService', function ($http, Constants) {

            var self = this;
             

            self.GetTaskPaperAnalysisDataForTeacher = function (taskID, classID, paperID) {
                return $http.post(GLOBAL_API_URL + 'api/report/report_TaskPaperAnalysisDataForTeacher', {
                    TaskID: taskID,
                    ClassID: classID,
                    PaperID: paperID
                });
            }

            self.GetTaskPaperAnalysisDataForStudent = function (taskID, studentId, paperID) {
                return $http.post(GLOBAL_API_URL + 'api/report/report_TaskPaperAnalysisDataForStudent', {
                    TaskID: taskID,
                    StudentID: studentId,
                    PaperID: paperID
                });
            }


            self.GetReport_TaskListForStudent = function (queryParams) {
                return $http.post(GLOBAL_API_URL + 'api/report/report_TaskListForStudentReport', queryParams);
            }

            self.GetReport_TaskListForTeacher = function (queryParams) {
                return $http.post(GLOBAL_API_URL + 'api/report/report_TaskListForTeacher', queryParams);
            }
            self.GetReport_TaskStudentForTeacher = function (queryParams) {
                return $http.post(GLOBAL_API_URL + 'api/report/report_TaskStudentForTeacher', queryParams);
            }
            self.GetReport_TaskSummaryForTeacher = function (queryParams) {
                return $http.post(GLOBAL_API_URL + 'api/report/report_TaskSummaryForTeacher', queryParams);
            }
            self.GetReport_TaskAreaDataForStudent = function (queryParams) {
                return $http.post(GLOBAL_API_URL + 'api/report/report_TaskAreaDataForStudent', queryParams);
            }

        })

});