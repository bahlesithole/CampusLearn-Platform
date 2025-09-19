namespace Backend.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string StudentName { get; set; } = "";
        public string Content { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Answer> Answers { get; set; } = new();
    }

    public class Answer
    {
        public int Id { get; set; }
        public string TutorName { get; set; } = "";
        public string Content { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
