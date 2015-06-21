﻿$(document).ready(function () { ShowResults() });

function ShowResults() {

    var arrayResult = [];
    var isTeacher;

    var query_string = new Object();
    getQuertyString(query_string);
    
    createSearchText(query_string)

    if (query_string["search"] === "All") {
        getAllData(query_string);
    }
    else if (query_string["search"] === "Courses") {
        getCourseData(query_string, arrayResult);
    } else if (query_string["search"] === "Teachers") {
        getTeacherData(query_string);
    }
}

function createSearchText(query_string) {
    var searchText = query_string["SearchText"];
    var res = searchText.split("+");
    var searchTextToReturn = new String();
    for (i in res) {
        searchTextToReturn = searchTextToReturn + res[i];
        
        if (res.length -1 != i) {
            searchTextToReturn = searchTextToReturn + ' ';
        }
    }

    query_string["SearchText"] = searchTextToReturn;
}

function getQuertyString(query_string) {
    var query = window.location.search.substring(1);
    query = decodeURI(query);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], pair[1]];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }
}

//need to fix this func so it will get answer from the comtroller
//right now the json gets 404 not found 
function getTeacherData(query_string) {
    $("#filter")[0].hidden = true;
    var dataToSearch = query_string["SearchText"];
    var uri = '/api/Teachers/GetAllSearchedTeachers/' + dataToSearch;
   
    var request = $.ajax({
        type: "GET",
        url: uri,
        contentType: "application/json; charset=UTF-8",
        success: function (data) {
            if (data.length == 0) {
                $("#NoMatches")[0].hidden = false;
            }
            else {
                showTeachersData(data);
            }
            succeed = true;
        },
        fail: function (data) {
         //   succeed = false;
        },
       // async: false
    });

    //var arrayResult = [];
    /*$.getJSON(uri)
    .done(function (data) {
        if (data.length == 0) {
        }
        else {
            showTeachersData(arrayResult);
        }
    });*/
    
}
/*
function getTeacherData(query_string) {
    var dataToSearch = query_string["SearchText"];
    var uri = '/api/Teachers/GetAllSearchedTeachers';
    var arrayResult = [];
    $.getJSON(uri)
    .done(function (data) {
        for (i in data) {
            if (dataToSearch == data[i].Name || data[i].Name.indexOf(dataToSearch) >= 0 || (data[i].Name.toLowerCase()).indexOf(dataToSearch) >= 0 || (data[i].Name.toLowerCase()).indexOf(dataToSearch.toLowerCase()) >= 0) {
                arrayResult.push(data[i]);
            }
        }
        if (arrayResult.length == 0) {
            $("#NoMatches")[0].hidden = false;
        }

         //      if (arrayResult.length == 1) { 
          //גיל .. תשנה איך שאתה רוצה שיקראו למשתנה GUID
            //   window.location = '/AddTeacherComment/AddTeacherComment.html?search=Teachers&SearchText=' + arrayResult[0].Id;
         //    }
        else {
            showTeachersData(arrayResult);
        }
    });
}
*/

function getCourseData(query_string) {
    $("#filter")[0].hidden = true;
    var dataToSearch = query_string["SearchText"];
    var uri = '/api/Courses/GetAllSearchedCourses';
    var arrayResult = [];
    $.getJSON(uri)
    .done(function (data) {
        for (i in data) {
            if (dataToSearch == data[i].Name || data[i].Name.indexOf(dataToSearch) >= 0 || (data[i].Name.toLowerCase()).indexOf(dataToSearch) >= 0 || (data[i].Name.toLowerCase()).indexOf(dataToSearch.toLowerCase()) >= 0) {
                arrayResult.push(data[i]);
            }
        }
        if (arrayResult.length == 0) {
            $("#NoMatches")[0].hidden = false;
        }
        else {
            showCoursesData(arrayResult);
        }
    });
}

function getAllData(query_string) {
    var coursesArrayResult = [];
    var teachersArrayResult = [];
    var dataToSearch = query_string["SearchText"];
    var uri = '/api/Courses/GetAllSearchedCourses';
    var arrayResult = [];
    $.getJSON(uri)
    .done(function (data) {
        for (i in data) { //search for courses
            if (dataToSearch == data[i].Name || data[i].Name.indexOf(dataToSearch) >= 0 || (data[i].Name.toLowerCase()).indexOf(dataToSearch) >= 0 || (data[i].Name.toLowerCase()).indexOf(dataToSearch.toLowerCase()) >= 0) {
                coursesArrayResult.push(data[i]);
            }
        }

        uri = '/api/Teachers/GetAllSearchedTeachers';
        $.getJSON(uri)
        .done(function (data) {
            for (i in data) { //search for teachers
                if (dataToSearch == data[i].Name || data[i].Name.indexOf(dataToSearch) >= 0 || (data[i].Name.toLowerCase()).indexOf(dataToSearch) >= 0 || (data[i].Name.toLowerCase()).indexOf(dataToSearch.toLowerCase()) >= 0) {
                    teachersArrayResult.push(data[i]);
                }
            }

           if(coursesArrayResult.length > 0 && teachersArrayResult.length > 0){ //we found matches in corses and teachers
               $("#filter")[0].hidden = false;
               filterByParameter(coursesArrayResult, teachersArrayResult);
                showCoursesData(coursesArrayResult);
                showTeachersData(teachersArrayResult);
            }
            else if(coursesArrayResult.length == 0 && teachersArrayResult.length > 0){ // we found several matches in teachers
                $("#filter")[0].hidden = false;
                filterByParameter(coursesArrayResult, teachersArrayResult);
                showTeachersData(teachersArrayResult);                
            }
            else if(coursesArrayResult.length > 0 && teachersArrayResult.length == 0){ // we found several matches in courses
                $("#filter")[0].hidden = false;
                filterByParameter(coursesArrayResult, teachersArrayResult);
                showCoursesData(coursesArrayResult);
            }
            else if(coursesArrayResult.length == 0 && teachersArrayResult.length == 0)
            {// we didnt found any match
                $("#filter")[0].hidden = true;
                $("#NoMatches")[0].hidden = false;
                
            }
        });       
    });
}

function filterByParameter(coursesArrayResult, teachersArrayResult) {

    $("#TeachresFilter").onclick = function () { filterByTeachers(teachersArrayResult); };

    $("#CoursesFilter").onclick = function () { filterByCourses(coursesArrayResult); };

    $("#NoFilter").onclick = function () { showAllWithoutFilter(coursesArrayResult, teachersArrayResult); };

}

function showAllWithoutFilter(coursesArrayResult, teachersArrayResult) {
    //clear all the results
    clearResults();
    showTeachersData(teachersArrayResult);
    showCoursesData(coursesArrayResult);
}

function filterByTeachers(arrayResult) {
    //clear all the results
    clearResults();
    showTeachersData(arrayResult);
}

function filterByCourses(arrayResult) {
    //clear all the results
    clearResults();
    showCoursesData(arrayResult);
}

function clearResults() {
    var myNode = document.getElementById("content");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

function showTeachersData(arrayResult) {
    var uri = '/api/Teachers/GetAllSearchedTeachers';
    var newLine = '<br>';
    $("#resultAdd").attr("href", "/AddTeacher/AddTeacher.html"); 
    $("#resultAdd").text('Cant find the requested teacher? CLICK HERE to add');
    $("#searchTitle")[0].hidden = false;

    for (i in arrayResult) {
                    var teacherData = $('<p />');
                    teacherData.addClass("lecturerData");

                    //adding teacher image
                    var img = new Image();
                    img.id = 'Img';
                    img.src = 'teacherImg.jpg';
                    teacherData.append(img);

                   // new line
                    teacherData.append(newLine);

                    //the teacher name
                    var a = $('<a />');
                    a.attr('href', "/AddTeacherComment/AddTeacherComment.html?id=" + arrayResult[i].Id);

                    a.text(arrayResult[i].Name);
                    teacherData.append(a);

                    //new line
                    teacherData.append(newLine);

                    var Score = document.createTextNode(arrayResult[i].Score);
                    teacherData.append(Score);

                    //new line
                    teacherData.append(newLine);

                    //adding the courses
                    for (l in arrayResult[i].Courses) {
                        if (l == arrayResult[i].Courses.length - 1) {
                            var Course = document.createTextNode('.' + arrayResult[i].Courses[l]);
                        }
                        else {
                            var Course = document.createTextNode(arrayResult[i].Courses[l] + ', ');
                        }
                        teacherData.append(Course);
                    }

        //  $('body').append(teacherData);    
                    $("#content").append(teacherData);
                }
}

function showCoursesData(arrayResult) {
    var uri = '/api/Courses/GetAllSearchedCourses';
    var newLine = '<br>';
    $("#resultAdd").attr("href", "/AddCourse/AddCourse.html");
    $("#resultAdd").text('Cant find the requested course? CLICK HERE to add');
    $("#searchTitle")[0].hidden = false;

    for (i in arrayResult) {
        var courseData = $('<p />');
        courseData.addClass("lecturerData");

        //adding course image
        var img = new Image();
        img.id = 'Img';
        img.src = 'courseImg.jpg';
        courseData.append(img);

        //new line
        courseData.append(newLine);

        //the course name
        var a = $('<a />');
        a.attr('href', "/AddCourseComment/AddCourseComment.html?id=" + arrayResult[i].Id);
        a.text(arrayResult[i].Name);
        courseData.append(a);

        //new line
        courseData.append(newLine);

        var Score = document.createTextNode(arrayResult[i].Score);
        courseData.append(Score);

        //new line
        courseData.append(newLine);

        //adding the faculties
        var Faculty = document.createTextNode(arrayResult[i].Faculty);
        courseData.append(Faculty);

        //new line
        courseData.append(newLine);

        //   $('body').append(courseData);
        $("#content").append(courseData);
    }
}