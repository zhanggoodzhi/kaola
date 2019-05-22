﻿define(function () {
    'use strict';
    var html =
        '<style>' +
        '    li {' +
        '        position: relative;' +
        '        box-sizing: border-box;' +
        '        -webkit-box-sizing: border-box;' +
        '        padding-left: 24px;' +
        '    }' +
        '    li .titleimg {' +
        '        position: absolute;' +
        '        left: 0;' +
        '        top: 5px;' +
        '    }' +
        '</style>' +
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--听对话答题, 听短文答题-->' +
        '    <div class="question-text" ng-if="questionData.Text!=undefined && questionData.Text.length>0" ng-bind-html="questionData.Text|trustHtml">' +
        '    </div>' +
        '    <div class="question-controlbar" ng-if="questionData.Audio.length>0" style="margin-top: 10px;">' +
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
        '    <div class="question-controlbar-spliter" style="padding-top: 10px;"></div>' +
        '    <div ng-repeat="ca in questionData.StudentContentAnswerData" ng-style="$last==false ?{\'border-bottom\':\'1px solid #e8e8e8\'}:{\'border-bottom\':\'0px\'}">' +
        '        <div class="div-ca">' +
        '            <div>' +
        '                <div class="content-idx" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div class="content-text" style="" ng-bind-html="ca.PaperContent.Text|trustHtml">' +
        '                </div>' +
        '            </div>' +
        '            <div style="clear:both;margin-bottom:10px;">' +
        '                <div id="content-options" class="row content-options" ng-switch="ca.PaperContent.ResourceType">' +
        '                    <!--文本-->' +
        '                    <ul ng-switch-when="1" ng-class="{1:\'horizontal\',2:\'vertical\'}[ca.PaperContent.Layout]">' +
        '                        <li ng-repeat="option in ca.PaperContentOption">' +
        '                            <img class="content-option-icon titleimg" ng-src="{{GetOptionIcon(ca.StudentAnswerData,option)}}" />' +
        '                            <label class="content-option-label">{{option.Idx | optionIndexFilter}}.&nbsp;{{option.Content}}</label>' +
        '                        </li>' +
        '                    </ul>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '        <student-score-info content-data="ca" question-data="questionData" show-score-comment="false" show-sample-answer="false"' +
        '            show-student-answer="false"></student-score-info>' +
        '    </div>' +
        '</div>';
    return html;
});