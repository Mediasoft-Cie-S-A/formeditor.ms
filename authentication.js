/*!
 * Copyright (c) 2023 Mediasoft & Cie S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

module.exports = function(app,session, passport) {


 // allow passport to use "express-session".
 app.use(session({
    secret: "secJKDFUret",
    resave: false ,
    saveUninitialized: true ,
  }))
 
// This is the basic express session({..}) initialization.
 app.use(passport.initialize()) 
 // init passport on every route call.
 app.use(passport.session())    

 // Configure the Azure AD strategy for Passport
passport.use(new OIDCStrategy({
    identityMetadata: `https://login.microsoftonline.com/89218426-003e-4883-a0d3-445bcca6f8c6/v2.0/.well-known/openid-configuration`,
    clientID: '8ceb09f3-fdc2-4a87-b5e6-067a7db86482',
    responseType: 'code',
    responseMode: 'query',
    redirectUrl: 'http://localhost:3000/auth/openid/return',
    allowHttpForRedirectUrl: true,
    clientSecret: '1-K8Q~MTHGtDOLonCupMCnAFkU~TJiewxHaCybaw',
    validateIssuer: false,
    passReqToCallback: true,
    scope: ['profile', 'offline_access', 'https://graph.microsoft.com/mail.read']
  },
  (req, iss, sub, profile, accessToken, refreshToken, params, done) => {
    if (!profile.oid) {
      return done(new Error("No oid found"), null);
    }
    // You can save the profile information to your user database here
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
    done(null, user.oid);
});

passport.deserializeUser((oid, done) => {
    // Find the user by OID and return the user object
    // Implement your logic to retrieve user from your database or user store
    done(null, { oid: oid, displayName: 'User Display Name' });
});

// Authentication request
app.get('/auth/openid',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/login', 
  failureMessage: true // This enables failure messages to be provided when authentication fails.
 }),  
  (req, res) => {
    res.redirect('/');
  }
);


// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    req.logout();
    res.redirect('/');
  });
});

// ... [previous code]

// Authentication callback
app.get('/auth/openid/return', 
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/login'    , 
  failureMessage: true // This enables failure messages to be provided when authentication fails.
 }),
   (req, res) => {
    // Authentication was successful
    // get username from req.user.oid
    const username = req.user.oid;
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
      </head>
      <body>
        <h1>Authentication Successful</h1>
        <p>Welcome,${username}!</p>
        <a href="/Dashboard">Go to Home</a>
        <a href="/logout">Logout</a>
      </body>
      </html>
    `);
  }
);

// Login route
app.get('/login', (req, res) => {
    const errorMessage = req.session.messages || [];
    req.session.messages = []; // Clear the message so it doesn't reappear on subsequent visits.
  
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login</title>
      </head>
      <body>
        <h1>Login</h1>
        ${errorMessage.length > 0 ? `<p style="color: red;">Error: ${errorMessage.join('<br>')}</p>` : ''}
        <p>Please <a href="/auth/openid">login with Azure AD</a>.</p>
      </body>
      </html>
    `);
  });
  


};
