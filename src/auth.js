// Real auth via better-auth (Google + Email code).
// Email codes are sent through the existing sendlib wrapper (src/mailer.js)
// so users only ever see our product branding. Never log codes or keys.
const { betterAuth } = require('better-auth');
const { drizzleAdapter } = require('better-auth/adapters/drizzle');
const { emailOTP } = require('better-auth/plugins');
const { getDb } = require('./db/drizzle');
const schema = require('./db/schema');
const { sendMail } = require('./mailer');

const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  plugins: [
    emailOTP({
      otpLength: Number(process.env.OTP_LENGTH) || 6,
      expiresIn: (Number(process.env.OTP_TTL_MINUTES) || 30) * 60,
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === 'sign-in'
            ? 'Your env sign-in code'
            : type === 'email-verification'
              ? 'Verify your env email'
              : 'Your env verification code';
        await sendMail({
          to: email,
          subject,
          html: `<p>Your verification code is <strong>${otp}</strong>. It expires soon. If you did not request it, ignore this email.</p>`,
        });
      },
    }),
  ],
});

module.exports = { auth };
