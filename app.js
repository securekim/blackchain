// 'use strict'; 
 
// var express = require('express'); 
// var cookieParser = require('cookie-parser'); 
// var cookieSession = require('cookie-session'); 

// var authObj = require("./auth.js").Create({ 
//     //tenant: "e458207d-8740-4c5d-ac13-10e9af827faf",
//     tenant:"bykim910116gmail.onmicrosoft.com", 
//     clientId:"8e794d00-2d77-40c8-a1a5-81d241357387", 
//     secret:"PLLxMvPIY4ZSQsh7ssu5wnKimY0ffXV5+xc23SJqXhM=", 
//     redirectUri:"http://localhost:51369/signin-oidc",
//     //resource : "8e794d00-2d77-40c8-a1a5-81d241357387"
// }); 
 
// var app = express(); 
// app.use(cookieParser('a deep secret')); 
// app.use(cookieSession({name: 'session',keys: [""]})); 
 
// app.get('/', function(req, res) {
//     res.end(`
//         <head> 
//         <title>test</title> 
//         </head>
//         <body> 
//         <a href="./auth">Login</a>\ 
//         </body> 
//     `);
// }); 
 
// app.get('/auth', function(req, res) { 
//     console.log("[BRO] auth :::"); 
//     authObj.loginIfNotAuth(req,res,function(){ 
//         res.send("authed"); 
//     }); 
// }); 
//  //http://localhost:51369/signin-oidc
// app.get('/signin-oidc', function(req, res) { 
//     console.log("[BRO] signin-oidc :::"); 
//     authObj.receiveToken(req,res,function(){ 
//         res.redirect('/AuthInfo'); 
//     }); 
// }); 
 
// app.get('/AuthInfo', function(req, res) { 
//     var sessionValue = req.session.authInfo;
//     console.log("[BRO] AuthInfo :::"); 
//     console.log(req.session);
//     var authString = JSON.stringify(sessionValue); 
//     var userID = sessionValue.userId; 
//     var familyName = sessionValue.familyName; 
//     var givenName = sessionValue.givenName; 
 
//     res.end(`\ 
//         <h1>UserID: ${userID}</h1> 
//         <h2>familyName: ${familyName}</h2> 
//         <h2>givenName: ${givenName}</h2> 
//         <h2>full data:</h2> 
//         <p>${authString}</p> 
//     `); 
// }); 
 
// app.listen(51369); 
// console.log("listen 51369"); 



/*
 * @copyright
 * Copyright © Microsoft Open Technologies, Inc.
 *
 * All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http: *www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION
 * ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A
 * PARTICULAR PURPOSE, MERCHANTABILITY OR NON-INFRINGEMENT.
 *
 * See the Apache License, Version 2.0 for the specific language
 * governing permissions and limitations under the License.
 */
'use strict';

var express = require('express');
var logger = require('connect-logger');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var fs = require('fs');
var crypto = require('crypto');

var AuthenticationContext = require('adal-node').AuthenticationContext;

var app = express();
app.use(logger());
app.use(cookieParser('a deep secret'));
app.use(session({secret: '1234567890QWERTY'}));

app.get('/', function(req, res) {
  res.redirect('login');
});

/*
 * You can override the default account information by providing a JSON file
 * with the same parameters as the sampleParameters variable below.  Either
 * through a command line argument, 'node sample.js parameters.json', or
 * specifying in an environment variable.
 * {
 *   "tenant" : "rrandallaad1.onmicrosoft.com",
 *   "authorityHostUrl" : "https://login.windows.net",
 *   "clientId" : "624ac9bd-4c1c-4686-aec8-e56a8991cfb3",
 *   "clientSecret" : "verySecret="
 * }
 */
var parametersFile = process.argv[2] || process.env['ADAL_SAMPLE_PARAMETERS_FILE'];

var sampleParameters;
if (parametersFile) {
  var jsonFile = fs.readFileSync(parametersFile);
  if (jsonFile) {
    sampleParameters = JSON.parse(jsonFile);
  } else {
    console.log('File not found, falling back to defaults: ' + parametersFile);
  }
}

if (!parametersFile) {
  sampleParameters = {
    
//     //tenant: "e458207d-8740-4c5d-ac13-10e9af827faf",
//     tenant:"bykim910116gmail.onmicrosoft.com", 
//     clientId:"8e794d00-2d77-40c8-a1a5-81d241357387", 
//     secret:"PLLxMvPIY4ZSQsh7ssu5wnKimY0ffXV5+xc23SJqXhM=", 
//     redirectUri:"http://localhost:51369/signin-oidc",
//     //resource : "8e794d00-2d77-40c8-a1a5-81d241357387"

    tenant : 'bykim910116gmail.onmicrosoft.com',
    authorityHostUrl : 'https://login.windows.net',
    clientId : '8e794d00-2d77-40c8-a1a5-81d241357387',
    clientSecret : 'PLLxMvPIY4ZSQsh7ssu5wnKimY0ffXV5+xc23SJqXhM='
  };
}

var authorityUrl = sampleParameters.authorityHostUrl + '/' + sampleParameters.tenant;
var redirectUri = 'http://localhost:51369/signin-oidc';
var resource = '00000002-0000-0000-c000-000000000000';

var templateAuthzUrl = 'https://login.windows.net/' + sampleParameters.tenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>&resource=<resource>';


app.get('/', function(req, res) {
  res.redirect('/login');
});

app.get('/login', function(req, res) {
  console.log(req.cookies);

  res.cookie('acookie', 'this is a cookie');

  res.send('\
<head>\
  <title>test</title>\
</head>\
<body>\
  <a href="./auth">Login</a>\
</body>\
    ');
});

function createAuthorizationUrl(state) {
  var authorizationUrl = templateAuthzUrl.replace('<client_id>', sampleParameters.clientId);
  authorizationUrl = authorizationUrl.replace('<redirect_uri>',redirectUri);
  authorizationUrl = authorizationUrl.replace('<state>', state);
  authorizationUrl = authorizationUrl.replace('<resource>', resource);
  return authorizationUrl;
}

// Clients get redirected here in order to create an OAuth authorize url and redirect them to AAD.
// There they will authenticate and give their consent to allow this app access to
// some resource they own.
app.get('/auth', function(req, res) {
  crypto.randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');

    res.cookie('authstate', token);
    var authorizationUrl = createAuthorizationUrl(token);

    res.redirect(authorizationUrl);
  });
});

// After consent is granted AAD redirects here.  The ADAL library is invoked via the
// AuthenticationContext and retrieves an access token that can be used to access the
// user owned resource.
app.get('/signin-oidc', function(req, res) {
  if (req.cookies.authstate !== req.query.state) {
    res.send('error: state does not match');
  }
  var authenticationContext = new AuthenticationContext(authorityUrl);
  authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, sampleParameters.clientId, sampleParameters.clientSecret, function(err, response) {
    var message = '';
    if (err) {
      message = 'error: ' + err.message + '\n';
    }
    message += 'response: ' + JSON.stringify(response);

    if (err) {
      res.send(message);
      return;
    }

    // Later, if the access token is expired it can be refreshed.
    authenticationContext.acquireTokenWithRefreshToken(response.refreshToken, sampleParameters.clientId, sampleParameters.clientSecret, resource, function(refreshErr, refreshResponse) {
      if (refreshErr) {
        message += 'refreshError: ' + refreshErr.message + '\n';
      }
      message += 'refreshResponse: ' + JSON.stringify(refreshResponse);

      res.send(message); 
    }); 
  });
});

app.listen(51369);
console.log('listening on 51369');