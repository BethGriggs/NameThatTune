require('dotenv');

const bodyParser = require('body-parser');
const helmet = require('helmet');
const fs = require('fs');
const secure = require('express-secure-only');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const AuthorizationV1 = require('watson-developer-cloud/authorization/v1');
const IamTokenManagerV1 = require('watson-developer-cloud/iam-token-manager/v1');
const vcapServices = require('vcap_services');
let tokenManager;
let instanceType;

const params = fs.existsSync('server/localdev-config.json') ?
  vcapServices.getCredentialsForStarter('speech_to_text', require('./../localdev-config.json')) :
  vcapServices.getCredentialsForStarter('speech_to_text');

const serviceUrl = params.url || 'https://stream.watsonplatform.net/speech-to-text/api';
if (params.iam_apikey && params.iam_apikey !== '') {
  instanceType = 'iam';
  tokenManager = new IamTokenManagerV1.IamTokenManagerV1({
    iamApikey: params.iam_apikey,
    iamUrl: params.iam_url || 'https://iam.bluemix.net/identity/token',
  });
} else {
  instanceType = 'cf';
  const speechService = new SpeechToTextV1({
    username: params.username || '<username>',
    password: params.password || '<password>',
    url: serviceUrl,
  });
  tokenManager = new AuthorizationV1(speechService.getCredentials());
}

module.exports = function(app) {

  app.enable('trust proxy');
  app.use(bodyParser.json());

  // Only loaded when running in Bluemix
  if (process.env.VCAP_APPLICATION) {
    app.use(secure());
    app.use(helmet());
  }

  // Get token using your credentials
  app.get('/api/credentials', function(req, res) {
    tokenManager.getToken(function(err, token) {
      if (err) {
        const error = {
          code: err.code || 500,
          error: err.error || err.message,
        };
        return res.status(error.code).json(error);
      } else {
        let credentials;
        if (instanceType === 'iam') {
          credentials = {
            accessToken: token,
            serviceUrl,
          };
        } else {
          credentials = {
            token,
            serviceUrl,
          };
        }
        res.json(credentials);
        }
    });
  });
}
