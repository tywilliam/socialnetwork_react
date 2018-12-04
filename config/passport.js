const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  /* 
    we passed in passport from
    server.js then we just activated middleware
    We're just using object instances
    and methods of instances
  
  */
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      // Finds user in the jwt_payload,
      // 
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            // Grabs user and place it in the
            // Request object
            
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
