using Microsoft.AspNetCore.Mvc;
using Firebase.Database;
using Firebase.Database.Query;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly FirebaseClient _firebase;

        public ChatController()
        {
            _firebase = new FirebaseClient("https://your-project-id.firebaseio.com/");
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessage msg)
        {
            var result = await _firebase
                .Child("messages")
                .PostAsync(msg);
            
            return Ok(result.Key);
        }

        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages()
        {
            var msgs = await _firebase
                .Child("messages")
                .OnceAsync<ChatMessage>();

            return Ok(msgs.Select(m => new { m.Key, m.Object.User, m.Object.Text }));
        }
    }

    public class ChatMessage
    {
        public string User { get; set; } = "";
        public string Text { get; set; } = "";
    }
}
