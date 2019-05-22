﻿define(function () {
    'use strict';
    var html =
        '<!--听对话后填空(北京)-->' +
        '<div class="clearfix" style="border-bottom: solid 1px #e1e1e1;padding: 15px 15px;">' +
        '    <div style="float:left;font-size: 15px;font-weight: bold;color: #000000;   " ng-if="questionData.Prompt!=undefined && questionData.Prompt.length>0">' +
        '        {{questionData.Prompt}}' +
        '    </div>' +
        '    <div class="question-controlbar" ng-if="questionData.Audio.length>0" style="margin-top: 0px;">' +
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
        '    <div ng-repeat="ca in questionData.ContentData">' +
        '        <div style="padding-top:20px;border-bottom: solid 1px #e1e1e1;">' +
        '            <div>' +
        '                <div class="content-idx" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div style="border-bottom: solid 1px #A6A6A6;float:left;min-width: 150px;padding: 0px 20px;height: 28px;line-height:28px;margin-left: 10px;text-align:center;font-size:16px;">' +
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
        '            <div style="" class="score-info">' +
        '                <label style="margin-left:14px;">正确率:</label>&nbsp;&nbsp;' +
        '                <label style="font-size:20px !important;color:#18B109;vertical-align:bottom;">{{ca.ContentAnalysisData.AnswerRightPercent}}%</label>' +
        '                <label class="spliter" ng-if="EnableShowKnowledgePoint"></label>' +
        '                <label ng-if="EnableShowKnowledgePoint" style="margin-left:16px;">考查知识点:</label>&nbsp;&nbsp;' +
        '                <label style="font-size:16px  !important;color:#000000;vertical-align:bottom;">{{ca.KnowledgePoint}}</label>' +
        '                <label class="spliter" style="margin-left:0"></label>'+
        '                <span class="showDetail" ng-click="ViewContentScoreDetail(ca,$event)">查看答题详情</span>'+
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>';
    return html;
});