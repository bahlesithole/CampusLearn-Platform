using Microsoft.AspNetCore.Mvc;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QAController : ControllerBase
    {
        private static List<Question> questions = new();

        // POST: api/qa/ask
        [HttpPost("ask")]
        public IActionResult AskQuestion([FromBody] Question q)
        {
            q.Id = questions.Count + 1;
            questions.Add(q);

            // TODO: Notify tutors (via Twilio/Firebase)
            return Ok(q);
        }

        // POST: api/qa/{id}/answer
        [HttpPost("{id}/answer")]
        public IActionResult AnswerQuestion(int id, [FromBody] Answer a)
        {
            var question = questions.FirstOrDefault(x => x.Id == id);
            if (question == null) return NotFound();

            a.Id = question.Answers.Count + 1;
            question.Answers.Add(a);

            // TODO: Notify student (via Twilio/Firebase)
            return Ok(a);
        }

        // GET: api/qa
        [HttpGet]
        public IActionResult GetAllQuestions()
        {
            return Ok(questions);
        }
        // Example notification method
private void Notify(string to, string message)
{
    var accountSid = _config["Twilio:AccountSID"];
    var authToken = _config["Twilio:AuthToken"];
    var fromPhone = _config["Twilio:FromPhone"];

    TwilioClient.Init(accountSid, authToken);

    MessageResource.Create(
        body: message,
        from: new Twilio.Types.PhoneNumber(fromPhone),
        to: new Twilio.Types.PhoneNumber(to)
    );
}

    }
}
