using Microsoft.AspNetCore.Mvc;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagingController : ControllerBase
    {
        private readonly IConfiguration _config;

        public MessagingController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("send-sms")]
        public IActionResult SendSms([FromBody] SmsRequest request)
        {
            var accountSid = _config["Twilio:AccountSID"];
            var authToken = _config["Twilio:AuthToken"];
            var fromPhone = _config["Twilio:FromPhone"];

            TwilioClient.Init(accountSid, authToken);

            var message = MessageResource.Create(
                body: request.Message,
                from: new Twilio.Types.PhoneNumber(fromPhone),
                to: new Twilio.Types.PhoneNumber(request.To)
            );

            return Ok(new { sid = message.Sid, status = message.Status.ToString() });
        }
    }

    public class SmsRequest
    {
        public string To { get; set; } = "";
        public string Message { get; set; } = "";
    }
}
