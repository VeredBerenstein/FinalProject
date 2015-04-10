﻿
var uri = '/api/Courses/GetCourses';
var uri2 = '/api/Universities/GetUniversities';
var uri3 = '/api/Teachers/GetTeachers';

var allCourses;
$.getJSON(uri).done(function (data) {
    allCourses = data;

    console.log(allCourses);
    $("#CourseName").autocomplete({
        source: allCourses
    });
});

var allUniversites;
$.getJSON(uri2).done(function (data) {
    allUniversites = data;

    console.log(allUniversites);
    $("#UniversityName").autocomplete({
        source: allUniversites
    });
});

var allTeachers;
$.getJSON(uri3).done(function (data) {
    allTeachers = data;
    console.log(allTeachers);
});

function checkAndAdd() {
    if ((allUniversites.indexOf($("#UniversityName").val()) >= 0) && allTeachers.indexOf($("#TeacherName").val()) < 0) {
        addTeacher($("#TeacherName").val() ,$("#UniversityName").val());
        $("#addTeacherSuccessfuly").hidden = false;
    } else {
        $("#TeacherExists").hidden = false;
        $("#TeachersLink").hidden = false;
        $("#TeachersLink").href = "#";
    }
};

function checkUniveristy() {
    if (allUniversites.indexOf($("#UniversityName").val()) >= 0)
        inputSuccesss("#universityWrap", "#UniversityInput", "input2Status", "#universityError");
    else
        inputError("#universityWrap", "#UniversityInput", "input2Status", "#universityError");
};

function inputSuccesss(divId, inputId, inputStatusId, labelId) {
    $(divId).removeClass("has-error").addClass("has-success");
    $(inputId).removeClass("glyphicon-remove").addClass("glyphicon-ok");
    $(inputStatusId).input = "(success)";
    $(labelId)[0].hidden = true;
};

function inputError(divId, inputId, inputStatusId, labelId) {
    $(divId).removeClass("has-success").addClass("has-error");
    $(inputId).removeClass("glyphicon-ok").addClass("glyphicon-remove");
    $(inputStatusId).input = "(error)";
    $(labelId)[0].hidden = false;
};

function addTeacher(teacherName, universityName) {
    var uri4 = '/api/Teachers/AddTeacher';

    $(function () {
        var teacher = {
            Name: teacherName,
            UniversityName: universityName
        };

        $.ajax({
            type: "POST",
            data: JSON.stringify(teacher),
            url: uri4,
            contentType: "application/json"
        });
    });
}