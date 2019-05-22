﻿define(function () {
    'use strict';
    var html =
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--听对话或独白回答问题-->' +
        '    <div class="question-text" ng-if="questionData.Text!=undefined && questionData.Text.length>0" ng-bind-html="questionData.Text|trustHtml">' +
        '    </div>' +
        '    <div style="margin: 10px 0;" class="question-controlbar" ng-if="questionData.Audio.length>0">' +
        '        <div ng-click="PlayAudio(questionData,questionData.QuestionID,questionData.Audio)">' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID)==false" src="img/report/bofangluyin.png" />' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID)==true" src="img/report/bofangluyin-2.png"' +
        '            />' +
        '            <span>播放录音</span>' +
        '        </div>' +
        '        <div ng-if="questionData.RefText.length>0" ng-click="ShowAudioRefText(questionData.RefText)">' +
        '            <img src="img/report/luyinyuanwen.png" />' +
        '            <span>录音原文</span>' +
        '        </div>' +
        '    </div>' +
        '    <div class="question-controlbar-spliter"></div>' +
        '    <div ng-repeat="ca in questionData.ContentData" ng-style="$last==false ?{\'border-bottom\':\'1px solid #e8e8e8\'}:{\'border-bottom\':\'0px\'}">' +
        '        <div class="div-ca">' +
        '            <div>' +
        '                <div class="content-idx" ng-if="questionData.ContentData.length>1" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div class="content-idx" ng-if="questionData.ContentData.length==1" style="">{{questionData.Idx}}</div>' +
        '                <div class="content-text" style="" ng-bind-html="ca.PaperContent.Text|trustHtml">' +
        '                </div>' +
        '            </div>' +
        '            <div style="clear:both;">' +
        '            </div>' +
        '        </div>' +
        '        <div style="" class="content-reftext">' +
        '            <div>' +
        '                <img src="img/report/cankaodaan.png" />' +
        '                <label>参考答案</label>' +
        '            </div>' +
        '            <ul>' +
        '                <li ng-repeat="refText in ca.PaperContentAnswer">{{refText.Content}}</li>' +
        '            </ul>' +
        '        </div>' +
        '        <div class="content-reftext-spliter">' +
        '        </div>' +
        '        <div style="" class="score-info">' +
        '            <label style="margin-left:20px;">最高分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#18B109;">{{ca.ContentAnalysisData.MaxScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <label style="margin-left:20px;">最低分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#FF0000;">{{ca.ContentAnalysisData.MinScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <label style="margin-left:20px;">平均分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#000000;">{{ca.ContentAnalysisData.AvgScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <span class="showDetail" ng-click="ViewContentScoreDetail(ca,$event)">查看答题详情</span>'+
        '            <div class="sample-answer">' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>';
    return html;
});