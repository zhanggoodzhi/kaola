define(function () {
    'use strict';
    var html =
        '<!--情景问答-->' +
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <div>' +
        '        <div style="float:left;font-size:15px;color:#444;max-width:600px;margin:16px 0px" ng-if="questionData.Text!=undefined && questionData.Text.length>0"' +
        '            ng-bind-html="questionData.Text|trustHtml">' +
        '        </div>' +
        '        <div class="question-image" ng-if="questionData.Image != null && questionData.Image != \'\'">' +
        '            <img ng-src="{{ questionData.ResourcePath + \'/\' + questionData.Image}}" style="max-width:560px;max-height:320px;float:left;margin:16px 0px 16px 0px;"' +
        '            />' +
        '        </div>' +
        '        <div class="question-controlbar" ng-if="questionData.Audio.length>0">' +
        '            <div ng-if="questionData.RefText.length>0" ng-click="ShowAudioRefText(questionData.RefText)" style="float:right;">' +
        '                <img src="img/report/luyinyuanwen.png" />' +
        '                <span>录音原文</span>' +
        '            </div>' +
        '            <div ng-click="PlayAudio(questionData,questionData.QuestionID+\'_Part1\',questionData.Audio)" style="float:right;">' +
        '                <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part1\')==false" src="img/report/bofangluyin.png"' +
        '                />' +
        '                <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part1\')==true" src="img/report/bofangluyin-2.png"' +
        '                />' +
        '                <span>播放录音</span>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '    <div class="question-controlbar-spliter"></div>' +
        '    <div ng-repeat="ca in questionData.StudentContentAnswerData" ng-style="$last==false ?{\'border-bottom\':\'1px solid #e8e8e8\'}:{\'border-bottom\':\'0px\'}">' +
        '        <div class="div-ca">' +
        '            <div>' +
        '                <div class="content-idx" ng-if="questionData.StudentContentAnswerData.length>1" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div class="content-idx" ng-if="questionData.StudentContentAnswerData.length==1" style="">{{questionData.Idx}}</div>' +
        '                <div class="content-text" style="" ng-if="ca.PaperContent.Text.length>0" ng-bind-html="ca.PaperContent.Text|trustHtml">' +
        '                </div>' +
        '                <div class="content-text" style="" ng-if="ca.PaperContent.Text.length==0&&  ca.PaperContent.RefText.length>0  " ng-bind-html="ca.PaperContent.RefText|trustHtml">' +
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
        '        <student-score-info content-data="ca" question-data="questionData" show-score-comment="false" show-sample-answer="false"' +
        '            show-student-answer="true"></student-score-info>' +
        '    </div>' +
        '</div>';
    return html;
});