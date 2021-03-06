﻿define(function () {
    'use strict';
    var html =
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--听力选图-->' +
        '    <div ng-repeat="ca in questionData.StudentContentAnswerData">' +
        '        <div class="div-ca">' +
        '            <div>' +
        '                <div class="content-idx" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div class="content-text" style="" ng-bind-html="ca.PaperContent.Text|trustHtml">' +
        '                </div>' +
        '                <div class="content-controlbar" ng-if="ca.PaperContent.Audio.length>0">' +
        '                    <div ng-click="PlayAudio(ca,ca.PaperContent.ContentID,ca.PaperContent.Audio)">' +
        '                        <img ng-if="IsAudioPlaying(ca.PaperContent.ContentID)==false" src="img/report/bofangluyin.png"' +
        '                        />' +
        '                        <img ng-if="IsAudioPlaying(ca.PaperContent.ContentID)==true" src="img/report/bofangluyin-2.png"' +
        '                        />' +
        '                        <span>播放录音</span>' +
        '                    </div>' +
        '                    <div ng-if="ca.PaperContent.RefText.length>0" ng-click="ShowAudioRefText(ca.PaperContent.RefText)">' +
        '                        <img src="img/report/luyinyuanwen.png" />' +
        '                        <span>录音原文</span>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '            <div style="clear:both;margin-bottom:10px;">' +
        '                <div id="content-options" class="row content-options" ng-switch="ca.PaperContent.ResourceType">' +
        '                    <!--文本-->' +
        '                    <ul ng-switch-when="1" ng-class="{1:\'horizontal\',2:\'vertical\'}[ca.PaperContent.Layout]">' +
        '                        <li ng-repeat="option in ca.PaperContentOption">' +
        '                            <img class="content-option-icon" ng-src="{{GetOptionIcon(ca.StudentAnswerData,option)}}" />' +
        '                            <label class="content-option-label">{{option.Idx | optionIndexFilter}}.&nbsp;{{option.Content}}</label>' +
        '                        </li>' +
        '                    </ul>' +
        '                    <!--图片-->' +
        '                    <ul ng-switch-when="2" ng-class="{1:\'horizontal\',2:\'vertical\'}[ca.PaperContent.Layout]">' +
        '                        <li ng-repeat="option in ca.PaperContentOption">' +
        '                            <img class="content-option-icon" ng-src="{{GetOptionIcon(ca.StudentAnswerData,option)}}" />' +
        '                            <label class="content-option-label">{{option.Idx | optionIndexFilter}}.&nbsp;</label>' +
        '                            <img class="img-thumbnail content-option-img" ng-src="{{ questionData.ResourcePath + \'/\' + option.Content }}" />' +
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