﻿define(function () {
    'use strict';
    var html =
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--朗读短文3,句子仿读6,句子朗读13,模仿朗读17-->' +
        '    <div ng-repeat="ca in questionData.StudentContentAnswerData">' +
        '        <div class="div-ca">' +
        '            <div>' +
        '                <div class="content-idx" ng-if="questionData.StudentContentAnswerData.length>1" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div class="content-idx" ng-if="questionData.StudentContentAnswerData.length==1" style="">{{questionData.Idx}}</div>' +
        '                <div class="content-text" style="">' +
        '                    <a ng-repeat="t in ca.PaperAnalysisData.ReadTextScoreDetail" ng-class="GetTextColorByScoreLevel(t.ScoreLevel)">' +
        '                        {{t.CharText}}' +
        '                    </a>' +
        '                </div>' +
        '            </div>' +
        '            <div style="clear:both;"></div>' +
        '            <div style="" class="score-comment-legend">' +
        '                <div class="score-comment-legend-green"></div>' +
        '                <label>优</label>' +
        '                <div class="score-comment-legend-yellow"></div>' +
        '                <label>良</label>' +
        '                <div class="score-comment-legend-blue"></div>' +
        '                <label>中</label>' +
        '                <div class="score-comment-legend-red"></div>' +
        '                <label>差</label>' +
        '            </div>' +
        '            <div style="clear:both;"></div>' +
        '        </div>' +
        '        <student-score-info content-data="ca" question-data="questionData" show-score-comment="true" show-sample-answer="true" show-student-answer="true"></student-score-info>' +
        '    </div>' +
        '</div>';
    return html;
});