const jwt = require('jsonwebtoken');

module.exports = function (app, session, passport) {

  // allow passport to use "express-session".
  app.use(session({
    secret: app.config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true, // httpOnly flag to prevent client side javascript from reading the cookie
      maxAge: 3600000 // 1 hour
    }, // set to true if your using https  

  }))

  // This is the basic express session({..}) initialization.
  app.use(passport.initialize())
  // init passport on every route call.
  app.use(passport.session())
  app.session = session;
  app.passport = passport;

  passport.serializeUser((user, done) => {
    //   console.log(`Serializing user: ${user.username}`);
    done(null, user); // Store the entire user object including `checkPoints`
  });


  passport.deserializeUser((user, done) => {
    //console.log(`Deserializing user: ${user.username}`);
    done(null, user); // Restore the user object including `checkPoints`
  });


};