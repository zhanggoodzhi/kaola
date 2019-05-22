define(function () {
    'use strict';
    var html =
        '<div style="" class="score-info">' +
        '    <label style="margin-left:14px;font-size: 14px !important;">得分:</label>&nbsp;&nbsp;' +
        '    <label style="font-size:20px !important;color:#18B109;" ng-style="{true:{color: \'#18B109\'},false:{color: \'#ff0000\'}}[ca.StudentAnswerData.FinalScore>0]"' +
        '        ng-if="ca.StudentAnswerData.StudentAnswerContent.length>0">{{ca.StudentAnswerData.FinalScore | roundMin0Max2Filter}}</label>' +
        '    <label style="font-size:16px !important;color:#ff0000;" ng-if="ca.StudentAnswerData.StudentAnswerContent==undefined||ca.StudentAnswerData.StudentAnswerContent.length==0">未答题</label>' +
        '    <label class="spliter" ng-if="EnableShowScoreComment && ca.PaperAnalysisData.ScoreComment.length>0"></label>' +
        '    <label ng-if="EnableShowScoreComment && ca.PaperAnalysisData.ScoreComment.length>0" style="margin-left:20px;">整体评价:</label>&nbsp;&nbsp;' +
        '    <label ng-if="EnableShowScoreComment && ca.PaperAnalysisData.ScoreComment.length>0" style="font-size:14px  !important;font-weight:bold;color:#000000;max-width:410px;">{{ca.PaperAnalysisData.ScoreComment}}</label>' +
        '    <div class="sample-answer" ng-if="ShowSampleAnswer">' +
        '        <div class="sample-answer-controlbar" ng-if="ca.PaperContent.Audio.length>0">' +
        '            <div ng-click="PlayAudio(ca,ca.PaperContent.ContentID,ca.PaperContent.Audio,\'paper\')">' +
        '                <img ng-if="IsAudioPlaying(ca.PaperContent.ContentID)==false" src="img/report/示范朗读.png"' +
        '                />' +
        '                <img ng-if="IsAudioPlaying(ca.PaperContent.ContentID)==true" src="img/report/暂停播放.png"' +
        '                />' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '    <div class="student-answer" ng-if="ShowQuestionAudio">' +
        '        <div ng-click="PlayAudio(questionData,questionData.QuestionID+\'_Part1\',questionData.Audio,\'paper\')" style="float:right;">' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part1\')==false" src="img/report/播放录音.png"' +
        '            />' +
        '            <img ng-if="IsAudioPlaying(questionData.QuestionID+\'_Part1\')==true" src="img/report/暂停播放.png"' +
        '            />' +
        '        </div>' +
        '    </div>' +
        '    <div class="student-answer" ng-if="ShowStudentAnswer && ca.StudentAnswerData.StudentAnswerContent.length>' +
        '        0" ng-click="PlayAudio(ca,ca.StudentAnswerData.AnswerID,ca.StudentAnswerData.StudentAnswerContent,\'answer\')">' +
        '        <img ng-if="IsAudioPlaying(ca.StudentAnswerData.AnswerID)==false" src="img/report/考生答案_Play.png"' +
        '        />' +
        '        <img ng-if="IsAudioPlaying(ca.StudentAnswerData.AnswerID)==true" src="img/report/考生答案_Stop.png"' +
        '        />' +
        '    </div>' +
        '</div>';
    return html;
});