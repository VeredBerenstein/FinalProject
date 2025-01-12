﻿using System.Collections.Generic;
using System.Runtime.Serialization;

namespace WebServer.App_Data.Models
{
    [DataContract(IsReference = true)]
    public class TeacherComment : Comment
    {
        [DataMember]
        public IList<TeacherCriteriaRating> CriteriaRatings { get; set; }

        public TeacherComment()
        {
            CriteriaRatings = new List<TeacherCriteriaRating>();
        }

        public int GetCriteriaRatingSummed()
        {
            var sum = 0;
            foreach (var rating in CriteriaRatings)
            {
                sum = rating.Rating;
            }

            return sum;
        }

        public static List<string> GetTeacherCommentCriterias() {
            return new List<string>
            {
                "יחס לסטודנטים",
                "רמת הוראה",
                "ידע בקורסים",
                "כמה המרצה מעניין",
            };
        }
    }
}