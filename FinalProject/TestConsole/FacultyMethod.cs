using WebServer.App_Data.Models.Enums;

namespace TestConsole
{
    public class FacultyMethod
    {
        public static Faculty FacultyFromString(string facultyName)
        {
            if (facultyName.Equals("���� �����"))
            {
                return Faculty.ComputerScience;
            }
            else if (facultyName.Equals("���� �������"))
            {
                return Faculty.BehavioralSciences;
            }
            else if (facultyName.Equals("����� ������ ����"))
            {
                return Faculty.InformationSystems;
            }
            else if (facultyName.Equals("���� ������"))
            {
                return Faculty.Nursing;
            }
            else if (facultyName.Equals("����� ������"))
            {
                return Faculty.ManagementEconomics;
            }
            else if (facultyName.Equals("���� �����"))
            {
                return Faculty.SocietyPolitics;
            }
            else if (facultyName.Equals("���� ������ ������"))
            {
                return Faculty.ConsultingOrganizationalDevelopment;
            }
            else if (facultyName.Equals("���� �����"))
            {
                return Faculty.BusinessAdministration;
            }
            else if (facultyName.Equals("����������"))
            {
                return Faculty.Psychology;
            }
            return Faculty.None;
        }
    }
}