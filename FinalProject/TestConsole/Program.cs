﻿using System;
using System.Collections.Generic;
using NHibernate;
using WebServer.App_Data;
using WebServer.App_Data.Models;
using WebServer.App_Data.Models.Enums;

namespace TestConsole
{
    internal class Program
    {
        private static void Main(string[] args)
        {
            var sessionFactory = NHibernateConfig.CreateSessionFactory(true);
            ISession session = sessionFactory.OpenSession();


            CreateInitData(session);

            getBestTeachers(session);

            session.Flush();
            session.Close();

            Console.WriteLine("Finished Creating DB!");
            Console.ReadKey();
        }

        private static void CreateInitData(ISession session)
        {
            const Faculty computersFaculty = Faculty.ComputerScience;
            var teacherCritias = new[]
            {
                new TeacherCriteria("יחס לסטודנטים"),
                new TeacherCriteria("רמת הוראה"),
                new TeacherCriteria("ידע בקורס"),
                new TeacherCriteria("דרקונים"),
                new TeacherCriteria("התעניינות מרצה בקורס")
            };

            foreach (var teacherCriteria in teacherCritias)
            {
                session.Save(teacherCriteria);
            }

            var courseCritias = new[]
            {
                new CourseCriteria("Material ease"),
                new CourseCriteria("Time investment for home-work"),
                new CourseCriteria("Number of home-work submissions"),
                new CourseCriteria("Time investment for test learning"),
                new CourseCriteria("Course usability"),
                new CourseCriteria("Course grades average"),
                new CourseCriteria("Does the attendance is mandatory"),
                new CourseCriteria("Does the test has open material/reference Pages")
            };

            foreach (var teacherCriteria1 in courseCritias)
            {
                session.Save(teacherCriteria1);
            }

            var romina = new Teacher
            {
                Name = "רומינה זיגדון",
                Cellphone = "05x-xxxxxxx",
                Email = "xxx@xxx.xxx",
                Room = 232,
            };
            TeacherComment rominaComment = new TeacherComment
            {
                CommentText = "ממש עוזרת ללמוד",
                DateTime = DateTime.Now,
            };
            rominaComment.CriteriaRatings.Add(new TeacherCriteriaRating(teacherCritias[0].DisplayName, 5));
            rominaComment.CriteriaRatings.Add(new TeacherCriteriaRating(teacherCritias[1].DisplayName, 4));
            rominaComment.CriteriaRatings.Add(new TeacherCriteriaRating(teacherCritias[2].DisplayName, 3));
            rominaComment.CriteriaRatings.Add(new TeacherCriteriaRating(teacherCritias[3].DisplayName, 2));
            rominaComment.CriteriaRatings.Add(new TeacherCriteriaRating(teacherCritias[4].DisplayName, 1));
            rominaComment.AddVote(new Vote(true));
            romina.addTeacherCommnet(rominaComment);
            
            var teachers = new[]
            {
                romina,
                new Teacher {Name = "אמיר קירש"},
                new Teacher {Name = "יוסי בצלאל"},
                new Teacher {Name = "צבי מלמד"},
            };

            foreach (var teacher in teachers)
            {
                session.Save(teacher);
            }


            var logic = new Course
            {
                Name = "לוגיקה",
                AcademicDegree = AcademicDegree.Bachelor,
                Faculty = computersFaculty,
                IntendedYear = IntendedYear.First,
                IsMandatory = true,
            };

            var courses = new[]
            {
                logic,
                new Course
                {
                    Name = "אלגוריתמים",
                    AcademicDegree = AcademicDegree.Bachelor,
                    Faculty = computersFaculty,
                    IntendedYear = IntendedYear.Second,
                    IsMandatory = true
                },
                new Course
                {
                    Name = "תורת הגרפים",
                    AcademicDegree = AcademicDegree.Bachelor,
                    Faculty = computersFaculty,
                    IntendedYear = IntendedYear.Any,
                    IsMandatory = false
                },
                new Course
                {
                    Name = "עוד לוגיקה",
                    AcademicDegree = AcademicDegree.Master,
                    Faculty = computersFaculty,
                    IntendedYear = IntendedYear.First,
                    IsMandatory = true
                },
            };

            var courseComment = new CourseComment
            {
                CommentText = "קורס ממש מעניין",
                DateTime = DateTime.Now,
                Votes = {new Vote(true)}
            };

            foreach (var courseCriteria in courseCritias)
            {
                courseComment.CriteriaRatings.Add(new CourseCriteriaRating
                {
                    Criteria = courseCriteria,
                    Rating = 5
                });
            }

            logic.CourseInSemesters.Add(new CourseInSemester
            {
                Semester = Semester.A,
                Teacher = romina,
                Course = logic,
                Year = 2012,
                CourseComments =
                {
                    courseComment
                }
            });

            foreach (var course in courses)
            {
                session.Save(course);
            }
        }

        private static void getBestTeachers(ISession session)
        {
            IList<Teacher> bestTeachers = session.QueryOver<Teacher>().OrderBy(x => x.Score).Asc.Take(10).List();
        }

        private static void getAllTeacherPerCourse(ISession session, Course course)
        {
//TODO
            //    IList<Teacher> allTeachers = session.QueryOver<Teacher>().Where(x => x.Courses.Contains(course)).List();
        }
    }
}