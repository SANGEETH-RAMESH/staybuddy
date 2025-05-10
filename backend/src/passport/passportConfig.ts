import passport from 'passport';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth2';
import dotenv from 'dotenv';
dotenv.config();



const userGoogleClientID = process.env.USER_GOOGLE_CLIENT_ID || '';
const userGoogleClientSecret = process.env.USER_GOOGLE_CLIENT_SECRET || '';

const hostGoogleClientID = process.env.HOST_GOOGLE_CLIENT_ID || '';
const hostGoogleClientSecret = process.env.HOST_GOOGLE_CLIENT_SECRET || '';

if (!userGoogleClientID || !userGoogleClientSecret) {
  
    console.log("illauser")
}

if (!hostGoogleClientID || !hostGoogleClientSecret) {
    console.log("illahost")
}


passport.use(
    'google-user',
    new GoogleStrategy(
      {
        clientID: process.env.USER_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.USER_GOOGLE_CLIENT_SECRET || '',
        callbackURL: "http://localhost:4000/user/auth/google/callback",
        passReqToCallback: true,
      },
      (
        request: Express.Request,
        accessToken: string,
        refreshToken: string,
        profile: passport.Profile, 
        done: VerifyCallback
      ) => {
        // Handle user-specific logic here
        done(null, profile);
      }
    )
  );

passport.use(
    'google-host',
    new GoogleStrategy(
      {
        clientID: process.env.HOST_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.HOST_GOOGLE_CLIENT_SECRET || '',
        callbackURL: "http://localhost:4000/host/auth/google/callback",
        passReqToCallback: true,
      },
      (
        request: Express.Request,
        accessToken: string,
        refreshToken: string,
        profile: passport.Profile, 
        done: VerifyCallback
      ) => {
      
        done(null, profile);
      }
    )
  );
  


passport.serializeUser((user, done) => {
    done(null, user as Express.User);
});


passport.deserializeUser((user, done) => {
    done(null, user as Express.User);
});

export default passport;
