﻿var course;
var allCriterias;
var filteredComments;
var allCourseFacultyTeachers;
var currentUniversity;

$(document).ready(function () {
    setupUniversity();
    setupCourse();
});

function setupUniversity() {
    $('#University').attr('value', getQuertyString()["University"]);
    currentUniversity = getQuertyString()["University"];

    ifNoUniversity(currentUniversity);
    getBackground(currentUniversity);
}

function setupCourse() {
    if (!loadCommentsCriteras()) {
        showLoadingCourseFailed();
        return;
    }
    if (loadCourse()) {
        setupNewComment();
        printCourseInfo();
    } else {
        showLoadingCourseFailed();
        return;
    }
}

function ChangePage() {
    window.location = "../UploadFile/UploadFile.html?University=" + currentUniversity + "&courseId=" + course.Id;
}

function ChangePage2() {
    window.location = "../GetAllFiles/GetAllFiles.html?University=" + currentUniversity + "&courseId=" + course.Id;
}

function setupNewComment() {
    $('#newAvgRating0').rating('refresh', { showClear: false, showCaption: false });
    $('#newAvgRating1').rating('refresh', { showClear: false, showCaption: false });
    $('#newAvgRating2').rating('refresh', { showClear: false, showCaption: false });
    $('#newAvgRating3').rating('refresh', { showClear: false, showCaption: false });
    $('#newAvgRating4').rating('refresh', { showClear: false, showCaption: false });
    $('#newAvgRating5').rating('refresh', { showClear: false, showCaption: false });
}

function printCourseInfo() {
    printCourseProperties();
    printCourseScores();
    allTeachers();
    setupFilters();
    setCourseCommentsWithFilters();
}

function setupFilters() {
    var teachersToFilterBy = [];
    var yearToFilterBy = [];
    for (var courseInSemster in course.CourseInSemesters) {
        if (course.CourseInSemesters[courseInSemster].CourseComments.length > 0) {
            teachersToFilterBy.push(course.CourseInSemesters[courseInSemster].Teacher);
            yearToFilterBy.push(course.CourseInSemesters[courseInSemster].Year);
        }
    };
    teachersToFilterBy = teachersToFilterBy.filter(function (itm, i, a) {
        return i == a.indexOf(itm);
    });
    yearToFilterBy = yearToFilterBy.filter(function (itm, i, a) {
        return i == a.indexOf(itm);
    });
    for (year in yearToFilterBy) {
        $('#filteredByYear').append($('<option>', {
            value: yearToFilterBy[year],
            text: yearToFilterBy[year]
        }));
    }
    var teacher;
    for (teacher in teachersToFilterBy) {
        if (teachersToFilterBy[teacher] == null || teachersToFilterBy[teacher].Name == undefined) {
            continue;
        }
        $('#filterByTeacher').append($('<option>', {
            value: teachersToFilterBy[teacher].Id,
            text: teachersToFilterBy[teacher].Name
        }));
    }
    for (teacher in allCourseFacultyTeachers) {
        $('#allCourseFacultyTeachers').append($('<option>', {
            value: allCourseFacultyTeachers[teacher].TeacherId,
            text: allCourseFacultyTeachers[teacher].TeacherName
        }));
    };
}

function printCourseProperties() {
    var courseNameTD = document.getElementById("courseNameTD");
    courseNameTD.innerHTML = course.Name;
    document.title = "Rate My School- " + course.Name;

    $('#averageRating').rating('update', course.Score);
    $('#averageRating').rating('refresh', { readonly: true, showClear: false, showCaption: false });

    var courseFacultyTD = document.getElementById("courseFacultyTD");
    courseFacultyTD.innerHTML = facultyNameByEnum(course.Faculty);

    var courseObligtoryTD = document.getElementById("courseObligtoryTD");
    courseObligtoryTD.innerHTML = course.IsMandatory ? "כן" : "לא";

    var courseOfDegreeTD = document.getElementById("courseOfDegreeTD");
    courseOfDegreeTD.innerHTML = academicDegreeNameByEnum(course.AcademicDegree);

    var courseYearTD = document.getElementById("courseYearTD");
    courseYearTD.innerHTML = intendedYearNameByEnum(course.IntendedYear);
}

function printCourseScores() {
    for (var criteria in allCriterias) {
        var ratingName = document.getElementById("criteriaTextTD" + criteria);
        ratingName.innerHTML = allCriterias[criteria];
        $('#avgRating' + criteria).rating('update', course.AverageCriteriaRatings.AverageRatingsList[criteria]);
        $('#avgRating' + criteria).rating('refresh', { readonly: true, showClear: false, showCaption: false });
    }
}

function showCourseComments() {
    $('#allComments').empty();
    if (filteredComments == null || filteredComments.length == 0) {
        var noCommentsErrorLabel = document.createElement("h1");
        noCommentsErrorLabel.innerHTML = "אין תגובות להציג";
        noCommentsErrorLabel.className = "NoComments";
        $('#allComments').append(noCommentsErrorLabel);
        return;
    }
    for (var comment in filteredComments) {
        printComment(filteredComments[comment], comment);
    }
}

function printComment(commentData, itr) {
    var comment = commentData.Comment;
    var commentView = document.getElementById("commentTable").cloneNode(true);
    document.getElementById("allComments").appendChild(commentView);
    commentView.style.display = 'block';
    commentView.id = "commentView" + itr;
    var commentTextRow = commentView.rows[0];
    commentTextRow.id = "commentTextRow" + itr;
    var commentTextCell = commentTextRow.cells[1];
    var commentTextLabel = commentTextCell.children[0];
    commentTextLabel.innerHTML = comment.CommentText;
    for (rating in comment.CriteriaRatings) {
        var loadedComment = comment.CriteriaRatings[rating];
        var commentRating = commentView.rows[parseInt(rating) + 1].cells[1].firstElementChild.firstElementChild;
        var ratingIdName = "commentView" + itr + "Rating" + rating;
        commentRating.setAttribute('id', ratingIdName);
        $('#' + ratingIdName).rating({ 'size': 'xs' });
        $('#' + ratingIdName).rating('update', loadedComment.Rating);
        $('#' + ratingIdName).rating('refresh', { readonly: true, showClear: false, showCaption: false });
    }
    var teacherButton = commentView.rows[7].cells[1].children[0];
    teacherButton.innerHTML = commentData.TeacherName;
    teacherButton.href = "../AddTeacherComment/AddTeacherComment.html?University=" + currentUniversity + "&id=" + commentData.TeacherId;
    var commentYear = commentView.rows[8].cells[1];
    commentYear.innerHTML = commentData.Year;
    var commentSemester = commentView.rows[9].cells[1];
    commentSemester.innerHTML = semesterNameByEnum(parseInt(commentData.Semester));
    var likesCell = commentView.rows[10].children[1];
    var numberOfLikes = document.createElement("Label");
    numberOfLikes.id = "CommentNumber" + itr + "Likes";
    numberOfLikes.innerHTML = comment.TotalNumberOfLikes;
    numberOfLikes.className = "LikesLabel";
    var numberOfDislikes = document.createElement("Label");
    numberOfDislikes.id = "CommentNumber" + itr + "Dislikes";
    numberOfDislikes.innerHTML = Math.abs(comment.TotalNumberOfDislikes);
    numberOfDislikes.className = "DislikeLabel";
    var voteUpButton = document.createElement("Button");
    voteUpButton.id = "CommentNumber" + itr + "VoteUp";
    voteUpButton.value = comment.Id;
    var voteUpFunctionString = function () { addVote(numberOfLikes, comment.Id, true); };
    voteUpButton.onclick = voteUpFunctionString;
    voteUpButton.innerHTML = "👍";
    voteUpButton.className = "voteButton";
    var voteDownButton = document.createElement("Button");
    voteDownButton.id = "CommentNumber" + itr + "VoteDown";
    voteDownButton.value = comment.Id;
    voteDownButton.className = "voteButton";
    var voteDownFunctionString = function () { addVote(numberOfDislikes, comment.Id, false); };
    voteDownButton.onclick = voteDownFunctionString;
    voteDownButton.innerHTML = "👎";
    likesCell.appendChild(numberOfLikes);
    likesCell.appendChild(voteUpButton);
    likesCell.appendChild(document.createElement("BR"));
    likesCell.appendChild(numberOfDislikes);
    likesCell.appendChild(voteDownButton);
    var commentDate = commentView.rows[11].children[1];
    commentDate.innerHTML = comment.DateTime.replace("T", " ");
}

function showNewCommentAction() {
    document.getElementById("newCommentTable").style.display = "block";
    document.getElementById("showNewCommentButtonTR").style.display = "none";
}

function showLoadingCourseFailed() {
    alert("קורס לא נמצא, הנך מועבר לעמוד הראשי.");
    parent.location = "../HomePage/HomePage.html";
}

function facultyNameByEnum(faculty) {
    switch (faculty) {
        case 0:
            return "מדעי המחשב";
        case 1:
            return "מדעי ההתנהגות";
        case 2:
            return "מערכות מידע";
        case 3:
            return "אחיות";
        case 4:
            return "כלכלה וניהול";
        case 5:
            return "פוליטיקה וממשל";
        case 6:
            return "פיתוח ארגוני";
        case 7:
            return "מנהל עסקים";
        case 8:
            return "פסיכולוגיה";
        default:
            return "";
    }
}

function academicDegreeNameByEnum(degree) {
    switch (degree) {
        case 0:
            return "תואר ראשון";
        case 1:
            return "תואר שני";
        default:
            return "אין";
    }
}

function intendedYearNameByEnum(year) {
    switch (year) {
        case 0:
            return "הכל";
        case 1:
            return "שנה ראשונה";
        case 2:
            return "שנה שניה";
        case 3:
            return "שנה שלישית";
        case 4:
            return "שנה רביעית";
        default:
            return "אין";
    }
}

function semesterNameByEnum(semester) {
    switch (semester) {
        case 0:
            return "א";
        case 1:
            return "ב";
        case 2:
            return "קיץ";
        default:
            return "";
    }
}

function setCourseCommentsWithFilters() {
    var year = $('#filteredByYear').val();
    year = (year != "") ? year : "-1";
    var commentRequest = {
        CourseId: course.Id,
        Semester: $('#filteredBySemester').val(),
        SortByDate: $("#filteredByNew").is(':checked'),
        SortByLikes: $('#filterByLikes').is(':checked')
    };
     $.ajax({
        type: "POST",
        data: JSON.stringify(commentRequest),
        url: '/api/Courses/GetCommentsForCourse',
        contentType: "application/json",
        success: function (data) {
            filteredComments = data;
            showCourseComments();
        },
        fail: function () {
            filteredComments = null;
            showCourseComments();
        },
        async: false
    });

}

function allTeachers() {
    var succeed = false;
     $.ajax({
        type: "GET",
        url: '/api/Teachers/GetAllTeacherNamesAndIds/' + course.Faculty,
        contentType: "application/json",
        success: function (data) {
            allCourseFacultyTeachers = data;
            succeed = true;
        },
        fail: function () {
            succeed = false;
        },
        async: false
    });
    return succeed;
}

function loadCommentsCriteras() {
    var succeed = false;
    $.ajax({
        type: "GET",
        url: '/api/Courses/GetCriterias',
        contentType: "application/json",
        success: function (data) {
            if (data.length > 0) {
                allCriterias = data;
                succeed = true;
            } else {
                succeed = false;
            }
        },
        fail: function () {
            succeed = false;
        },
        async: false
    });
    return succeed;
}

function loadCourse() {
    var id = getQuertyString()["id"];
    var succeed = false;

    $.ajax({
        type: "GET",
        url: '/api/Courses/GetCourse' + "/" + id,
        contentType: "application/json",
        success: function (data) {
            course = data;
            succeed = true;
        },
        fail: function () {
            succeed = false;
        },
        async: false
    });
    return succeed;
}

function addVote(voteValueLabel, id, like) {
    var vote = {
        commentId: id,
        liked: like
    };
    var didLikeBefore = $.jStorage.get(id);
    if (didLikeBefore == true) {
        alert("מותר לדרג פעם אחת");
        return false;
    }
    $.ajax({
        type: "POST",
        data: JSON.stringify(vote),
        url: '/api/Courses/AddVote',
        contentType: "application/json",
        success: function (data) {
            voteValueLabel.innerHTML = Math.abs(parseInt(data));
            $.jStorage.set(id, true);
        },
        fail: function (jqXhr, textStatus) {
            alert("נכשל: " + textStatus);
        },
        async: false
    });
    return false;
}

function addComment() {
    if (document.getElementById("CourseNewCommetBox").value == "") {
        alert("הכנס תגובה");
        return;
    }
    var parsedYear = parseInt($('#Year').val(), 10);
    var currentYear = (new Date()).getFullYear();
    if (isNaN(parsedYear) || parsedYear < (currentYear - 10) || parsedYear > currentYear) {
        alert("אנא הכנס שנה בתחום העשור האחרון.");
        return;
    }
    var one = $('#newAvgRating0').val();
    var two = $('#newAvgRating1').val();
    var three = $('#newAvgRating2').val();
    var four = $('#newAvgRating3').val();
    var five = $('#newAvgRating4').val();
    var six = $('#newAvgRating5').val();
    var ratings = [one, two, three, four, five, six];
    for (var rate in ratings) {
        if (ratings[rate] == undefined || ratings[rate] == 0) {
            alert("עליך לדרג את כל הקריטריונים");
            return;
        }
    }
    var comment = {
        Id: course.Id,
        teacherId: $('#allCourseFacultyTeachers').val(),
        Ratings: ratings,
        Comment: $('#CourseNewCommetBox').val(),
        semester: $('#courseSemesters').val(),
        Year: parsedYear
    };
     $.ajax({
        type: "POST",
        data: JSON.stringify(comment),
        url: '/api/Courses/AddComment',
        contentType: "application/json",
        success: function () {
            location.reload();
        },
        fail: function (jqXhr, textStatus) {
            alert("Request failed: " + textStatus);
        },
        async: false
    });
}
