const { Router } = require("express");
const router = Router();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require("dotenv").config();
const { REFRESH, URI, CLIENT_ID, SECRET  } = process.env;

router.post('/', (req, res) => {
  const { to, subject, html } = req.body;

  async function sendEmail() {
    const oAuthClient = new google.auth.OAuth2(
      CLIENT_ID,
      SECRET,
      URI
    );

    contentHtml = `
            <h1>Hello</h1>
            <ul>
                <li>adidas</li>
                <li>rebook</li>
                <li>nike</li>
                <li>pumas</li>
            </ul>
            `

    try {

      oAuthClient.setCredentials({ refresh_token: REFRESH });

      const accessToken = await oAuthClient.getAccessToken()
      const tranporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'henrycourse22@gmail.com',
          clientId: CLIENT_ID,
          clientSecret: SECRET,
          refreshToken: REFRESH,
          accessToken: accessToken
        }
      })
      const mailOptions = {
        from: "Pagina web",
        to: to,
        subject: subject,
        html: html
      };

      const result = await tranporter.sendMail(mailOptions)

      res.send(result)

    } catch (error) {
      console.log(error)
    }
  }
  sendEmail()
})

module.exports = router;