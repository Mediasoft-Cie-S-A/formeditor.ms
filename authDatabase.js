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

const LocalStrategy = require('passport-local').Strategy;

module.exports = function (app, session, passport, dbs) {

  const dbAuthConfig = app?.config?.authentication?.database;
  if (!dbAuthConfig) {
    console.warn('⚠️  Database authentication is not configured. Skipping /api/db-login endpoint.');
    return;
  }

  if (!dbs || typeof dbs.authenticateUser !== 'function') {
    console.error('❌ dblayer instance is required for database authentication.');
    return;
  }

  const strategyName = 'database';

  const authUser = async (username, password, done) => {
    try {
      const authenticated = await dbs.authenticateUser(username, password);
      if (!authenticated) {
        return done(null, false, { message: 'Incorrect username or password' });
      }

      const user = {
        oid: authenticated.username,
        username: authenticated.username,
        details: authenticated.record
      };

      return done(null, user);
    } catch (error) {
      console.error('Error during database authentication:', error);
      return done(error);
    }
  };

  passport.use(strategyName, new LocalStrategy(authUser));

  app.post('/api/db-login', (req, res, next) => {
    passport.authenticate(strategyName, (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        return res.status(401).send({ authenticated: false, message: info && info.message });
      }
      req.logIn(user, err => {
        if (err) { return next(err); }
        res.send({ authenticated: true, username: user.username });
      });
    })(req, res, next);
  });

};
