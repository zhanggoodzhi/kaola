﻿define(function () {
    'use strict';
    var html =
        '<div style="background-color:#ffffff;padding-left:14px;padding-right:14px;">' +
        '    <!--看图说话-->' +
        '    <div ng-repeat="ca in questionData.StudentContentAnswerData">' +
        '        <div class="div-ca">' +
        '            <div>' +
        '                <div class="content-idx" ng-if="questionData.StudentContentAnswerData.length>1" style="">{{ca.PaperContent.Idx}}</div>' +
        '                <div class="content-idx" ng-if="questionData.StudentContentAnswerData.length==1" style="">{{questionData.Idx}}</div>' +
        '                <div class="content-text" ng-if="ca.PaperContent.Text!=undefined&& ca.PaperContent.Text.length>0" ng-bind-html="(ca.PaperContent.Text)|trustHtml"></div>' +
        '                <div class="content-image">' +
        '                    <img style="" ng-src="{{questionData.ResourcePath+ca.PaperContent.Image}}" />' +
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