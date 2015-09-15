using System;
using WebServer.App_Data.Models.Enums;

namespace TestConsole
{
    public class FacultyMethod
    {
        public static Faculty FacultyFromString(string facultyName)
        {
            if (string.Equals(facultyName, "���� �����", StringComparison.CurrentCulture))
            {
                return Faculty.ComputerScience;
            }
            if (string.Equals(facultyName, "���� �������", StringComparison.CurrentCulture))
            {
                return Faculty.BehavioralSciences;
            }
            if (string.Equals(facultyName, "����� ������ ����", StringComparison.CurrentCulture))
            {
                return Faculty.InformationSystems;
            }
            if (string.Equals(facultyName, "���� ������", StringComparison.CurrentCulture))
            {
                return Faculty.Nursing;
            }
            if (string.Equals(facultyName, "����� ������", StringComparison.CurrentCulture))
            {
                return Faculty.ManagementEconomics;
            }
            if (string.Equals(facultyName, "���� �����", StringComparison.CurrentCulture))
            {
                return Faculty.SocietyPolitics;
            }
            if (string.Equals(facultyName, "���� ������ ������", StringComparison.CurrentCulture))
            {
                return Faculty.ConsultingOrganizationalDevelopment;
            }
            if (string.Equals(facultyName, "���� �����", StringComparison.CurrentCulture))
            {
                return Faculty.BusinessAdministration;
            }
            if (string.Equals(facultyName, "����������", StringComparison.CurrentCulture))
            {
                return Faculty.Psychology;
            }
            return Faculty.None;
        }
    }
}