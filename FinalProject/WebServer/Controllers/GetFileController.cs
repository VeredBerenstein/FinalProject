﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using NHibernate.Linq;
using WebServer.App_Data;
using WebServer.App_Data.Models;
using WebServer.App_Data.Models.Enums;

namespace WebServer.Controllers
{
    public class GetFileController : ApiController
    {
        [HttpGet]
        [ActionName("GetSyllabus")]
        public IList<ResultSyllabus> GetSyllabus([FromUri]string id)
        {
            using (var session = DBHelper.OpenSession())
            {
                var Syllabus = session.QueryOver<UplodedFile>().List();
                IList<ResultSyllabus> result = new List<ResultSyllabus>();

                var course = session.Load<Course>(new Guid(id));

                foreach (var CourseSemester in course.CourseInSemesters)
                {
                    if (CourseSemester.uploadedSyllabus != null)
                    {
                        Guid syllabusId = CourseSemester.uploadedSyllabus.Id;
                        string semester = CourseSemester.uploadedSyllabus.Semster.ToString();
                        int year = CourseSemester.uploadedSyllabus.Year;
                   //     byte[] file = CourseSemester.Syllabus.File;
                        string fileName = CourseSemester.uploadedSyllabus.FileName;
                        result.Add(new ResultSyllabus(syllabusId, semester, year/*,file*/, fileName));
                    }
                    

                }
                return result;
            }
           
        }
        /*Todo : GradesDestribution*/
        /*  [HttpGet]
          [ActionName("GetGradesDestribution")]
          public IList<ResultGrades> GetGradesDestribution([FromUri]string id)
          {

          }
          */

        /*
          [ActionName("GetSpecificGradeDistribution")]
        public byte[] GetSpecificGradeDistribution([FromUri]string id)
        {
         
         }
         */

        [ActionName("GetSpecificSyllabus")]
        public byte[] GetSpecificSyllabus([FromUri]string id)
        {
            using (var session = DBHelper.OpenSession())
            {
                var Syllabus = session.QueryOver<UplodedFile>().List();
                IList<ResultSyllabus> result = new List<ResultSyllabus>();

                var requestedSyllabus = session.Load<UplodedFile>(new Guid(id));

                return requestedSyllabus.File;
            }
        }

        public class ResultSyllabus
        {
            public Guid Id { get; set; }
            public string Semester { get; set; }
            public int Year { get; set; }
          //  public byte[] File { get; set; }
            public string FileName { get; set; }

            public ResultSyllabus(Guid id, string semester, int year/*, byte[] file*/, string fileName)
            {
                Id = id;
                Semester = semester;
                Year = year;
//                File = file;
                FileName = fileName; 
            }
        }
    }
}