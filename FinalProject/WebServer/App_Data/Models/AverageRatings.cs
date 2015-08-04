﻿using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace WebServer.App_Data.Models
{
    [DataContract(IsReference = true)]  
    public class AverageRatings : IPersistent
    {
        [DataMember]
        public Guid Id { get; set; }
        [DataMember]
        public IList<int> AverageRatingsList { get; set; }
        [DataMember]
        private IList<int> SumOfRatingsList;
        [DataMember]
        private int Counter;

        public AverageRatings() { }

        public AverageRatings(int numberOfRatings) {
            AverageRatingsList = new List<int>();
            SumOfRatingsList = new List<int>();
            for (int i = 0; i < numberOfRatings; i++) {
                AverageRatingsList.Add(0);
                SumOfRatingsList.Add(0);
            }
        }

        public void AddRatings(List<int> ratings) {
            Counter++;
            for (int i = 0; i < ratings.Count; i++) {
                SumOfRatingsList[i] += ratings[i];
                AverageRatingsList[i] = SumOfRatingsList[i] / Counter;
            }
        }
    }
}