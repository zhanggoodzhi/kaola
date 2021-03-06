﻿define(function () {
    'use strict';
    var html =
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--短文复述-->' +
        '    <div ng-repeat="ca in questionData.ContentData">' +
        '        <div class="div-ca">' +
        '            <div>' +
        '                <div class="content-idx" ng-if="questionData.ContentData.length>1" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div class="content-idx" ng-if="questionData.ContentData.length==1" style="">{{questionData.Idx}}</div>' +
        '                <div class="content-text" style="" ng-bind-html="ca.PaperContent.Text |trustHtml">' +
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
        '        </div>' +
        '    </div>' +
        '</div>';
    return html;
});