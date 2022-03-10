const nodemailer = require("nodemailer");

exports.sendMail = (
  email,
  name,
  confirmationCode,
  routeString,
  subject,
  body
) => {
  var transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "alizeb831@gmail.com",
      pass: "ali@0000",
    },
  });

  var mailOptions = {
    from: "alizeb831@gmail.com",
    to: `${email}`,
    subject: subject,
    html: `<p> Hello ${name}, <br>

    ${body}:</p>

    <a href = http://${process.env.host}/${routeString}/${email}/${confirmationCode}>Click Here</a> <br>

    Kind Regards, NOYZ`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error.message);
    } else {
      console.log("Email sent successfully.");
    }
  });
};
