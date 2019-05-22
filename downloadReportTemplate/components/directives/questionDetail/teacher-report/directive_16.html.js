define(function () {
    'use strict';
    var html =
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--跟读与模仿16-->' +
        '    <div class="div-ca">' +
        '        <div>' +
        '            <div class="content-idx" style="">{{questionData.Idx}}</div>' +
        '            <div class="content-text" style="" ng-bind-html="questionData.Text|trustHtml">' +
        '            </div>' +
        '        </div>' +
        '        <div style="clear:both;"></div>' +
        '    </div>' +
        '    <div style="" class="score-info">' +
        '        <label style="margin-left:20px;">最高分:</label>&nbsp;&nbsp;' +
        '        <label style="font-size:20px !important;color:#18B109;">{{questionData.QuestionAnalysisData.MaxScore}}</label>' +
        '        <label class="spliter"></label>' +
        '        <label style="margin-left:20px;">最低分:</label>&nbsp;&nbsp;' +
        '        <label style="font-size:20px !important;color:#FF0000;">{{questionData.QuestionAnalysisData.MinScore}}</label>' +
        '        <label class="spliter"></label>' +
        '        <label style="margin-left:20px;">平均分:</label>&nbsp;&nbsp;' +
        '        <label style="font-size:20px !important;color:#000000;">{{questionData.QuestionAnalysisData.AvgScore}}</label>' +
        '        <label class="spliter"></label>' +
        '        <span class="showDetail" ng-click="ViewContentScoreDetail({PaperContent:{ContentID:questionData.QuestionID}},$event)">查看答题详情</span>'+
        '        <div class="sample-answer">' +
        '            <div class="sample-answer-controlbar" ng-if="questionData.Audio.length>0">' +
        '                <div ng-click="PlayAudio(questionData,questionData.QuestionID,questionData.Audio)">' +
        '                    <img ng-if="IsAudioPlaying(questionData.QuestionID)==false" src="img/report/示范朗读.png"' +
        '                    />' +
        '                    <img ng-if="IsAudioPlaying(questionData.QuestionID)==true" src="img/report/暂停播放.png"' +
        '                    />' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>';
    return html;
});