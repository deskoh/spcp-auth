const fs = require('fs')
const express = require('express')
var cookieParser = require('cookie-parser')
const SPCPAuthClient = require('@opengovsg/spcp-auth-client')

const client = new SPCPAuthClient({
  partnerEntityId: '12345678A',
  idpLoginURL: 'http://localhost:5156/singpass/logininitial',
  idpEndpoint: 'http://localhost:5156/singpass/soap',
  esrvcID: 'MYESERVICEID',
  appCert: fs.readFileSync('./mockpass/node_modules/@opengovsg/mockpass/static/certs/server.crt'),
  appKey: fs.readFileSync('./mockpass/node_modules/@opengovsg/mockpass/static/certs/key.pem'),
  spcpCert: fs.readFileSync('./mockpass/node_modules/@opengovsg/mockpass/static/certs/spcp.crt'),
  extract: SPCPAuthClient.extract.SINGPASS,
})

const app = express()
app.use(cookieParser())

const POST_LOGIN_PAGE = '/private'
app.get('/login', (req, res) => {
  const redirectURL = client.createRedirectURL(POST_LOGIN_PAGE)
  res.cookie('connect.sid', '').redirect(redirectURL)
})

app.get('/singpass/assert', (req, res) => {
  const { SAMLart: samlArt, RelayState: relayState } = req.query
  client.getAttributes(samlArt, relayState, (err, data) => {
    if (err) {
      // Indicate that an error has occurred
      res.status(400).send(err.message)
    } else {
      // If all is well and login occurs, the attributes are given
      const { attributes, relayState } = data
      const { UserName: userName } = attributes

      // Embed a session cookie, a JWT based on user name
      const FOUR_HOURS = 4 * 60 * 60 * 1000
      const jwt = client.createJWT({ userName }, FOUR_HOURS)
      res.cookie('connect.sid', jwt)
      res.redirect(relayState)
    }
  })
})

const isAuthenticated = (req, res, next) => {
  client.verifyJWT(req.cookies['connect.sid'], (err, data) => {
    if (err) {
      res.status(401).send('Unauthorized')
    } else {
      req.userName = data.userName
      next()
    }
  })
}
app.get(
  '/private',
  isAuthenticated,
  (req, res) => {
    res.send(`Hello ${req.userName}!`)
  }
)

const port = process.env.PORT || 5000
app.listen(5000, () => console.log(`Listening on port ${port}`))
