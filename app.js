const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
let text = '';
const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
}
return text;
};

const stateKey = 'spotify_auth_state';

const app = express();

app.use(express.static(__dirname + '/public'))
.use(cors())
.use(cookieParser());

app.get('/login', function(req, res) {

let state = generateRandomString(16);
res.cookie(stateKey, state);

// your application requests authorization
const scope = 'user-read-private user-read-email user-read-recently-played';
res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state
    }));
});

app.get('/callback', function(req, res) {

// your application requests refresh and access tokens
// after checking the state parameter

let code = req.query.code || null;
let state = req.query.state || null;
let storedState = req.cookies ? req.cookies[stateKey] : null;

if (state === null || state !== storedState) {
    res.redirect('/#' +
    querystring.stringify({
        error: 'state_mismatch'
    }));
} else {
    res.clearCookie(stateKey);
    let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
    },
    headers: {
        'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
    },
    json: true
    };

    request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

        let access_token = body.access_token,
            refresh_token = body.refresh_token;

        let options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
        console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
        querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
        }));
    } else {
        res.redirect('/#' +
        querystring.stringify({
            error: 'invalid_token'
        }));
    }
    });
}
});

app.get('/refresh_token', function(req, res) {

// requesting access token from refresh token
let refresh_token = req.query.refresh_token;
let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')) },
    form: {
    grant_type: 'refresh_token',
    refresh_token: refresh_token
    },
    json: true
};

request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
    let access_token = body.access_token;
    res.send({
        'access_token': access_token
    });
    }
});
});

console.log('Listening on 8888');
app.listen(8888);
