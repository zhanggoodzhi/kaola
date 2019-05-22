﻿define(function () {
    'use strict';
    var html =
        '<!--听后记录并转述信息-->' +
        '<div style="min-height:50px;border-bottom: solid 1px #e1e1e1;padding: 15px 15px;display: inline-block;">' +
        '    <div style="float:left;font-size: 15px;font-weight: bold;color: #000000; width: 672px;   ">' +
        '        {{questionData.Prompt}}' +
        '    </div>' +
        '    <div class="question-controlbar" style="margin-top: 0px;width: 167px;">' +
        '        <div ng-if="questionData.RefText.length>0" ng-click="ShowAudioRefText(questionData.RefText)" style="float:right;">' +
        '            <img src="img/report/luyinyuanwen.png" />' +
        '            <span>录音原文</span>' +
        '        </div>' +
        '        <div ng-click="PlayAudio(questionData,questionData.QuestionID+\'_Part1\',questionData.Audio)" style="float:right;">' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part1\')==false" src="img/report/bofangluyin.png"' +
        '            />' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part1\')==true" src="img/report/bofangluyin-2.png"' +
        '            />' +
        '            <span>播放录音</span>' +
        '        </div>' +
        '    </div>' +
        '</div>' +
        '<div style="clear:both;"></div>' +
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <div class="" style="padding-top:20px;padding-bottom:20px;border-bottom: solid 1px #e1e1e1;">' +
        '        <img ng-src="{{questionData.ResourcePath+questionData.Image}}" style="max-width:550px;max-height:260px;margin-left:14px;"' +
        '        />' +
        '    </div>' +
        '    <div ng-repeat="ca in questionData.StudentContentAnswerData">' +
        '        <div ng-if="!$last" style="padding-top:20px;border-bottom: solid 1px #e1e1e1;">' +
        '            <div>' +
        '                <div class="content-idx" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div class="ellipsis" style="max-width:500px;border-bottom: solid 1px #A6A6A6;float:left;min-width: 150px;padding: 0px 20px;height: 28px;line-height:28px;margin-left: 10px;text-align:center;font-size:16px;"' +
        '                    ng-style="{true:{color: \'#18B109\'},false:{color: \'#ff0000\'}}[ca.StudentAnswerData.FinalScore>0]">' +
        '                    {{ca.StudentAnswerData.StudentAnswerContent}}' +
        '                </div>' +
        '            </div>' +
        '            <div style="clear:both;"></div>' +
        '            <div style="" class="content-reftext">' +
        '                <div>' +
        '                    <img src="img/report/cankaodaan.png" />' +
        '                    <label>参考答案</label>' +
        '                </div>' +
        '                <div style="padding: 10px 0px 15px;font-size: 16px;color:#444444;">{{GetSpecialContentAnswer(ca.PaperContentAnswer)}}</div>' +
        '            </div>' +
        '            <div class="content-reftext-spliter">' +
        '            </div>' +
        '            <student-score-info content-data="ca" question-data="questionData" show-score-comment="false" show-sample-answer="false"' +
        '                show-student-answer="false"></student-score-info>' +
        '        </div>' +
        '    </div>' +
        '    <div ng-repeat="ca2 in questionData.StudentContentAnswerData">' +
        '        <div ng-if="$last">' +
        '            <div style="height:50px;border-top: solid 1px #e1e1e1;border-bottom: solid 1px #e1e1e1;padding: 15px 15px;margin: -1px -15px;">' +
        '                <div style="float:left;font-size: 15px;font-weight: bold;color: #000000;" ng-if="questionData.Tips!=undefined && questionData.Tips.length>0">' +
        '                    {{questionData.Tips}}' +
        '                </div>' +
        '                <div class="question-controlbar" ng-if="questionData.Audio.length>0" style="margin-top: 0px;">' +
        '                    <div ng-if="questionData.RefText.length>0" ng-click="ShowAudioRefText(questionData.RefText)" style="float:right;">' +
        '                        <img src="img/report/luyinyuanwen.png" />' +
        '                        <span>录音原文</span>' +
        '                    </div>' +
        '                    <div ng-click="PlayAudio(questionData,questionData.QuestionID+\'_Part2\',questionData.Audio)" style="float:right;">' +
        '                        <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part2\')==false" src="img/report/bofangluyin.png"' +
        '                        />' +
        '                        <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part2\')==true" src="img/report/bofangluyin-2.png"' +
        '                        />' +
        '                        <span>播放录音</span>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '            <div style="clear:both;"></div>' +
        '            <div style="color:#000000;font-size:15px;margin-top: 20px;" ng-bind-html="ca2.PaperContent.Tips|trustHtml">' +
        '            </div>' +
        '            <div style="" class="content-reftext">' +
        '                <div>' +
        '                    <img src="img/report/cankaodaan.png" />' +
        '                    <label>参考答案</label>' +
        '                </div>' +
        '                <ul>' +
        '                    <li ng-repeat="refText in ca2.PaperContentAnswer">{{refText.Content}}</li>' +
        '                </ul>' +
        '            </div>' +
        '            <div class="content-reftext-spliter">' +
        '            </div>' +
        '            <student-score-info content-data="ca2" question-data="questionData" show-score-comment="false" show-sample-answer="false"' +
        '                show-student-answer="true"></student-score-info>' +
        '        </div>' +
        '    </div>' +
        '</div>';
    return html;
});