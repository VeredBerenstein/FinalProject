﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using NHibernate.Linq;
using WebServer.App_Data;
using WebServer.App_Data.Models;
using WebServer.App_Data.Models.Enums;

namespace WebServer.Controllers
{
    public class CoursesController : ApiController
    {
        [HttpGet]
        [ActionName("GetAllSearchedCourses")]
        public IList<ResultCourse> GetAllSearchedCourses([FromUri]string id)
        {
            using (var session = DBHelper.OpenSession())
            {
                var courses = session.QueryOver<Course>().List();
                IList<ResultCourse> result = new List<ResultCourse>();

                foreach (var course in courses)
                {
                    if (id == course.Name ||
                        (course.Name).IndexOf(id, StringComparison.Ordinal) >= 0 ||
                        ((course.Name).ToLower()).IndexOf(id, StringComparison.Ordinal) >= 0 ||
                        ((course.Name).ToLower()).IndexOf(id.ToLower(), StringComparison.Ordinal) >= 0)
                    {
                        var year = course.IntendedYear.ToString();
                        var returnYear = "";
                        switch (year)
                        {
                            case "Any":
                                returnYear = "כל שנה";
                                break;
                            case "First":
                                returnYear = "שנה ראשונה";
                                break;
                            case "Second":
                                returnYear = "שנה שניה";
                                break;
                            case "Third":
                                returnYear = "שנה שלישית";
                                break;
                            case "Forth":
                                returnYear = "שנה רביעית";
                                break;
                        }


                        result.Add(new ResultCourse(course.Id, course.Name, course.Faculty.ToString(), course.Score, course.IsMandatory, returnYear));
                    }
                }
                return result;
            }
        }

        public class ResultCourse
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public string Faculty { get; set; }
            public int Score { get; set; }
            public bool IsMandatory { get; set; }
            public string Year { get; set; }

            public ResultCourse(Guid id, string name, string faculty, int score, bool isMandatory, string year)
            {
                Id = id;
                Name = name;
                Faculty = faculty;
                Score = score;
                IsMandatory = isMandatory;
                Year = year;
            }
        }

        public IHttpActionResult GetCourse([FromUri] string id)
        {
            using (var session = DBHelper.OpenSession())
            {
                Guid courseGuid;

                if (!Guid.TryParse(id, out courseGuid))
                {
                    return NotFound();
                }

                var course = session.Get<Course>(courseGuid);

                if (course != null)
                {
                    return Ok(course);
                }

                return NotFound();
            }
        }

        [HttpGet]
        [ActionName("GetCoursesNames")]
        public IList<string> GetAllCoursesNames([FromUri] string id)
        {
            using (var session = DBHelper.OpenSession())
            {
                return session.Query<Course>().Where(x => x.University.Acronyms == id).Select(x => x.Name).ToList();
            }
        }

        [HttpPost]
        [ActionName("AddCourse")]
        public IHttpActionResult AddCourse([FromBody] CreateCourseCommand createCommand)
        {
            using (var session = DBHelper.OpenSession())
            using (var transaction = session.BeginTransaction())
            {
                var query = session.Query<Course>().Where(x => x.Name == createCommand.Name).ToList();
                if (query.Count != 0)
                {
                    const HttpStatusCode myStatusCode = (HttpStatusCode)222;
                    return Content(myStatusCode, query.Select(x => x.Id).FirstOrDefault());
                }
                var course = new Course
                {
                    University = session.Query<University>().SingleOrDefault(x => x.Name == createCommand.University),
                    Name = createCommand.Name,
                    Faculty = createCommand.Faculty,
                    IsMandatory = createCommand.IsMandatory,
                    AcademicDegree = createCommand.AcademicDegree,
                    IntendedYear = createCommand.IntendedYear,
                };

                course.AddCourseInSemester(new CourseInSemester
                {
                    Course = course,
                    Teacher = session.Query<Teacher>().SingleOrDefault(x => x.Name == createCommand.TeacherName),
                });
                session.Save(course);
                transaction.Commit();

                return Ok(course.Id);
            }
        }

        [HttpGet]
        [ActionName("GetCriterias")]
        public IList<string> GetAllCriterias()
        {
            using (DBHelper.OpenSession())
            {
                return CourseComment.GetCourseCommentCriterias();
            }
        }

        [HttpPost]
        [ActionName("AddComment")]
        public IHttpActionResult AddComment([FromBody] CreateCourseComment comment)
        {
            using (var session = DBHelper.OpenSession())
            using (var transaction = session.BeginTransaction())
            {
                Guid courseGuid, teacherGuid;
                var succedParsingCourseId = Guid.TryParse(comment.Id, out courseGuid);
                if (!succedParsingCourseId)
                {
                    return NotFound();
                }
                var courseToAddComment = session.Load<Course>(courseGuid);
                var succedParsingTeacherId = Guid.TryParse(comment.teacherId, out teacherGuid);
                if (!succedParsingTeacherId)
                {
                    return NotFound();
                }
                var courseTeacher = session.Load<Teacher>(teacherGuid);
                var courseInSemester = session.QueryOver<CourseInSemester>()
                    .Where(x => x.Course == courseToAddComment &&
                    x.Semester == comment.Semester &&
                    x.Year == comment.Year)
                    .SingleOrDefault();
                if (courseInSemester == null)
                {
                    courseInSemester = new CourseInSemester
                    {
                        Course = courseToAddComment,
                        Teacher = courseTeacher,
                        Semester = comment.Semester,
                        Year = comment.Year,
                    };
                    courseToAddComment.CourseInSemesters.Add(courseInSemester);
                }
                var courseCriterias = CourseComment.GetCourseCommentCriterias();
                var ratings = new List<CourseCriteriaRating>();
                var newComment = new CourseComment
                {
                    CommentText = comment.Comment,
                    CriteriaRatings = ratings,
                    DateTime = DateTime.Now,
                };
                for (var index = 0; index < courseCriterias.Count; index++)
                {
                    newComment.CriteriaRatings.Add(new CourseCriteriaRating(courseCriterias[index], comment.Ratings[index]));
                }
                session.Save(newComment);
                courseToAddComment.AddCourseCommnet(courseInSemester, newComment);
                session.Save(courseInSemester);
                session.Save(courseToAddComment);
                transaction.Commit();
                return Ok(newComment);
            }
        }

        [HttpGet]
        [ActionName("GetCommentById")]
        public IHttpActionResult GetCommentById([FromUri] string commentId)
        {
            using (var session = DBHelper.OpenSession())
            {
                Guid courseCommentGuid;
                var didSuccedParsingCourseCommentGuid = Guid.TryParse(commentId, out courseCommentGuid);
                var comment = didSuccedParsingCourseCommentGuid ? session.Load<CourseComment>(courseCommentGuid) : null;
                if (comment == null)
                {
                    return NotFound();
                }
                return Ok(comment);
            }
        }

        [HttpGet]
        [ActionName("GetAllSemesters")]
        public IHttpActionResult GetAllSemesters()
        {
            using (var session = DBHelper.OpenSession())
            {
                var comment = session.QueryOver<CourseInSemester>().List();
                if (comment == null)
                {
                    return NotFound();
                }
                return Ok(comment);
            }
        }

        [HttpPost]
        [ActionName("AddVote")]
        public IHttpActionResult Vote([FromBody] VoteCommand vote)
        {
            using (var session = DBHelper.OpenSession())
            using (var transaction = session.BeginTransaction())
            {
                Guid commentId;
                if (!Guid.TryParse(vote.commentId, out commentId))
                {
                    return NotFound();
                }
                var comment = session.Get<CourseComment>(commentId);
                if (comment == null) return NotFound();
                var v = new Vote(vote.Liked);
                session.Save(v);
                comment.AddVote(v);
                session.Save(comment);
                transaction.Commit();
                return Ok(vote.Liked ? comment.TotalNumberOfLikes : comment.TotalNumberOfDislikes);
            }
        }

        [HttpPost]
        [ActionName("GetCommentsForCourse")]
        public IHttpActionResult GetCommentsForCourse([FromBody] CourseCommentRequest commentRequest)
        {
            using (var session = DBHelper.OpenSession())
            using (session.BeginTransaction())
            {
                var courseComments = new List<CourseComment>();
                IList<CommentData> commentData = new List<CommentData>();
                Guid courseId, teacherId;
                if (!Guid.TryParse(commentRequest.CourseId, out courseId))
                {
                    return NotFound();
                }
                var course = session.Get<Course>(courseId);
                if (course == null)
                {
                    return NotFound();
                }
                Guid.TryParse(commentRequest.TeacherId, out teacherId);
                var teacher = session.Get<Teacher>(teacherId);
                foreach (var courseInSemester in from courseInSemester in course.CourseInSemesters where (teacher == null) || (courseInSemester.Teacher == teacher) where (commentRequest.Year == CourseCommentRequest.kNoInfoProvided) || (courseInSemester.Year == commentRequest.Year) where (commentRequest.Semester == CourseCommentRequest.kNoInfoProvided) || (courseInSemester.Semester == (Semester)commentRequest.Semester) select courseInSemester)
                {
                    courseComments.AddRange(courseInSemester.CourseComments);
                }
                if (commentRequest.SortByDate)
                {
                    foreach (CourseComment courseComment in (courseComments.OrderByDescending(x => x.DateTime)))
                    {
                        var commentedCourse = getCourseByComment(courseComment);
                        if (commentedCourse == null) {
                            return NotFound();
                        }
                    
                        commentData.Add(new CommentData
                        {
                            Comment = courseComment,
                            TeacherId = commentedCourse.Teacher.Id.ToString(),
                            TeacherName = commentedCourse.Teacher.Name,
                            Year = commentedCourse.Year,
                            Semester = commentedCourse.Semester,
                        });
                    }
                }
                else if (commentRequest.SortByLikes)
                {
                    foreach (CourseComment courseComment in (courseComments.OrderByDescending(x => x.TotalNumberOfLikes)))
                    {
                        var commentedCourse = getCourseByComment(courseComment);
                        if (commentedCourse == null)
                        {
                            return NotFound();
                        }
                        commentData.Add(new CommentData
                        {
                            Comment = courseComment,
                            TeacherId = commentedCourse.Teacher.Id.ToString(),
                            TeacherName = commentedCourse.Teacher.Name,
                            Year = commentedCourse.Year,
                            Semester = commentedCourse.Semester,
                        });
                    }
                }
                return Ok(commentData);
            }
        }

        private CourseInSemester getCourseByComment(CourseComment comment)
        {
            using (var session = DBHelper.OpenSession())
            {
                return session
                    .Query<CourseInSemester>()
                    .SingleOrDefault(c => c.CourseComments.Contains(comment));
            }
        }
    }

        

    public class CreateCourseCommand
    {
        public string University { get; set; }
        public string Name { get; set; }
        public string TeacherName { get; set; }
        public Faculty Faculty { get; set; }
        public bool IsMandatory { get; set; }
        public AcademicDegree AcademicDegree { get; set; }
        public IntendedYear IntendedYear { get; set; }
    }

    public class CreateCourseComment
    {
        public string Id { get; set; }
        public string teacherId { get; set; }
        public List<int> Ratings { get; set; }
        public string Comment { get; set; }
        public Semester Semester { get; set; }
        public int Year { get; set; }
    }

    public class CourseCommentRequest
    {
        public string CourseId { get; set; }
        public string TeacherId { get; set; }
        public int Year { get; set; }
        public int Semester { get; set; }
        public int Page { get; set; }
        public bool SortByDate { get; set; }
        public bool SortByLikes { get; set; }

        public const int kNoInfoProvided = -1;
        public const int kNoOfCommentsPerPage = 5;
    }

    public class CommentData
    {
        public CourseComment Comment { get; set; }
        public string TeacherId { get; set; }
        public string TeacherName { get; set; }
        public int Year { get; set; }
        public Semester Semester { get; set;}
    }
}