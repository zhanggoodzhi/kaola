﻿define(function () {
    'use strict';
    var html =
        '<!--信息转述-->' +
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--<div class="content-idx" ng-if="questionData.StudentContentAnswerData.length==1" style="margin-top: 8px;">{{questionData.Idx}}</div>-->' +
        '    <div class="question-controlbar" ng-if="questionData.Audio.length>0" style="margin-top:10px;margin-bottom: 0px;padding-right: 10px;">' +
        '        <div ng-if="questionData.RefText.length>0" ng-click="ShowAudioRefText(questionData.RefText)" style="float:right;">' +
        '            <img src="img/report/luyinyuanwen.png" />' +
        '            <span>录音原文</span>' +
        '        </div>' +
        '        <div ng-click="PlayAudio(questionData,questionData.QuestionID,questionData.Audio)" style="float:right;">' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID)==false" src="img/report/bofangluyin.png"' +
        '            />' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID)==true" src="img/report/bofangluyin-2.png"' +
        '            />' +
        '            <span>播放录音</span>' +
        '        </div>' +
        '    </div>' +
        '    <div class="question-prompt" style="margin-bottom: 16px;font-size:15px;line-height:20px;" ng-if="questionData.Prompt!=undefined && questionData.Prompt.length>0">' +
        '        {{questionData.Prompt}}' +
        '    </div>' +
        '    <div style="clear:both;"></div>' +
        '    <div class="question-text" ng-if="questionData.Text!=undefined && questionData.Text.length>0" ng-bind-html="questionData.Text|trustHtml">' +
        '    </div>' +
        '    <div style="clear:both;"></div>' +
        '    <div class="question-image" style="">' +
        '        <img ng-src="{{questionData.ResourcePath+questionData.Image}}" style="width:700px;height:auto;margin-left:14px;" />' +
        '    </div>' +
        '    <div style="clear:both;"></div>' +
        '    <div class="question-tips" ng-if="questionData.Tips!=undefined && questionData.Tips.length>0" style="margin-top: 20px; font-size:16px;">' +
        '        {{questionData.Tips}}' +
        '    </div>' +
        '    <div style="clear:both;"></div>' +
        '    <div ng-repeat="ca in questionData.StudentContentAnswerData">' +
        '        <div class="div-ca">' +
        '            <div>' +
        '                <div class="content-text" style="" ng-bind-html="ca.PaperContent.Text|trustHtml">' +
        '                </div>' +
        '                <div class="content-text" style="" ng-bind-html="ca.PaperContent.Tips|trustHtml">' +
        '                </div>' +
        '            </div>' +
        '            <div style="clear:both;"></div>' +
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
        '        <student-score-info content-data="ca" question-data="questionData" show-score-comment="false" show-sample-answer="false"' +
        '            show-student-answer="true"></student-score-info>' +
        '    </div>' +
        '</div>';
    return html;
});