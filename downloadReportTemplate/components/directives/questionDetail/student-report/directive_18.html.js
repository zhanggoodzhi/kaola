define(function () {
    'use strict';
    var html =
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--跟读与模仿16-->' +
        '    <div class="div-ca">' +
        '        <div>' +
        '            <div class="content-idx" style="">{{questionData.Idx}}</div>' +
        '            <div class="content-text" style="">' +
        '                <a ng-repeat="t in questionData.QuestionAnalysisData.ReadTextScoreDetail" ng-class="GetTextColorByScoreLevel(t.ScoreLevel)">' +
        '                    {{t.CharText}}' +
        '                </a>' +
        '            </div>' +
        '        </div>' +
        '        <div style="clear:both;"></div>' +
        '        <div style="" class="score-comment-legend">' +
        '            <div class="score-comment-legend-green"></div>' +
        '            <label>优</label>' +
        '            <div class="score-comment-legend-yellow"></div>' +
        '            <label>良</label>' +
        '            <div class="score-comment-legend-blue"></div>' +
        '            <label>中</label>' +
        '            <div class="score-comment-legend-red"></div>' +
        '            <label>差</label>' +
        '        </div>' +
        '        <div style="clear:both;"></div>' +
        '    </div>' +
        '    <div style="" class="score-info">' +
        '        <label style="margin-left:20px;font-size: 14px !important;">得分:</label>&nbsp;&nbsp;' +
        '        <label style="font-size:20px !important;color:#18B109;" ng-if="questionData.QuestionAnalysisData.HasAnswer">{{questionData.Score|fixedScoreFilter:1}}</label>' +
        '        <label style="font-size:16px !important;color:#ff0000;" ng-if="questionData.QuestionAnalysisData.HasAnswer==false">未答题</label>' +
        '        <label class="spliter" ng-if="EnableShowScoreComment && questionData.QuestionAnalysisData.ScoreComment.length>0"></label>' +
        '        <label ng-if="EnableShowScoreComment && questionData.QuestionAnalysisData.ScoreComment.length>0" style="margin-left:20px;">整体评价:</label>&nbsp;&nbsp;' +
        '        <label ng-if="EnableShowScoreComment && questionData.QuestionAnalysisData.ScoreComment.length>0"' +
        '            style="font-size:14px  !important;font-weight:bold;color:#000000;max-width:400px;">{{questionData.QuestionAnalysisData.ScoreComment}}</label>' +
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
        '        <div class="student-answer" ng-if="questionData.QuestionAnalysisData.HasAnswer" ng-click="PlaySpecialStudentAudioForAreaType16()">' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_16_PlayAnswer\')==false" src="img/report/考生答案_Play.png"' +
        '            />' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_16_PlayAnswer\')==true" src="img/report/考生答案_Stop.png"' +
        '            />' +
        '        </div>' +
        '    </div>' +
        '</div>';
    return html;
});