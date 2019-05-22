define(function () {
    'use strict';
    var html =
        '<!--信息转述并询问-->' +
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;" ng-if="questionData.Idx%2!=0">' +
        '    <!--Part1信息转述-->' +
        '    <div style="min-height:50px;border-bottom: solid 1px #e1e1e1;padding: 15px 14px;margin: 0px -14px;display: inline-block;">' +
        '        <div style="float:left;font-size: 15px;font-weight: bold;color: #333333; width: 672px;margin-top:7px">' +
        '            {{questionData.Prompt}}' +
        '        </div>' +
        '        <div class="question-controlbar" style="margin-top: 0px;width: 167px;">' +
        '            <div ng-if="questionData.Audio.length>0" ng-click="PlayAudio(questionData,questionData.QuestionID+\'_Part1\',questionData.Audio)"' +
        '                style="float:right;">' +
        '                <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part1\')==false" src="img/report/bofangluyin.png"' +
        '                />' +
        '                <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part1\')==true" src="img/report/bofangluyin-2.png"' +
        '                />' +
        '                <span>播放录音</span>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '    <div style="margin:20px 0px 0px 0px;font-size:15px;color:#333;line-height:20px;" ng-if="questionData.Text != null && questionData.Text.length > 0"' +
        '        ng-bind-html="questionData.Text|trustHtml">' +
        '    </div>' +
        '    <div style="margin-top:15px;font-size:15px;color:#333;" ng-if="questionData.Tips!=undefined && questionData.Tips.length>0">' +
        '        {{questionData.Tips}}' +
        '    </div>' +
        '    <div class="" style="margin-top:10px;">' +
        '        <img ng-src="{{questionData.ResourcePath+questionData.Image}}" style="max-width:550px;max-height:260px;" />' +
        '    </div>' +
        '    <div ng-repeat="ca1 in questionData.ContentData">' +
        '        <div style="margin-top:12px;margin-bottom:12px;font-size:15px;color:#333;font-family:Arial;text-align:justify;line-height:20px;"' +
        '            ng-if="questionData.RefText!=undefined && questionData.RefText.length>0">' +
        '            {{questionData.RefText}}' +
        '        </div>' +
        '        <div style="font-size:15px;color:#333;line-height:20px;" ng-bind-html="ca1.PaperContent.Tips|trustHtml">' +
        '        </div>' +
        '        <div style="" class="content-reftext">' +
        '            <div>' +
        '                <img src="img/report/cankaodaan.png" />' +
        '                <label>参考答案</label>' +
        '            </div>' +
        '            <ul>' +
        '                <li ng-repeat="refText in ca1.PaperContentRefText">{{refText.Content}}</li>' +
        '            </ul>' +
        '        </div>' +
        '        <div class="content-reftext-spliter">' +
        '        </div>' +
        '        <div style="" class="score-info">' +
        '            <label style="margin-left:20px;">最高分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#18B109;">{{ca1.ContentAnalysisData.MaxScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <label style="margin-left:20px;">最低分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#FF0000;">{{ca1.ContentAnalysisData.MinScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <label style="margin-left:20px;">平均分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#333333;">{{ca1.ContentAnalysisData.AvgScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <span class="showDetail" ng-click="ViewContentScoreDetail(ca1,$event)">查看答题详情</span>'+
        '            <div class="sample-answer">' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>' +
        '<!--Part2情景问答-->' +
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;" ng-if="questionData.Idx%2==0">' +
        '    <div class="clearfix" style="border-bottom: solid 1px #e1e1e1;padding: 15px 14px;margin: 0px -14px;">' +
        '        <div style="float:left;font-size: 15px;font-weight: bold;color: #333333;   " ng-if="questionData.Prompt!=undefined && questionData.Prompt.length>0">' +
        '            {{questionData.Prompt}}' +
        '        </div>' +
        '        <div class="question-controlbar" ng-if="questionData.Audio.length>0" style="margin-top: 0px;">' +
        '            <!--<div ng-if="questionData.RefText.length>0" ng-click="ShowAudioRefText(questionData.RefText)" style="float:right;"><img src="img/report/luyinyuanwen.png" /><span>录音原文</span></div>-->' +
        '            <!--<div ng-click="PlayAudio(questionData,questionData.QuestionID+\'_Part2\',questionData.Audio)" style="float:right;"><img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part2\')==false" src="img/report/bofangluyin.png" /><img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part2\')==true" src="img/report/bofangluyin-2.png" /><span>播放录音</span></div>-->' +
        '        </div>' +
        '    </div>' +
        '    <div style="margin:20px 0px 0px 0px;font-size:15px;color:#333;line-height:20px;" ng-if="questionData.Text!=undefined && questionData.Text.length>0"' +
        '        ng-bind-html="questionData.Text|trustHtml">' +
        '    </div>' +
        '    <div ng-repeat="ca in questionData.ContentData" ng-style="$last==false ?{\'border-bottom\':\'1px solid #e8e8e8\'}:{\'border-bottom\':\'0px\'}">' +
        '        <div style="margin-top:20px;">' +
        '            <div>' +
        '                <div class="content-idx" style="">{{ca.PaperContent.Idx}}</div>' +
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
        '        <div style="" class="score-info">' +
        '            <label style="margin-left:20px;">最高分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#18B109;">{{ca.ContentAnalysisData.MaxScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <label style="margin-left:20px;">最低分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#FF0000;">{{ca.ContentAnalysisData.MinScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <label style="margin-left:20px;">平均分:</label>&nbsp;&nbsp;' +
        '            <label style="font-size:20px !important;color:#333333;">{{ca.ContentAnalysisData.AvgScore}}</label>' +
        '            <label class="spliter"></label>' +
        '            <span class="showDetail" ng-click="ViewContentScoreDetail(ca,$event)">查看答题详情</span>'+
        '            <div class="sample-answer">' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>';
    return html;
});