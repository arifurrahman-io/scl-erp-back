const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("User");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        // Find user by ID stored in JWT
        // We populate assignedCampuses because the frontend/middleware needs
        // this to enforce Campus-Based Access Rules.
        const user = await User.findById(jwt_payload.id)
          .select("-password")
          .populate("assignedCampuses", "name isActive");

        if (user) {
          if (!user.isActive) {
            return done(null, false, { message: "Account is deactivated" });
          }
          return done(null, user);
        }

        return done(null, false);
      } catch (err) {
        console.error(err);
        return done(err, false);
      }
    })
  );
};
